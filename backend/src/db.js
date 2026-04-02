import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');

    // 1. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS auser (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      );

      CREATE TABLE IF NOT EXISTS form_message (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_handled SMALLINT DEFAULT 0,
        handled_at TEXT
      );

      CREATE TABLE IF NOT EXISTS web_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image TEXT,
        paragraphs JSONB DEFAULT '[]',
        bullets JSONB DEFAULT '[]',
        additional_images JSONB DEFAULT '[]',
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image TEXT,
        tags JSONB DEFAULT '[]',
        paragraphs JSONB DEFAULT '[]',
        bullets JSONB DEFAULT '[]',
        additional_images JSONB DEFAULT '[]',
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT,
        quote TEXT,
        photo TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS uploaded_images (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        mimetype TEXT NOT NULL,
        image_data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Seeding Logic (only if tables are empty)
    const settingsCheck = await client.query('SELECT COUNT(*) FROM web_settings');
    if (parseInt(settingsCheck.rows[0].count) === 0 && fs.existsSync(CONTENT_PATH)) {
      console.log('Seeding relational tables from content.json...');
      const data = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));
      
      // Seed singular settings
      const settingsKeys = ['logos', 'hero', 'about', 'cta', 'contact'];
      for (const key of settingsKeys) {
        if (data[key]) {
          await client.query('INSERT INTO web_settings (key, value) VALUES ($1, $2)', [key, JSON.stringify(data[key])]);
        }
      }

      // Seed Services
      if (data.services) {
        for (const [idx, item] of data.services.entries()) {
          await client.query(
            'INSERT INTO services (title, description, image, paragraphs, bullets, additional_images, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [item.title, item.description, item.image, JSON.stringify(item.paragraphs), JSON.stringify(item.bullets), JSON.stringify(item.additionalImages), idx]
          );
        }
      }

      // Seed Projects
      if (data.projects) {
        for (const [idx, item] of data.projects.entries()) {
          await client.query(
            'INSERT INTO projects (title, description, image, tags, paragraphs, bullets, additional_images, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [item.title, item.description, item.image, JSON.stringify(item.tags), JSON.stringify(item.paragraphs), JSON.stringify(item.bullets), JSON.stringify(item.additionalImages), idx]
          );
        }
      }

      // Seed Testimonials
      if (data.testimonials) {
        for (const [idx, item] of data.testimonials.entries()) {
          await client.query(
            'INSERT INTO testimonials (name, position, quote, photo, display_order) VALUES ($1, $2, $3, $4, $5)',
            [item.name, item.position, item.quote, item.photo, idx]
          );
        }
      }

      // Seed Partners
      if (data.partners) {
        for (const [idx, item] of data.partners.entries()) {
          await client.query('INSERT INTO partners (name, logo, display_order) VALUES ($1, $2, $3)', [item.name, item.logo, idx]);
        }
      }

      // Seed Stats
      if (data.stats) {
        for (const [idx, item] of data.stats.entries()) {
          await client.query('INSERT INTO stats (label, value, display_order) VALUES ($1, $2, $3)', [item.label, item.value, idx]);
        }
      }
    }

    // Seed Admin User
    const userCheck = await client.query('SELECT COUNT(*) FROM auser');
    if (parseInt(userCheck.rows[0].count) === 0) {
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminHash = process.env.ADMIN_PASSWORD_HASH || '$2a$10$8AnhMN1M2PUznIiNavZ25OsZpSycVGlUrd9zFJH2oJBufrM1zHDke';
      console.log('Seeding initial admin user...');
      await client.query('INSERT INTO auser (username, password_hash) VALUES ($1, $2)', [adminUser, adminHash]);
    }

    console.log('Database tables initialized.');
    client.release();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

// Start initialization
initializeDatabase();

export default {
  query: (text, params) => pool.query(text, params),
  pool
};
