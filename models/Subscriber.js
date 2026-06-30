const mongoose = require('mongoose');
const SubscriberSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:   { type: String, default: '', trim: true },
  topics: { type: [String], default: ['cars','blog','offers'] },
  active: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Subscriber', SubscriberSchema);
