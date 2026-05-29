const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['cashCard', 'awardBooking', 'awardBookingWithFees', 'portalBooking', 'statementCredit', 'creditVoucher'] },
  dueDate: String,
  paid: { type: Boolean, default: false },
  // cash
  amount: Number,
  currency: String,
  method: String,
  // pointsBooking
  pointsProgram: String,
  pointsAmount: Number,
  pointsAppliedDate: String,
  refundable: Boolean,
  // cashOffsetByPoints
  chargeAmount: Number,
  cardUsed: String,
  netCashOut: Number,
  // credit
  creditSource: String,
  creditAmount: Number,
  remainingCash: Number,
  notes: String
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Flights', 'Lodging', 'Transportation', 'Activities & Tours', 'Food & Dining', 'Shopping & Souvenirs', 'Car Rental & Rideshare', 'Gas, Tolls & Parking', 'Insurance', 'Pre-trip & Misc'],
    required: true
  },
  type: { type: String, enum: ['confirmed', 'planned'], default: 'confirmed' },
  eventStatus: { type: String, enum: ['placeholder', 'prepaid', 'payOnSite', 'optional'], default: 'prepaid' },
  totalValue: { type: Number, default: 0 },
  estimatedValue: { type: Number, default: null },  // original quote/estimate before trip
  activityDate: String,
  bookedDate: String,
  vendor: String,
  confirmationNumber: String,
  notes: String,
  localAmount: Number,
  localCurrency: String,
  payments: [paymentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
