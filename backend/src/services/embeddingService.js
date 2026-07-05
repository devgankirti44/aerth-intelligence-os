// backend/src/services/embeddingService.js

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import Event from '../models/Event.js';

const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

/**
 * Generate 384-dim embedding using HuggingFace (free)
 */
export async function generateEmbedding(text) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('HUGGINGFACE_API_KEY missing');
    return null;
  }

  try {
    const cleaned = text.slice(0, 2000);

    const response = await axios.post(
      HF_URL,
      { inputs: cleaned, options: { wait_for_model: true } },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return Array.isArray(response.data[0]) ? response.data[0] : response.data;
  } catch (error) {
    console.error('Embedding error:', error.response?.data?.error || error.message);
    return null;
  }
}

export async function embedEvent(event) {
  const text = `${event.title}. ${event.summary || ''}`.trim();
  if (!text) return null;

  const embedding = await generateEmbedding(text);
  if (!embedding) return null;

  await Event.updateOne(
    { _id: event._id },
    { $set: { embedding, embeddedAt: new Date() } }
  );

  return embedding;
}

export async function embedAllUnembedded() {
  const events = await Event.find({ embedding: null }).select('+embedding').limit(200);
  console.log(`Embedding ${events.length} events...`);

  let count = 0;
  for (const event of events) {
    const result = await embedEvent(event);
    if (result) count++;
    await new Promise(r => setTimeout(r, 300)); // avoid rate limits
  }
  console.log(`✓ Embedded ${count} events`);
  return count;
}