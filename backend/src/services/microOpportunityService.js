import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Trend from '../models/Trend.js';
import { isAiInCooldown, triggerCooldown } from '../utils/aiGuard.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export async function generateMicroOpportunities(profile) {
  const client = getClient();
  if (!client) throw new Error('Groq not configured');

  if (isAiInCooldown()) {
    throw new Error('AI rate limit cooldown. Try again in an hour.');
  }

  // Pull top trends as context
  const trends = await Trend.find().sort({ momentum: -1 }).limit(8).lean();
  const trendsCtx = trends.map(t => `- ${t.name} (${t.category})`).join('\n');

  const prompt = `You are a career + entrepreneurship coach specifically for Indian people looking to earn income. You know grassroots opportunities across cities, not just tech.

═══════════════════════════════════════════
PERSON'S PROFILE
═══════════════════════════════════════════
Situation: ${profile.situation}
Degree/Education: ${profile.degree || 'Not specified'}
Current Skills: ${profile.currentSkills?.join(', ') || 'None listed'}
Interests: ${profile.interests?.join(', ') || 'Open to anything'}
City: ${profile.city || 'Not specified'} (${profile.cityTier})
Time available: ${profile.hoursPerDay} hours/day
Starting capital: ₹${profile.capital}
Goal: ${profile.goal}
Target monthly income: ₹${profile.targetMonthlyIncome}

═══════════════════════════════════════════
CURRENT MACRO TRENDS (use if relevant)
═══════════════════════════════════════════
${trendsCtx}

═══════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════

Generate 6-8 SPECIFIC micro-opportunity plays for THIS person.

CRITICAL RULES:
1. NOT generic "start a startup" advice. Be SPECIFIC.
2. Match to their skills, capital, city tier, hours available.
3. Realistic ₹ numbers for India (a person in Ludhiana isn't earning like San Francisco).
4. Mix quick-money plays (₹5-15K/month in 2 months) with bigger plays (₹50K+/month in 6 months).
5. Include NON-DIGITAL options too — pottery, cooking, farming, crafts, tutoring, service business.
6. If their skills are limited, suggest SKILL-FIRST plays: "Learn X in 3 weeks → then do Y".
7. Use their city tier: metro = premium services, tier-2/3 = local markets, rural = agri/craft.

Examples of GOOD micro-opportunities:
- "Pottery Studio Micro-Business" (learn pottery 3 weeks → Instagram Reels + local exhibitions → ₹15-40K/month)
- "WhatsApp Automation for Local Retailers" (CS student → Twilio bots → ₹5K per client × 5 clients = ₹25K/month)
- "Ayurveda Ingredient Wholesale" (Botany BSc → source & pack medicinal herbs → ₹20-50K/month)
- "Regional Cloud Kitchen" (housewife with cooking skills → Zomato specialty dish → ₹30-80K/month)
- "Freelance Data Cleaning" (any student → learn Excel+Python → Upwork gigs → ₹15-40K/month)
- "Rooftop Microgreens Farming" (small space → premium restaurants → ₹20-40K/month)

Examples of BAD (generic, avoid these):
- "Start a startup"
- "Become an entrepreneur"
- "Do freelancing"
- "Invest in stocks"

Return ONLY valid JSON:

{
  "opportunities": [
    {
      "title": "Specific niche play (5-10 words)",
      "shortDescription": "1-sentence what this is",
      "category": "Skill|Craft|Service|Digital|Food|Farming|Trading|Content|Tutoring|Wholesale|Other",
      "difficulty": "Easy|Medium|Hard",
      "investment": 5000,
      "timeToFirstIncome": "e.g., 2 weeks, 1 month, 3 months",
      "timeToSustainableIncome": "e.g., 3 months, 6 months",
      "monthlyRevenueMin": 5000,
      "monthlyRevenueMax": 25000,
      "skillsToLearn": [
        { "skill": "Skill name", "timeToLearn": "e.g., 2 weeks, free on YouTube" }
      ],
      "whyThisFits": "Why THIS person specifically (reference their situation/skills/city)",
      "step30Day": "What to do in the first 30 days (2-3 sentences)",
      "step60Day": "What to do in days 31-60",
      "step90Day": "What to do in days 61-90 to hit target income",
      "whereToFindCustomers": "Specific channels/marketplaces for THIS play",
      "realExamples": "2-3 sentences on actual people/businesses doing this in India",
      "risks": ["2-3 practical risks or reasons this might not work"],
      "relatedTrend": "Name of related macro trend from list above (or empty string)"
    }
  ]
}

Generate 6-8 opportunities. Mix difficulty levels and revenue ranges. Be specific to their city and skills.`;

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are an elite India-focused career and micro-business coach. You know grassroots opportunities. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    });
  } catch (err) {
    if (err.status === 429) {
      triggerCooldown(60);
      throw new Error('AI rate limit reached. Try again in 1 hour.');
    }
    throw err;
  }

  const parsed = JSON.parse(completion.choices[0].message.content);
  return {
    opportunities: parsed.opportunities || [],
    generatedAt: new Date(),
    profileSnapshot: {
      situation: profile.situation,
      city: profile.city,
      capital: profile.capital,
      hoursPerDay: profile.hoursPerDay
    }
  };
}