// bot/utils/flow-history.js

const history = {};

function saveStep(phone, step, prompt, data = {}) {
  if (!history[phone]) history[phone] = [];
  history[phone].push({ step, prompt, data });
}

function goBack(phone) {
  if (!history[phone] || history[phone].length === 0) return null;
  history[phone].pop(); // remove current step
  return history[phone][history[phone].length - 1]; // return previous step
}

function resetHistory(phone) {
  delete history[phone];
}

module.exports = { saveStep, goBack, resetHistory };
