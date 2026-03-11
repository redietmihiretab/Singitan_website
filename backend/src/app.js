import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRouter from './routes/contact.js';
import authRouter from './routes/auth.js';
import contentRouter from './routes/content.js';
import uploadRouter from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5176',
  ].filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (like curl/postman) with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/upload', uploadRouter);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Sington backend running on http://localhost:${PORT}`);
});

export default app;
