import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import Company from '../models/Company.js';

let groq = null;
function getClient() {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

/**
 * AI detects competitors from the Companies DB for a user's company
 */
export async function detectCompetitors({ name, sector, description }) {
  const client = getClient();
  if (!client) return [];

  // Load all companies in relevant sectors + adjacent sectors
  const allCompanies = await Company.find().select('slug name sector description').lean();

  const companyList = allCompanies.map((c, i) =>
    `${i + 1}. [${c.slug}] ${c.name} — ${c.sector}${c.description ? ' — ' + c.description.slice(0, 100) : ''}`
  ).join('\n');

  const prompt = `You are a competitive intelligence analyst.

A user just registered their company:
- Name: ${name}
- Sector: ${sector}
- Description: ${description}

Below is our full database of companies. Your task: identify the 5-8 MOST RELEVANT COMPETITORS for the user's company.

Consider:
- Direct competitors (same product, same market)
- Adjacent competitors (similar market, different angle)
- Emerging threats (companies that could disrupt)
- Strategic reference points (bigger players to benchmark against)

COMPANIES DATABASE:
${companyList}

Return ONLY valid JSON:
{
  "competitorSlugs": ["slug1", "slug2", "slug3", ...],
  "reasoning": "1-2 sentence explanation of your competitor selection logic"
}

The slugs MUST match exactly from the database above. Pick 5-8 competitors.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an elite competitive intelligence analyst. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const validSlugs = allCompanies.map(c => c.slug);
    
    // Filter to only slugs that actually exist
    return (result.competitorSlugs || []).filter(s => validSlugs.includes(s));
  } catch (error) {
    console.error('Competitor detection error:', error.message);
    return [];
  }
}