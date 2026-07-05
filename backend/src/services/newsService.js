// backend/src/services/newsService.js

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import Event from '../models/Event.js';
import { embedEvent } from './embeddingService.js';

const NEWS_API = 'https://newsapi.org/v2/everything';

const INDUSTRY_KEYWORDS = {
  'Artificial Intelligence': 'AI OR "artificial intelligence" OR LLM OR startup OR launches OR announces OR raises OR partnership',
  'Semiconductors': 'chip OR semiconductor OR GPU OR AI OR earnings OR foundry',
  'default': 'company OR business OR tech OR launches OR announces'
};

const TRUSTED_DOMAINS = [
  'techcrunch.com', 'theverge.com', 'bloomberg.com', 'reuters.com',
  'wsj.com', 'ft.com', 'cnbc.com', 'arstechnica.com', 'wired.com',
  'forbes.com', 'businessinsider.com', 'venturebeat.com',
  'axios.com', 'theinformation.com', 'protocol.com', 'engadget.com'
].join(',');

const JUNK_PATTERNS = [
  'recipe', 'cooking', 'chef', 'restaurant', 'menu',
  'celebrity', 'gossip', 'divorce', 'dating',
  'horoscope', 'weather forecast', 'sports score',
  'fashion week', 'movie review'
];

export async function fetchAndStoreNews(company) {
  if (!process.env.NEWS_API_KEY) {
    console.warn('NEWS_API_KEY missing');
    return [];
  }

  try {
    const industryTerms = INDUSTRY_KEYWORDS[company.industry] || INDUSTRY_KEYWORDS.default;
    const query = `"${company.name}" AND (${industryTerms})`;

    const { data } = await axios.get(NEWS_API, {
      params: {
        q: query,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 30,
        apiKey: process.env.NEWS_API_KEY,
        domains: TRUSTED_DOMAINS
      }
    });

    if (!data.articles?.length) {
      console.log(`No news from trusted sources for ${company.name}`);
      return [];
    }

    // Filter for relevance
    const relevantArticles = data.articles.filter(article => {
      const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
      const companyLower = company.name.toLowerCase();

      if (!text.includes(companyLower)) return false;
      return !JUNK_PATTERNS.some(junk => text.includes(junk));
    });

    if (!relevantArticles.length) {
      console.log(`No relevant articles for ${company.name} after filtering`);
      return [];
    }

    const events = [];

    for (const article of relevantArticles) {
      if (!article.title || !article.url) continue;

      const exists = await Event.findOne({ url: article.url });
      if (exists) continue;

      const event = await Event.create({
        companySlug: company.slug,
        type: detectEventType(article.title, article.description),
        title: article.title,
        summary: article.description || '',
        url: article.url,
        source: article.source?.name || 'Unknown',
        imageUrl: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        significance: detectSignificance(article.title, article.description)
      });

      // Generate embedding for RAG
      await embedEvent(event);
      events.push(event);
    }

    console.log(`✓ ${company.name}: ${events.length} relevant events stored`);
    return events;

  } catch (error) {
    console.error(`News error (${company.name}):`, error.message);
    return [];
  }
}

function detectEventType(title, description) {
  const text = `${title} ${description || ''}`.toLowerCase();
  if (/launch|releases?|unveil|announce|introduce/.test(text)) return 'product_launch';
  if (/raise[sd]?|funding|series [a-z]|investment|valuation/.test(text)) return 'funding';
  if (/acqui|purchase|buy|merger/.test(text)) return 'acquisition';
  if (/partner|collaborat|team up|deal/.test(text)) return 'partnership';
  if (/hire[sd]?|hiring|talent|staff/.test(text)) return 'hiring';
  if (/ceo|cto|cfo|resign|appoint|steps down/.test(text)) return 'leadership_change';
  if (/regul|law|court|lawsuit|sued|complian/.test(text)) return 'regulation';
  return 'news';
}

function detectSignificance(title, description) {
  const text = `${title} ${description || ''}`.toLowerCase();
  if (/billion|major|breakthrough|first ever|historic|acqui|ipo/.test(text)) return 'critical';
  if (/million|launch|announce|partner|expand/.test(text)) return 'high';
  if (/update|beta|version|release/.test(text)) return 'medium';
  return 'medium';
}