import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

/**
 * Script to synchronize the PostgreSQL database content back to content.json.
 * This is useful for keeping the local JSON file in sync with any changes made via the admin dashboard.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(__dirname, '..', 'data', 'content.json');

async function syncDbToJson() {
  try {
    console.log('--- Starting DB to JSON Synchronization ---');

    const content = {};

    // 1. Fetch web_settings (hero, about, cta, contact, logos)
    console.log('Fetching web_settings...');
    const settingsRes = await db.query('SELECT key, value FROM web_settings');
    settingsRes.rows.forEach(row => {
      content[row.key] = row.value;
    });

    // 2. Fetch stats
    console.log('Fetching stats...');
    const statsRes = await db.query('SELECT * FROM stats ORDER BY display_order ASC');
    content.stats = statsRes.rows.map(row => ({
      id: row.id,
      value: row.value,
      label: row.label
    }));

    // 3. Fetch services
    console.log('Fetching services...');
    const servicesRes = await db.query('SELECT * FROM services ORDER BY display_order ASC');
    content.services = servicesRes.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      image: row.image,
      paragraphs: row.paragraphs || [],
      bullets: row.bullets || [],
      additionalImages: row.additional_images || []
    }));

    // 4. Fetch projects
    console.log('Fetching projects...');
    const projectsRes = await db.query('SELECT * FROM projects ORDER BY display_order ASC');
    content.projects = projectsRes.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      image: row.image,
      tags: row.tags || [],
      paragraphs: row.paragraphs || [],
      bullets: row.bullets || [],
      additionalImages: row.additional_images || []
    }));

    // 5. Fetch partners
    console.log('Fetching partners...');
    const partnersRes = await db.query('SELECT * FROM partners ORDER BY display_order ASC');
    content.partners = partnersRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      logo: row.logo
    }));

    // 6. Fetch testimonials
    console.log('Fetching testimonials...');
    const testimonialsRes = await db.query('SELECT * FROM testimonials ORDER BY display_order ASC');
    content.testimonials = testimonialsRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      position: row.position,
      quote: row.quote,
      photo: row.photo
    }));

    // Ensure directory exists
    const dir = path.dirname(CONTENT_PATH);
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory ${dir}...`);
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to content.json
    fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), 'utf-8');
    
    console.log('-------------------------------------------');
    console.log(`Successfully synchronized database to:\n${CONTENT_PATH}`);
    console.log('-------------------------------------------');
    
    // Success - exit
    process.exit(0);
  } catch (err) {
    console.error('Error during synchronization:', err);
    process.exit(1);
  }
}

// Ensure database pool is closed after execution if we weren't just running the whole app
// But db.js initializes automatically, so we'll just run it.
syncDbToJson();
