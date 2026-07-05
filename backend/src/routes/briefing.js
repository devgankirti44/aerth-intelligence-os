// backend/src/routes/briefing.js

import express from 'express';
import Signal from '../models/Signal.js';

const router = express.Router();

// GET /api/briefing
router.get('/', async (req, res) => {
  try {
    res.json(getSeedData());
  } catch (error) {
    console.error('Briefing error:', error);
    res.status(500).json({ error: 'Failed to load briefing' });
  }
});

// POST /api/briefing/summary
router.post('/summary', async (req, res) => {
  res.json({
    summary: 'Multiple high-priority developments emerged today across AI infrastructure and regulatory frameworks. OpenAI and Anthropic continue accelerating capability competition at the frontier. EU enforcement actions signal increasing compliance burden for AI deployments in Europe.',
    actions: [
      'Monitor OpenAI GPT-5 enterprise adoption for competitive displacement signals',
      'Assess EU AI Act compliance requirements for any European market exposure',
      'Evaluate browser automation opportunity before large incumbents consolidate'
    ]
  });
});

function getSeedData() {
  return {
    date: new Date().toISOString(),
    signals: [
      {
        _id: '1',
        title: 'OpenAI launches GPT-5 with real-time reasoning capabilities',
        summary: 'GPT-5 introduces a new reasoning layer that reduces hallucinations by 60% and adds native code execution across 40 programming languages.',
        category: 'product_launch',
        importance: 'critical',
        company: 'OpenAI',
        source: { name: 'OpenAI Blog', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '2',
        title: 'Anthropic raises $2.5B Series E at $18B valuation',
        summary: 'Round led by Google with participation from Spark Capital. Capital allocated toward training infrastructure and constitutional AI research.',
        category: 'funding',
        importance: 'critical',
        company: 'Anthropic',
        source: { name: 'Bloomberg', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '3',
        title: 'EU AI Act enforcement begins for high-risk systems',
        summary: 'European regulators begin enforcement actions against AI systems in healthcare and financial services. Fines up to 3% of global revenue.',
        category: 'regulation',
        importance: 'high',
        country: 'European Union',
        source: { name: 'Reuters', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '4',
        title: 'NVIDIA announces Blackwell Ultra GPU architecture',
        summary: 'New architecture delivers 4x performance improvement over H100. First shipments expected Q3 2025 to hyperscalers.',
        category: 'product_launch',
        importance: 'high',
        company: 'NVIDIA',
        source: { name: 'NVIDIA Newsroom', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '5',
        title: 'Microsoft acquires AI security startup Calypso for $800M',
        summary: 'Acquisition adds LLM firewall and red-teaming capabilities to Azure AI platform. Team of 120 engineers joins Microsoft Security division.',
        category: 'acquisition',
        importance: 'high',
        company: 'Microsoft',
        source: { name: 'WSJ', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '6',
        title: 'Perplexity AI hiring surge signals enterprise push',
        summary: '47 new enterprise sales and solutions engineer roles posted this week. Pattern consistent with pre-launch enterprise product preparation.',
        category: 'hiring',
        importance: 'medium',
        company: 'Perplexity',
        source: { name: 'LinkedIn', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '7',
        title: 'China announces $47B semiconductor self-sufficiency fund',
        summary: 'State-backed investment targeting advanced logic and memory chip production. Primary focus on replacing TSMC dependency for military applications.',
        category: 'geopolitical',
        importance: 'high',
        country: 'China',
        source: { name: 'Financial Times', url: '#' },
        publishedAt: new Date()
      },
      {
        _id: '8',
        title: 'Stanford HAI releases 2025 AI Index Report',
        summary: 'Report finds AI investment up 340% in 3 years. Agentic systems now dominant research focus, surpassing language models in paper count.',
        category: 'research',
        importance: 'medium',
        source: { name: 'Stanford HAI', url: '#' },
        publishedAt: new Date()
      }
    ],
    meta: { total: 8, critical: 2, high: 4 }
  };
}

export default router;