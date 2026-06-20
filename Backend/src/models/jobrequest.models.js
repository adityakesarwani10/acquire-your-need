const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for seeded/demo requests
    user:     { type: String, required: true },   // display name of requester
    task:     { type: String, required: true },
    location: { type: String, default: '' },
    budget:   { type: Number, default: 0 },
    status:   { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRequest', jobRequestSchema);