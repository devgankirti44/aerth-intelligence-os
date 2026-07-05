import express from 'express';
import Company from '../models/Company.js';
import Trend from '../models/Trend.js';
import Opportunity from '../models/Opportunity.js';
import Event from '../models/Event.js';

const router = express.Router();

// GET /api/graph — build entity relationship graph
router.get('/', async (req, res) => {
  try {
    const nodes = [];
    const links = [];
    const nodeIds = new Set();

    const addNode = (id, label, type, extra = {}) => {
      if (nodeIds.has(id)) return;
      nodeIds.add(id);
      nodes.push({ id, label, type, ...extra });
    };

    // Companies
    const companies = await Company.find().limit(60).lean();
    companies.forEach(c => {
      addNode(`company:${c.slug}`, c.name, 'company', {
        sector: c.sector,
        val: 8
      });
    });

    // Trends
    const trends = await Trend.find().lean();
    trends.forEach(t => {
      const nodeId = `trend:${t.slug}`;
      addNode(nodeId, t.name, 'trend', {
        category: t.category,
        momentum: t.momentum,
        val: 6 + (t.momentum / 20)
      });

      // Link trends to their companies
      (t.signals?.companiesInvolved || []).forEach(slug => {
        const cid = `company:${slug}`;
        if (nodeIds.has(cid)) {
          links.push({ source: cid, target: nodeId, type: 'drives' });
        }
      });
    });

    // Opportunities
    const opportunities = await Opportunity.find().lean();
    opportunities.forEach(o => {
      const nodeId = `opp:${o.slug}`;
      addNode(nodeId, o.title, 'opportunity', {
        sector: o.sector,
        score: o.score,
        val: 5 + (o.score / 20)
      });

      // Link opportunities to associated trends
      (o.associatedTrendSlugs || []).forEach(slug => {
        const tid = `trend:${slug}`;
        if (nodeIds.has(tid)) {
          links.push({ source: tid, target: nodeId, type: 'enables' });
        }
      });
    });

    // Domains (from world signals)
    const domainAgg = await Event.aggregate([
      { $match: { type: 'world_signal' } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    domainAgg.forEach(d => {
      if (!d._id) return;
      addNode(`domain:${d._id}`, d._id.replace(/_/g, ' '), 'domain', {
        count: d.count,
        val: 10
      });
    });

    // Link trends to domains (by category matching or keyword)
    trends.forEach(t => {
      const catMap = {
        'AI': 'company',
        'Agriculture': 'india_agriculture',
        'Energy': 'energy_transition',
        'Geopolitics': 'geopolitics',
        'Finance': 'currency_macro',
        'Hardware': 'india_manufacturing'
      };
      const mappedDomain = catMap[t.category];
      if (mappedDomain && nodeIds.has(`domain:${mappedDomain}`)) {
        links.push({
          source: `trend:${t.slug}`,
          target: `domain:${mappedDomain}`,
          type: 'belongs'
        });
      }
    });

    res.json({
      nodes,
      links,
      stats: {
        nodeCount: nodes.length,
        linkCount: links.length,
        companies: companies.length,
        trends: trends.length,
        opportunities: opportunities.length,
        domains: domainAgg.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;