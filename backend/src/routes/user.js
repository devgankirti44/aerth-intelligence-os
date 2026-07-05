import express from 'express';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';
import { detectCompetitors } from '../services/competitorService.js';
import { generateMyCompanyBrief } from '../services/myCompanyService.js';

const router = express.Router();

// POST /api/user/company
router.post('/company', requireAuth, async (req, res) => {
  try {
    const { name, sector, size, description, website, country, interests } = req.body;

    if (!name || !sector || !description) {
      return res.status(400).json({ error: 'name, sector, and description required' });
    }

    const detectedCompetitors = await detectCompetitors({ name, sector, description });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        myCompany: {
          name, sector,
          size: size || 'startup',
          description, website, country,
          interests: interests || [],
          detectedCompetitors,
          registeredAt: new Date(),
          cachedBrief: null,
          cachedBriefAt: null,
          cachedBriefMeta: null
        }
      },
      { new: true }
    ).select('-passwordHash');

    res.json({ user, competitors: detectedCompetitors });
  } catch (error) {
    console.error('Register company error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/company/competitors
router.get('/company/competitors', requireAuth, async (req, res) => {
  try {
    const slugs = req.user.myCompany?.detectedCompetitors || [];
    if (slugs.length === 0) return res.json([]);
    const competitors = await Company.find({ slug: { $in: slugs } }).lean();
    res.json(competitors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/user/company/competitors
router.patch('/company/competitors', requireAuth, async (req, res) => {
  try {
    const { competitors } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      'myCompany.detectedCompetitors': competitors
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/company/brief — WITH 6H CACHE + STALE FALLBACK
router.get('/company/brief', requireAuth, async (req, res) => {
  try {
    if (!req.user.myCompany?.name) {
      return res.status(400).json({ error: 'No company registered' });
    }

    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const cached = req.user.myCompany.cachedBrief;
    const cachedAt = req.user.myCompany.cachedBriefAt;
    const forceRefresh = req.query.refresh === '1';

    // Serve fresh cache
    if (!forceRefresh && cached && cachedAt && (Date.now() - new Date(cachedAt).getTime() < SIX_HOURS)) {
      console.log(`✓ Serving cached brief for ${req.user.myCompany.name}`);
      return res.json({
        brief: cached,
        meta: req.user.myCompany.cachedBriefMeta || {},
        cached: true,
        cachedAt
      });
    }

    // Try to generate fresh
    try {
      console.log(`⚙ Generating fresh brief for ${req.user.myCompany.name}...`);
      const result = await generateMyCompanyBrief(req.user.myCompany);
      await User.findByIdAndUpdate(req.user._id, {
        'myCompany.cachedBrief': result.brief,
        'myCompany.cachedBriefAt': new Date(),
        'myCompany.cachedBriefMeta': result.meta
      });
      return res.json({ ...result, cached: false });
    } catch (aiError) {
      // AI failed — serve stale cache if we have any
      if (cached) {
        console.log(`⚠ AI failed, serving stale cache for ${req.user.myCompany.name}`);
        return res.json({
          brief: cached,
          meta: req.user.myCompany.cachedBriefMeta || {},
          cached: true,
          cachedAt,
          stale: true,
          aiError: aiError.message
        });
      }
      throw aiError;
    }
  } catch (error) {
    console.error('Brief error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/company/competitor-events
router.get('/company/competitor-events', requireAuth, async (req, res) => {
  try {
    const slugs = req.user.myCompany?.detectedCompetitors || [];
    if (slugs.length === 0) return res.json([]);
    const events = await Event.find({ companySlug: { $in: slugs } })
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;