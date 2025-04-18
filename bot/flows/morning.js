// morning.js
const getDailyHoroscope = require('../utils/horoscope-generator');
const { getSalutation } = require('../utils/tone-utils');
const { isMorningHours, todayStr } = require('../utils/time-utils');
const { getMainMenu } = require('../utils/menu-utils');
const Dialog = require('../db/user-dialog');
const Horoscope = require('../db/horoscope-data');

module.exports = async function morning(from, user) {
  // ⏰ 6–9 AM window check
  if (!isMorningHours()) {
    await Dialog.create({
      userId: user._id,
      phone: from,
      input: 'morning outside window',
      response: 'Morning messages restricted to 6AM–9AM',
      flow: 'morning',
      role: user.role
    });

    return '🌞 Divine morning messages are available between 6AM–9AM only.\n\nPlease type "menu" to see today’s options.';
  }

  const zodiac = (user.zodiac || '').toLowerCase().split('(')[0].trim(); // e.g. capricorn

  if (!zodiac) {
    await Dialog.create({
      userId: user._id,
      phone: from,
      input: 'zodiac missing',
      response: 'Zodiac not found. Ask to re-register.',
      flow: 'morning',
      role: user.role
    });

    return '🙏 Your zodiac is missing. Please type "my info" and re-register if needed.';
  }

  // ✅ Try fetching from DB if already approved
  const today = todayStr();
  const stored = await Horoscope.findOne({ date: today });

  let message = '';
  if (stored && stored.confirmed && stored.data[zodiac]) {
    message = stored.data[zodiac];
  } else {
    // 🔁 Real-time fallback fetch via OpenAI (GPT)
    message = await getDailyHoroscope(zodiac);
  }

  const greeting = getSalutation(user);
  const menu = getMainMenu(user);

  const fullMessage = `🔮 *Today’s Divine Guidance for ${zodiac.toUpperCase()}*:

  ${message}

  🙏 ଜୟଗୁରୁ ${greeting}!
  ${menu}`;

  // 📝 Log this dialog
  await Dialog.create({
    userId: user._id,
    phone: from,
    input: 'auto: morning greeting',
    response: message,
    flow: 'morning',
    role: user.role
  });

  return fullMessage;
};
