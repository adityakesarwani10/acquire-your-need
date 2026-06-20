/**
 * ML-style Worker Ranking Algorithm
 * Scores workers on 5 weighted factors to rank best matches.
 * Works on plain JS objects (call .lean() or .toObject() before passing in).
 */

const WEIGHTS = {
  rating: 0.30,
  experience: 0.25,
  jobsCompleted: 0.20,
  responseRate: 0.15,
  availability: 0.10,
};

function normalize(value, min, max) {
  if (max === min) return 100;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

// completionRate doubles as our "response rate" signal since both represent reliability
function scoreWorker(worker, allWorkers) {
  const maxExp  = Math.max(1, ...allWorkers.map(w => w.experience || 0));
  const maxJobs = Math.max(1, ...allWorkers.map(w => w.jobsCompleted || 0));

  const ratingScore   = normalize(worker.rating || 0, 0, 5);
  const expScore      = normalize(worker.experience || 0, 0, maxExp);
  const jobsScore     = normalize(worker.jobsCompleted || 0, 0, maxJobs);
  const responseScore = normalize(worker.completionRate || 85, 0, 100);
  const availScore    = worker.available ? 100 : 20;

  const total =
    ratingScore   * WEIGHTS.rating +
    expScore      * WEIGHTS.experience +
    jobsScore     * WEIGHTS.jobsCompleted +
    responseScore * WEIGHTS.responseRate +
    availScore    * WEIGHTS.availability;

  return Math.round(total);
}

function buildScoreBreakdown(worker, allWorkers) {
  const maxExp  = Math.max(1, ...allWorkers.map(w => w.experience || 0));
  const maxJobs = Math.max(1, ...allWorkers.map(w => w.jobsCompleted || 0));
  return [
    { label: 'Customer satisfaction', value: Math.round(normalize(worker.rating || 0, 0, 5)) },
    { label: 'Job completion rate',   value: worker.completionRate || 85 },
    { label: 'Response time',         value: Math.round(normalize(worker.experience || 0, 0, maxExp)) },
    { label: 'Verified credentials',  value: worker.verified ? 100 : 60 },
    { label: 'Repeat hire rate',      value: Math.round(normalize(worker.jobsCompleted || 0, 0, maxJobs)) },
  ];
}

// NLP-style intent extraction — maps free text to a skill category
function extractIntent(query) {
  const q = query.toLowerCase();
  const skillMap = {
    plumber:        ['plumb', 'pipe', 'leak', 'tap', 'water', 'drain', 'bathroom', 'toilet', 'tank', 'heater'],
    electrician:    ['electric', 'wiring', 'wire', 'short circuit', 'fan', 'light', 'switch', 'mcb', 'inverter', 'cctv', 'panel', 'smart home'],
    carpenter:      ['carpen', 'furniture', 'wood', 'door', 'wardrobe', 'cabinet', 'polish', 'modular kitchen', 'ceiling'],
    painter:        ['paint', 'wall', 'texture', 'colour', 'color', 'waterproof'],
    mason:          ['mason', 'rcc', 'roof', 'crack', 'tiling', 'compound wall', 'brick'],
    'ac technician': ['ac', 'air condition', 'cooling', 'split', 'gas', 'refill', 'duct', 'cassette'],
    cleaner:        ['clean', 'deep clean', 'carpet', 'move-in', 'move out', 'office cleaning'],
  };
  const matches = [];
  for (const [skill, keywords] of Object.entries(skillMap)) {
    if (keywords.some(k => q.includes(k))) matches.push(skill);
  }
  return matches;
}

/**
 * Main ranking function
 * @param {Array} workers - array of plain worker objects (already role-filtered to 'worker')
 * @param {string} query - free-text search
 * @param {string} filterSkill - exact skill filter
 */
function rankWorkers(workers, query = '', filterSkill = '') {
  let pool = [...workers];

  if (filterSkill && filterSkill.toLowerCase() !== 'all') {
    pool = pool.filter(w => (w.skill || '').toLowerCase() === filterSkill.toLowerCase());
  }

  if (query.trim()) {
    const intents = extractIntent(query);
    if (intents.length > 0) {
      const filtered = pool.filter(w =>
        intents.some(i => (w.skill || '').toLowerCase().includes(i) || i.includes((w.skill || '').toLowerCase()))
      );
      if (filtered.length > 0) pool = filtered;
    } else {
      // fall back to plain substring match on name/skill/subSkills
      const filtered = pool.filter(w =>
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        (w.skill || '').toLowerCase().includes(query.toLowerCase()) ||
        (w.subSkills || []).some(s => s.toLowerCase().includes(query.toLowerCase()))
      );
      if (filtered.length > 0) pool = filtered;
    }
  }

  const scored = pool.map(worker => ({
    ...worker,
    mlScore: scoreWorker(worker, workers),
  }));

  scored.sort((a, b) => b.mlScore - a.mlScore);
  return scored;
}

module.exports = { rankWorkers, scoreWorker, buildScoreBreakdown, extractIntent };