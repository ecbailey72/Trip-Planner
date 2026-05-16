require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find();
  users.forEach(u => console.log(u._id.toString(), u.email));
  mongoose.disconnect();
});
