import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import Event from '../models/Event.js';
import { generateEmbedding } from './embeddingService.js';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// 7 macro domains with strategic search queries
const DOMAINS = [
  {
    key: 'india_agriculture',
    region: 'India',
    queries: [
      'India agriculture exports wheat rice',
      'India farmers MSP monsoon',
      'India smart farming precision agriculture',
      'India agri-tech startup drone'
    ]
  },
  {
    key: 'food_security',
    region: 'Global',
    queries: [
      'global food shortage 2025',
      'wheat rice grain export ban',
      'climate change food supply',
      'food inflation developing countries'
    ]
  },
  {
    key: 'commodities',
    region: 'Global',
    queries: [
      'gold price surge central bank',
      'silver commodity rally',
      'lithium supply chain battery',
      'copper oil crude price'
    ]
  },
  {
    key: 'currency_macro',
    region: 'Global',
    queries: [
      'US dollar decline reserve currency',
      'BRICS de-dollarization',
      'Indian rupee yuan currency',
      'Federal Reserve inflation interest rate'
    ]
  },
  {
    key: 'geopolitics',
    region: 'Global',
    queries: [
      'Trump tariff China trade',
      'US China semiconductor export control',
      'Taiwan chip sanctions',
      'India Russia oil sanctions'
    ]
  },
  {
    key: 'energy_transition',
    region: 'Global',
    queries: [
      'solar power India renewable',
      'electric vehicle adoption battery',
      'green hydrogen investment',
      'OPEC oil production cut'
    ]
  },
  {
    key: 'india_manufacturing',
    region: 'India',
    queries: [
      'India PLI scheme manufacturing',
      'India semiconductor mission fab',
      'India defense export HAL',
      'India China plus one supply chain'
    ]
  }
];

/**
 * Fetch news for one query and store as world_signal events
 */
async function fetchQuery(query, domain, region) {
  try {
    const res = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 8,
        apiKey: NEWS_API_KEY
      },
      timeout: 15000
    });

    const articles = res.data.articles || [];
    let saved = 0;

    for (const art of articles) {
      if (!art.title || !art.url) continue;
      
      // Dedupe
      const exists = await Event.findOne({ url: art.url });
      if (exists) continue;

      const text = `${art.title}. ${art.description || ''}`;
      let embedding = null;
      try {
        embedding = await generateEmbedding(text);
      } catch (e) {
        // embedding failure shouldn't block storage
      }

      await Event.create({
        companySlug: 'global',
        type: 'world_signal',
        domain,
        region,
        keywords: query.split(' '),
        title: art.title,
        summary: art.description || '',
        url: art.url,
        source: art.source?.name || 'Unknown',
        imageUrl: art.urlToImage,
        publishedAt: new Date(art.publishedAt),
        embedding,
        embeddedAt: embedding ? new Date() : null
      });

      saved++;
    }

    return saved;
  } catch (err) {
    console.error(`  ✗ Query "${query}" failed:`, err.message);
    return 0;
  }
}

/**
 * Ingest world signals across all domains
 */
export async function ingestWorldSignals() {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY missing — skipping world signals');
    return { total: 0 };
  }

  console.log('\n🌍 Starting world signals ingestion...');
  const startTime = Date.now();
  let totalSaved = 0;
  const breakdown = {};

  for (const { key, region, queries } of DOMAINS) {
    console.log(`\n[${key}]`);
    let domainSaved = 0;
    for (const q of queries) {
      const n = await fetchQuery(q, key, region);
      domainSaved += n;
      // Rate limit: NewsAPI free = 100 req/day
      await new Promise(r => setTimeout(r, 1500));
    }
    breakdown[key] = domainSaved;
    console.log(`  → ${domainSaved} new signals`);
    totalSaved += domainSaved;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ World ingestion complete: ${totalSaved} signals in ${elapsed}s`);
  console.log('Breakdown:', breakdown);

  return { total: totalSaved, breakdown };
}