import { Router } from 'express';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// Public — frontend fetches this to hydrate content
router.get('/', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM content').all();
    const data = {};
    rows.forEach(row => {
      data[row.key] = JSON.parse(row.value);
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, message: 'Could not read content.' });
  }
});

// Protected — admin only
router.put('/', verifyToken, (req, res) => {
  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO content (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        upsert.run(key, JSON.stringify(value));
      }
    });
    
    transaction(req.body);
    
    // Return the updated data
    const rows = db.prepare('SELECT * FROM content').all();
    const resultData = {};
    rows.forEach(row => {
      resultData[row.key] = JSON.parse(row.value);
    });

    res.json({ success: true, message: 'Content updated.', data: resultData });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, message: 'Could not save content.' });
  }
});

export default router;
