const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  date: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  type: {
    type: String,
    enum: ['flight', 'lodging', 'activity', 'tour', 'restaurant', 'directions', 'parking', 'task', 'free', 'transportation', 'concert', 'theater', 'rail', 'ferry', 'cruise', 'meeting', 'note'],
    default: 'activity'
  },
  title: { type: String, required: true },
  subtitle: { type: String },
  notes: { type: String },
  status: {
    type: String,
    enum: ['prepaid', 'payOnSite', 'optional'],
    default: 'prepaid'
  },
  linkedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  travelerIds: [{ type: String }],
  contact: {
    website: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  confirmationNumber: { type: String },
  cost: { type: String },
  driveTimeToNext: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
