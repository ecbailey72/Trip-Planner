const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  status: { type: String, enum: ['planning', 'active', 'complete'], default: 'planning' },
  startDate: { type: String },
  endDate: { type: String },
  tripBudget: { type: Number, default: 0 },
  dailyBudget: { type: Number, default: 200 },
  cppBenchmark: { type: Number, default: 1.5 },
  country: { type: String, default: "United States" },
  localCurrency: { type: String, default: "USD" },
  exchangeRate: { type: Number, default: 1 },
  baseCurrency: { type: String, default: 'USD' },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Trip', tripSchema);
