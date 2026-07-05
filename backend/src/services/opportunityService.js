import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Trend from '../models/Trend.js';
import Event from '../models/Event.js';
import Opportunity from '../models/Opportunity.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function discoverOpportunities() {
  const client = getClient();
  if (!client) {
    console.warn('Groq not configured — skipping opportunity discovery');
    return [];
  }

  // Get active trends and latest events as analytical context
  const trends = await Trend.find().lean();
  const events = await Event.find({ type: 'world_signal' })
    .sort({ publishedAt: -1 })
    .limit(80)
    .lean();

  if (trends.length === 0) {
    console.log('No trends found to analyze for opportunities.');
    return [];
  }

  console.log(`Analyzing ${trends.length} trends & ${events.length} signals for Opportunity Discovery...`);

  const trendsContext = trends.map((t, idx) => 
    `${idx + 1}. [Trend: ${t.name}] Category: ${t.category}, Momentum: ${t.momentum}, Summary: ${t.aiSummary}`
  ).join('\n');

  const eventsContext = events.map((e, idx) =>
    `- [Signal] ${e.title} (Domain: ${e.domain})`
  ).join('\n');

  const prompt = `You are a high-level McKinsey partner and geopolitical risk strategist.

Below is our system's live intelligence data:

LIVE TRENDS DETECTED:
${trendsContext}

RECENT WORLD SIGNALS:
${eventsContext}

Your task is to identify 5-7 HIGH-VALUE STRATEGIC OPPORTUNITIES emerging from this intersection.
These must be extremely specific, highly strategic, and non-obvious business plays. (e.g., "India Precision Irrigation for Drought Mitigation", "Decentralized BRICS Trade Finance Platform", "DRAM Supply Chain Diversification").

For each opportunity, calculate an Opportunity Score (0-100) based on how strong the signals are, and provide an action plan.

Return ONLY a valid JSON object in this exact format:
{
  "opportunities": [
    {
      "slug": "unique-url-slug",
      "title": "Clear Opportunity Title",
      "description": "1-sentence summary of the strategic play",
      "sector": "Agri-Tech|Semiconductors|Renewable Energy|Finance|Defense|Space|Logistics",
      "score": 88,
      "horizon": "short|medium|long",
      "strategicRationale": "Detailed analytical explanation of why this opportunity has emerged now, combining trends and macro shifts.",
      "actionPlan": [
        "First tactical move to establish positioning",
        "Strategic partnership or operational scaling step",
        "Long-term play to dominate this niche"
      ],
      "risks": [
        "Primary regulatory or market risk",
        "Execution or supply chain barrier"
      ],
      "associatedTrendSlugs": ["slug-of-trend-1", "slug-of-trend-2"]
    }
  ]
}

Ensure the "associatedTrendSlugs" match actual slugs from the trends list. Keep your recommendations sharp, realistic, and highly professional.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are an elite business strategy AI. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const discoveredOpps = result.opportunities || [];

    console.log(`✓ Discovered ${discoveredOpps.length} strategic opportunities`);

    // Clean old opportunities and save new ones
    await Opportunity.deleteMany({});

    const saved = [];
    for (const opp of discoveredOpps) {
      // Find matching events to create citations/relations
      const relatedEvents = await Event.find({
        $or: [
          { title: new RegExp(opp.sector, 'i') },
          { summary: new RegExp(opp.sector, 'i') }
        ]
      }).limit(5).select('_id');

      const doc = await Opportunity.create({
        ...opp,
        supportingEventIds: relatedEvents.map(e => e._id),
        lastAnalyzedAt: new Date()
      });
      saved.push(doc);
    }

    return saved;
  } catch (error) {
    console.error('Opportunity discovery failed:', error.message);
    return [];
  }
}