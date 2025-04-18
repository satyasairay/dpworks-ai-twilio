// user-data.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },  // WhatsApp number
  name: String,
  pin: String,
  village: String,
  villageOdia: String,

  birthday: String,         // Format: DD-MM-YYYY
  zodiac: String,           // Dual format: କନ୍ୟା (Virgo)

  gender: String,           // male / female
  role: String,             // e.g. Field Worker / Volunteer

  onboardingStep: String,   // Tracks current step (e.g. 'dob')
  isOnboarded: { type: Boolean, default: false },
  pendingConfirm: { type: Boolean, default: false },

  // NEW for strict village logic
  villageAttempts: { type: Number, default: 0 },
  villageFlagged: { type: Boolean, default: false },

  // Creator/Dev override
  isAdmin: { type: Boolean, default: false },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
