const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['planning', 'active', 'complete'], default: 'planning' },
  startDate: { type: String },
  endDate: { type: String },
  baseCurrency: { type: String, default: 'USD' },
  tripBudget: { type: Number, default: 0 },
  dailyBudget: { type: Number, default: 0 },
  cppBenchmark: { type: Number, default: 1.5 },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Trip', TripSchema);
