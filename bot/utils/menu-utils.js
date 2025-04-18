// menu-utils.js
const { getSalutation } = require('./tone-utils');

function getMainMenu(user) {
    const salutation = getSalutation(user);
  return `🙏 ଜୟଗୁରୁ ${salutation}!\n\nHere's your divine menu for today 🌸
  
  1️⃣ My Assigned Task  
  2️⃣ Submit Visit Report  
  3️⃣ Report Problem / Scam  
  4️⃣ Feedback or Suggestion  
  5️⃣ Divine Songs / Learn
  
  Type the number to continue 👇`;
  }
  
  module.exports = { getMainMenu };
  