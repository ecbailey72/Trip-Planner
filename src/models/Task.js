const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  phase: { type: String, enum: ['preTrip', 'duringTrip', 'postTrip'], default: 'preTrip' },
  title: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['todo', 'inProgress', 'complete'], default: 'todo' },
  dueDateType: { type: String, enum: ['absolute', 'relative'], default: 'relative' },
  absoluteDueDate: { type: String },
  relativeDueDays: { type: Number },
  completedDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
