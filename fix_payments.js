const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const expenses = db.collection('expenses');
  const typeMap = { cash: 'cashCard', pointsBooking: 'awardBooking', cashOffsetByPoints: 'awardBookingWithFees', pointsStatementCredit: 'statementCredit', credit: 'creditVoucher' };
  let total = 0;
  const all = await expenses.find({}).toArray();
  for (const expense of all) {
    if (!expense.payments) continue;
    let changed = false;
    const updated = expense.payments.map(p => {
      if (typeMap[p.type]) { changed = true; return { ...p, type: typeMap[p.type] }; }
      return p;
    });
    if (changed) {
      await expenses.updateOne({ _id: expense._id }, { $set: { payments: updated } });
      total++;
    }
  }
  console.log('Migrated', total, 'expenses');
  mongoose.disconnect();
});
