// flows/admin-watch.js
const EscalationLog = require('../db/escalation-log');
const User = require('../db/user-data');
const moment = require('moment-timezone');

module.exports = async function adminWatch(from, user, input = '') {
  const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const inputTrimmed = input.trim().toLowerCase();

  // Authorization check
  if (!user?.role?.toLowerCase().includes('admin') && user?.name !== 'Satya') {
    return '🚫 You are not authorized to access this view.';
  }

  // Handle phone number input to mark reviewed
  if (/^\d{10}$/.test(inputTrimmed)) {
    const found = await EscalationLog.findOneAndUpdate(
      { phone: inputTrimmed, date: today, reviewed: false },
      { $set: { reviewed: true } }
    );

    if (found) {
      return `✅ Escalation for ${inputTrimmed} marked as reviewed.`;
    } else {
      return `⚠️ No unreviewed escalation found for ${inputTrimmed}.`;
    }
  }

  // Handle 'watch all'
  if (inputTrimmed === 'all') {
    const allFlags = await EscalationLog.find({ flagged: true }).sort({ timestamp: -1 }).limit(20);

    if (!allFlags.length) {
      return '📭 No escalations found in the system.';
    }

    let report = '📋 Full Escalation Summary (Last 20)';
    for (const entry of allFlags) {
      report += `• ${entry.phone} | ${entry.flow} | Reviewed: ${entry.reviewed ? 'Yes' : 'No'} | ${entry.reason?.slice(0, 40) || '—'}
`;
    }
    return report;
  }

  // Default: show unreviewed for today
  const recentFlags = await EscalationLog.find({
    date: today,
    reviewed: false
  }).limit(10).sort({ timestamp: -1 });

  if (!recentFlags.length) {
    return '✅ No unresolved escalations for today. All clear. 🙏';
  }

  let summary = `🛡️ Escalation Watch (Unreviewed)
Date: ${today}

`;

  for (const log of recentFlags) {
    const reportedUser = await User.findOne({ phone: log.phone });
    const name = reportedUser?.name || 'Unknown';
    const salutation = reportedUser?.gender === 'female' ? 'Maa' : 'Bhai';
    summary += `🔹 *${name}* (${salutation})
• Phone: ${log.phone}
• Type: ${log.flow}
• Message: ${log.input.slice(0, 60)}...
• Reason: ${log.reason || '—'}

`;
  }

  summary += '📝 Reply with a phone number to mark as reviewed or type "all" to see full archive.';
  return summary;
};