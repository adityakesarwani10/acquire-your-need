require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const keepAlive = require('./keepalive.js');

const authRoutes     = require('./src/routes/auth.js');
const workerRoutes   = require('./src/routes/worker.js');
const jobRoutes      = require('./src/routes/job.js');
const earningRoutes  = require('./src/routes/earning.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/worker',  workerRoutes);
app.use('/api/jobs',     jobRoutes);
app.use('/api/earnings', earningRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Acquire-Your-Need API running', version: '2.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', details: err.message });
});


// ── Start server only after DB connects ──────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Acquire-Your-Need API running at http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log(`   Workers: http://localhost:${PORT}/api/workers\n`);
    keepAlive(process.env.BACKEND_URL + "/api/health");
  });
});