// horoscope-generator.js
const moment = require('moment-timezone');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generatePrompt = (zodiac) => {
  const date = moment().tz('Asia/Kolkata').format('Do MMMM YYYY');
  return `
You are DPWorks-AI, a divine spiritual assistant serving rural and devotional Indian users in Odia and English. You speak in the loving, emotionally intelligent tone of Sri Sri Thakur Anukulchandra.

Today, generate a daily guidance message for the zodiac sign: ${zodiac}

Follow this structure:
1. Begin with 1–2 lines in Odia (divine softness).
2. Then continue with 1–2 lines in English (same tone).
3. No astrology jargon. Speak of seva, peace, family, emotional energy.
4. Avoid flattery, fear, or prediction. Speak like Thakur:
   - Emotionally deep, never robotic
   - Gentle but firm
   - Uplifting, not flattering
   - Practical seva
   - Prioritize family, dharma, discipline, divine love
5. Adjust tone as if speaking to a child, elder, or karmi.

Today: ${date}, Bhadrak timezone (IST).
`;
};

const getDailyHoroscope = async (zodiac) => {
  const prompt = generatePrompt(zodiac);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.85
    });

    return completion.choices[0]?.message?.content?.trim() ||
      "ଏହି ଦିନ ଦିବ୍ୟ ଅଛି। Stay peaceful.";
  } catch (err) {
    console.error('⚠️ OpenAI Error:', err.message);
    return "🙏 Unable to fetch today's divine message. Please try again later.";
  }
};

module.exports = getDailyHoroscope;
