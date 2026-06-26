const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId:   { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  name:     { type: String, required: true, trim: true, maxlength: 100 },
  message:  { type: String, required: true, trim: true, maxlength: 1000 },
  approved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
