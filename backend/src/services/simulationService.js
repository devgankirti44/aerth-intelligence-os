import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Simulation from '../models/Simulation.js';
import Trend from '../models/Trend.js';
import Event from '../models/Event.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function runSimulation(scenario) {
  const client = getClient();
  if (!client) throw new Error('Groq not configured');
  if (!scenario || scenario.trim().length < 5) throw new Error('Scenario too short');

  const start = Date.now();

  // Load current intelligence graph
  const trends = await Trend.find().sort({ momentum: -1 }).lean();
  const recentSignals = await Event.find({ type: 'world_signal' })
    .sort({ publishedAt: -1 })
    .limit(40)
    .lean();

  const trendsCtx = trends.map((t, i) =>
    `${i + 1}. ${t.name} (${t.category}, momentum ${t.momentum}, ${t.status})`
  ).join('\n');

  const signalsCtx = recentSignals.slice(0, 25).map((s, i) =>
    `- [${s.domain}] ${s.title}`
  ).join('\n');

  const prompt = `You are the world's most respected geopolitical strategist — a fusion of Kissinger, Ray Dalio, and a McKinsey senior partner. You are running a SCENARIO SIMULATION.

SCENARIO TO SIMULATE:
"${scenario}"

CURRENT INTELLIGENCE GRAPH:

Active Trends (with momentum scores):
${trendsCtx}

Recent World Signals:
${signalsCtx}

Your job: Run a rigorous CASCADE ANALYSIS of this scenario. Predict second and third-order effects. Reference the actual trends and signals above where relevant. Be BOLD but grounded in data.

Return ONLY valid JSON:

{
  "category": "Geopolitics|Economy|Technology|Climate|Trade|Currency|Conflict|Other",
  "executiveVerdict": "2-3 sharp sentences. The ONE thing a decision-maker must understand about this scenario's implications.",
  "cascadeChain": [
    "First-order effect (immediate consequence)",
    "Second-order effect (what that triggers)",
    "Third-order effect (systemic reshape)",
    "Fourth-order effect (long-term equilibrium shift)"
  ],
  "probability": 65,
  "timeToImpact": "Immediate | 3-6 months | 6-18 months | 2-5 years",
  "confidenceScore": 75,
  "trendImpacts": [
    {
      "trendName": "must match a trend from the list above",
      "direction": "accelerate|decelerate|reverse|unchanged",
      "magnitude": "critical|high|medium|low",
      "reasoning": "1 sentence why this scenario affects this trend"
    }
  ],
  "sectorImpacts": [
    {
      "sector": "e.g., Semiconductors, Agriculture, Energy, Finance, Defense",
      "impact": "boom|growth|neutral|decline|collapse",
      "reasoning": "1 sentence"
    }
  ],
  "winners": [
    { "name": "Company or country", "why": "1 sentence" }
  ],
  "losers": [
    { "name": "Company or country", "why": "1 sentence" }
  ],
  "emergingOpportunities": [
    "3-5 specific strategic plays that become viable in this scenario"
  ],
  "hiddenRisks": [
    "3-5 non-obvious risks that emerge from cascade effects"
  ],
  "strategicPlaybook": [
    "4-6 concrete actions a smart decision-maker should take in the next 90 days if this scenario looks likely"
  ]
}

Rules:
- 4-6 trend impacts (pick most relevant from the list)
- 4-6 sector impacts
- 3-4 winners, 3-4 losers (be specific — real countries or company names)
- probability is 0-100 (your honest estimate of scenario likelihood)
- confidenceScore is 0-100 (how confident you are in your analysis)
- Be sharp, non-obvious, executive-grade`;

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.6,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
    messages: [
      { role: 'system', content: 'You are an elite scenario strategist. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  const sim = await Simulation.create({
    scenario,
    category: parsed.category,
    analysis: {
      executiveVerdict: parsed.executiveVerdict,
      cascadeChain: parsed.cascadeChain || [],
      probability: parsed.probability || 50,
      timeToImpact: parsed.timeToImpact || 'Unknown',
      confidenceScore: parsed.confidenceScore || 60,
      trendImpacts: parsed.trendImpacts || [],
      sectorImpacts: parsed.sectorImpacts || [],
      winners: parsed.winners || [],
      losers: parsed.losers || [],
      emergingOpportunities: parsed.emergingOpportunities || [],
      hiddenRisks: parsed.hiddenRisks || [],
      strategicPlaybook: parsed.strategicPlaybook || []
    },
    meta: {
      trendsAnalyzed: trends.length,
      signalsReferenced: recentSignals.length,
      generationTimeMs: Date.now() - start
    }
  });

  return sim;
}