const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['cash', 'pointsBooking', 'cashOffsetByPoints', 'credit'],
    required: true 
  },
  dueDate: { type: String },
  paid: { type: Boolean, default: false },
  paidDate: { type: String },
  // Cash fields
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  method: { type: String },
  // Points booking fields
  pointsProgram: { type: String },
  pointsAmount: { type: Number, default: 0 },
  pointsAppliedDate: { type: String },
  refundable: { type: Boolean, default: true },
  // Cash offset by points fields
  chargeAmount: { type: Number, default: 0 },
  cardUsed: { type: String },
  netCashOut: { type: Number, default: 0 },
  // Credit fields
  creditSource: { type: String },
  creditAmount: { type: Number, default: 0 },
  remainingCash: { type: Number, default: 0 },
  notes: { type: String }
});

const ExpenseSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  name: { type: String, required: true },
  category: { 
    type: String,
    enum: [
      'Flights',
      'Lodging', 
      'Activities & Tours',
      'Food & Dining',
      'Shopping & Souvenirs',
      'Gas, Tolls & Parking',
      'Insurance',
      'Pre-trip & Misc'
    ]
  },
  type: { type: String, enum: ['confirmed', 'planned'], default: 'confirmed' },
  eventStatus: { type: String, enum: ['prepaid', 'payOnSite', 'optional'], default: 'prepaid' },
  totalValue: { type: Number, default: 0 },
  activityDate: { type: String },
  bookedDate: { type: String },
  vendor: { type: String },
  confirmationNumber: { type: String },
  notes: { type: String },
  payments: [PaymentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
