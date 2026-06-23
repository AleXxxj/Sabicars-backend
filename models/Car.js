const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  make:         { type: String, required: true },
  model:        { type: String, required: true },
  year:         { type: String, required: true },
  category: {
    type: String,
    enum: ['regular', 'luxury', 'suv', 'bus', 'truck'],
    required: true
  },
  condition: {
    type: String,
    enum: ['foreign-used', 'nigeria-used', 'brand-new'],
    default: 'foreign-used'
  },
  bodyType:     { type: String, default: '' },
  mileage:      { type: String },
  fuel:         { type: String },
  colour:       { type: String },
  price:        { type: String, default: 'Call Us' },
  tag: {
    type: String,
    enum: ['hot', 'new', 'premium', 'supply'],
    default: 'new'
  },
  description:  { type: String },
  engine:       { type: String },
  horsepower:   { type: String },
  transmission: { type: String },
  drivetrain:   { type: String },
  interiorColor:{ type: String },
  seats:        { type: String },
  features:     [{ type: String }],
  images:       [{ type: String }],
  available:    { type: Boolean, default: true },
  featured:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Car', CarSchema);