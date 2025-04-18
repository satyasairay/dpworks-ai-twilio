// task.js
const { getSalutation } = require('../utils/tone-utils');
const Dialog = require('../db/user-dialog');
const fs = require('fs');
const path = require('path');

const tasksData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/tasks-by-pin.json'), 'utf-8'));

const userTaskState = {}; // In-memory for now (replace with Redis or DB later)

module.exports = async function task(from, user) {
  const salutation = getSalutation(user);

  // Step 0 – Already assigned?
  if (userTaskState[from]?.locked) {
    await Dialog.create({
      phone: from,
      userId: user._id,
      input: 'Already locked',
      response: 'User already assigned 3 tasks.',
      flow: 'task',
      role: user.role
    });

    return `✅ ${salutation}, you have already received 3 tasks.\nPlease proceed to "Submit Visit" or type "4" for motivation.`;
  }

  // Step 1 – PIN filter
  const pin = user.pin;
  if (!tasksData[pin]) {
    await Dialog.create({
      phone: from,
      userId: user._id,
      input: `PIN: ${pin}`,
      response: 'No tasks for this PIN',
      flow: 'task',
      role: user.role
    });

    return `⚠️ ${salutation}, no tasks available for your PIN (${pin}).\nPlease contact your coordinator.`;
  }

  const villages = Object.keys(tasksData[pin]);

  // Step 2 – If user is browsing
  if (!userTaskState[from]) {
    userTaskState[from] = {
      currentPage: 0,
      selectedVillage: null,
      assigned: [],
    };
  }

  const state = userTaskState[from];

  // Step 3 – If user selected a village
  if (state.selectedVillage) {
    const villageTasks = tasksData[pin][state.selectedVillage] || [];
    const assigned = villageTasks.splice(0, 3); // Give 3 entries

    state.assigned = assigned;
    state.locked = true;

    await Dialog.create({
      phone: from,
      userId: user._id,
      input: `Selected village: ${state.selectedVillage}`,
      response: `Assigned ${assigned.length} tasks`,
      flow: 'task',
      role: user.role
    });

    return `📋 ${salutation}, here are your 3 tasks from *${state.selectedVillage}*:\n\n` +
      assigned.map((t, i) => `${i + 1}. ${t}`).join('\n') +
      `\n\n✅ You are now in tracking mode.\nType "2" to begin visit submission.`;
  }

  // Step 4 – Show 10 villages at a time
  const pageSize = 10;
  const start = state.currentPage * pageSize;
  const page = villages.slice(start, start + pageSize);

  if (page.length === 0) {
    await Dialog.create({
      phone: from,
      userId: user._id,
      input: 'Village page end',
      response: 'No more villages',
      flow: 'task',
      role: user.role
    });

    return `⚠️ No more villages available.\nType "restart task" to begin again.`;
  }

  const list = page.map((v, i) => `${i + 1}. ${v} (${tasksData[pin][v].length} tasks)`).join('\n');

  state.currentPage++;

  await Dialog.create({
    phone: from,
    userId: user._id,
    input: `Page ${state.currentPage}`,
    response: `Village list shown:\n${list}`,
    flow: 'task',
    role: user.role
  });

  return `🙏 ${salutation}, select a village to begin seva:\n\n${list}\n\n👉 Type village name exactly, or type "next" to see more.\nIf your village is incorrect, type "correct [village]" to suggest fix.`;
};
