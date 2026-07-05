import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Event from '../models/Event.js';
import Trend from '../models/Trend.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function discoverTrends() {
  const client = getClient();
  if (!client) {
    console.warn('Groq not configured — skipping trend discovery');
    return [];
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await Event.find({
    publishedAt: { $gte: thirtyDaysAgo }
  })
    .sort({ publishedAt: -1 })
    .limit(100) // reduced from 150 to save tokens
    .lean();

  if (events.length === 0) {
    console.log('No events to analyze');
    return [];
  }

  console.log(`Analyzing ${events.length} events for trend discovery...`);

  const eventList = events.map((e, i) =>
    `${i + 1}. [${e.companySlug || 'general'}] ${e.title}`
  ).join('\n');

  const prompt = `You are a senior strategic intelligence analyst studying global signals.

Below are ${events.length} real news events from the last 30 days across companies, geopolitics, technology, agriculture, energy, and markets.

Analyze these events and identify 8-12 MAJOR STRATEGIC TRENDS emerging from this data.

Think DEEPLY about:
- Non-obvious patterns across sectors
- Emerging opportunities (like India agri boom, food security, dollar decline)
- Geopolitical shifts (US-China tech war, Trump policies)
- Technology paradigm shifts
- Macro economic themes
- Cross-sector implications

Do NOT be limited to tech. Include agriculture, energy, geopolitics, healthcare, space, defense if the data shows patterns there.

EVENTS:
${eventList}

Return ONLY valid JSON in this exact format:
{
  "trends": [
    {
      "slug": "url-friendly-slug",
      "name": "Trend Name (max 5 words)",
      "category": "AI|Hardware|Agriculture|Energy|Geopolitics|Finance|Healthcare|Space|Defense|Climate",
      "description": "1-sentence description of trend",
      "narrative": "2-3 sentence strategic narrative explaining WHY this is significant and what makes it emerge NOW",
      "prediction": "1-2 sentence prediction for next 12-24 months",
      "opportunities": ["3 specific opportunities emerging from this trend"],
      "momentum": 60,
      "status": "emerging|accelerating|peaking|declining",
      "eventNumbers": [1, 5, 12]
    }
  ]
}

The eventNumbers should reference which event numbers from the list above support this trend (2-5 numbers per trend).

Be bold. Find non-obvious patterns. Think like a top-tier strategist.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: 'You are a world-class strategic intelligence analyst. You see patterns others miss. Return only valid JSON.'
        },
        { role: 'user', content: prompt }
      ]
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const discoveredTrends = result.trends || [];

    console.log(`✓ Discovered ${discoveredTrends.length} trends`);

    await Trend.deleteMany({});

    const saved = [];
    for (const t of discoveredTrends) {
      const supportingEvents = (t.eventNumbers || [])
        .map(n => events[n - 1])
        .filter(Boolean);

      const companies = [...new Set(
        supportingEvents.map(e => e.companySlug).filter(Boolean)
      )];

      const trend = await Trend.create({
        slug: t.slug,
        name: t.name,
        title: t.name,
        category: t.category,
        description: t.description,
        keywords: [],
        momentum: t.momentum || 50,
        velocity: 0,
        status: t.status || 'emerging',
        signals: {
          eventCount: supportingEvents.length,
          companiesInvolved: companies,
          lastActivityAt: supportingEvents[0]?.publishedAt || new Date(),
          growthRate: 0
        },
        aiSummary: t.narrative,
        aiPrediction: t.prediction,
        aiOpportunities: t.opportunities || [],
        history: [{
          date: new Date(),
          momentum: t.momentum || 50,
          eventCount: supportingEvents.length
        }],
        lastAnalyzedAt: new Date(),
        supportingEventIds: supportingEvents.map(e => e._id)
      });

      saved.push(trend);
    }

    return saved;
  } catch (error) {
    console.error('Trend discovery error:', error.message);
    return [];
  }
}