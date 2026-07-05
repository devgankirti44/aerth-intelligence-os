import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Report from '../models/Report.js';
import Trend from '../models/Trend.js';
import Opportunity from '../models/Opportunity.js';
import Event from '../models/Event.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function generateReport({ topic = null, type = 'custom' } = {}) {
  const client = getClient();
  if (!client) throw new Error('Groq not configured');

  const start = Date.now();

  // Gather intelligence
  const trends = await Trend.find().sort({ momentum: -1 }).limit(10).lean();
  const opportunities = await Opportunity.find().sort({ score: -1 }).limit(8).lean();
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const signals = await Event.find({
    type: 'world_signal',
    publishedAt: { $gte: sevenDaysAgo }
  })
    .sort({ publishedAt: -1 })
    .limit(50)
    .lean();

  if (trends.length === 0 && signals.length === 0) {
    throw new Error('No intelligence available. Run trend discovery and world ingestion first.');
  }

  const trendsCtx = trends.map((t, i) => 
    `${i + 1}. ${t.name} (${t.category}, momentum ${t.momentum}) — ${t.aiSummary || t.description}`
  ).join('\n');

  const oppsCtx = opportunities.map((o, i) =>
    `${i + 1}. ${o.title} (${o.sector}, score ${o.score}) — ${o.description}`
  ).join('\n');

  const signalsCtx = signals.slice(0, 30).map((s, i) =>
    `${i + 1}. [${s.domain}] ${s.title}`
  ).join('\n');

  const focusInstruction = topic
    ? `PRIMARY FOCUS: This report must center on the topic "${topic}". Filter and prioritize insights relevant to this focus.`
    : `This is a weekly comprehensive intelligence briefing covering all major domains.`;

  const prompt = `You are the Chief Intelligence Officer producing an EXECUTIVE INTELLIGENCE REPORT for a global CEO / investor / policymaker.

${focusInstruction}

LIVE INTELLIGENCE DATA:

--- ACTIVE TRENDS ---
${trendsCtx || 'None available.'}

--- STRATEGIC OPPORTUNITIES ---
${oppsCtx || 'None available.'}

--- RECENT WORLD SIGNALS (last 7 days) ---
${signalsCtx || 'None available.'}

Produce a structured executive report. Return ONLY valid JSON:

{
  "title": "Sharp title, max 10 words, reflecting the report's core message",
  "executiveSummary": "3-4 sentences. The one thing a CEO must know from this report.",
  "stateOfWorld": "2-3 paragraphs (~200 words). Set the macro scene. What is the world becoming right now? Reference specific trends and signals.",
  "topTrends": [
    { "name": "Trend name", "insight": "1-2 sentences on why this matters strategically" }
  ],
  "opportunities": [
    { "title": "Opportunity title", "rationale": "1-2 sentences on why this is high-value", "score": 90 }
  ],
  "risks": [
    "Sharp 1-line risk observations, 4-6 items"
  ],
  "recommendations": [
    "Concrete strategic actions to take in the next 90 days, 4-6 items"
  ]
}

Style: Bloomberg meets Kissinger meets McKinsey. Sharp, non-obvious, decision-grade prose.
Pick 4-5 trends and 3-4 opportunities max (the most important ones).`;

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
    messages: [
      { role: 'system', content: 'You are an elite intelligence analyst producing executive-grade reports. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  const report = await Report.create({
    title: parsed.title,
    topic,
    type,
    sections: {
      executiveSummary: parsed.executiveSummary,
      stateOfWorld: parsed.stateOfWorld,
      topTrends: parsed.topTrends || [],
      opportunities: parsed.opportunities || [],
      risks: parsed.risks || [],
      recommendations: parsed.recommendations || []
    },
    meta: {
      signalsAnalyzed: signals.length,
      trendsReferenced: trends.length,
      opportunitiesReferenced: opportunities.length,
      generationTimeMs: Date.now() - start
    },
    status: 'ready'
  });

  return report;
}