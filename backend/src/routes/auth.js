import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';

dotenv.config();

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password required.' });

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
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
      db.prepare('UPDATE users SET username = ? WHERE username = ?').run(newUsername, currentUsername);
    }
    
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, newUsername || currentUsername);
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
