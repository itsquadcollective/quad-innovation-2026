// ============================================================
//  QUAD INNOVATION 2026 — Form Submission Backend
//  Node.js + Express + Nodemailer
//
//  WHAT THIS DOES:
//  - Receives the registration form data from your website
//  - Sends a confirmation email to the participant
//  - Sends a copy to The Quad's email
//
//  HOW TO RUN LOCALLY:
//  1. npm install
//  2. Fill in your real values in the .env file
//  3. node server.js
//
//  HOW TO DEPLOY ON RENDER:
//  - Push this folder to GitHub (the .env file is excluded automatically)
//  - On Render, go to Environment Variables and add each key from .env manually
// ============================================================

require('dotenv').config(); // loads your .env file automatically

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


// ============================================================
//  CONFIG — reads from .env (never hardcoded here)
// ============================================================
const CONFIG = {
  QUAD_EMAIL:         process.env.QUAD_EMAIL,
  GMAIL_USER:         process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  PORT:               process.env.PORT || 3000,
};
// ============================================================


// Set up the email sender using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.GMAIL_USER,
    pass: CONFIG.GMAIL_APP_PASSWORD,
  },
});


// ============================================================
//  HELPER — Generate a Participant ID
//  Format: QI2026-001, QI2026-002, etc.
//  This is a simple in-memory counter. For a proper database,
//  you'd store this in a file or a service like Airtable.
// ============================================================
let participantCounter = 1;

function generateParticipantID() {
  const id = `QI2026-${String(participantCounter).padStart(3, '0')}`;
  participantCounter++;
  return id;
}


