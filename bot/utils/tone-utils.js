// tone-utils.js
function getProfileSummary(user) {
  return `🧾 Your profile:

👤 Name: ${user.name || 'N/A'}
📍 PIN: ${user.pin || 'N/A'}
🏡 Village: ${user.village || ''} (${user.villageOdia || ''})
🎂 DOB: ${user.birthday || 'N/A'}
🔮 Zodiac: ${user.zodiac || 'N/A'}
🎖️ Role: ${user.role || 'N/A'}
🧑 Gender: ${user.gender || 'N/A'}`;
}

function detectMood(input = '') {
const txt = input.toLowerCase();
if (txt.includes('help') || txt.includes('sad')) return 'sad';
if (txt.includes('thank') || txt.includes('joyguru')) return 'peaceful';
if (txt.includes('angry') || txt.includes('why')) return 'frustrated';
return 'neutral';
}

function getSalutation(user) {
if (!user?.name || !user?.gender) return 'Sevak';

const first = user.name.trim().split(' ')[0];
const gender = user.gender.toLowerCase();
const role = user.role?.toLowerCase() || '';

// Optional DOB-based age calculation
let age = null;
if (user.birthday) {
  const [dd, mm, yyyy] = user.birthday.split('-');
  const birthDate = new Date(`${yyyy}-${mm}-${dd}`);
  const ageDiff = Date.now() - birthDate.getTime();
  age = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

// Children
if (role.includes('child') || role.includes('pilaa')) return `${first}`;

// Elder women or spiritual roles
// if (gender === 'female' && role.includes('admin')) return `${first} Didi`;
// if (gender === 'female' && role.includes('karmi')) return `${first} Maa`;

// Elder men or formal tone
if (gender === 'male' && (role.includes('admin') || role.includes('ritwick'))) return `${first} Dada`;
if (gender === 'male' && age !== null && age >= 40) return `${first} Dada`;

// Default youth tones
if (gender === 'female') return `${first} Maa`;
if (gender === 'male') return `${first} Bhai`;

return first;
}

module.exports = { getProfileSummary, detectMood, getSalutation };
