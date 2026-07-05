import express from 'express';
import PersonalProfile from '../models/PersonalProfile.js';
import { requireAuth } from '../middleware/auth.js';
import { generateMicroOpportunities } from '../services/microOpportunityService.js';

const router = express.Router();

// GET profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const profile = await PersonalProfile.findOne({ userId: req.user._id }).lean();
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create/update profile
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const {
      situation, degree, currentSkills, interests,
      city, cityTier, hoursPerDay, capital,
      goal, targetMonthlyIncome
    } = req.body;

    const profile = await PersonalProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        situation, degree,
        currentSkills: currentSkills || [],
        interests: interests || [],
        city, cityTier,
        hoursPerDay: hoursPerDay || 3,
        capital: capital || 0,
        goal,
        targetMonthlyIncome: targetMonthlyIncome || 20000,
        // Invalidate cache on profile update
        cachedOpportunities: null,
        cachedAt: null
      },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET opportunities (cached 6h)
router.get('/opportunities', requireAuth, async (req, res) => {
  try {
    const profile = await PersonalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ error: 'No profile — create one first' });
    }

    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const forceRefresh = req.query.refresh === '1';

    if (!forceRefresh && profile.cachedOpportunities && profile.cachedAt) {
      const age = Date.now() - new Date(profile.cachedAt).getTime();
      if (age < SIX_HOURS) {
        return res.json({
          ...profile.cachedOpportunities,
          cached: true,
          cachedAt: profile.cachedAt
        });
      }
    }

    // Generate fresh
    try {
      console.log(`⚙ Generating micro opportunities for ${req.user.email}...`);
      const result = await generateMicroOpportunities(profile);
      
      profile.cachedOpportunities = result;
      profile.cachedAt = new Date();
      await profile.save();

      res.json({ ...result, cached: false });
    } catch (aiError) {
      // Serve stale cache if AI fails
      if (profile.cachedOpportunities) {
        return res.json({
          ...profile.cachedOpportunities,
          cached: true,
          stale: true,
          aiError: aiError.message
        });
      }
      throw aiError;
    }
  } catch (error) {
    console.error('Micro opportunities error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;