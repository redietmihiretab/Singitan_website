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

  // Debug: Log the request
  console.error('=== LOGIN ATTEMPT ===');
  console.error('Username received:', username);
  console.error('Password received:', password ? '***provided***' : 'missing');

  if (!username || !password) {
    console.error('Missing username or password');
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  try {
    // Debug: Query the database
    console.error('Querying database for user:', username);
    const result = await db.query('SELECT * FROM auser WHERE username = ?', [username]);

    // Debug: Check result structure
    console.error('Query result type:', typeof result);
    console.error('Query result keys:', Object.keys(result));
    console.error('Has rows property:', result.hasOwnProperty('rows'));
    console.error('Rows count:', result.rows ? result.rows.length : 'no rows property');

    const user = result.rows[0];

    if (!user) {
      console.error('User not found:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.error('User found:', user.username);
    console.error('User role:', user.role);
    console.error('Stored hash (first 30 chars):', user.password_hash ? user.password_hash.substring(0, 30) : 'NO HASH');

    // Debug: Verify password
    console.error('Verifying password...');
    const valid = await bcrypt.compare(password, user.password_hash);
    console.error('Password valid:', valid);

    if (!valid) {
      console.error('Invalid password for user:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Debug: Check JWT secret
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing!');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Debug: Generate token
    console.error('Generating JWT token...');
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.error('✅ Login successful for:', username);
    console.error('=== LOGIN SUCCESS ===');

    res.json({ success: true, token });

  } catch (error) {
    console.error('❌ Login error DETAILS:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/update-credentials', verifyToken, async (req, res) => {
  const { newUsername, newPassword } = req.body;
  const currentUsername = req.user.username;

  console.error('=== UPDATE CREDENTIALS ===');
  console.error('Current username:', currentUsername);
  console.error('New username:', newUsername);
  console.error('New password:', newPassword ? '***provided***' : 'not provided');

  if (!newUsername && !newPassword) {
    return res.status(400).json({ success: false, message: 'New username or password required.' });
  }

  try {
    if (newUsername) {
      console.error('Updating username from', currentUsername, 'to', newUsername);
      await db.query('UPDATE auser SET username = ? WHERE username = ?', [newUsername, currentUsername]);
      console.error('Username updated');
    }

    if (newPassword) {
      console.error('Updating password for user:', newUsername || currentUsername);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      await db.query('UPDATE auser SET password_hash = ? WHERE username = ?', [hash, newUsername || currentUsername]);
      console.error('Password updated');
    }

    console.error('✅ Credentials updated successfully');
    res.json({ success: true, message: 'Credentials updated successfully. Please log in again.' });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update credentials.' });
  }
});

router.get('/profile', verifyToken, (req, res) => {
  console.error('Profile accessed by:', req.user.username);
  res.json({ success: true, username: req.user.username });
});


export default router;