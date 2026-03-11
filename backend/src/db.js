import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const CONTENT_PATH = path.join(dataDir, 'content.json');

const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_handled INTEGER DEFAULT 0,
    handled_at TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
  );
`);

// Migration: Add columns if they don't exist (for existing databases)
try {
  db.prepare('ALTER TABLE contact_submissions ADD COLUMN is_handled INTEGER DEFAULT 0').run();
} catch (e) {
  // Column already exists, ignore
}
try {
  db.prepare('ALTER TABLE contact_submissions ADD COLUMN handled_at TEXT').run();
} catch (e) {
  // Column already exists, ignore
}

console.log('Database tables initialized.');

// Migration logic
const seedData = () => {
  // Seed Content
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content').get().count;
  if (contentCount === 0 && fs.existsSync(CONTENT_PATH)) {
    console.log('Seeding content from JSON file...');
    const data = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));
    const insert = db.prepare('INSERT INTO content (key, value) VALUES (?, ?)');
    const transaction = db.transaction((contentData) => {
      for (const [key, value] of Object.entries(contentData)) {
        insert.run(key, JSON.stringify(value));
      }
    });
    transaction(data);
  }

  // Seed Admin User
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (adminHash) {
      console.log('Seeding admin user from .env...');
      db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(adminUser, adminHash);
    }
  }
};

seedData();

export default db;
