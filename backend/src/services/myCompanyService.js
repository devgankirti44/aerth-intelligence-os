import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Trend from '../models/Trend.js';
import Opportunity from '../models/Opportunity.js';
import Event from '../models/Event.js';
import Company from '../models/Company.js';
import { isAiInCooldown, triggerCooldown, getCooldownRemaining } from '../utils/aiGuard.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function generateMyCompanyBrief(myCompany) {
  const client = getClient();
  if (!client) throw new Error('Groq not configured');

  if (isAiInCooldown()) {
    throw new Error(`AI rate limit cooldown active. Retry in ${getCooldownRemaining()} minutes.`);
  }

  const [trends, opportunities, competitors, recentSignals] = await Promise.all([
    Trend.find().sort({ momentum: -1 }).limit(10).lean(),
    Opportunity.find().sort({ score: -1 }).limit(10).lean(),
    Company.find({ slug: { $in: myCompany.detectedCompetitors || [] } }).lean(),
    Event.find({ type: 'world_signal' }).sort({ publishedAt: -1 }).limit(40).lean()
  ]);

  const competitorEvents = await Event.find({
    companySlug: { $in: myCompany.detectedCompetitors || [] }
  }).sort({ publishedAt: -1 }).limit(20).lean();

  const trendsCtx = trends.map((t, i) => `${i + 1}. ${t.name} (${t.category})`).join('\n');
  const oppsCtx = opportunities.map((o, i) => `${i + 1}. ${o.title} (${o.sector})`).join('\n');
  const compCtx = competitors.map(c => `- ${c.name} (${c.sector})`).join('\n');
  const compEventsCtx = competitorEvents.slice(0, 12).map((e, i) => `${i + 1}. [${e.companySlug}] ${e.title}`).join('\n');
  const signalsCtx = recentSignals.slice(0, 20).map(s => `- [${s.domain}] ${s.title}`).join('\n');

  const prompt = `You are a McKinsey partner writing a private strategic briefing for a specific client. You know THEIR business intimately.

═══════════════════════════════════════════
CLIENT PROFILE (THIS IS ALL THAT MATTERS)
═══════════════════════════════════════════
Company: ${myCompany.name}
Sector: ${myCompany.sector}
Size: ${myCompany.size}
Country: ${myCompany.country || 'Global'}

DESCRIPTION (READ CAREFULLY, EVERY WORD):
"${myCompany.description}"

═══════════════════════════════════════════
ABSOLUTE RULES — VIOLATING THESE IS FAILURE
═══════════════════════════════════════════

1. Your ENTIRE analysis must be about the exact niche described above. If the description says "SaaS for utility contractors doing meter connection paperwork" — your analysis is about utility contractor SaaS, NOT electric vehicles, NOT battery recycling, NOT renewable energy trends, unless those DIRECTLY affect their contractor customers.

2. IGNORE the world signals / trends / opportunities below UNLESS they directly impact this client's specific niche. It is BETTER to write "no relevant macro trend this week, focus on execution" than to force-fit tangential trends like "EV boom" onto an unrelated business.

3. Use your OWN knowledge of the actual industry ${myCompany.name} operates in. If they build documentation SaaS for utility contractors in India, think about: DISCOM regulations, contractor billing pain points, competitors like specific Indian regtech / utility software companies, digitization of paperwork, government schemes affecting DISCOMs, etc. NOT generic "customer acquisition."

4. If detected competitors below are irrelevant to their niche — IGNORE THEM. Use your knowledge to name real competitors in their actual niche.

5. Every threat/opportunity/recommendation must be so specific that ONLY ${myCompany.name} would find it useful. If it could apply to any startup, it's WRONG.

═══════════════════════════════════════════
BACKGROUND DATA (USE ONLY IF DIRECTLY RELEVANT)
═══════════════════════════════════════════

Auto-detected competitors from our DB (probably wrong, use your own knowledge):
${compCtx || '(none — you must reason about their real niche competitors)'}

Recent competitor activity (may be irrelevant):
${compEventsCtx || '(none)'}

Active global trends (mostly irrelevant to niche businesses — ignore if not directly applicable):
${trendsCtx}

Strategic opportunities in the wider world:
${oppsCtx}

Recent world signals:
${signalsCtx}

═══════════════════════════════════════════
YOUR OUTPUT
═══════════════════════════════════════════

Return ONLY valid JSON:

{
  "executiveBrief": "3-4 sentences that make clear you understand ${myCompany.name}'s exact business. Reference specific things from their description. NO generic macro talk.",
  "threats": [
    {
      "title": "Specific to their niche",
      "severity": "critical|high|medium",
      "reasoning": "Why THIS threatens ${myCompany.name}'s specific product and customers"
    }
  ],
  "opportunities": [
    {
      "title": "Specific to their niche",
      "match": "Why this fits THIS company's exact offering",
      "priority": "high|medium|low"
    }
  ],
  "competitorMoves": [
    {
      "competitor": "Real name of a company in their actual niche",
      "move": "Specific product/pricing/customer move",
      "implication": "Direct impact on ${myCompany.name}"
    }
  ],
  "recommendations": [
    "5-7 concrete actions specific to their business"
  ],
  "focusMetric": {
    "label": "Metric specific to their niche business",
    "value": "Actual specific KPI",
    "why": "1 sentence why this matters"
  }
}

Rules: 3-5 threats, 4-6 opportunities, 3-5 competitor moves, 5-7 recommendations.`;

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are an elite McKinsey partner writing niche-specific strategic briefings. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    });
  } catch (err) {
    if (err.status === 429) {
      triggerCooldown(60);
      throw new Error('AI rate limit reached. Please try again in 1 hour.');
    }
    throw err;
  }

  const brief = JSON.parse(completion.choices[0].message.content);

  return {
    brief,
    meta: {
      trendsAnalyzed: trends.length,
      opportunitiesConsidered: opportunities.length,
      competitorsTracked: competitors.length,
      signalsProcessed: recentSignals.length,
      competitorEvents: competitorEvents.length,
      generatedAt: new Date()
    }
  };
}