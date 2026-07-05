// backend/src/routes/companies.js

import express from 'express';
import Company from '../models/Company.js';
import Event from '../models/Event.js';
import Insight from '../models/Insight.js';
import { fetchAndStoreNews } from '../services/newsService.js';
import { fetchGithubActivity } from '../services/githubService.js';
import { generateCompanyInsight } from '../services/aiService.js';
import { ragAnswer, getChatHistory } from '../services/ragService.js';
import { getCompanyAnalytics } from '../services/analyticsService.js';

const router = express.Router();

/**
 * GET /api/companies
 */
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({ isTracked: true })
      .sort({ name: 1 })
      .lean();

    const enriched = await Promise.all(
      companies.map(async (c) => {
        const eventCount = await Event.countDocuments({ companySlug: c.slug });
        const latestEvent = await Event.findOne({ companySlug: c.slug })
          .sort({ publishedAt: -1 })
          .lean();
        return {
          ...c,
          eventCount,
          latestEvent: latestEvent ? {
            title: latestEvent.title,
            publishedAt: latestEvent.publishedAt
          } : null
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list companies' });
  }
});

/**
 * GET /api/companies/:slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug }).lean();
    if (!company) return res.status(404).json({ error: 'Not found' });

    // Auto-refresh news if stale
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    if (!company.lastFetchedNews || company.lastFetchedNews < sixHoursAgo) {
      await fetchAndStoreNews(company);
      await Company.updateOne(
        { slug: company.slug },
        { lastFetchedNews: new Date() }
      );
    }

    const events = await Event.find({ companySlug: company.slug })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();

    let insight = await Insight.findOne({ companySlug: company.slug }).lean();
    if (!insight && events.length > 0) {
      insight = await generateCompanyInsight(company);
    }

    let github = null;
    if (company.github) {
      github = await fetchGithubActivity(company.github);
    }

    res.json({ company, events, insight, github });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load company' });
  }
});

/**
 * POST /api/companies/:slug/refresh
 */
router.post('/:slug/refresh', async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ error: 'Not found' });

    const newEvents = await fetchAndStoreNews(company);
    const insight = await generateCompanyInsight(company);

    await Company.updateOne(
      { slug: company.slug },
      { lastFetchedNews: new Date() }
    );

    res.json({
      newEventsCount: newEvents.length,
      insight
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

/**
 * POST /api/companies/:slug/ask
 * RAG endpoint — vector search + LLM with citations
 */
router.post('/:slug/ask', async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });

    const result = await ragAnswer({
      question,
      companySlug: req.params.slug,
      sessionId: sessionId || `${req.params.slug}-default`
    });

    res.json(result);
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to answer' });
  }
});

/**
 * GET /api/companies/:slug/history
 */
router.get('/:slug/history', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || `${req.params.slug}-default`;
    const history = await getChatHistory(sessionId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load history' });
  }
});

/**
 * GET /api/companies/:slug/analytics
 * MongoDB aggregation pipeline demo
 */
router.get('/:slug/analytics', async (req, res) => {
  try {
    const analytics = await getCompanyAnalytics(req.params.slug);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Analytics failed' });
  }
});

export default router;