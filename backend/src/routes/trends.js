import express from 'express';
import Trend from '../models/Trend.js';
import Event from '../models/Event.js';
import { discoverTrends } from '../services/trendDiscoveryService.js';

const router = express.Router();

// GET /api/trends
router.get('/', async (req, res) => {
  try {
    const count = await Trend.countDocuments();
    if (count === 0) {
      console.log('No trends yet — running discovery...');
      await discoverTrends();
    }
    const trends = await Trend.find().sort({ momentum: -1 }).lean();
    res.json(trends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/trends/:slug
router.get('/:slug', async (req, res) => {
  try {
    const trend = await Trend.findOne({ slug: req.params.slug }).lean();
    if (!trend) return res.status(404).json({ error: 'Trend not found' });

    let events = [];
    if (trend.supportingEventIds?.length > 0) {
      events = await Event.find({ _id: { $in: trend.supportingEventIds } })
        .sort({ publishedAt: -1 })
        .lean();
    }

    res.json({ trend, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
});

// POST /api/trends/discover
router.post('/discover', async (req, res) => {
  try {
    const trends = await discoverTrends();
    res.json({ discovered: trends.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Discovery failed' });
  }
});

export default router;