// bot/twilioServer.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const mongoose = require('mongoose');
const router = require('./router');
const app = express();

const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// === DB Connection ===
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'dpworks-db',
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB error:', err.message);
  process.exit(1);
});

// === Incoming WhatsApp Webhook ===
app.post('/incoming', async (req, res) => {
  const twiml = new MessagingResponse();
  const from = req.body.From; // e.g. 'whatsapp:+918456002017'
  const body = req.body.Body ? req.body.Body.trim() : '';

  console.log(`📩 Message from ${from}: ${body}`);

  try {
    const responseText = await router({ body, from });
    if (responseText) {
      twiml.message(responseText);
    }
  } catch (err) {
    console.error('💥 Error in router:', err.message);
    twiml.message('⚠️ Something went wrong. Please type "Hi" to try again.');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Twilio Server running on http://localhost:${PORT}`);
});
