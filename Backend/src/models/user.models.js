const mongoose = require('mongoose');

const scoreBreakdownSchema = new mongoose.Schema(
  { label: String, value: Number },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hashed with bcrypt
    role:     { type: String, enum: ['user', 'worker', 'admin'], default: 'user' },
    avatar:   { type: String, default: '' },
    phone:    { type: String, default: '' },

    // ── Worker-only fields (ignored for role=user/admin) ──────────────────
    skill:            { type: String, default: '' },
    subSkills:        { type: [String], default: [] },
    city:             { type: String, default: '' },
    area:             { type: String, default: '' },
    experience:       { type: Number, default: 0 },     // years
    jobsCompleted:     { type: Number, default: 0 },
    previousEmployer: { type: String, default: '' },
    portfolio:        { type: [String], default: [] },
    aadhar:           { type: String, default: '' },
    license:          { type: String, default: '' },
    pricePerHour:     { type: Number, default: 300 },
    bio:              { type: String, default: '' },
    responseTime:     { type: String, default: '~30 min' },
    completionRate:   { type: Number, default: 85 },

    // Computed / ML fields — recalculated by ranking logic, but cached here too
    mlScore:        { type: Number, default: 70 },
    rating:         { type: Number, default: 0 },
    reviewCount:    { type: Number, default: 0 },
    available:      { type: Boolean, default: true },
    verified:        { type: Boolean, default: false },
    scoreBreakdown: { type: [scoreBreakdownSchema], default: [] },
  },
  { timestamps: true }
);

// Never leak password hash in API responses
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);