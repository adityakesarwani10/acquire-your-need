const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    workerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for seeded/demo reviews
    author:       { type: String, required: true },       // display name
    authorAvatar: { type: String, default: '' },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    text:         { type: String, required: true },
    verified:     { type: Boolean, default: false },       // verified hire
    task:         { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);