// db/escalation-log.js
const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  input: { type: String, required: true },
  reason: { type: String },
  flow: { type: String }, // scam-check, feedback, etc.
  flagged: { type: Boolean, default: true },
  reviewed: { type: Boolean, default: false },
  date: { type: String }, // YYYY-MM-DD format
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EscalationLog', escalationSchema);