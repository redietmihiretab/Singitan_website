import { Router } from 'express';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// Helper to get full content from relational tables
const getFullContent = async () => {
  const settings = await db.query('SELECT * FROM web_settings');
  const services = await db.query('SELECT * FROM services ORDER BY display_order ASC');
  const projects = await db.query('SELECT * FROM projects ORDER BY display_order ASC');
  const testimonials = await db.query('SELECT * FROM testimonials ORDER BY display_order ASC');
  const partners = await db.query('SELECT * FROM partners ORDER BY display_order ASC');
  const stats = await db.query('SELECT * FROM stats ORDER BY display_order ASC');

  const data = {};
  
  // Fill settings
  settings.rows.forEach(row => {
    data[row.key] = row.value;
  });

  // Fill entities
  data.services = services.rows.map(s => ({
    ...s,
    paragraphs: s.paragraphs || [],
    bullets: s.bullets || [],
    additionalImages: s.additional_images || []
  }));

  data.projects = projects.rows.map(p => ({
    ...p,
    tags: p.tags || [],
    paragraphs: p.paragraphs || [],
    bullets: p.bullets || [],
    additionalImages: p.additional_images || []
  }));

  data.testimonials = testimonials.rows;
  data.partners = partners.rows;
  data.stats = stats.rows;

  return data;
};

// Public — frontend fetches this to hydrate content
router.get('/', async (_req, res) => {
  try {
    const data = await getFullContent();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, message: 'Could not read content.' });
  }
});

// Protected — admin only
router.put('/', verifyToken, async (req, res) => {
  try {
    const data = req.body;
    
    await db.query('BEGIN');
    try {
      // 1. Update Settings
      const settingsKeys = ['logos', 'hero', 'about', 'cta', 'contact'];
      for (const key of settingsKeys) {
        if (data[key]) {
          await db.query(
            'INSERT INTO web_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [key, JSON.stringify(data[key])]
          );
        }
      }

      // 2. Sync Services (Delete and Re-insert for simplicity in this implementation)
      await db.query('DELETE FROM services');
      if (data.services) {
        for (const [idx, item] of data.services.entries()) {
          await db.query(
            'INSERT INTO services (title, description, image, paragraphs, bullets, additional_images, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [item.title, item.description, item.image, JSON.stringify(item.paragraphs), JSON.stringify(item.bullets), JSON.stringify(item.additionalImages), idx]
          );
        }
      }

      // 3. Sync Projects
      await db.query('DELETE FROM projects');
      if (data.projects) {
        for (const [idx, item] of data.projects.entries()) {
          await db.query(
            'INSERT INTO projects (title, description, image, tags, paragraphs, bullets, additional_images, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [item.title, item.description, item.image, JSON.stringify(item.tags), JSON.stringify(item.paragraphs), JSON.stringify(item.bullets), JSON.stringify(item.additionalImages), idx]
          );
        }
      }

      // 4. Testimonials
      await db.query('DELETE FROM testimonials');
      if (data.testimonials) {
        for (const [idx, item] of data.testimonials.entries()) {
          await db.query(
            'INSERT INTO testimonials (name, position, quote, photo, display_order) VALUES ($1, $2, $3, $4, $5)',
            [item.name, item.position, item.quote, item.photo, idx]
          );
        }
      }

      // 5. Partners
      await db.query('DELETE FROM partners');
      if (data.partners) {
        for (const [idx, item] of data.partners.entries()) {
          await db.query('INSERT INTO partners (name, logo, display_order) VALUES ($1, $2, $3)', [item.name, item.logo, idx]);
        }
      }

      // 6. Stats
      await db.query('DELETE FROM stats');
      if (data.stats) {
        for (const [idx, item] of data.stats.entries()) {
          await db.query('INSERT INTO stats (label, value, display_order) VALUES ($1, $2, $3)', [item.label, item.value, idx]);
        }
      }

      await db.query('COMMIT');
    } catch (txError) {
      await db.query('ROLLBACK');
      throw txError;
    }
    
    // Return the updated data
    const resultData = await getFullContent();
    res.json({ success: true, message: 'Content updated.', data: resultData });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, message: 'Could not save content.' });
  }
});

export default router;
