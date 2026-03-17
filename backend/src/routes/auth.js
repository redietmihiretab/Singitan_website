import { Router } from 'express';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



const router = Router();

// Stricter limiter for login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 login attempts per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password required.' });

  try {
    const result = await db.query('SELECT * FROM auser WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/update-credentials', verifyToken, async (req, res) => {
  const { newUsername, newPassword } = req.body;
  const currentUsername = req.user.username;

  if (!newUsername && !newPassword) {
    return res.status(400).json({ success: false, message: 'New username or password required.' });
  }

  try {
    if (newUsername) {
      await db.query('UPDATE auser SET username = $1 WHERE username = $2', [newUsername, currentUsername]);
    }
    
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      await db.query('UPDATE auser SET password_hash = $1 WHERE username = $2', [hash, newUsername || currentUsername]);
    }

    res.json({ success: true, message: 'Credentials updated successfully. Please log in again.' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update credentials.' });
  }
});

router.get('/profile', verifyToken, (req, res) => {
  res.json({ success: true, username: req.user.username });
});

export default router;
