const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['car','blog','offer','system'], default: 'system' },
  link:    { type: String, default: '' },
  icon:    { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Notification', NotificationSchema);
