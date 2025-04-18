// horoscope-data.js
const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
  date: { type: String, required: true },  // Format: YYYY-MM-DD
  data: {
    aries: String,
    taurus: String,
    gemini: String,
    cancer: String,
    leo: String,
    virgo: String,
    libra: String,
    scorpio: String,
    sagittarius: String,
    capricorn: String,
    aquarius: String,
    pisces: String
  },
  confirmed: { type: Boolean, default: false },  // Admin approval toggle
  approvedBy: { type: String },                 // Satya's number or name
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Horoscope', horoscopeSchema);
