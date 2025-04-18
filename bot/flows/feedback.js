// flows/feedback.js
const Dialog = require('../db/user-dialog');
const EscalationLog = require('../db/escalation-log');
const { getSalutation } = require('../utils/tone-utils');

module.exports = async function feedback(from, user, input = '') {
  const salutation = getSalutation(user);
  const today = new Date().toISOString().slice(0, 10);

  if (!input || input.length < 4) {
    return `💬 ${salutation}, please type your feedback, suggestion, or complaint.

ଦୟାକରି ତୁମ ମନ୍ତବ୍ୟ କିମ୍ବା ଅନୁଭବ ଟାଇପ୍ କରନ୍ତୁ।`;
  }

  await Dialog.create({
    phone: from,
    userId: user?._id,
    input,
    response: 'Feedback received',
    flow: 'feedback',
    role: user?.role || 'unknown'
  });

  await EscalationLog.create({
    phone: from,
    userId: user?._id,
    input,
    reason: 'User feedback or complaint',
    flow: 'feedback',
    flagged: true,
    reviewed: false,
    date: today
  });

  return `🙏 Thank you ${salutation}, your message has been noted.

ଅପଣଙ୍କ ମନ୍ତବ୍ୟ ରେକର୍ଡ ହୋଇଛି। ଆମେ ଏଥିରେ ଧ୍ୟାନ ଦେବୁ।`;
};
