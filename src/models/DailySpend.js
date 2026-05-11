const mongoose = require('mongoose');

const DailySpendSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  amountUSD: { type: Number },
  category: {
    type: String,
    enum: ['Food & Drinks', 'Transportation', 'Shopping', 'Activities', 'Tips', 'Entrance Fees', 'Misc'],
    default: 'Food & Drinks'
  },
  description: { type: String },
  paymentMethod: { type: String, enum: ['Cash', 'Credit card', 'Debit'], default: 'Credit card' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailySpend', DailySpendSchema);
