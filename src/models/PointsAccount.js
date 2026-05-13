const mongoose = require('mongoose');

const anticipatedAdditionSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  expectedDate: { type: String },
  description: { type: String },
  posted: { type: Boolean, default: false }
}, { _id: false });

const pointsAccountSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  program: { type: String, required: true },
  currentBalance: { type: Number, default: 0 },
  balanceDate: { type: String },
  anticipatedAdditions: [anticipatedAdditionSchema]
}, { timestamps: true });

module.exports = mongoose.model('PointsAccount', pointsAccountSchema);
