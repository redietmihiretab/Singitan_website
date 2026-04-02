import express from 'express';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Get all active blogs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM blogs WHERE is_active = TRUE ORDER BY display_order ASC, posted_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching blogs:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all blogs (including inactive ones, for admin)
router.get('/admin', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM blogs ORDER BY display_order ASC, posted_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching admin blogs:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get a single blog by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching blog:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new blog
router.post('/', verifyToken, async (req, res) => {
  const {
    title, author, image, paragraph_1, paragraph_2, paragraph_3, paragraph_4, paragraph_5,
    image_1, image_2, image_3, display_order, is_active
  } = req.body;

  try {
    const query = `
      INSERT INTO blogs (
        title, author, image, paragraph_1, paragraph_2, paragraph_3, paragraph_4, paragraph_5,
        image_1, image_2, image_3, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      title, author, image, paragraph_1, paragraph_2, paragraph_3, paragraph_4, paragraph_5,
      image_1, image_2, image_3, display_order || 0, is_active !== undefined ? is_active : true
    ];

    const result = await db.query(query, params);
    res.status(201).json({ success: true, message: 'Blog created successfully', id: result.insertId });
  } catch (err) {
    console.error('Error creating blog:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a blog
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    title, author, image, paragraph_1, paragraph_2, paragraph_3, paragraph_4, paragraph_5,
    image_1, image_2, image_3, display_order, is_active
  } = req.body;

  try {
    const query = `
      UPDATE blogs SET
        title = ?, author = ?, image = ?, paragraph_1 = ?, paragraph_2 = ?, paragraph_3 = ?,
        paragraph_4 = ?, paragraph_5 = ?, image_1 = ?, image_2 = ?, image_3 = ?,
        display_order = ?, is_active = ?
      WHERE id = ?
    `;
    const params = [
      title, author, image, paragraph_1, paragraph_2, paragraph_3, paragraph_4, paragraph_5,
      image_1, image_2, image_3, display_order, is_active, id
    ];

    await db.query(query, params);
    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (err) {
    console.error('Error updating blog:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a blog
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM blogs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// TEMPORARY: Migration route to add 'author' column if missing
router.get('/sys/migrate', async (req, res) => {
  try {
    console.log('Starting manual migration: adding author column...');
    const connection = await db.getConnection();
    const [columns] = await connection.query('SHOW COLUMNS FROM blogs');
    const hasAuthor = columns.some(c => c.Field === 'author' || c.field === 'author');
    
    if (!hasAuthor) {
      await connection.query('ALTER TABLE blogs ADD COLUMN author VARCHAR(255) AFTER title');
      console.log('Migration SUCCESS: Author column added.');
      res.json({ success: true, message: 'Author column added successfully.' });
    } else {
      console.log('Migration SKIP: Author column already exists.');
      res.json({ success: true, message: 'Author column already exists.' });
    }
    connection.release();
  } catch (err) {
    console.error('Migration ERROR:', err);
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
});

export default router;
