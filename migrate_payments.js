const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrate() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const expenses = db.collection('expenses');

  const typeMap = {
    cash: 'cashCard',
    pointsBooking: 'awardBooking',
    cashOffsetByPoints: 'awardBookingWithFees',
    pointsStatementCredit: 'statementCredit',
    credit: 'creditVoucher'
  };

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
  await client.close();
}
migrate().catch(console.error);
