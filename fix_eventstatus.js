const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('expenses').updateMany(
    { eventStatus: 'placeholder', type: 'confirmed' },
    { $set: { eventStatus: 'prepaid' } }
  );
  console.log('Updated', result.modifiedCount, 'expenses');
  mongoose.disconnect();
});
