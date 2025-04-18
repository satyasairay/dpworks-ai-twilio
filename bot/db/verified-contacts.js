// verified-contacts.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,                     // Officer/Doctor name
  designation: String,              // RI, ASI, Doctor, Lawyer
  phone: String,                    // Contact number
  location: String,                 // Village / Town / Block
  pin: String,                      // ✅ New — exact 6-digit PIN
  district: String,                 // Bhadrak / Balasore / etc.
  verifiedBy: String,               // Admin or volunteer who submitted
  notes: String,                    // Any info: "Available at night", etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerifiedContact', contactSchema);
