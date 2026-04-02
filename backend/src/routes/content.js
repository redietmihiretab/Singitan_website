import { Router } from 'express';
import db from '../db.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// Helper to get full content from relational tables
const getFullContent = async () => {
  const settingsReq = await db.query('SELECT * FROM settings LIMIT 1');
  const services = await db.query('SELECT * FROM services ORDER BY display_order ASC');
  const projects = await db.query('SELECT * FROM projects ORDER BY display_order ASC');
  const testimonials = await db.query('SELECT * FROM testimonials ORDER BY display_order ASC');
  const partners = await db.query('SELECT * FROM partners ORDER BY display_order ASC');
  const stats = await db.query('SELECT * FROM stats ORDER BY display_order ASC');
  const careers = await db.query('SELECT * FROM careers ORDER BY display_order ASC');
  const socials = await db.query('SELECT * FROM social_links ORDER BY display_order ASC');

  const data = {};
  
  // Fill settings
  const sRow = settingsReq.rows[0];
  if (sRow) {
    data.logos = { light: sRow.logo_light, dark: sRow.logo_dark };
    data.hero = { headline: sRow.hero_headline, headlineHighlight: sRow.hero_headline_highlight, subtext: sRow.hero_subtext, ctaLabel: sRow.hero_cta_label, ctaLink: sRow.hero_cta_link };
    data.about = { sectionTitle: sRow.about_section_title, heading: sRow.about_heading, body: sRow.about_body, ctaLabel: sRow.about_cta_label, ctaLink: sRow.about_cta_link };
    data.cta = { headline: sRow.cta_headline, headlineAccent: sRow.cta_headline_accent, subtext: sRow.cta_subtext, ctaLabel: sRow.cta_cta_label, ctaLink: sRow.cta_cta_link };
    data.contact = { phone1: sRow.contact_phone1, phone2: sRow.contact_phone2, email: sRow.contact_email, address: sRow.contact_address, linkedin: sRow.contact_linkedin, facebook: sRow.contact_facebook, instagram: sRow.contact_instagram, twitter: sRow.contact_twitter, mapEmbed: sRow.contact_map_embed };
    data.socialLinks = socials.rows;
  }

  // Helper to extract array from columns
  const extractArray = (row, prefix, count) => {
    const arr = [];
    for (let i = 1; i <= count; i++) {
        if (row[`${prefix}_${i}`]) arr.push(row[`${prefix}_${i}`]);
    }
    return arr;
  };

  // Fill entities
  data.services = services.rows.map(s => ({
    ...s,
    paragraphs: extractArray(s, 'paragraph', 3),
    bullets: extractArray(s, 'bullet', 3),
    additionalImages: extractArray(s, 'additional_image', 3)
  }));

  data.projects = projects.rows.map(p => ({
    ...p,
    tags: extractArray(p, 'tag', 4),
    paragraphs: extractArray(p, 'paragraph', 3),
    bullets: extractArray(p, 'bullet', 3),
    additionalImages: extractArray(p, 'additional_image', 3)
  }));

  data.testimonials = testimonials.rows;
  data.partners = partners.rows;
  data.stats = stats.rows;
  data.careers = careers.rows.map(c => ({
    ...c,
    requirements: extractArray(c, 'requirement', 6)
  }));

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
    
    // Use a dedicated connection for the transaction
    const connection = await db.getConnection();
    
    await connection.beginTransaction();
    try {
      // 1. Update Settings
      const s = data;
      await connection.query(
        `INSERT INTO settings (id, logo_light, logo_dark, hero_headline, hero_headline_highlight, hero_subtext, hero_cta_label, hero_cta_link, about_section_title, about_heading, about_body, about_cta_label, about_cta_link, cta_headline, cta_headline_accent, cta_subtext, cta_cta_label, cta_cta_link, contact_phone1, contact_phone2, contact_email, contact_address, contact_linkedin, contact_facebook, contact_instagram, contact_twitter, contact_map_embed)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         logo_light=VALUES(logo_light), logo_dark=VALUES(logo_dark), hero_headline=VALUES(hero_headline), hero_headline_highlight=VALUES(hero_headline_highlight), hero_subtext=VALUES(hero_subtext), hero_cta_label=VALUES(hero_cta_label), hero_cta_link=VALUES(hero_cta_link), about_section_title=VALUES(about_section_title), about_heading=VALUES(about_heading), about_body=VALUES(about_body), about_cta_label=VALUES(about_cta_label), about_cta_link=VALUES(about_cta_link), cta_headline=VALUES(cta_headline), cta_headline_accent=VALUES(cta_headline_accent), cta_subtext=VALUES(cta_subtext), cta_cta_label=VALUES(cta_cta_label), cta_cta_link=VALUES(cta_cta_link), contact_phone1=VALUES(contact_phone1), contact_phone2=VALUES(contact_phone2), contact_email=VALUES(contact_email), contact_address=VALUES(contact_address), contact_linkedin=VALUES(contact_linkedin), contact_facebook=VALUES(contact_facebook), contact_instagram=VALUES(contact_instagram), contact_twitter=VALUES(contact_twitter), contact_map_embed=VALUES(contact_map_embed)`,
        [
          s.logos?.light, s.logos?.dark,
          s.hero?.headline, s.hero?.headlineHighlight, s.hero?.subtext, s.hero?.ctaLabel, s.hero?.ctaLink,
          s.about?.sectionTitle, s.about?.heading, s.about?.body, s.about?.ctaLabel, s.about?.ctaLink,
          s.cta?.headline, s.cta?.headlineAccent, s.cta?.subtext, s.cta?.ctaLabel, s.cta?.ctaLink,
          s.contact?.phone1, s.contact?.phone2, s.contact?.email, s.contact?.address, s.contact?.linkedin, s.contact?.facebook, s.contact?.instagram, s.contact?.twitter, s.contact?.mapEmbed
        ]
      );

      // Helper for saving arrays
      const getArrVal = (arr, i) => (arr && arr.length > i) ? arr[i] : null;

      // 2. Sync Services
      await connection.query('DELETE FROM services');
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

      // 3. Sync Projects
      await connection.query('DELETE FROM projects');
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

      // 4. Testimonials
      await connection.query('DELETE FROM testimonials');
      if (data.testimonials) {
        for (const [idx, item] of data.testimonials.entries()) {
          await connection.query(
            'INSERT INTO testimonials (name, position, quote, photo, display_order) VALUES (?, ?, ?, ?, ?)',
            [item.name, item.position, item.quote, item.photo, idx]
          );
        }
      }

      // 5. Partners
      await connection.query('DELETE FROM partners');
      if (data.partners) {
        for (const [idx, item] of data.partners.entries()) {
          await connection.query('INSERT INTO partners (name, logo, display_order) VALUES (?, ?, ?)', [item.name, item.logo, idx]);
        }
      }

      // 6. Stats
      await connection.query('DELETE FROM stats');
      if (data.stats) {
        for (const [idx, item] of data.stats.entries()) {
          await connection.query('INSERT INTO stats (label, value, display_order) VALUES (?, ?, ?)', [item.label, item.value, idx]);
        }
      }
      
      // 7. Careers
      await connection.query('DELETE FROM careers');
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

      // 8. Social Links
      await connection.query('DELETE FROM social_links');
      if (data.socialLinks) {
        for (const [idx, item] of data.socialLinks.entries()) {
          await connection.query(
            'INSERT INTO social_links (name, url, icon, display_order) VALUES (?, ?, ?, ?)',
            [item.name, item.url, item.icon, idx]
          );
        }
      }

      await connection.commit();
      connection.release();
    } catch (txError) {
      await connection.rollback();
      connection.release();
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
