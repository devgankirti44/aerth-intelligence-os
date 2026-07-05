
import express from 'express';
import Opportunity from '../models/Opportunity.js';
import { discoverOpportunities } from '../services/opportunityService.js';

const router = express.Router();

// GET /api/opportunities - Get all active strategic opportunities
router.get('/', async (req, res) => {
  try {
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      console.log('No opportunities found. Initiating discovery pipeline...');
      await discoverOpportunities();
    }
    
    const opportunities = await Opportunity.find({ status: 'active' })
      .sort({ score: -1 })
      .lean();
      
    res.json(opportunities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// POST /api/opportunities/discover - Force run AI strategy engine
router.post('/discover', async (req, res) => {
  try {
    const opportunities = await discoverOpportunities();
    res.json({ status: 'success', count: opportunities.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;