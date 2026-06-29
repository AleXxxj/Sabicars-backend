const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, default: '', trim: true, maxlength: 100 },
  rating:   { type: Number, min: 1, max: 5, default: 5 },
  message:  { type: String, required: true, trim: true, maxlength: 500 },
  approved: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Review', ReviewSchema);
