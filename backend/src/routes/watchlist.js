import express from 'express';
import WatchlistItem from '../models/WatchlistItem.js';

const router = express.Router();

// GET /api/watchlist — all items
router.get('/', async (req, res) => {
  try {
    const items = await WatchlistItem.find({ status: { $ne: 'archived' } })
      .sort({ priority: 1, pinnedAt: -1 })
      .lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/watchlist — pin an item
router.post('/', async (req, res) => {
  try {
    const { itemType, refId, title, subtitle, linkPath } = req.body;
    if (!itemType || !title) {
      return res.status(400).json({ error: 'itemType and title required' });
    }
    
    const item = await WatchlistItem.findOneAndUpdate(
      { itemType, refId },
      { itemType, refId, title, subtitle, linkPath, pinnedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/watchlist/:id — update notes/tags/priority/status
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['notes', 'tags', 'priority', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const item = await WatchlistItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/watchlist/:id
router.delete('/:id', async (req, res) => {
  try {
    await WatchlistItem.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/watchlist/check/:itemType/:refId — is item pinned?
router.get('/check/:itemType/:refId', async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({
      itemType: req.params.itemType,
      refId: req.params.refId
    }).lean();
    res.json({ pinned: !!item, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;