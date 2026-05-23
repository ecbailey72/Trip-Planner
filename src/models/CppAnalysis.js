const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  label: String,
  points: Number,
  fees: Number,
}, { _id: false });

const optionSchema = new mongoose.Schema({
  description: String,
  cashPrice: Number,
  nights: { type: Number, default: 1 },
  payments: [paymentSchema],
}, { _id: false });

const cppAnalysisSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  name: { type: String, required: true },
  mode: { type: String, enum: ['flight', 'hotel'], default: 'flight' },
  options: [optionSchema],
  benchmark: { type: Number, default: 1.5 },
}, { timestamps: true });

module.exports = mongoose.model('CppAnalysis', cppAnalysisSchema);
