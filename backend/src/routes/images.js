import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const result = await db.query(
      'SELECT mimetype, image_data FROM uploaded_images WHERE filename = ?',
      [filename]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const image = result.rows[0];
    
    // Serve the binary data with the correct content type and cache headers
    res.setHeader('Content-Type', image.mimetype);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.image_data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
