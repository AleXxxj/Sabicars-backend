const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['Industry News','Buying Guide','Financing','Fleet Guide','Tips & Maintenance'],
    default: 'Industry News'
  },
  excerpt:     { type: String, required: true },
  content:     { type: String, required: true },
  coverImage:  { type: String, default: '' },
  author:      { type: String, default: 'Sabicars Team' },
  published:   { type: Boolean, default: false },
  publishedAt: { type: Date },
  readTime:    { type: String, default: '3 min read' },
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', BlogPostSchema);