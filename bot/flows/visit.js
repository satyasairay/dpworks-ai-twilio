const Dialog = require('../db/user-dialog');
const { getSalutation } = require('../utils/tone-utils');
const moment = require('moment-timezone');
const VisitLog = require('../db/visit-log');
const visitTracking = {};
const userTaskState = require('../utils/task-session-store'); // assuming shared store

module.exports = async function visit(from, user, input = '') {
  const salutation = getSalutation(user);
  const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

  // If no tasks assigned
  if (!userTaskState[from]?.assigned) {
    return `⚠️ ${salutation}, you haven’t been assigned any tasks yet.\nType "1" to get started.`;
  }

  // Setup tracking state
  if (!visitTracking[from]) {
    visitTracking[from] = {
      userId: user._id,
      current: 0,
      assigned: userTaskState[from].assigned,
      reports: []
    };
  }

  const state = visitTracking[from];
  const currentTask = state.assigned[state.current];
  const sl_no = currentTask?.split('–')[0]?.replace('SL_NO', '').trim();

  // First entry
  if (!state.step) {
    state.step = 'status';
    await Dialog.create({ phone: from, userId: user._id, input, response: '📌 What was the result of your visit?', flow: 'visit' });
    return `🧾 Let’s begin visit logging, ${salutation}.\n\nFirst task:\n${currentTask}\n\n📌 What was the result of your visit?\n\n1️⃣ Inactive / Passed Away\n2️⃣ Continuing Istavrity\n3️⃣ Discontinued\n\nଦୟାକରି ଫଳାଫଳ ଚୟନ କରନ୍ତୁ:`;
  }

  if (state.step === 'status') {
    if (['1', '2', '3'].includes(input.trim())) {
      state.currentReport = { sl_no, status: input.trim(), data: {}, flagged: false };
      state.step = input.trim() === '1' ? 'reasonDeath'
                : input.trim() === '2' ? 'familyCode'
                : 'discontinuedReason';
    } else {
      return '⚠️ Please enter a valid number: 1, 2, or 3.';
    }
  }

  if (state.step === 'reasonDeath') {
    state.currentReport.data.reasonOfDeath = input;
    state.step = 'deathComment';
    await Dialog.create({ phone: from, userId: user._id, input, response: '💬 Any additional comments?', flow: 'visit' });
    return `💬 Any additional comments?\nଅନ୍ୟ କିଛି ତଥ୍ୟ ଅଛି କି?`;
  }

  if (state.step === 'deathComment') {
    state.currentReport.data.comment = input;
    state.step = 'landmark';
    await Dialog.create({ phone: from, userId: user._id, input, response: '📍 Any known landmark?', flow: 'visit' });
    return `📍 Any known landmark?\nସ୍ଥାନ / ଲ୍ୟାଣ୍ଡମାର୍କ କ’ଣ?`;
  }

  if (state.step === 'familyCode') {
    state.currentReport.data.familyCode = input;
    state.step = 'phone';
    await Dialog.create({ phone: from, userId: user._id, input, response: '📞 Phone number?', flow: 'visit' });
    return `📞 Phone number?\nଫୋନ୍ ନମ୍ବର?`;
  }

  if (state.step === 'phone') {
    state.currentReport.data.phone = input;
    state.step = 'landmark';
    await Dialog.create({ phone: from, userId: user._id, input, response: '📍 Landmark or location?', flow: 'visit' });
    return `📍 Landmark or location?\nଲ୍ୟାଣ୍ଡମାର୍କ?`;
  }

  if (state.step === 'landmark') {
    state.currentReport.data.landmark = input;
    if (state.currentReport.status === '2') {
      state.step = 'dpAppHelp';
      await Dialog.create({ phone: from, userId: user._id, input, response: '📲 Will *you* update this member’s status in the DPWorks App?', flow: 'visit' });
      return `📲 Will *you* update this member’s status in the DPWorks App?\n\n1️⃣ Yes – I will update it\n2️⃣ No – I need help\n3️⃣ Not sure`;
    } else {
      state.step = 'discontinuedReason';
      await Dialog.create({ phone: from, userId: user._id, input, response: '📌 Why did the member discontinue?', flow: 'visit' });
      return `📌 Why did the member discontinue?\n1️⃣ Took other initiation\n2️⃣ Married – not accepted\n3️⃣ Financial hardship 💰\n4️⃣ Health issues 😷\n5️⃣ Job migration\n6️⃣ No visits\n7️⃣ Other\n8️⃣ ✨ They have returned 🕊️`;
    }
  }

  if (state.step === 'dpAppHelp') {
    state.currentReport.data.dpAppSupport = input;
    state.step = 'finalize';
  }

  if (state.step === 'discontinuedReason') {
    const reasonMap = {
      '1': 'Took other initiation',
      '2': 'Married – not accepted by in-laws',
      '3': 'Financial hardship',
      '4': 'Health issues',
      '5': 'Job migration',
      '6': 'No one ever visited',
      '7': 'Other',
      '8': 'Returned'
    };

    const reason = reasonMap[input.trim()];
    if (!reason) return '⚠️ Please enter a valid number (1–8).';

    state.currentReport.data.reason = reason;

    if (input === '3') {
      state.step = 'needHelpFinancial';
      await Dialog.create({ phone: from, userId: user._id, input, response: '💰 Do they need financial help?', flow: 'visit' });
      return `💰 Do they need financial help?\n1️⃣ Yes\n2️⃣ No\n3️⃣ Don’t know`;
    }
    if (input === '4') {
      state.step = 'needHelpMedical';
      await Dialog.create({ phone: from, userId: user._id, input, response: '🩺 Do they need medical help?', flow: 'visit' });
      return `🩺 Do they need medical help?\n1️⃣ Yes\n2️⃣ No\n3️⃣ Don’t know`;
    }
    if (input === '5') {
      state.step = 'jobStudy';
      await Dialog.create({ phone: from, userId: user._id, input, response: '📘 What have they studied?', flow: 'visit' });
      return `📘 What have they studied?\nକ’ଣ ପଢ଼ିଛନ୍ତି?`;
    }
    if (input === '8') {
      state.step = 'returnedStatus';
      await Dialog.create({ phone: from, userId: user._id, input, response: '📿 Has Istavrity been submitted?', flow: 'visit' });
      return `📿 Has Istavrity been submitted?\n1️⃣ Yes\n2️⃣ Not yet\n3️⃣ No`;
    }

    state.step = 'discontinuedComment';
    await Dialog.create({ phone: from, userId: user._id, input, response: '💬 Any other comments?', flow: 'visit' });
    return `💬 Any other comments?\nଅନ୍ୟ କିଛି ଟିପ୍ପଣୀ?`;
  }

  if (state.step === 'needHelpFinancial' || state.step === 'needHelpMedical') {
    state.currentReport.data.needsHelp = input;
    state.step = 'discontinuedComment';
    await Dialog.create({ phone: from, userId: user._id, input, response: '💬 Comments / ଟିପ୍ପଣୀ?', flow: 'visit' });
    return `💬 Comments / ଟିପ୍ପଣୀ?`;
  }

  if (state.step === 'jobStudy') {
    state.currentReport.data.study = input;
    state.step = 'jobType';
    await Dialog.create({ phone: from, userId: user._id, input, response: '💼 Job type preferred?', flow: 'visit' });
    return `💼 Job type preferred?\nକେଉଁ ଧରଣର ଚାକିରି?`;
  }

  if (state.step === 'jobType') {
    state.currentReport.data.jobType = input;
    state.step = 'jobLocation';
    await Dialog.create({ phone: from, userId: user._id, input, response: '📍 Preferred location?', flow: 'visit' });
    return `📍 Preferred location?\nଘର / ଭୁବନେଶ୍ୱର / ବାହାରେ?`;
  }

  if (state.step === 'jobLocation') {
    state.currentReport.data.jobLocation = input;
    state.step = 'discontinuedComment';
    await Dialog.create({ phone: from, userId: user._id, input, response: '💬 Any other info or comment?', flow: 'visit' });
    return `💬 Any other info or comment?\nଅନ୍ୟ ଅଭିପ୍ରାୟ?`;
  }

  if (state.step === 'returnedStatus') {
    state.currentReport.data.returned = input;
    state.step = 'needHelpReturn';
    await Dialog.create({ phone: from, userId: user._id, input, response: '🙏 Do they need help?', flow: 'visit' });
    return `🙏 Do they need help?\n1️⃣ Yes\n2️⃣ No`;
  }

  if (state.step === 'needHelpReturn') {
    state.currentReport.data.needsHelp = input;
    state.step = 'discontinuedComment';
    await Dialog.create({ phone: from, userId: user._id, input, response: '💬 Final comment?', flow: 'visit' });
    return `💬 Final comment?`;
  }

  if (state.step === 'discontinuedComment') {
    state.currentReport.data.comment = input;
    state.step = 'finalize';
  }

  if (state.step === 'finalize') {
    state.reports.push(state.currentReport);
    await Dialog.create({
        phone: from,
        userId: user._id,
        input: `Visit SL_NO ${sl_no}`,
        response: state.currentReport,
        flow: 'visit',
        role: user.role
    });

    await VisitLog.create({
      ...state.currentReport,
      phone: from,
      volunteerName: salutation,
      role: user.role,
      submittedAt: new Date()
    });

    state.current++;

    if (state.current >= state.assigned.length) {
      const finalReflection = `🧑 Who all visited with you?\n🌟 Rate this member’s comeback potential (1–10)?\n🙏 Would you like a divine message? Type "5".`;

      delete visitTracking[from];
      return `✅ ${salutation}, you completed all 3 visits.\n📩 Admins will review corrections or returns.\n\n${finalReflection}`;
    }

    const nextTask = state.assigned[state.current];
    state.step = 'status';
    await Dialog.create({ phone: from, userId: user._id, input, response: `🧾 Next task:\n${nextTask}`, flow: 'visit' });
    return `🧾 Next task:\n${nextTask}\n\n📌 What was the result?\n1️⃣ Inactive\n2️⃣ Continuing\n3️⃣ Discontinued`;
  }
};
