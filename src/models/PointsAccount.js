const mongoose = require('mongoose');

const PointsAccountSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  program: { type: String, required: true },
  currentBalance: { type: Number, default: 0 },
  balanceDate: { type: String },
  anticipatedAdditions: [
    {
      amount: { type: Number },
      expectedDate: { type: String },
      description: { type: String }
    }
  ],
  balanceHistory: [
    {
      balance: { type: Number },
      date: { type: String },
      note: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PointsAccount', PointsAccountSchema);
