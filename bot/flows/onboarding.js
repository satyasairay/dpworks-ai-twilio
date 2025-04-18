// bot/flows/onboarding.js
const User = require('../db/user-data');
const zodiacHelper = require('../validators/zodiac-helper');
const villageCorrector = require('../validators/village-corrector');
const roleMap = require('../validators/role-map');
const { getSalutation } = require('../utils/tone-utils');
const flowHistory = require('../utils/flow-history');

module.exports = async function onboarding(from, input) {
  const user = await User.findOne({ phone: from });

  const inputLower = input.trim().toLowerCase();

  if (inputLower === 'reset') {
    await User.findOneAndDelete({ phone: from });
    flowHistory.resetHistory(from);
    return '🔄 Reset complete. Type "Hi" to begin again.';
  }

  if (inputLower === 'back main' || inputLower === 'exit') {
    flowHistory.resetHistory(from);
    return `🏠 Exiting to main menu…

  🌸 Type "1" for My Task, "2" for Visit, "3" for Help.`;
  }

  if (inputLower === 'back') {
    const last = flowHistory.goBack(from);
    if (last) {
      const updatedUser = await User.findOne({ phone: from });
      updatedUser.onboardingStep = last.step;
      await updatedUser.save();
      return `🔁 No worries, let’s go back.\n\n${last.prompt}`;
    } else {
      return `❌ You are already at the beginning.`;
    }
  }

  // 1. First-time user – begin onboarding
  if (!user) {
    await User.create({ phone: from, onboardingStep: 'name' });
    await flowHistory.saveStep(from, 'name', '🙏 ଜୟଗୁରୁ! Welcome to DPWorks Seva Assistant.\n\nଦୟାକରି ନିଜ ନାମ କୁହନ୍ତୁ।\nPlease tell me your name 👤');
    return '🙏 ଜୟଗୁରୁ! Welcome to DPWorks Seva Assistant.\n\nଦୟାକରି ନିଜ ନାମ କୁହନ୍ତୁ।\nPlease tell me your name 👤';
  }

  // 2. Creator Access Mode
  if (input === 'aatma') {
    user.role = 'full_admin';
    user.isOnboarded = true;
    await user.save();
    return '🕉️ Creator access granted. Full privileges activated.';
  }

  // 3. Stepwise onboarding logic
  switch (user.onboardingStep) {
    case 'name':
      user.name = input.trim();
      user.onboardingStep = 'pin';
      await user.save();
      await flowHistory.saveStep(from, 'pin', '📍 Enter your 6-digit PIN code:\n\nଦୟାକରି ତୁମ ପିନ କୋଡ୍ କୁହନ୍ତୁ (ଭଦ୍ରକ PIN ମାତ୍ର)।');
      return '📍 Enter your 6-digit PIN code:\n\nଦୟାକରି ତୁମ ପିନ କୋଡ୍ କୁହନ୍ତୁ (ଭଦ୍ରକ PIN ମାତ୍ର)।';

    case 'pin':
      if (!/^\d{6}$/.test(input)) return '❌ Invalid PIN. Please enter a 6-digit number.';
      if (!input.startsWith('756')) return '⚠️ Only Bhadrak-based PINs are supported.';
      user.pin = input;
      user.onboardingStep = 'village';
      await user.save();
      await flowHistory.saveStep(from, 'village', '🏡 What is your village name?\n\nଦୟାକରି ତୁମ ଗ୍ରାମ ନାମ କୁହନ୍ତୁ (typed in English/Odia).');
      return '🏡 What is your village name?\n\nଦୟାକରି ଗ୍ରାମ ନାମ କୁହନ୍ତୁ (typed in English/Odia).';

    case 'village':
      const attempt = user.villageAttempts || 0;
      const result = villageCorrector(input.trim());

      if (!result.matched) {
        user.villageAttempts = attempt + 1;

        if (attempt === 0) {
          await user.save();
          await flowHistory.saveStep(from, 'village_retry', '⚠️ This village is not listed.\n\nଦୟାକରି ନାମ ଟିକେ ଠିକ୍ ଭାବରେ ଲେଖନ୍ତୁ ଏବଂ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।\nPlease recheck and type your village again.');
          return `⚠️ This village is not listed.\n\nଦୟାକରି ନାମ ଟିକେ ଠିକ୍ ଭାବରେ ଲେଖନ୍ତୁ ଏବଂ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।\nPlease recheck and type your village again.`;
        } else {
          user.village = result.en;
          user.villageOdia = '🔍 Unverified';
          user.villageFlagged = true;
          user.onboardingStep = 'dob';
          await user.save();
          await flowHistory.saveStep(from, 'dob', '📩 Thank you. We’ve noted your village as a new entry.\nIt will be reviewed by admins.\n\n🎂 Now, tell me your date of birth (DD-MM-YYYY)\n\nଦୟାକରି ତୁମ ଜନ୍ମ ତାରିଖ ଦିଅ (DD-MM-YYYY)।');
          return `📩 Thank you. We’ve noted your village as a new entry.\nIt will be reviewed by admins.\n\n🎂 Now, tell me your date of birth (DD-MM-YYYY)\n\nଦୟାକରି ତୁମ ଜନ୍ମ ତାରିଖ ଦିଅ (DD-MM-YYYY)।`;
        }
      }

      // ✅ Exact match found
      user.village = result.en;
      user.villageOdia = result.od;
      user.villageAttempts = 0;
      user.villageFlagged = false;
      user.onboardingStep = 'dob';
      await user.save();
      await flowHistory.saveStep(from, 'dob', `✅ Village detected: ${result.en} (${result.od})\n\n🎂 Now, tell me your date of birth (DD-MM-YYYY)\n\nଦୟାକରି ତୁମ ଜନ୍ମ ତାରିଖ ଦିଅ (DD-MM-YYYY)।`);
      return `✅ Village detected: ${result.en} (${result.od})\n\n🎂 Now, tell me your date of birth (DD-MM-YYYY)\n\nଦୟାକରି ତୁମ ଜନ୍ମ ତାରିଖ ଦିଅ (DD-MM-YYYY)।`;

    case 'dob':
      const dob = input.trim();
      if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) return '❌ Format should be DD-MM-YYYY. Try again.';
      const zodiac = zodiacHelper(dob);
      user.birthday = dob;
      user.zodiac = zodiac.nameEn + ' (' + zodiac.nameOdia + ')';
      user.onboardingStep = 'gender';
      await user.save();
      await flowHistory.saveStep(from, 'gender', `🔮 Zodiac detected: ${zodiac.nameOdia} (${zodiac.nameEn})\n\n🧑 Please select your gender:\nType "Male" or "Female".`);
      return `🔮 Zodiac detected: ${zodiac.nameOdia} (${zodiac.nameEn})\n\n🧑 Please select your gender:\nType "Male" or "Female".`;

    case 'gender':
      if (!['male', 'female'].includes(input.toLowerCase())) return '❌ Please type "Male" or "Female".';
      user.gender = input.toLowerCase();
      user.onboardingStep = 'role';
      await user.save();
      await flowHistory.saveStep(from, 'role', `🎖️ Please select your DP role:\n\n1. Field Worker / Volunteer\n2. Karmi Mandali\n3. District Admin\n4. Other\n\nType 1/2/3/4`);
      return `🎖️ Please select your DP role:\n\n1. Field Worker / Volunteer\n2. Karmi Mandali\n3. District Admin\n4. Other\n\nType 1/2/3/4`;

    case 'role':
      const roleInput = input.trim().toLowerCase();
      const role = roleMap(roleInput);
      if (!role) return '❌ Invalid role. Please type 1, 2, 3 or 4.';
      user.role = role;
      user.onboardingStep = 'confirm';
      user.pendingConfirm = true;
      await user.save();
      await flowHistory.saveStep(from, 'confirm', `🧾 Please review your details:\n\n👤 Name: ${user.name}\n📍 PIN: ${user.pin}\n🏡 Village: ${user.village} (${user.villageOdia})\n🎂 DOB: ${user.birthday}\n🔮 Zodiac: ${user.zodiac}\n🎖️ Role: ${user.role}\n🧑 Gender: ${user.gender}\n\n👉 Type "confirm" to save or "edit" to restart.`);
      return `🧾 Please review your details:\n\n👤 Name: ${user.name}\n📍 PIN: ${user.pin}\n🏡 Village: ${user.village} (${user.villageOdia})\n🎂 DOB: ${user.birthday}\n🔮 Zodiac: ${user.zodiac}\n🎖️ Role: ${user.role}\n🧑 Gender: ${user.gender}\n\n👉 Type "confirm" to save or "edit" to restart.`;

    case 'confirm':
      if (input === 'confirm') {
        user.isOnboarded = true;
        user.pendingConfirm = false;
        user.onboardingStep = null;
        await user.save();
        const welcomeName = getSalutation(user);
        return `✅ Welcome, ${welcomeName}! You are now part of DPWorks.\n\n🙏 ଜୟଗୁରୁ! Your divine journey begins.`;
      } else if (input === 'edit') {
        await User.findOneAndDelete({ phone: from });
        return '🔄 Restarting onboarding. Type "Hi" to begin again.';
      } else {
        return '👉 Please type "confirm" to save or "edit" to restart.';
      }

    default:
      return '⚠️ Something went wrong. Please type "reset" to start over.';
  }
};
