import { Router } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const router = Router();

// Rate limiting for contact form to prevent email spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Limit each IP to 3 submissions per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent. Please try again later.' }
});

const NAME_REGEX = /^[a-zA-Z\s\-']{3,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MSG_RESTRICT = /[<>{}[\]]/;

function validateInput({ name, email, message }) {
  if (!NAME_REGEX.test(name?.trim())) return 'Invalid name (3–50 letters only).';
  if (!EMAIL_REGEX.test(email?.trim())) return 'Invalid email address.';
  const msg = message?.trim() ?? '';
  if (msg.length < 20 || msg.length > 500) return 'Message must be 20–500 characters.';
  if (MSG_RESTRICT.test(msg)) return 'Message contains invalid characters.';
  return null;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Protected: Get all submissions for admin
router.get('/submissions', verifyToken, async (_req, res) => {
  try {
    const result = await db.query('SELECT * FROM form_message ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch submissions.' });
  }
});

// Protected: Mark submission as handled (non-reversible)
router.put('/submissions/:id/handle', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if already handled
    const existingResult = await db.query('SELECT is_handled FROM form_message WHERE id = $1', [id]);
    const existing = existingResult.rows[0];
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    
    // If already handled, don't allow unhandling
    if (existing.is_handled === 1) {
      return res.status(400).json({ success: false, message: 'Message already handled.' });
    }
    
    const handledAt = new Date().toISOString();
    
    const result = await db.query('UPDATE form_message SET is_handled = 1, handled_at = $1 WHERE id = $2', [handledAt, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    
    res.json({ success: true, message: 'Marked as handled.' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, message: 'Could not update submission.' });
  }
});

router.post('/', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  const error = validateInput({ name, email, message });
  if (error) return res.status(400).json({ success: false, message: error });

  try {
    // 1. Save to Database first
    await db.query('INSERT INTO form_message (name, email, message) VALUES ($1, $2, $3)', [name.trim(), email.trim(), message.trim()]);

    // 2. Send response immediately (before sending emails)
    res.json({ success: true, message: "Success! Your message was saved and we'll be in touch." });

    // 3. Send emails asynchronously in the background (fire-and-forget)
    const transporter = createTransporter();

    // Only attempt email if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Send company email
      transporter.sendMail({
        from: `"Sington Website" <${process.env.SMTP_USER}>`,
        to: process.env.COMPANY_EMAIL || 'info@singitanengineering.com',
        replyTo: email.trim(),
        subject: `New Contact Request from ${name.trim()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #f7931e;border-radius:12px;">
            <h2 style="color:#f7931e;margin-bottom:16px;">New Message from Sington Website</h2>
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Email:</strong> <a href="mailto:${email.trim()}">${email.trim()}</a></p>
            <hr style="border-color:#f7931e;margin:16px 0;"/>
            <p><strong>Message:</strong></p>
            <p style="background:#f9f9f9;padding:16px;border-radius:8px;">${message.trim().replace(/\n/g, '<br>')}</p>
            <p style="color:#888;font-size:12px;margin-top:24px;">Sent via Sington Engineering website contact form.</p>
          </div>
        `,
      }).catch(mailErr => console.warn('Company email failed:', mailErr.message));

      // Send auto-reply to sender
      transporter.sendMail({
        from: `"Sington Engineering" <${process.env.SMTP_USER}>`,
        to: email.trim(),
        subject: 'We received your message — Sington Engineering',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #f7931e;border-radius:12px;">
            <h2 style="color:#f7931e;">Thank you, ${name.trim()}!</h2>
            <p>We have received your message and will get back to you within 24 hours.</p>
            <p style="color:#888;font-size:12px;margin-top:24px;">Sington Engineering PLC | info@singitanengineering.com</p>
          </div>
        `,
      }).catch(mailErr => console.warn('Auto-reply email failed:', mailErr.message));
    }
  } catch (err) {
    console.error('Submission error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again.' });
  }
});

export default router;

