const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Core
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  // Tiered account
  tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  isActive: { type: Boolean, default: true },

  // Signup metadata
  signupIp: { type: String },
  signupReason: { type: String },
  travelFrequency: { type: String, enum: ['1-2 trips/year', '3-5 trips/year', '6+ trips/year', 'varies'], default: 'varies' },
  typicalBudget: { type: String, enum: ['under $2k', '$2k-$5k', '$5k-$10k', '$10k+', 'varies'], default: 'varies' },
  heardAbout: { type: String },

  // Timestamps
  lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
