// backend/src/services/aiService.js

import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Event from '../models/Event.js';
import Insight from '../models/Insight.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function generateCompanyInsight(company) {
  const client = getClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await Event.find({
    companySlug: company.slug,
    publishedAt: { $gte: thirtyDaysAgo }
  }).sort({ publishedAt: -1 }).limit(30);

  if (events.length === 0) return null;

  if (!client) {
    return await Insight.findOneAndUpdate(
      { companySlug: company.slug },
      {
        summary: `${events.length} events tracked. Configure Groq for AI analysis.`,
        themes: [], strategicMoves: [], eventCount: events.length, generatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

  const eventList = events
    .map(e => `- [${e.type}] ${e.title} (${e.source})`)
    .join('\n');

  const prompt = `You are a strategic intelligence analyst tracking ${company.name}.

Company: ${company.name}
Industry: ${company.industry || 'Unknown'}
Description: ${company.description || ''}

Recent events (last 30 days):
${eventList}

Analyze deeply. Return ONLY valid JSON:
{
  "summary": "2-3 sentence executive summary of what's happening RIGHT NOW",
  "themes": ["3-5 strategic themes emerging"],
  "strategicMoves": [
    {"move": "specific strategic move detected", "evidence": "which event supports this"}
  ],
  "competitivePosition": "1-2 sentences on their competitive position",
  "risks": ["2-3 specific emerging risks"],
  "opportunities": ["2-3 specific emerging opportunities"]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a senior strategic intelligence analyst. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    const insight = await Insight.findOneAndUpdate(
      { companySlug: company.slug },
      {
        summary: analysis.summary,
        themes: analysis.themes || [],
        strategicMoves: (analysis.strategicMoves || []).map(m => ({
          move: m.move, evidence: m.evidence, date: new Date()
        })),
        competitivePosition: analysis.competitivePosition,
        risks: analysis.risks || [],
        opportunities: analysis.opportunities || [],
        eventCount: events.length,
        generatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return insight;
  } catch (error) {
    console.error('AI insight error:', error.message);
    return null;
  }
}