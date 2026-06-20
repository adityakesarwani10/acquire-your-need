const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequest' },
    user:     { type: String, required: true },
    task:     { type: String, required: true },
    amount:   { type: Number, required: true },
    status:   { type: String, enum: ['paid', 'pending'], default: 'pending' },
    paidAt:   { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Earning', earningSchema);