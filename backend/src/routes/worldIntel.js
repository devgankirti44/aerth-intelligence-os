import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Groq from 'groq-sdk';
import Event from '../models/Event.js';
import { isAiInCooldown, triggerCooldown, getCooldownRemaining } from '../utils/aiGuard.js';

const router = express.Router();

// In-memory cache for world brief (6h TTL)
let briefCache = null;
let briefCacheAt = 0;
const BRIEF_TTL = 6 * 60 * 60 * 1000;

let groq = null;
function getGroq() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

// GET /api/world-intel/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const totalSignals = await Event.countDocuments({
      type: 'world_signal',
      publishedAt: { $gte: sevenDaysAgo }
    });

    const last24h = await Event.countDocuments({
      type: 'world_signal',
      publishedAt: { $gte: oneDayAgo }
    });

    const byDomain = await Event.aggregate([
      { $match: { type: 'world_signal', publishedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$domain', count: { $sum: 1 }, latest: { $max: '$publishedAt' } } },
      { $sort: { count: -1 } }
    ]);

    const byRegion = await Event.aggregate([
      { $match: { type: 'world_signal', publishedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const latestSignals = await Event.find({ type: 'world_signal' })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    res.json({
      stats: {
        totalSignals,
        last24h,
        activeDomains: byDomain.length,
        activeRegions: byRegion.length
      },
      byDomain,
      byRegion,
      latestSignals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// GET /api/world-intel/brief — WITH 6H CACHE
router.get('/brief', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === '1';

    // Serve fresh cache
    if (!forceRefresh && briefCache && (Date.now() - briefCacheAt < BRIEF_TTL)) {
      console.log('✓ Serving cached world brief');
      return res.json({ ...briefCache, cached: true });
    }

    const client = getGroq();
    if (!client) return res.json({ brief: 'AI unavailable' });

    if (isAiInCooldown()) {
      if (briefCache) {
        console.log('⚠ AI cooldown, serving stale world brief');
        return res.json({ ...briefCache, cached: true, stale: true });
      }
      return res.status(503).json({ 
        error: `AI in cooldown. Retry in ${getCooldownRemaining()} minutes.` 
      });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const signals = await Event.find({
      type: 'world_signal',
      publishedAt: { $gte: sevenDaysAgo }
    })
      .sort({ publishedAt: -1 })
      .limit(60)
      .lean();

    if (signals.length === 0) {
      return res.json({ brief: 'No world signals available. Run world ingestion first.' });
    }

    const context = signals.map((s, i) => `${i + 1}. [${s.domain}] ${s.title}`).join('\n');

    const prompt = `You are the Chief Intelligence Officer briefing a global CEO.

Below are 60 real world signals from the last 7 days across agriculture, food security, commodities, currency, geopolitics, energy, and manufacturing.

SIGNALS:
${context}

Write a sharp 3-paragraph MACRO INTELLIGENCE BRIEF:

Paragraph 1 — THE STATE OF THE WORLD: What's the dominant narrative across these signals? What is the world becoming?

Paragraph 2 — THE HIDDEN CURRENTS: What non-obvious cross-domain patterns are emerging?

Paragraph 3 — THE STRATEGIC IMPLICATION: What should decision-makers do RIGHT NOW?

Style: Bloomberg meets Kissinger. Sharp. Executive-grade.
Length: 3 paragraphs, ~120 words each. Plain text, no markdown headers.`;

    console.log('⚙ Generating fresh world brief...');

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 900,
        messages: [
          { role: 'system', content: 'You are an elite intelligence analyst.' },
          { role: 'user', content: prompt }
        ]
      });
    } catch (err) {
      if (err.status === 429) {
        triggerCooldown(60);
        if (briefCache) {
          return res.json({ ...briefCache, cached: true, stale: true });
        }
      }
      throw err;
    }

    const result = {
      brief: completion.choices[0].message.content,
      generatedAt: new Date(),
      signalCount: signals.length
    };

    briefCache = result;
    briefCacheAt = Date.now();

    res.json({ ...result, cached: false });
  } catch (error) {
    console.error('World brief error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;