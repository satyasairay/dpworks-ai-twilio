// village-corrector.js
const villages = require('../../data/bhadrak-villages-auto-odia.json');

function villageCorrector(input) {
  const cleaned = input.trim().toLowerCase();

  const match = villages.find(v =>
    v.en.toLowerCase() === cleaned || v.od.toLowerCase() === cleaned
  );

  if (match) {
    return { ...match, matched: true };
  }

  return { en: input.trim(), od: '', matched: false };
}

module.exports = villageCorrector;
