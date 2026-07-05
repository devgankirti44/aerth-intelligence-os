// backend/src/services/ragService.js

import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Event from '../models/Event.js';
import ChatMessage from '../models/ChatMessage.js';
import { generateEmbedding } from './embeddingService.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function vectorSearch(query, options = {}) {
  const { companySlug = null, limit = 8, numCandidates = 100 } = options;

  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return await keywordFallback(query, companySlug, limit);

  const vectorStage = {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates,
      limit
    }
  };

  if (companySlug) {
    vectorStage.$vectorSearch.filter = { companySlug: { $eq: companySlug } };
  }

  try {
    return await Event.aggregate([
      vectorStage,
      {
        $project: {
          _id: 1, companySlug: 1, type: 1, title: 1, summary: 1,
          url: 1, source: 1, publishedAt: 1, significance: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);
  } catch (error) {
    console.error('Vector search failed:', error.message);
    return await keywordFallback(query, companySlug, limit);
  }
}

async function keywordFallback(query, companySlug, limit) {
  const filter = { $text: { $search: query } };
  if (companySlug) filter.companySlug = companySlug;

  return await Event.find(filter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
}

export async function ragAnswer({ question, companySlug, sessionId }) {
  const client = getClient();

  const relevantEvents = await vectorSearch(question, { companySlug, limit: 8 });

  if (relevantEvents.length === 0) {
    return {
      answer: "I don't have enough information to answer that yet. Try refreshing intelligence first.",
      sources: []
    };
  }

  if (!client) {
    return {
      answer: `Found ${relevantEvents.length} relevant events. Configure Groq for AI-generated answers.`,
      sources: relevantEvents.map(e => ({
        eventId: e._id, title: e.title, url: e.url,
        source: e.source, publishedAt: e.publishedAt, score: e.score
      }))
    };
  }

  const context = relevantEvents
    .map((e, i) => {
      const date = new Date(e.publishedAt).toISOString().slice(0, 10);
      return `[Source ${i + 1}] (${e.source}, ${date})\nTitle: ${e.title}\n${e.summary || ''}`;
    })
    .join('\n\n---\n\n');

  const systemPrompt = `You are a strategic intelligence analyst.
Answer using ONLY the provided sources.
- Cite sources inline as [Source 1], [Source 2] etc.
- If sources don't contain the answer, say so.
- Be concise, strategic, and analytical.
- Focus on insights and implications, not just facts.`;

  const userPrompt = `SOURCES:
${context}

QUESTION: ${question}

Provide a strategic answer with citations.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const answer = completion.choices[0].message.content;

    const sources = relevantEvents.map(e => ({
      eventId: e._id, title: e.title, url: e.url,
      source: e.source, publishedAt: e.publishedAt, score: e.score
    }));

    if (sessionId) {
      await ChatMessage.create({
        sessionId, companySlug, role: 'user', content: question
      });
      await ChatMessage.create({
        sessionId, companySlug, role: 'assistant', content: answer, sources
      });
    }

    return { answer, sources };
  } catch (error) {
    console.error('RAG error:', error.message);
    return { answer: 'Failed to generate answer.', sources: [] };
  }
}

export async function getChatHistory(sessionId, limit = 20) {
  return await ChatMessage.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}