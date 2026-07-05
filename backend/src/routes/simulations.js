import express from 'express';
import Simulation from '../models/Simulation.js';
import { runSimulation } from '../services/simulationService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sims = await Simulation.find()
      .sort({ createdAt: -1 })
      .select('scenario category createdAt analysis.probability analysis.executiveVerdict')
      .lean();
    res.json(sims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sim = await Simulation.findById(req.params.id).lean();
    if (!sim) return res.status(404).json({ error: 'Not found' });
    res.json(sim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/run', async (req, res) => {
  try {
    const { scenario } = req.body || {};
    if (!scenario) return res.status(400).json({ error: 'Scenario required' });
    const sim = await runSimulation(scenario);
    res.json(sim);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Simulation.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;