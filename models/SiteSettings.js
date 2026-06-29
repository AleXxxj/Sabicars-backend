const mongoose = require('mongoose');
const SiteSettingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, default: '' },
});
module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
