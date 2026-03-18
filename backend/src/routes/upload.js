import multer from 'multer';
import { Router } from 'express';
import sharp from 'sharp';
import db from '../db.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    
    // Generate a unique filename with .webp extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}.webp`;
    const mimetype = 'image/webp';

    // Convert image buffer to webp using sharp
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Store in PostgreSQL database
    await db.query(
      'INSERT INTO uploaded_images (filename, mimetype, image_data) VALUES ($1, $2, $3)',
      [filename, mimetype, webpBuffer]
    );

    // Return the relative path for frontend usage
    const filePath = `/api/images/${filename}`;
    res.json({ success: true, filePath: filePath });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during upload.' });
  }
});

export default router;
