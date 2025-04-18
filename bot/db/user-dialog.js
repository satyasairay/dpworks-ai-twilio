// user-dialog.js
const mongoose = require('mongoose');

const dialogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // FK to onboarded user
  phone: { type: String },         // Also logged separately for safety
  input: { type: String },         // What user said
  response: { type: String },      // What bot replied
  flow: { type: String },          // Chapter or intent (e.g. 'task', 'motivation', 'onboarding')
  role: { type: String },          // If known
  mood: { type: String },          // (Optional) AI-detected tone: sad, angry, joyful
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dialog', dialogSchema);
