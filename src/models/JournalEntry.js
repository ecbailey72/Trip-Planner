const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  date: { type: String, required: true },
  title: { type: String },
  body: { type: String, required: true },
  tag: {
    type: String,
    enum: ['Memory', 'Review', 'Tip', 'Local Phrase', 'Observation'],
    default: 'Memory'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
