// time-utils.js
const moment = require('moment-timezone');

const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';

function isMorningHours() {
  const now = moment().tz(TIMEZONE);
  return now.hour() >= 6 && now.hour() < 9;
}

function isEveningHours() {
  const now = moment().tz(TIMEZONE);
  return now.hour() >= 20 && now.hour() <= 21;
}

function todayStr() {
  return moment().tz(TIMEZONE).format('YYYY-MM-DD');
}

module.exports = { isMorningHours, isEveningHours, todayStr };