// ============================================================
//  HELPER — Build the confirmation email HTML
// ============================================================
function buildParticipantEmail(data, participantID) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
      .wrap { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 6px; overflow: hidden; }
      .header { background: #03081b; padding: 36px 40px; text-align: center; }
      .header h1 { color: #3b82f6; font-size: 28px; margin: 0 0 4px; letter-spacing: 0.05em; }
      .header p { color: #7b94c4; font-size: 13px; margin: 0; letter-spacing: 0.1em; text-transform: uppercase; }
      .body { padding: 36px 40px; }
      .body h2 { color: #1e293b; font-size: 20px; margin: 0 0 12px; }
      .body p { color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 20px; }
      .id-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }
      .id-box .id-label { font-size: 11px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; color: #3b82f6; margin-bottom: 4px; }
      .id-box .id-value { font-size: 24px; font-weight: bold; color: #1e293b; letter-spacing: 0.05em; }
      .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .details-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
      .details-table td:first-child { color: #94a3b8; font-weight: bold; width: 40%; }
      .details-table td:last-child { color: #1e293b; }
      .timeline { background: #f8fafc; border-radius: 4px; padding: 20px 24px; margin: 20px 0; }
      .timeline h3 { font-size: 13px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; margin: 0 0 14px; }
      .tl-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
      .tl-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; margin-top: 5px; flex-shrink: 0; }
      .tl-text { font-size: 14px; color: #475569; line-height: 1.5; }
      .tl-text strong { color: #1e293b; }
      .footer { background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
      .footer p { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.7; }
      .footer a { color: #3b82f6; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>QUAD INNOVATION 2026</h1>
        <p>The Quad Collective &nbsp;·&nbsp; Official Confirmation</p>
      </div>
      <div class="body">
        <h2>You're in, ${data.fullName.split(' ')[0]}. 🎉</h2>
        <p>Your registration for <strong>Quad Innovation 2026</strong> has been confirmed. Welcome to Nigeria's boldest youth-led tech and innovation competition.</p>

        <div class="id-box">
          <div class="id-label">Your Participant ID</div>
          <div class="id-value">${participantID}</div>
        </div>

        <table class="details-table">
          <tr><td>Full Name</td><td>${data.fullName}</td></tr>
          <tr><td>Email</td><td>${data.email}</td></tr>
          <tr><td>Phone</td><td>${data.phone}</td></tr>
          <tr><td>Institution</td><td>${data.institution}</td></tr>
          <tr><td>Project Name</td><td>${data.projectName}</td></tr>
          <tr><td>Category</td><td>${data.category}</td></tr>
          <tr><td>Payment Ref</td><td>${data.paystackRef}</td></tr>
        </table>

        <div class="timeline">
          <h3>What Happens Next</h3>
          <div class="tl-row"><div class="tl-dot"></div><div class="tl-text"><strong>Now – May 31:</strong> Registration is open. Share the competition with friends.</div></div>
          <div class="tl-row"><div class="tl-dot"></div><div class="tl-text"><strong>Early June:</strong> Shortlisted participants will be notified with pitch guidelines.</div></div>
          <div class="tl-row"><div class="tl-dot"></div><div class="tl-text"><strong>June 7, 2026:</strong> Competition Day. Show up. Pitch. Win.</div></div>
        </div>

        <p>Keep this email safe — it is your official registration record. If you have any questions, reply to this email or reach us at <a href="mailto:hello@thequadcollective.com">hello@thequadcollective.com</a>.</p>

        <p style="color:#1e293b; font-weight:600;">We are rooting for you.<br>— Lilly &amp; The Quad Collective Team</p>
      </div>
      <div class="footer">
        <p>The Quad Collective &nbsp;·&nbsp; Quad Innovation 2026<br>
        <a href="mailto:hello@thequadcollective.com">hello@thequadcollective.com</a> &nbsp;·&nbsp; @thequadcollective</p>
      </div>
    </div>
  </body>
  </html>
  `;
}


// ============================================================
//  HELPER — Build the internal copy email for The Quad
// ============================================================
function buildQuadEmail(data, participantID) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
      .wrap { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 6px; overflow: hidden; }
      .header { background: #1d40ae; padding: 24px 32px; }
      .header h1 { color: #ffffff; font-size: 18px; margin: 0; }
      .header p { color: #bfdbfe; font-size: 13px; margin: 4px 0 0; }
      .body { padding: 28px 32px; }
      .body p { color: #475569; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
      td:first-child { color: #64748b; font-weight: bold; width: 38%; }
      .id { font-size: 20px; font-weight: bold; color: #1d40ae; margin-bottom: 20px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>New Registration — Quad Innovation 2026</h1>
        <p>Internal copy · The Quad Collective</p>
      </div>
      <div class="body">
        <p>A new participant has registered. Here are their details:</p>
        <div class="id">Participant ID: ${participantID}</div>
        <table>
          <tr><td>Full Name</td><td>${data.fullName}</td></tr>
          <tr><td>Email</td><td>${data.email}</td></tr>
          <tr><td>Phone</td><td>${data.phone}</td></tr>
          <tr><td>Date of Birth</td><td>${data.dob}</td></tr>
          <tr><td>State</td><td>${data.state}</td></tr>
          <tr><td>Institution</td><td>${data.institution}</td></tr>
          <tr><td>Institution Type</td><td>${data.institutionType}</td></tr>
          <tr><td>Faculty / Dept</td><td>${data.faculty || 'Not provided'}</td></tr>
          <tr><td>Year of Study</td><td>${data.yearOfStudy || 'Not provided'}</td></tr>
          <tr><td>Project Name</td><td>${data.projectName}</td></tr>
          <tr><td>Problem</td><td>${data.problem}</td></tr>
          <tr><td>Solution</td><td>${data.solution}</td></tr>
          <tr><td>Category</td><td>${data.category}</td></tr>
          <tr><td>Project Stage</td><td>${data.projectStage}</td></tr>
          <tr><td>Tech Experience</td><td>${data.techExperience}</td></tr>
          <tr><td>Pitched Before</td><td>${data.pitchedBefore}</td></tr>
          <tr><td>Heard About Us</td><td>${data.heardFrom}</td></tr>
          <tr><td>Paystack Ref</td><td>${data.paystackRef}</td></tr>
        </table>
      </div>
    </div>
  </body>
  </html>
  `;
}


// ============================================================
//  ROUTE — POST /register
//  Your website form submits to this endpoint
// ============================================================
app.post('/register', async (req, res) => {
  const data = req.body;

  // Basic check — make sure the required fields arrived
  const required = ['fullName', 'email', 'phone', 'institution', 'projectName', 'paystackRef'];
  for (const field of required) {
    if (!data[field]) {
      return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
    }
  }

  // Generate a participant ID for this person
  const participantID = generateParticipantID();

  try {
    // 1. Send confirmation email TO THE PARTICIPANT
    await transporter.sendMail({
      from: `"The Quad Collective" <${CONFIG.GMAIL_USER}>`,
      to: data.email,
      subject: `You're In — Quad Innovation 2026 Registration Confirmed (${participantID})`,
      html: buildParticipantEmail(data, participantID),
    });

    // 2. Send internal copy TO THE QUAD EMAIL
    await transporter.sendMail({
      from: `"Quad Registration System" <${CONFIG.GMAIL_USER}>`,
      to: CONFIG.QUAD_EMAIL,
      subject: `New Registration: ${data.fullName} — ${participantID}`,
      html: buildQuadEmail(data, participantID),
    });

    // 3. Return success to the website
    return res.status(200).json({
      success: true,
      participantID,
      message: 'Registration successful. Confirmation email sent.',
    });

  } catch (error) {
    console.error('Email sending failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Registration received but email sending failed. Please contact hello@thequadcollective.com.',
    });
  }
});


// ============================================================
//  ROUTE — GET /  (health check — just to confirm it's running)
// ============================================================
app.get('/', (req, res) => {
  res.json({ status: 'Quad Innovation 2026 backend is running.' });
});


// Start the server
app.listen(CONFIG.PORT, () => {
  console.log(`Quad backend running on http://localhost:${CONFIG.PORT}`);
});
