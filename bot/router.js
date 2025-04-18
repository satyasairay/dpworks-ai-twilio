// bot/router.js
const User = require('./db/user-data');
const timeUtils = require('./utils/time-utils');
const toneUtils = require('./utils/tone-utils');

// === Flows ===
const onboarding = require('./flows/onboarding');
const morning = require('./flows/morning');
const task = require('./flows/task');
const report = require('./flows/report');
const feedback = require('./flows/feedback');
const scamcheck = require('./flows/scamcheck');
const motivation = require('./flows/motivation');
const returnFlow = require('./flows/return');
const endofday = require('./flows/endofday');
const watchers = require('./flows/watchers');
const aatma = require('./flows/aatma'); // Placeholder

// === Dispatcher Function ===
module.exports = async ({ body, from }) => {
  const input = body.trim().toLowerCase();

  // === Priority 1: Creator Mode Trigger ===
  if (input === 'aatma') {
    return await aatma(from);
  }

  // === Priority 2: Reset Flow ===
  if (input === 'reset') {
    await User.findOneAndDelete({ phone: from });
    return '🔄 Your data has been reset. Please type "Hi" to begin again.';
  }

  // === Priority 3: Scam or Emergency Keywords (BLEED detection) ===
  const bleedKeywords = ['rape', 'danger', 'blackmail', 'help', 'scam', 'threat', 'death', 'emergency'];
  if (bleedKeywords.some(keyword => input.includes(keyword))) {
    return await watchers(from, input);
  }

  // === Priority 4: Onboarding Entry ===
  const onboardingTriggers = ['hi', 'hello', 'joyguru', 'jayguru', 'thakur'];
  const user = await User.findOne({ phone: from });

  if (!user || !user.isOnboarded) {
    return await onboarding(from, input);
  }

  // === Priority 5: Morning Flow (6–9AM greetings) ===
  if (timeUtils.isMorningHours()) {
    const morningTriggers = ['menu', 'start', 'good morning', 'morning'];
    if (morningTriggers.includes(input)) {
      return await morning(from, user);
    }
    // Also auto-run on first message of the day
    if (input === 'hi') {
      return await morning(from, user);
    }
  }

  // === Priority 6: Menu Commands (1 to 5) ===
  switch (input) {
    case '1':
    case 'my task':
      return await task(from, user);
    case '2':
    case 'submit visit':
    case 'visit':
      return await report(from, user);
    case '3':
    case 'complaint':
    case 'report':
      return await scamcheck(from, user); // Chapter 4
    case '4':
    case 'feedback':
    case 'suggest':
      return await feedback(from, user);
    case '5':
    case 'learn':
    case 'songs':
    case 'entertain':
      return await motivation(from, user); // Chapter 9
    case 'confirm':
      if (!user || !user.pendingConfirm) return 'You have nothing pending to confirm.';
      return await onboarding(from, 'confirm');
    case 'my info':
      return toneUtils.getProfileSummary(user); // Returns bilingual profile summary
    case 'endofday':
      return await endofday(from);
  }

  // === Priority 7: Return Flow (If user says someone is back) ===
  const returnTriggers = ['he came back', 'she returned', 'back in dpworks'];
  if (returnTriggers.some(t => input.includes(t))) {
    return await returnFlow(from, user);
  }

  // === Priority 8: Smart Scam Check (auto fallback)
  if (input.includes('http') || input.includes('+91') || input.includes('upi')) {
    return await scamcheck(from, user);
  }

  // === Priority 9: Fallback Message ===
  return `🤖 I'm not sure what you meant.

👉 Type:
1 – My Task  
2 – Submit Visit  
3 – Report  
4 – Feedback  
5 – Divine Songs / Learn  
or type "Hi" to start over.`;
};
