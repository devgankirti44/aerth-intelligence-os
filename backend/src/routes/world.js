import express from 'express';
import { ingestWorldSignals } from '../services/worldSignalsService.js';
import Event from '../models/Event.js';

const router = express.Router();

// POST /api/world/ingest — manually trigger world signal ingestion
router.post('/ingest', async (req, res) => {
  try {
    ingestWorldSignals().catch(e => console.error('World ingest bg:', e));
    res.json({ status: 'started', message: 'Ingesting world signals in background. Watch backend terminal.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/world/stats — see what's in the DB
router.get('/stats', async (req, res) => {
  try {
    const stats = await Event.aggregate([
      { $match: { type: 'world_signal' } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const total = await Event.countDocuments({ type: 'world_signal' });
    res.json({ total, byDomain: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;