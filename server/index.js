const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT && parseInt(process.env.SMTP_PORT, 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, auth: { user, pass }, secure: port === 465 });
}

app.post('/send-code', async (req, res) => {
  const { email, code, purpose } = req.body || {};
  if (!email || !code || !purpose) return res.status(400).json({ error: 'Missing fields' });

  const transporter = createTransport();
  const subject = purpose === 'forgot' ? 'Your Stumart password reset code' : 'Your Stumart verification code';
  const text = `Your Stumart ${purpose === 'forgot' ? 'password reset' : 'verification'} code is: ${code}`;

  if (!transporter) {
    console.warn('SMTP not configured. Skipping send.');
    return res.json({ ok: true, info: 'smtp-not-configured' });
  }

  try {
    const info = await transporter.sendMail({ from: process.env.FROM_EMAIL || 'no-reply@stumart.app', to: email, subject, text });
    return res.json({ ok: true, info });
  } catch (err) {
    console.error('send-code error', err);
    return res.status(500).json({ error: 'Unable to send email' });
  }
});

// mount reels endpoints
const reelsRoutes = require('./reels');
app.use('/', reelsRoutes);
// mount chat endpoints
const chatRoutes = require('./chat');
app.use('/', chatRoutes);
// mount vendor endpoints
const vendorRoutes = require('./vendor');
app.use('/', vendorRoutes);

app.listen(PORT, () => console.log(`Email server listening on ${PORT}`));
