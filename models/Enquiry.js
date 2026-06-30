const mongoose = require('mongoose');
const EnquirySchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, default: '', trim: true },
  phone:   { type: String, default: '', trim: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true, trim: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Enquiry', EnquirySchema);
