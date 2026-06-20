const express = require('express');
const router = express.Router();
const Earning = require('../models/earning.models');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/earnings/mine  (protected, worker only)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ error: 'Worker accounts only' });

    const earnings = await Earning.find({ workerId: req.user.id }).sort({ createdAt: -1 }).lean();

    const paidTotal     = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
    const pendingTotal  = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

    res.json({ total: earnings.length, paidTotal, pendingTotal, earnings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// PATCH /api/earnings/:id/mark-paid  (protected, worker only — demo helper to simulate payout)
router.patch('/:id/mark-paid', authMiddleware, async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id);
    if (!earning) return res.status(404).json({ error: 'Earning not found' });
    if (earning.workerId.toString() !== req.user.id) return res.status(403).json({ error: 'Not yours' });

    earning.status = 'paid';
    earning.paidAt = new Date();
    await earning.save();

    res.json({ message: 'Marked as paid', earning });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update earning' });
  }
});

module.exports = router;