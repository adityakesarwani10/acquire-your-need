const express = require('express');
const router = express.Router();
const User = require('../models/user.models');
const Review = require('../models/review.models');
const { rankWorkers, buildScoreBreakdown } = require('../ml/ranworker.ml');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/workers/search?q=...&skill=...&location=...
router.get('/search', async (req, res) => {
  try {
    const { q = '', skill = '', location = '' } = req.query;

    const filter = { role: 'worker' };
    if (location) filter.city = new RegExp(location, 'i');

    const workers = await User.find(filter).lean();
    const safe = workers.map(({ password, ...rest }) => rest);

    const ranked = rankWorkers(safe, q, skill);
    res.json({ query: q, skill, location, total: ranked.length, workers: ranked });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/workers  (all workers, ML ranked)
router.get('/', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).lean();
    const safe = workers.map(({ password, ...rest }) => rest);
    const ranked = rankWorkers(safe, '', '');
    res.json({ total: ranked.length, workers: ranked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// GET /api/workers/categories/all
router.get('/categories/all', async (req, res) => {
  try {
    const skills = await User.distinct('skill', { role: 'worker', skill: { $ne: '' } });
    res.json({ categories: skills.sort() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/workers/:id  (single worker profile + reviews + live ML score)
router.get('/:id', async (req, res) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: 'worker' }).lean();
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const allWorkers = await User.find({ role: 'worker' }).lean();
    const [ranked] = rankWorkers([worker], '', '');
    const scoreBreakdown = buildScoreBreakdown(worker, allWorkers);

    const reviews = await Review.find({ workerId: worker._id }).sort({ createdAt: -1 }).lean();

    const { password, ...safeWorker } = worker;
    res.json({ worker: { ...safeWorker, mlScore: ranked.mlScore, scoreBreakdown }, reviews });
  } catch (err) {
    console.error('Worker fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

// POST /api/workers/:id/review  (protected — submit a review, recalculates rating)
router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { rating, comment, task } = req.body;
    if (!rating || !comment) return res.status(400).json({ error: 'Rating and comment are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const worker = await User.findOne({ _id: req.params.id, role: 'worker' });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const review = await Review.create({
      workerId: worker._id,
      authorId: req.user.id,
      author: req.user.name,
      authorAvatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(req.user.email)}`,
      rating: Number(rating),
      text: comment,
      task: task || '',
      verified: true, // came from an authenticated hire on the platform
    });

    // Recalculate worker's aggregate rating
    const allReviews = await Review.find({ workerId: worker._id });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    worker.rating = Math.round(avg * 10) / 10;
    worker.reviewCount = allReviews.length;
    await worker.save();

    res.status(201).json({ message: 'Review submitted', review, newRating: worker.rating });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;