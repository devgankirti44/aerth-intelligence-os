// backend/src/routes/ask.js

import express from 'express';
import { ragAnswer } from '../services/ragService.js';

const router = express.Router();

/**
 * POST /api/ask
 * Global Ask AERTH AI endpoint.
 * Searches across all events, not just one company.
 */
router.post('/', async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await ragAnswer({
      question,
      companySlug: null,
      sessionId: sessionId || 'global-aerth-assistant'
    });

    res.json(result);
  } catch (error) {
    console.error('Global Ask error:', error);
    res.status(500).json({
      error: 'Failed to answer question',
      details: error.message
    });
  }
});

export default router;