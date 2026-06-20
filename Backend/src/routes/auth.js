const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.models');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth.middleware');

function sign(user) {
  return jwt.sign(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function avatarFor(seed) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,ffd5dc,b6e3f4,ffdfbf,d1f7c4`;
}

// POST /api/auth/register
// Accepts both plain user signup and the richer worker-signup payload.
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role = 'user', phone,
      // worker-only fields (ignored unless role === 'worker')
      skill, subSkills, experience, city, area, jobsCompleted,
      previousEmployer, portfolio, aadhar, license, bio,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userDoc = {
      name, email: email.toLowerCase(), password: hashedPassword, role, phone: phone || '',
      avatar: avatarFor(email),
    };

    if (role === 'worker') {
      Object.assign(userDoc, {
        skill: skill || '',
        subSkills: subSkills || [],
        city: city || 'Bengaluru',
        area: area || '',
        experience: Number(experience) || 0,
        jobsCompleted: Number(jobsCompleted) || 0,
        previousEmployer: previousEmployer || '',
        portfolio: portfolio || [],
        aadhar: aadhar || '',
        license: license || '',
        bio: bio || `${skill || 'Skilled worker'} with ${experience || 0} years of experience.`,
        pricePerHour: 350,
        mlScore: 70,        // starter score — recalculated on next ranking pass
        rating: 0,
        reviewCount: 0,
        available: true,
        verified: false,    // new workers start unverified
        completionRate: 85, // starter trust signal
        responseTime: '~30 min',
      });
    }

    const user = await User.create(userDoc);
    const token = sign(user);

    res.status(201).json({ message: 'Account created successfully', token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    if (role && user.role !== role) {
      return res.status(403).json({ error: `This account is not a ${role} account` });
    }

    const token = sign(user);
    res.json({ message: 'Login successful', token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me  (protected — returns fresh user doc, not just JWT payload)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;