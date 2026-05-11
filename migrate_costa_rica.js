// Costa Rica 2026 Migration Script
// Run from travel-tool root: node migrate_costa_rica.js

require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./src/models/Trip');
const Expense = require('./src/models/Expense');
const Event = require('./src/models/Event');
const Task = require('./src/models/Task');
const DailySpend = require('./src/models/DailySpend');
const PointsAccount = require('./src/models/PointsAccount');

const data = require('./costa_rica_backup.json');

// Map old categories to new schema
const CAT_MAP = {
  'Flights': 'Flights',
  'Lodging': 'Lodging',
  'Car Rental': 'Lodging',
  'Activities': 'Activities & Tours',
  'Food & dining': 'Food & Dining',
  'Shopping': 'Shopping & Souvenirs',
  'Gas & Tolls': 'Gas, Tolls & Parking',
  'Parking': 'Gas, Tolls & Parking',
  'Insurance': 'Insurance',
  'Tips & Incidentals': 'Pre-trip & Misc',
  'Pre-trip Purchases': 'Pre-trip & Misc',
};

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── DELETE any existing Costa Rica trip ──────────────────────────────
  const existing = await Trip.findOne({ name: 'Costa Rica 2026' });
  if (existing) {
    await Trip.findByIdAndDelete(existing._id);
    await Expense.deleteMany({ tripId: existing._id });
    await Event.deleteMany({ tripId: existing._id });
    await Task.deleteMany({ tripId: existing._id });
    await DailySpend.deleteMany({ tripId: existing._id });
    await PointsAccount.deleteMany({ tripId: existing._id });
    console.log('Cleaned up existing Costa Rica trip');
  }

  // ── CREATE TRIP ──────────────────────────────────────────────────────
  const trip = await new Trip({
    name: 'Costa Rica 2026',
    status: 'complete',
    startDate: '2026-04-25',
    endDate: '2026-05-05',
    baseCurrency: 'USD',
    tripBudget: data.budget || 7500,
    dailyBudget: data.dailyBudget || 200,
    cppBenchmark: data.benchmark || 1.5
  }).save();
  console.log('Trip created:', trip._id);

  // ── EXPENSES ─────────────────────────────────────────────────────────
  let expCount = 0;
  for (const e of data.expenses) {
    const payments = (e.payments || []).map(p => {
      if (p.usePoints && p.points > 0 && p.cashOut > 0) {
        return {
          type: 'cashOffsetByPoints',
          dueDate: p.dueDate,
          paid: p.paid,
          chargeAmount: p.expenseAmt || 0,
          cardUsed: p.method || '',
          pointsProgram: p.program || '',
          pointsAmount: p.points || 0,
          pointsAppliedDate: p.pointsAppliedDate || '',
          netCashOut: p.cashOut || 0,
          notes: p.notes || ''
        };
      } else if (p.usePoints && p.points > 0 && p.cashOut === 0) {
        return {
          type: 'pointsBooking',
          dueDate: p.dueDate,
          paid: p.paid,
          pointsProgram: p.program || '',
          pointsAmount: p.points || 0,
          pointsAppliedDate: p.pointsAppliedDate || '',
          refundable: true,
          notes: p.notes || ''
        };
      } else if (p.creditAmt > 0) {
        return {
          type: 'credit',
          dueDate: p.dueDate,
          paid: p.paid,
          creditSource: p.creditSource || '',
          creditAmount: p.creditAmt || 0,
          remainingCash: p.cashOut || 0,
          notes: p.notes || ''
        };
      } else {
        return {
          type: 'cash',
          dueDate: p.dueDate,
          paid: p.paid,
          amount: p.cashOut || p.expenseAmt || 0,
          currency: 'USD',
          method: p.method || '',
          notes: p.notes || ''
        };
      }
    });

    const mappedCat = CAT_MAP[e.category] || 'Pre-trip & Misc';

    await new Expense({
      tripId: trip._id,
      name: e.name,
      category: mappedCat,
      type: e.type || 'confirmed',
      eventStatus: e.type === 'planned' ? 'optional' : 'prepaid',
      totalValue: e.total || 0,
      activityDate: e.activityDate || '',
      bookedDate: e.bookedDate || '',
      vendor: e.vendor || '',
      confirmationNumber: e.confirmation || '',
      notes: e.note || '',
      payments
    }).save();
    expCount++;
  }
  console.log(`Expenses migrated: ${expCount}`);

  // ── EVENTS ───────────────────────────────────────────────────────────
  let evtCount = 0;
  for (const e of data.events) {
    await new Event({
      tripId: trip._id,
      date: e.date,
      startTime: e.time || '',
      endTime: e.endTime || '',
      type: ({car: 'transportation', directions: 'directions', parking: 'parking', flight: 'flight', task: 'task', lodging: 'lodging', free: 'free', restaurant: 'restaurant', activity: 'activity', tour: 'tour'}[e.type] || 'activity'),
      title: e.title,
      subtitle: e.subtitle || '',
      notes: e.notes || '',
      status: e.optional ? 'optional' : 'prepaid',
      confirmationNumber: e.confirmation || '',
      cost: e.cost || '',
      contact: {
        website: e.website || '',
        address: e.address || '',
        phone: e.phone || '',
        email: e.email || ''
      }
    }).save();
    evtCount++;
  }
  console.log(`Events migrated: ${evtCount}`);

  // ── TASKS ────────────────────────────────────────────────────────────
  let taskCount = 0;
  for (const t of data.tasks) {
    await new Task({
      tripId: trip._id,
      phase: 'preTrip',
      title: t.title,
      notes: t.notes || '',
      status: t.status === 'complete' ? 'complete' : t.status === 'inprogress' ? 'inProgress' : 'todo',
      dueDateType: 'absolute',
      absoluteDueDate: t.dueDate || '',
      completedDate: t.status === 'complete' ? t.dueDate || '' : ''
    }).save();
    taskCount++;
  }
  console.log(`Tasks migrated: ${taskCount}`);

  // ── DAILY SPEND ──────────────────────────────────────────────────────
  let spendCount = 0;
  for (const s of data.dailySpend) {
    if (!s.amount || s.amount === 0) continue;
    await new DailySpend({
      tripId: trip._id,
      date: s.date,
      amount: s.amount,
      currency: 'USD',
      amountUSD: s.amount,
      category: 'Food & Drinks',
      description: s.note || '',
      paymentMethod: 'Credit card'
    }).save();
    spendCount++;
  }
  console.log(`Daily spend migrated: ${spendCount}`);

  // ── POINTS ACCOUNTS ──────────────────────────────────────────────────
  let ptsCount = 0;
  for (const p of data.pointsAccounts) {
    if (p.balance === undefined) continue;
    await new PointsAccount({
      tripId: trip._id,
      program: p.program,
      currentBalance: p.balance,
      balanceDate: '2026-05-06'
    }).save();
    ptsCount++;
  }
  console.log(`Points accounts migrated: ${ptsCount}`);

  console.log('\n✅ Migration complete! Costa Rica 2026 is now in your app.');
  console.log(`Trip ID: ${trip._id}`);
  mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  console.error(err.message);
  mongoose.disconnect();
});
