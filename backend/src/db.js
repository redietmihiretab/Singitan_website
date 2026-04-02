import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  user: process.env.DB_USER ?? 'singitanengineering_singitan_web',
  password: process.env.DB_PASSWORD ?? 'W[^k^W=GOJ+flpN6',
  database: process.env.DB_NAME ?? 'singitanengineering_Singitan_Db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database.');

    // 1. Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS auser (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin'
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS form_message (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_handled TINYINT DEFAULT 0,
        handled_at VARCHAR(255)
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        logo_light VARCHAR(255), logo_dark VARCHAR(255),
        hero_headline VARCHAR(255), hero_headline_highlight VARCHAR(255), hero_subtext TEXT, hero_cta_label VARCHAR(100), hero_cta_link VARCHAR(255),
        about_section_title VARCHAR(255), about_heading VARCHAR(255), about_body TEXT, about_cta_label VARCHAR(100), about_cta_link VARCHAR(255),
        cta_headline VARCHAR(255), cta_headline_accent VARCHAR(255), cta_subtext TEXT, cta_cta_label VARCHAR(100), cta_cta_link VARCHAR(255),
        contact_phone1 VARCHAR(50), contact_phone2 VARCHAR(50), contact_email VARCHAR(255), contact_address TEXT,
        contact_linkedin VARCHAR(255), contact_facebook VARCHAR(255), contact_instagram VARCHAR(255), contact_twitter VARCHAR(255), contact_map_embed TEXT
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL, description TEXT, image VARCHAR(255),
        paragraph_1 TEXT, paragraph_2 TEXT, paragraph_3 TEXT,
        bullet_1 TEXT, bullet_2 TEXT, bullet_3 TEXT,
        additional_image_1 VARCHAR(255), additional_image_2 VARCHAR(255), additional_image_3 VARCHAR(255),
        display_order INT DEFAULT 0
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL, description TEXT, image VARCHAR(255),
        tag_1 VARCHAR(100), tag_2 VARCHAR(100), tag_3 VARCHAR(100), tag_4 VARCHAR(100),
        paragraph_1 TEXT, paragraph_2 TEXT, paragraph_3 TEXT,
        bullet_1 TEXT, bullet_2 TEXT, bullet_3 TEXT,
        additional_image_1 VARCHAR(255), additional_image_2 VARCHAR(255), additional_image_3 VARCHAR(255),
        display_order INT DEFAULT 0
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL, position VARCHAR(255), quote TEXT, photo VARCHAR(255),
        display_order INT DEFAULT 0
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL, logo VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(255) NOT NULL, value VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uploaded_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL, mimetype VARCHAR(255) NOT NULL, image_data LONGBLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS careers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL, department VARCHAR(255), location VARCHAR(255), type VARCHAR(255), description TEXT NOT NULL,
        requirement_1 TEXT, requirement_2 TEXT, requirement_3 TEXT, requirement_4 TEXT, requirement_5 TEXT, requirement_6 TEXT,
        posted_at DATETIME DEFAULT CURRENT_TIMESTAMP, is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        image VARCHAR(255),
        posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paragraph_1 TEXT,
        paragraph_2 TEXT,
        paragraph_3 TEXT,
        paragraph_4 TEXT,
        paragraph_5 TEXT,
        image_1 VARCHAR(255),
        image_2 VARCHAR(255),
        image_3 VARCHAR(255),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        display_order INT DEFAULT 0
      );
    `);

    // Helper for saving arrays
    const getArrVal = (arr, i) => (arr && arr.length > i) ? arr[i] : null;

    // 2. Seeding Logic (only if tables are empty)
    const [settingsCheck] = await connection.query('SELECT COUNT(*) as count FROM settings');
    if (parseInt(settingsCheck[0].count) === 0 && fs.existsSync(CONTENT_PATH)) {
      console.log('Seeding relational tables from content.json...');
      const data = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));

      const s = data;
      await connection.query(
        `INSERT INTO settings (id, logo_light, logo_dark, hero_headline, hero_headline_highlight, hero_subtext, hero_cta_label, hero_cta_link, about_section_title, about_heading, about_body, about_cta_label, about_cta_link, cta_headline, cta_headline_accent, cta_subtext, cta_cta_label, cta_cta_link, contact_phone1, contact_phone2, contact_email, contact_address, contact_linkedin, contact_facebook, contact_instagram, contact_twitter, contact_map_embed)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.logos?.light, s.logos?.dark,
          s.hero?.headline, s.hero?.headlineHighlight, s.hero?.subtext, s.hero?.ctaLabel, s.hero?.ctaLink,
          s.about?.sectionTitle, s.about?.heading, s.about?.body, s.about?.ctaLabel, s.about?.ctaLink,
          s.cta?.headline, s.cta?.headlineAccent, s.cta?.subtext, s.cta?.ctaLabel, s.cta?.ctaLink,
          s.contact?.phone1, s.contact?.phone2, s.contact?.email, s.contact?.address, s.contact?.linkedin, s.contact?.facebook, s.contact?.instagram, s.contact?.twitter, s.contact?.mapEmbed
        ]
      );

      if (data.services) {
        for (const [idx, item] of data.services.entries()) {
          await connection.query(
            `INSERT INTO services (title, description, image, paragraph_1, paragraph_2, paragraph_3, bullet_1, bullet_2, bullet_3, additional_image_1, additional_image_2, additional_image_3, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.title, item.description, item.image,
              getArrVal(item.paragraphs, 0), getArrVal(item.paragraphs, 1), getArrVal(item.paragraphs, 2),
              getArrVal(item.bullets, 0), getArrVal(item.bullets, 1), getArrVal(item.bullets, 2),
              getArrVal(item.additionalImages, 0), getArrVal(item.additionalImages, 1), getArrVal(item.additionalImages, 2),
              idx
            ]
          );
        }
      }

      if (data.projects) {
        for (const [idx, item] of data.projects.entries()) {
          await connection.query(
            `INSERT INTO projects (title, description, image, tag_1, tag_2, tag_3, tag_4, paragraph_1, paragraph_2, paragraph_3, bullet_1, bullet_2, bullet_3, additional_image_1, additional_image_2, additional_image_3, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.title, item.description, item.image,
              getArrVal(item.tags, 0), getArrVal(item.tags, 1), getArrVal(item.tags, 2), getArrVal(item.tags, 3),
              getArrVal(item.paragraphs, 0), getArrVal(item.paragraphs, 1), getArrVal(item.paragraphs, 2),
              getArrVal(item.bullets, 0), getArrVal(item.bullets, 1), getArrVal(item.bullets, 2),
              getArrVal(item.additionalImages, 0), getArrVal(item.additionalImages, 1), getArrVal(item.additionalImages, 2),
              idx
            ]
          );
        }
      }

      if (data.testimonials) {
        for (const [idx, item] of data.testimonials.entries()) {
          await connection.query(
            'INSERT INTO testimonials (name, position, quote, photo, display_order) VALUES (?, ?, ?, ?, ?)',
            [item.name, item.position, item.quote, item.photo, idx]
          );
        }
      }

      if (data.partners) {
        for (const [idx, item] of data.partners.entries()) {
          await connection.query('INSERT INTO partners (name, logo, display_order) VALUES (?, ?, ?)', [item.name, item.logo, idx]);
        }
      }

      if (data.stats) {
        for (const [idx, item] of data.stats.entries()) {
          await connection.query('INSERT INTO stats (label, value, display_order) VALUES (?, ?, ?)', [item.label, item.value, idx]);
        }
      }

      if (data.careers) {
        for (const [idx, item] of data.careers.entries()) {
          await connection.query(
            `INSERT INTO careers (title, department, location, type, description, requirement_1, requirement_2, requirement_3, requirement_4, requirement_5, requirement_6, is_active, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.title, item.department, item.location, item.type, item.description,
              getArrVal(item.requirements, 0), getArrVal(item.requirements, 1), getArrVal(item.requirements, 2), getArrVal(item.requirements, 3), getArrVal(item.requirements, 4), getArrVal(item.requirements, 5),
              item.is_active ?? true, idx
            ]
          );
        }
      }
    }

    // Seed Admin User
    const [userCheck] = await connection.query('SELECT COUNT(*) as count FROM auser');
    if (parseInt(userCheck[0].count) === 0) {
      const adminUser = process.env.ADMIN_USERNAME;
      const adminHash = process.env.ADMIN_PASSWORD_HASH;

      if (adminUser && adminHash) {
        console.log('Seeding initial admin user from environment variables...');
        await connection.query('INSERT INTO auser (username, password_hash) VALUES (?, ?)', [adminUser, adminHash]);
      } else {
        console.log('Skipping admin seeding (environment variables missing).');
      }
    }

    connection.release();
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Start initialization
initializeDatabase();

export default {
  // A MySQL query wrapper that returns a structure compatible with existing PostgreSQL-style routes
  // (providing .rows and .rowCount properties).
  query: async (text, params) => {
    const [rows, fields] = await pool.query(text, params);
    return {
      rows: Array.isArray(rows) ? rows : [],
      rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows || 0
    };
  },
  pool,
  getConnection: () => pool.getConnection()
};
