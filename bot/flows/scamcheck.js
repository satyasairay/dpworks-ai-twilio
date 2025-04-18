// flows/scam-check.js
const Dialog = require('../db/user-dialog');
const { getSalutation } = require('../utils/tone-utils');
const flowHistory = require('../utils/flow-history');
const getScamAnalysisFromAI = require('../utils/getScamAnalysisFromAI');
const EscalationLog = require('../db/escalation-log');

module.exports = async function scamCheck(from, user, input = '', isForwarded = false) {
  const inputLower = input.toLowerCase().trim();
  const salutation = getSalutation(user);
  const today = new Date().toISOString().slice(0, 10);

  if (inputLower === 'reset') {
    flowHistory.resetHistory(from);
    return '🔄 Scam check reset. You can forward or type the suspicious message again.';
  }
  if (inputLower === 'back main' || inputLower === 'exit') {
    flowHistory.resetHistory(from);
    return '🏠 Returning to main menu. Type "1" for Task, "2" for Visit, "3" for Help.';
  }
  if (inputLower === 'back') {
    const last = flowHistory.goBack(from);
    if (last) return `🔁 Going back...\n\n${last.prompt}`;
    return '❌ You are already at the start of this flow.';
  }

  // === Handle Follow-up Choice: 1, 2, 3 ===
  if (["1", "2", "3"].includes(inputLower)) {
    if (inputLower === "1") {
      await Dialog.create({
        phone: from,
        userId: user?._id,
        input: 'User chose to report to admin',
        response: 'Escalated to admin via Chapter 11',
        flagged: true,
        flow: 'scam-check',
        role: user?.role || 'unknown'
      });

      await EscalationLog.create({
        phone: from,
        userId: user?._id,
        input: 'User manually requested escalation',
        reason: 'Scam report via option 1',
        flow: 'scam-check',
        flagged: true,
        reviewed: false,
        date: today
      });

      return `📩 Thank you ${salutation}, your report has been forwarded to our trusted DP Admin team.\nThey will review it and take action if needed. You are not alone. 🙏`;
    } else if (inputLower === "2") {
      return `🔗 You can report this scam directly to India’s official Cybercrime portal:\nhttps://cybercrime.gov.in\n\nPlease stay safe, ${salutation}. We are here if you need help.`;
    } else {
      return `✅ Got it, ${salutation}. Ignored for now. Stay alert and reach out if you feel unsafe.`;
    }
  }

  await flowHistory.saveStep(from, 'scamCheck', `📥 Received suspicious message: ${input}`);

  const recentMatch = await Dialog.findOne({
    input,
    flow: 'scam-check',
    flagged: true
  });

  if (recentMatch) {
    await Dialog.create({
      phone: from,
      userId: user?._id,
      input,
      response: 'Matched previous user report. Auto-flagged.',
      flagged: true,
      flow: 'scam-check',
      role: user?.role || 'unknown'
    });

    return `🚨 ${salutation}, this message has already been reported by other users as dangerous.\n\nPlease do not engage with it.\n\n🙏 Would you like to:\n1️⃣ Report this to DP Admin?\n2️⃣ Get Cybercrime link?\n3️⃣ Ignore for now\n\n👉 Type 1, 2 or 3`;
  }

  const aiResult = await getScamAnalysisFromAI(input);

  await Dialog.create({
    phone: from,
    userId: user?._id,
    input,
    response: aiResult.reason,
    flagged: aiResult.classification !== 'safe',
    flow: 'scam-check',
    role: user?.role || 'unknown'
  });

  if (aiResult.classification !== 'safe') {
    await EscalationLog.create({
      phone: from,
      userId: user?._id,
      input,
      reason: aiResult.reason,
      flow: 'scam-check',
      flagged: true,
      reviewed: false,
      date: today
    });
  }

  if (aiResult.classification === 'safe') {
    return `🧐 ${salutation}, this message doesn't seem dangerous.\nBut stay alert. Never click unknown links or share OTPs.\n\n📞 If you're unsure, type "Help me" to escalate.`;
  } else {
    return `⚠️ ${salutation}, the AI found this message to be *${aiResult.classification.toUpperCase()}*.\n\n${aiResult.reason}\n\n${aiResult.alert}\n\n🙏 Would you like to:\n1️⃣ Report this to DP Admin?\n2️⃣ Get Cybercrime link?\n3️⃣ Ignore for now\n\n👉 Type 1, 2 or 3`;
  }
};
