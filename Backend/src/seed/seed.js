/**
 * Seed script — populates MongoDB with realistic demo data so the app
 * behaves like a live product immediately after setup.
 *
 * Run with: npm run seed
 * Safe to re-run — it wipes and re-creates all collections.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db.js');

const User = require('../models/user.models');
const Review = require('../models/review.models');
const JobRequest = require('../models/jobRequest.models');
const Earning = require('../models/earning.models');

const avatar = (seed) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,ffd5dc,b6e3f4,ffdfbf,d1f7c4`;

// ── 15 workers, matching the frontend's mock-data.ts shape ──────────────────
const WORKERS = [
  { name: "Ravi Kumar", skill: "Electrician", subSkills: ["Wiring", "Panel install", "Smart home", "Fan & light fitting", "Inverter setup"], city: "Bengaluru", area: "Indiranagar", rating: 4.9, reviewCount: 248, pricePerHour: 450, experience: 9, jobsCompleted: 612, mlScore: 96, available: true, verified: true, phone: "+91 98765 43210", responseTime: "~12 min", completionRate: 99, bio: "Licensed electrician with 9 years of residential & commercial wiring experience. Specialist in smart-home retrofits and full panel upgrades." },
  { name: "Priya Sharma", skill: "Plumber", subSkills: ["Leak repair", "Bathroom fitting", "Water heater", "Pipe fitting", "Drainage"], city: "Bengaluru", area: "Koramangala", rating: 4.8, reviewCount: 192, pricePerHour: 380, experience: 7, jobsCompleted: 421, mlScore: 93, available: true, verified: true, phone: "+91 98765 00002", responseTime: "~18 min", completionRate: 97, bio: "Punctual plumber known for exceptionally clean work. Bathroom remodels and water-heater specialist." },
  { name: "Mohammed Faiz", skill: "Carpenter", subSkills: ["Modular kitchen", "Wardrobe", "Doors", "Furniture repair", "False ceiling"], city: "Bengaluru", area: "HSR Layout", rating: 4.7, reviewCount: 156, pricePerHour: 520, experience: 12, jobsCompleted: 389, mlScore: 89, available: false, verified: true, phone: "+91 98765 00003", responseTime: "~30 min", completionRate: 94, bio: "Master carpenter focused on modular furniture, bespoke wardrobes, and false ceiling work." },
  { name: "Anjali Reddy", skill: "Painter", subSkills: ["Interior", "Exterior", "Texture", "Waterproofing", "Wood polish"], city: "Bengaluru", area: "Whitefield", rating: 4.6, reviewCount: 134, pricePerHour: 320, experience: 6, jobsCompleted: 287, mlScore: 84, available: true, verified: true, phone: "+91 98765 00004", responseTime: "~22 min", completionRate: 91, bio: "Detail-obsessed painter with 6 years of experience. Textured walls, waterproofing, and wood polish specialist." },
  { name: "Suresh Patil", skill: "AC Technician", subSkills: ["Installation", "Servicing", "Gas refill", "Repair", "Deep cleaning"], city: "Bengaluru", area: "JP Nagar", rating: 4.5, reviewCount: 98, pricePerHour: 600, experience: 8, jobsCompleted: 245, mlScore: 81, available: true, verified: true, phone: "+91 98765 00005", responseTime: "~45 min", completionRate: 90, bio: "8 years fixing residential AC units across Bengaluru. Fast response, fair pricing." },
  { name: "Vikram Joshi", skill: "Mason", subSkills: ["Brickwork", "Plastering", "Tiling", "RCC work"], city: "Bengaluru", area: "Banashankari", rating: 4.4, reviewCount: 76, pricePerHour: 480, experience: 14, jobsCompleted: 210, mlScore: 80, available: true, verified: true, phone: "+91 98765 00006", responseTime: "~40 min", completionRate: 89, bio: "14 years of masonry experience. Strong in tiling and structural plastering work." },
  { name: "Sunita Devi", skill: "Cleaner", subSkills: ["Deep clean", "Bathroom", "Kitchen", "Move-in/out", "Office cleaning"], city: "Bengaluru", area: "Marathahalli", rating: 4.9, reviewCount: 211, pricePerHour: 280, experience: 5, jobsCompleted: 502, mlScore: 92, available: true, verified: true, phone: "+91 98765 00007", responseTime: "~15 min", completionRate: 98, bio: "Thorough deep-cleaning specialist using eco-friendly products. Fast turnaround, consistently 5-star." },
  { name: "Arun Nair", skill: "Electrician", subSkills: ["Wiring", "Short circuit repair", "MCB fitting"], city: "Bengaluru", area: "Bellandur", rating: 4.3, reviewCount: 64, pricePerHour: 400, experience: 5, jobsCompleted: 178, mlScore: 76, available: true, verified: false, phone: "+91 98765 00008", responseTime: "~35 min", completionRate: 86, bio: "5 years of electrical troubleshooting and repair work across Bengaluru's East side." },
  { name: "Lakshmi Rao", skill: "Painter", subSkills: ["Interior", "Texture", "Stencil work"], city: "Bengaluru", area: "Rajajinagar", rating: 4.5, reviewCount: 88, pricePerHour: 300, experience: 7, jobsCompleted: 198, mlScore: 82, available: true, verified: true, phone: "+91 98765 00009", responseTime: "~25 min", completionRate: 92, bio: "Specializes in stencil and feature-wall designs alongside standard interior painting." },
  { name: "Manoj Verma", skill: "Carpenter", subSkills: ["Furniture repair", "Doors", "Window frames"], city: "Bengaluru", area: "Electronic City", rating: 4.2, reviewCount: 52, pricePerHour: 350, experience: 4, jobsCompleted: 130, mlScore: 73, available: true, verified: false, phone: "+91 98765 00010", responseTime: "~38 min", completionRate: 85, bio: "Affordable carpentry for repairs and small custom builds." },
  { name: "Rohit Singh", skill: "Electrician", subSkills: ["CCTV installation", "MCB fitting", "Short circuit repair", "Light fitting"], city: "Bengaluru", area: "Yelahanka", rating: 4.5, reviewCount: 102, pricePerHour: 420, experience: 7, jobsCompleted: 290, mlScore: 83, available: false, verified: true, phone: "+91 98765 00011", responseTime: "~20 min", completionRate: 92, bio: "Experienced electrician in North Bengaluru. Specialises in CCTV installation and complex MCB/short circuit repair." },
  { name: "Fatima Sheikh", skill: "Cleaner", subSkills: ["Office cleaning", "Deep clean", "Carpet cleaning", "Kitchen", "Bathroom"], city: "Bengaluru", area: "Shivajinagar", rating: 4.9, reviewCount: 165, pricePerHour: 270, experience: 6, jobsCompleted: 420, mlScore: 91, available: true, verified: true, phone: "+91 98765 00012", responseTime: "~10 min", completionRate: 99, bio: "Top-rated cleaner for both homes and offices. Extremely thorough, uses professional-grade equipment." },
  { name: "Balaji Krishnan", skill: "AC Technician", subSkills: ["Cassette AC", "Duct AC", "Multi-split", "AMC service", "PCB repair"], city: "Bengaluru", area: "Hebbal", rating: 4.7, reviewCount: 89, pricePerHour: 650, experience: 11, jobsCompleted: 340, mlScore: 88, available: true, verified: true, phone: "+91 98765 00013", responseTime: "~22 min", completionRate: 96, bio: "11 years in commercial and residential AC systems. Certified for PCB-level repairs." },
  { name: "Neeraj Gupta", skill: "Mason", subSkills: ["RCC work", "Roof repair", "Crack filling", "Tiling", "Compound wall"], city: "Bengaluru", area: "Nagarbhavi", rating: 4.3, reviewCount: 58, pricePerHour: 500, experience: 10, jobsCompleted: 195, mlScore: 78, available: true, verified: false, phone: "+91 98765 00014", responseTime: "~45 min", completionRate: 87, bio: "10 years masonry experience including RCC work and roof repairs." },
  { name: "Geeta Iyer", skill: "Plumber", subSkills: ["Water tank cleaning", "Motor repair", "Leak repair", "Water heater"], city: "Bengaluru", area: "Malleswaram", rating: 4.7, reviewCount: 140, pricePerHour: 360, experience: 8, jobsCompleted: 378, mlScore: 88, available: true, verified: true, phone: "+91 98765 00015", responseTime: "~18 min", completionRate: 96, bio: "Specialist in water tank cleaning and motor repair. Trusted plumber in Central Bengaluru." },
];

// ── Reviews keyed by worker index (0-based, matches WORKERS array order) ────
const REVIEWS_BY_WORKER_INDEX = {
  0: [
    { author: "Aakash M.", rating: 5, text: "Showed up on time, diagnosed a tricky short-circuit in 10 minutes. Clean, polite work.", task: "Short circuit repair" },
    { author: "Neha P.",   rating: 5, text: "Best electrician I've hired. Walked me through every change. Will absolutely re-book.", task: "Panel install" },
    { author: "Kunal D.",  rating: 4, text: "Solid work on the panel install. Slight delay but communicated well.", task: "Panel install" },
    { author: "Sara K.",   rating: 5, text: "Smart home setup was flawless. Highly recommend.", task: "Smart home" },
  ],
  1: [
    { author: "Ritu S.", rating: 5, text: "Fixed our bathroom leak same day. Priya was very professional and tidy.", task: "Leak repair" },
    { author: "Dev A.",  rating: 4, text: "Great water heater install. Reasonable price too.", task: "Water heater" },
  ],
  2: [
    { author: "Pooja R.",  rating: 5, text: "Faiz built our modular wardrobe perfectly. Took 2 days, looks stunning.", task: "Wardrobe" },
    { author: "Nikhil T.", rating: 4, text: "Kitchen work was good, took longer than estimated but quality was top notch.", task: "Modular kitchen" },
  ],
  3: [
    { author: "Meena L.", rating: 5, text: "Anjali did an amazing texture job on our living room. Everyone asks about it!", task: "Texture" },
  ],
  4: [
    { author: "Abhay N.", rating: 5, text: "AC was down during peak summer. Suresh came in 45 mins and fixed it. Lifesaver!", task: "AC repair" },
  ],
  6: [
    { author: "Shruti K.", rating: 5, text: "Sunita did a spectacular deep clean. The house looked brand new for move-in.", task: "Deep clean" },
    { author: "Vivek P.",  rating: 5, text: "Booked twice now. Consistent quality each time. Eco-friendly products are a bonus.", task: "Deep clean" },
  ],
  11: [
    { author: "Rahul B.", rating: 5, text: "Fatima cleaned our office overnight. Came back to a spotless floor. Excellent!", task: "Office cleaning" },
  ],
  14: [
    { author: "Lavanya M.", rating: 5, text: "Tank cleaning was thorough and quick. Geeta explained exactly what was done.", task: "Water tank cleaning" },
  ],
};

// ── Job requests + earnings only for worker[0] (Ravi Kumar) — matches dashboard demo ──
const JOB_REQUESTS_FOR_W0 = [
  { user: "Sneha Patel", task: "Wiring for new 3BHK apartment",        location: "Koramangala, Bengaluru", budget: 3500, status: "pending" },
  { user: "Arjun Mehta", task: "Smart home setup — Alexa integration", location: "HSR Layout, Bengaluru",  budget: 6200, status: "pending" },
  { user: "Priya Nair",  task: "Fan & light fitting (4 rooms)",        location: "Indiranagar, Bengaluru", budget: 1800, status: "accepted" },
  { user: "Karan Shah",  task: "Short circuit troubleshooting",        location: "Whitefield, Bengaluru",  budget: 900,  status: "declined" },
  { user: "Meera Iyer",  task: "Inverter installation & battery setup",location: "Jayanagar, Bengaluru",   budget: 4100, status: "accepted" },
];

const EARNINGS_FOR_W0 = [
  { user: "Priya Nair",  task: "Fan & light fitting",      amount: 1800,  status: "paid" },
  { user: "Meera Iyer",  task: "Inverter installation",    amount: 4100,  status: "paid" },
  { user: "Rahul Das",   task: "Panel board upgrade",      amount: 7500,  status: "paid" },
  { user: "Anita Roy",   task: "Full house wiring (2BHK)", amount: 12000, status: "paid" },
  { user: "Sneha Patel", task: "Wiring for new 3BHK",      amount: 3500,  status: "pending" },
  { user: "Arjun Mehta", task: "Smart home setup",         amount: 6200,  status: "pending" },
];

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database...\n');

  // Wipe existing data — safe to re-run
  await Promise.all([
    User.deleteMany({}),
    Review.deleteMany({}),
    JobRequest.deleteMany({}),
    Earning.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing collections');

  // ── Demo accounts (user + admin), password hashed ─────────────────────────
  const demoPassword = await bcrypt.hash('demo1234', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const workerPassword = await bcrypt.hash('worker123', 10);

  const demoUser = await User.create({
    name: 'Aakash Mehta', email: 'demo@ayn.com', password: demoPassword,
    role: 'user', avatar: avatar('demo@ayn.com'),
  });
  await User.create({
    name: 'Admin', email: 'admin@ayn.com', password: adminPassword,
    role: 'admin', avatar: avatar('admin@ayn.com'),
  });
  console.log('👤 Created demo user + admin accounts');

  // ── 15 workers — first one uses the "worker@ayn.com" demo login ──────────
  const createdWorkers = [];
  for (let i = 0; i < WORKERS.length; i++) {
    const w = WORKERS[i];
    const email = i === 0 ? 'worker@ayn.com' : `${w.name.toLowerCase().replace(/\s+/g, '.')}@ayn.com`;
    const doc = await User.create({
      ...w,
      email,
      password: workerPassword,
      role: 'worker',
      avatar: avatar(w.name),
    });
    createdWorkers.push(doc);
  }
  console.log(`🔧 Created ${createdWorkers.length} worker profiles`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  let reviewCount = 0;
  for (const [idx, reviews] of Object.entries(REVIEWS_BY_WORKER_INDEX)) {
    const worker = createdWorkers[Number(idx)];
    for (const r of reviews) {
      await Review.create({
        workerId: worker._id, author: r.author, authorAvatar: avatar(r.author),
        rating: r.rating, text: r.text, task: r.task, verified: true,
      });
      reviewCount++;
    }
  }
  console.log(`⭐ Created ${reviewCount} reviews`);

  // ── Job requests + earnings for Ravi Kumar (index 0) ───────────────────────
  const ravi = createdWorkers[0];
  for (const jr of JOB_REQUESTS_FOR_W0) {
    await JobRequest.create({ workerId: ravi._id, ...jr });
  }
  for (const er of EARNINGS_FOR_W0) {
    await Earning.create({ workerId: ravi._id, ...er, paidAt: er.status === 'paid' ? new Date() : undefined });
  }
  console.log(`📋 Created ${JOB_REQUESTS_FOR_W0.length} job requests + ${EARNINGS_FOR_W0.length} earnings for Ravi Kumar`);

  console.log('\n✅ Seed complete!\n');
  console.log('Demo logins:');
  console.log('  User   → demo@ayn.com   / demo1234');
  console.log('  Worker → worker@ayn.com / worker123  (Ravi Kumar — has job requests + earnings)');
  console.log('  Admin  → admin@ayn.com  / admin123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});