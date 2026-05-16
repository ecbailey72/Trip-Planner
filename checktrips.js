require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./src/models/Trip');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const trips = await Trip.find();
  trips.forEach(t => console.log(t._id, t.name, t.userId));
  mongoose.disconnect();
});
