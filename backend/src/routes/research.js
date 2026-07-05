import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import ResearchNote from '../models/ResearchNote.js';
import Trend from '../models/Trend.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';
import { isAiInCooldown, triggerCooldown } from '../utils/aiGuard.js';

dotenv.config();
const router = express.Router();

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

// GET all notes
router.get('/', requireAuth, async (req, res) => {
  try {
    const notes = await ResearchNote.find({ userId: req.user._id, status: { $ne: 'archived' } })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const note = await ResearchNote.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, topic, content, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const note = await ResearchNote.create({
      userId: req.user._id,
      title, topic: topic || '',
      content: content || '',
      tags: tags || []
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const allowed = ['title', 'topic', 'content', 'tags', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const note = await ResearchNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ResearchNote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /:id/analyze — AI deep research on this topic
router.post('/:id/analyze', requireAuth, async (req, res) => {
  try {
    if (isAiInCooldown()) {
      return res.status(429).json({ error: 'AI in cooldown. Try again later.' });
    }

    const note = await ResearchNote.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ error: 'Not found' });

    const client = getClient();
    if (!client) return res.status(500).json({ error: 'AI unavailable' });

    // Pull trends + recent signals as context
    const trends = await Trend.find().sort({ momentum: -1 }).limit(10).lean();
    const signals = await Event.find({ type: 'world_signal' })
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();

    const trendsCtx = trends.map(t => `- ${t.name} (${t.category}, momentum ${t.momentum})`).join('\n');
    const signalsCtx = signals.map(s => `- [${s.domain}] ${s.title}`).join('\n');

    const prompt = `You are a senior research analyst. A user is researching:

TOPIC: "${note.title}"
NOTES: "${note.content || '(empty)'}"

Below is current global intelligence context — use it if relevant:

TRENDS:
${trendsCtx}

RECENT WORLD SIGNALS:
${signalsCtx}

Provide a deep research analysis. Return ONLY valid JSON:

{
  "summary": "2-3 paragraph deep analysis of the topic, connecting it to current trends and signals where relevant",
  "keyPoints": [
    "5-7 specific insights, findings, or non-obvious angles about this topic"
  ],
  "relatedTrends": [
    "3-5 trend names from the list above that are relevant to this research"
  ]
}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        max_tokens: 2500,
        messages: [
          { role: 'system', content: 'You are an elite research analyst. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ]
      });
    } catch (err) {
      if (err.status === 429) {
        triggerCooldown(60);
        return res.status(429).json({ error: 'AI rate limit reached. Try again in 1 hour.' });
      }
      throw err;
    }

    const parsed = JSON.parse(completion.choices[0].message.content);
    note.aiSummary = parsed.summary;
    note.aiKeyPoints = parsed.keyPoints || [];
    note.aiRelatedTrends = parsed.relatedTrends || [];
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Research analyze error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;