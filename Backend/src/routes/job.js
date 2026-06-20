const express = require('express');
const router = express.Router();
const JobRequest = require('../models/jobrequest.models');
const Earning = require('../models/earning.models');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/jobs/mine  (protected, worker only — their incoming requests)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ error: 'Worker accounts only' });
    const requests = await JobRequest.find({ workerId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ total: requests.length, requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job requests' });
  }
});

// POST /api/jobs  (protected — a user requests a worker for a job)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { workerId, task, location, budget } = req.body;
    if (!workerId || !task) return res.status(400).json({ error: 'workerId and task are required' });

    const request = await JobRequest.create({
      workerId, userId: req.user.id, user: req.user.name,
      task, location: location || '', budget: Number(budget) || 0,
    });
    res.status(201).json({ message: 'Job request sent', request });
  } catch (err) {
    console.error('Create job request error:', err);
    res.status(500).json({ error: 'Failed to create job request' });
  }
});

// PATCH /api/jobs/:id  (protected, worker only — accept or decline)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be accepted or declined' });
    }

    const request = await JobRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Job request not found' });
    if (request.workerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not your job request' });
    }

    request.status = status;
    await request.save();

    // When accepted, automatically create a pending earning record
    if (status === 'accepted') {
      await Earning.create({
        workerId: request.workerId, jobRequestId: request._id,
        user: request.user, task: request.task, amount: request.budget, status: 'pending',
      });
    }

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    console.error('Update job request error:', err);
    res.status(500).json({ error: 'Failed to update job request' });
  }
});

module.exports = router;