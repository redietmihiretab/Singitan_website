import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRouter from './routes/contact.js';
import authRouter from './routes/auth.js';
import contentRouter from './routes/content.js';
import uploadRouter from './routes/upload.js';
import imagesRouter from './routes/images.js';
import blogsRouter from './routes/blogs.js';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Trust the cPanel/Passenger proxy to get the real user IP
app.set('trust proxy', 1);

// Security Middleware (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Required if serving images to other origins
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  validate: { trustProxy: false },
});
app.use(globalLimiter);

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

// Compress all responses
app.use(compression());

// Serve static files from the public directory with cache
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true
}));

// Root route for cPanel/Passenger health checks
app.get('/', (_, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sington Engineering API</title>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f4f4f4; color: #333; }
        .container { text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #f7931e; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Sington Engineering API</h1>
        <p>The backend service is running successfully.</p>
        <p style="color: #666; font-size: 0.9rem;">Deployment Health Check: OK</p>
      </div>
    </body>
    </html>
  `);
});

app.get('/api', (_, res) => res.json({ success: true, message: 'Sington Engineering API is running' }));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/images', imagesRouter);
app.use('/api/blogs', blogsRouter);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Sington backend running on http://localhost:${PORT}`);
});

export default app;
