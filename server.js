const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('MongoDB connection error:', err));

const Trip = require('./src/models/Trip');
const User = require('./src/models/User');
const authRoutes = require('./auth');
const authMiddleware = require('./authMiddleware');
const Expense = require('./src/models/Expense');
const Event = require('./src/models/Event');
const Task = require('./src/models/Task');
const DailySpend = require('./src/models/DailySpend');
const JournalEntry = require('./src/models/JournalEntry');
const PointsAccount = require('./src/models/PointsAccount');

// ── AUTH ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── TRIPS ─────────────────────────────────────────────────────────────
app.get('/api/trips', authMiddleware, async (req, res) => {
  try { res.json(await Trip.find({ userId: req.user.userId }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/trips/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips', authMiddleware, async (req, res) => {
  try { res.json(await new Trip({ ...req.body, userId: req.user.userId }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:id', authMiddleware, async (req, res) => {
  try { res.json(await Trip.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:id', authMiddleware, async (req, res) => {
  try { await Trip.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EXPENSES ──────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/expenses', authMiddleware, async (req, res) => {
  try { res.json(await Expense.find({ tripId: req.params.tripId }).sort({ activityDate: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips/:tripId/expenses', authMiddleware, async (req, res) => {
  try { res.json(await new Expense({ ...req.body, tripId: req.params.tripId }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:tripId/expenses/:id', authMiddleware, async (req, res) => {
  try { res.json(await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:tripId/expenses/:id', authMiddleware, async (req, res) => {
  try { await Expense.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EVENTS ────────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/events', authMiddleware, async (req, res) => {
  try { res.json(await Event.find({ tripId: req.params.tripId }).sort({ date: 1, startTime: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips/:tripId/events', authMiddleware, async (req, res) => {
  try { res.json(await new Event({ ...req.body, tripId: req.params.tripId }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:tripId/events/:id', authMiddleware, async (req, res) => {
  try { res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:tripId/events/:id', authMiddleware, async (req, res) => {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TASKS ─────────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/tasks', authMiddleware, async (req, res) => {
  try { res.json(await Task.find({ tripId: req.params.tripId }).sort({ phase: 1, createdAt: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips/:tripId/tasks', authMiddleware, async (req, res) => {
  try { res.json(await new Task({ ...req.body, tripId: req.params.tripId }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:tripId/tasks/:id', authMiddleware, async (req, res) => {
  try { res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:tripId/tasks/:id', authMiddleware, async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DAILY SPEND ───────────────────────────────────────────────────────
app.get('/api/trips/:tripId/spending', authMiddleware, async (req, res) => {
  try { res.json(await DailySpend.find({ tripId: req.params.tripId }).sort({ date: 1, createdAt: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips/:tripId/spending', authMiddleware, async (req, res) => {
  try { res.json(await new DailySpend({ ...req.body, tripId: req.params.tripId, amountUSD: req.body.amount }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:tripId/spending/:id', authMiddleware, async (req, res) => {
  try { res.json(await DailySpend.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:tripId/spending/:id', authMiddleware, async (req, res) => {
  try { await DailySpend.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── JOURNAL ───────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/journal', authMiddleware, async (req, res) => {
  try { res.json(await JournalEntry.find({ tripId: req.params.tripId }).sort({ date: -1, createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips/:tripId/journal', authMiddleware, async (req, res) => {
  try { res.json(await new JournalEntry({ ...req.body, tripId: req.params.tripId }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:tripId/journal/:id', authMiddleware, async (req, res) => {
  try { res.json(await JournalEntry.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:tripId/journal/:id', authMiddleware, async (req, res) => {
  try { await JournalEntry.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POINTS ────────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/points', authMiddleware, async (req, res) => {
  try { res.json(await PointsAccount.find({ tripId: req.params.tripId }).sort({ program: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trips/:tripId/points', authMiddleware, async (req, res) => {
  try { res.json(await new PointsAccount({ ...req.body, tripId: req.params.tripId }).save()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trips/:tripId/points/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await PointsAccount.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    doc.program = req.body.program || doc.program;
    doc.currentBalance = req.body.currentBalance ?? doc.currentBalance;
    doc.balanceDate = req.body.balanceDate || doc.balanceDate;
    doc.anticipatedAdditions = req.body.anticipatedAdditions || [];
    const saved = await doc.save();
    res.json(saved);
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trips/:tripId/points/:id', authMiddleware, async (req, res) => {
  try { await PointsAccount.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SERVE REACT BUILD ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'build')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
