import express from 'express';
import Report from '../models/Report.js';
import { generateReport } from '../services/reportService.js';

const router = express.Router();

// GET /api/reports — list all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ generatedAt: -1 })
      .select('title topic type generatedAt meta status')
      .lean();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id — get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/reports/generate — generate a new report
router.post('/generate', async (req, res) => {
  try {
    const { topic, type } = req.body || {};
    const report = await generateReport({ topic, type });
    res.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;