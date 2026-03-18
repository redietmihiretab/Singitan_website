import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const result = await db.query(
      'SELECT mimetype, image_data FROM uploaded_images WHERE filename = $1',
      [filename]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const image = result.rows[0];
    
    // Serve the binary data with the correct content type
    res.setHeader('Content-Type', image.mimetype);
    res.send(image.image_data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
