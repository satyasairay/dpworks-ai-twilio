// /flows/bleed-check.js
const EscalationLog = require('../db/escalation-log');

// Define BLEED mode trigger keywords
const bleedKeywords = [
  'scared', 'fear', 'threat', 'help', 'suicide', 'die', 'kill', 'afraid', 'alone', 'dhamka', 'bhaya', 'mara',
  'chinta', 'dhamki', 'amar', 'thik nai'
];

module.exports = async function checkBleed(input) {
  const inputLower = input.toLowerCase();

  // Check for any BLEED keywords
  const isBleed = bleedKeywords.some(keyword => inputLower.includes(keyword));

  if (isBleed) {
    // Flag it for admin review
    await EscalationLog.create({
      phone: '', // Add phone logic later
      userId: '', // Add user ID logic later
      input,
      reason: 'Emotional distress detected (BLEED mode)',
      flow: 'bleed',
      flagged: true,
      reviewed: false,
      date: new Date().toISOString().slice(0, 10)
    });

    return {
      triggered: true,
      message: '🙏 We are here for you. You’re not alone. Your message has been noted.' 
      // Add Odia translation later
    };
  }

  return { triggered: false };
};
