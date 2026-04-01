require('dotenv').config();

const nodemailer = require('nodemailer');

// ============================================================
// Simple serverless handler for Vercel (Node)
// Endpoint: POST /api/register
// ============================================================

const CONFIG = {
  QUAD_EMAIL: process.env.QUAD_EMAIL,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
};

// Create transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.GMAIL_USER,
    pass: CONFIG.GMAIL_APP_PASSWORD,
  },
});

let participantCounter = 1;
function generateParticipantID() {
  const id = `QI2026-${String(participantCounter).padStart(3, '0')}`;
  participantCounter++;
  return id;
}

function buildParticipantEmail(data, participantID) {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><p>Hi ${data.fullName.split(' ')[0]}, your registration is confirmed. ID: ${participantID}</p></body></html>`;
}

function buildQuadEmail(data, participantID) {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><p>New registration: ${data.fullName} — ${participantID}</p></body></html>`;
}

// Helper to parse JSON body when the platform hasn't already parsed it
async function parseJSONBody(req) {
  if (req.body && Object.keys(req.body).length) return req.body;
  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Quad API is running' });
  }

  let data;
  try {
    data = await parseJSONBody(req);
  } catch (err) {
    console.error('Invalid JSON body', err);
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  const required = ['fullName', 'email', 'phone', 'institution', 'projectName', 'paystackRef'];
  for (const field of required) {
    if (!data[field]) return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
  }

  const participantID = generateParticipantID();

  try {
    // Send confirmation to participant
    await transporter.sendMail({
      from: `"The Quad Collective" <${CONFIG.GMAIL_USER}>`,
      to: data.email,
      subject: `You're In — Quad Innovation 2026 (${participantID})`,
      html: buildParticipantEmail(data, participantID),
    });

    // Send internal copy
    if (CONFIG.QUAD_EMAIL) {
      await transporter.sendMail({
        from: `"Quad Registration" <${CONFIG.GMAIL_USER}>`,
        to: CONFIG.QUAD_EMAIL,
        subject: `New Registration: ${data.fullName} — ${participantID}`,
        html: buildQuadEmail(data, participantID),
      });
    }

    return res.status(200).json({ success: true, participantID, message: 'Registration successful. Confirmation email sent.' });
  } catch (err) {
    console.error('Email sending failed:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: 'Registration received but email sending failed.' });
  }
};
