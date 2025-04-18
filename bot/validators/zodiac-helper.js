// zodiac-helper.js
const odiaMap = {
    aries: 'ମେଷ', taurus: 'ବୃଷ', gemini: 'ମିଥୁନ',
    cancer: 'କର୍କଟ', leo: 'ସିଂହ', virgo: 'କନ୍ୟା',
    libra: 'ତୁଳା', scorpio: 'ବୃଶ୍ଚିକ', sagittarius: 'ଧନୁ',
    capricorn: 'ମକର', aquarius: 'କୁମ୍ଭ', pisces: 'ମୀନ'
  };
  
  function zodiacHelper(dob) {
    const [dd, mm] = dob.split('-').map(Number);
  
    const rules = [
      { sign: 'capricorn', from: [12, 22], to: [1, 19] },
      { sign: 'aquarius', from: [1, 20], to: [2, 18] },
      { sign: 'pisces', from: [2, 19], to: [3, 20] },
      { sign: 'aries', from: [3, 21], to: [4, 19] },
      { sign: 'taurus', from: [4, 20], to: [5, 20] },
      { sign: 'gemini', from: [5, 21], to: [6, 20] },
      { sign: 'cancer', from: [6, 21], to: [7, 22] },
      { sign: 'leo', from: [7, 23], to: [8, 22] },
      { sign: 'virgo', from: [8, 23], to: [9, 22] },
      { sign: 'libra', from: [9, 23], to: [10, 22] },
      { sign: 'scorpio', from: [10, 23], to: [11, 21] },
      { sign: 'sagittarius', from: [11, 22], to: [12, 21] },
    ];
  
    for (const rule of rules) {
      const [fromM, fromD] = rule.from;
      const [toM, toD] = rule.to;
  
      if (
        (mm === fromM && dd >= fromD) ||
        (mm === toM && dd <= toD)
      ) {
        return { nameEn: rule.sign, nameOdia: odiaMap[rule.sign] };
      }
    }
  
    return { nameEn: 'unknown', nameOdia: 'ଅଜଣା' };
  }
  
  module.exports = zodiacHelper;
  