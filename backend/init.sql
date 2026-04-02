-- 1. Core Tables
CREATE TABLE IF NOT EXISTS auser (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS form_message (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_handled TINYINT DEFAULT 0,
  handled_at VARCHAR(255)
);

-- 2. Content Tables (Settings & Unique Sections)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  
  logo_light VARCHAR(255),
  logo_dark VARCHAR(255),
  
  hero_headline VARCHAR(255),
  hero_headline_highlight VARCHAR(255),
  hero_subtext TEXT,
  hero_cta_label VARCHAR(100),
  hero_cta_link VARCHAR(255),

  about_section_title VARCHAR(255),
  about_heading VARCHAR(255),
  about_body TEXT,
  about_cta_label VARCHAR(100),
  about_cta_link VARCHAR(255),

  cta_headline VARCHAR(255),
  cta_headline_accent VARCHAR(255),
  cta_subtext TEXT,
  cta_cta_label VARCHAR(100),
  cta_cta_link VARCHAR(255),

  contact_phone1 VARCHAR(50),
  contact_phone2 VARCHAR(50),
  contact_email VARCHAR(255),
  contact_address TEXT,
  contact_linkedin VARCHAR(255),
  contact_facebook VARCHAR(255),
  contact_instagram VARCHAR(255),
  contact_twitter VARCHAR(255),
  contact_map_embed TEXT
);

-- 3. Entity Tables (Multiple Items)
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  
  paragraph_1 TEXT,
  paragraph_2 TEXT,
  paragraph_3 TEXT,
  
  bullet_1 TEXT,
  bullet_2 TEXT,
  bullet_3 TEXT,
  
  additional_image_1 VARCHAR(255),
  additional_image_2 VARCHAR(255),
  additional_image_3 VARCHAR(255),
  
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  
  tag_1 VARCHAR(100),
  tag_2 VARCHAR(100),
  tag_3 VARCHAR(100),
  tag_4 VARCHAR(100),

  paragraph_1 TEXT,
  paragraph_2 TEXT,
  paragraph_3 TEXT,

  bullet_1 TEXT,
  bullet_2 TEXT,
  bullet_3 TEXT,

  additional_image_1 VARCHAR(255),
  additional_image_2 VARCHAR(255),
  additional_image_3 VARCHAR(255),

  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  quote TEXT,
  photo VARCHAR(255),
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS uploaded_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  mimetype VARCHAR(255) NOT NULL,
  image_data LONGBLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  type VARCHAR(255),
  description TEXT NOT NULL,
  
  requirement_1 TEXT,
  requirement_2 TEXT,
  requirement_3 TEXT,
  requirement_4 TEXT,
  requirement_5 TEXT,
  requirement_6 TEXT,

  posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS social_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  display_order INT DEFAULT 0
);

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

-- 4. Seed Data


-- Site Settings (Single Sections)
INSERT INTO settings (
  id, logo_light, logo_dark, 
  hero_headline, hero_headline_highlight, hero_subtext, hero_cta_label, hero_cta_link,
  about_section_title, about_heading, about_body, about_cta_label, about_cta_link,
  cta_headline, cta_headline_accent, cta_subtext, cta_cta_label, cta_cta_link,
  contact_phone1, contact_phone2, contact_email, contact_address, 
  contact_linkedin, contact_facebook, contact_instagram, contact_twitter, contact_map_embed
) VALUES (
  1, 
  '/images/logo_horizontal_light.svg', '/images/logo_horizontal.svg',
  'TRANSFORM YOUR ', 'ADVANCED IT SOLUTIONS', 'Unlock new levels of efficiency, agility, and growth. Our cutting-edge IT solutions from cloud infrastructure and intelligent automation to enterprise networks and telecom engineering are tailored to propel your business forward.', 'GET STARTED', '#contact',
  'Get to know Us', 'Leading IT Solutions Provider Since 2012', 'Sington Engineering PLC is a premier IT solutions provider specializing in advanced technology services for businesses across various industries. With our headquarters in Guangdong, we serve clients globally with cutting-edge solutions. Our team of certified professionals combines technical expertise with business acumen to deliver solutions that drive growth, efficiency, and competitive advantage.', 'Our Services', '#services',
  'READY TO TRANSFORM', 'YOUR BUSINESS?', 'Contact us today to discover how our advanced IT solutions can help your business thrive.', 'GET IN TOUCH', '#contact',
  '+251909090928', '+251975040521', 'info@singitanengineering.com', 'Bole, Atlas, Addis Ababa, Ethiopia',
  'https://www.linkedin.com/company/singitan-engineering/', 'https://facebook.com', 'https://instagram.com', 'https://twitter.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6544577528375!2d38.78409179999999!3d9.0039078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b859272a60d37%3A0x5176c0938998331a!2sSingitan%20Engineering%20PLC!5e0!3m2!1sen!2set!4v1757323258167!5m2!1sen!2set'
) ON DUPLICATE KEY UPDATE 
  logo_light = VALUES(logo_light), logo_dark = VALUES(logo_dark),
  hero_headline = VALUES(hero_headline), hero_headline_highlight = VALUES(hero_headline_highlight), hero_subtext = VALUES(hero_subtext), hero_cta_label = VALUES(hero_cta_label), hero_cta_link = VALUES(hero_cta_link),
  about_section_title = VALUES(about_section_title), about_heading = VALUES(about_heading), about_body = VALUES(about_body), about_cta_label = VALUES(about_cta_label), about_cta_link = VALUES(about_cta_link),
  cta_headline = VALUES(cta_headline), cta_headline_accent = VALUES(cta_headline_accent), cta_subtext = VALUES(cta_subtext), cta_cta_label = VALUES(cta_cta_label), cta_cta_link = VALUES(cta_cta_link),
  contact_phone1 = VALUES(contact_phone1), contact_phone2 = VALUES(contact_phone2), contact_email = VALUES(contact_email), contact_address = VALUES(contact_address),
  contact_linkedin = VALUES(contact_linkedin), contact_facebook = VALUES(contact_facebook), contact_instagram = VALUES(contact_instagram), contact_twitter = VALUES(contact_twitter), contact_map_embed = VALUES(contact_map_embed);

-- Services
INSERT INTO services (title, description, image, paragraph_1, bullet_1, additional_image_1, additional_image_2, display_order) VALUES
('Modern Data Center and Cloud', 'Cloud services offer a significantly more cost effective solution, particularly for small businesses.', '/images/2.jpg', 'In the rapidly evolving digital landscape, a modernized infrastructure serves as the essential foundation.', 'Strategic Public, Private, and Hybrid Cloud Architectures', '/images/2.jpg', '/images/1.jpg', 1),
('Enterprise Network Services', 'We deliver comprehensive network solutions encompassing physical, virtual, and logical design.', '/images/1.jpg', 'A robust and resilient network is the lifeline of modern business operations.', 'Professional LAN & WAN Design and Implementation', '/images/1.jpg', '/images/2.jpg', 2);

-- Projects
INSERT INTO projects (title, description, image, tag_1, tag_2, paragraph_1, bullet_1, additional_image_1, additional_image_2, display_order) VALUES
('Banking System Modernization', 'Complete infrastructure overhaul for a leading financial institution.', '/images/21.jpg', 'Cloud Migration', 'Security', 'We partnered with a major regional bank to modernize their core infrastructure.', 'Full Private Cloud Migration of Core Services', '/images/21.jpg', '/images/1.jpg', 1),
('Hospital Network Infrastructure', 'Designed and implemented a secure, HIPAA-compliant network.', '/images/22.jpg', 'Healthcare', 'Compliance', 'Healthcare provider connectivity requires extreme reliability.', 'HIPAA-Compliant Network Segmentation', '/images/22.jpg', '/images/3.jpg', 2);

-- Testimonials
INSERT INTO testimonials (name, position, quote, photo, display_order) VALUES
('Jane Smith', 'CEO of TechNova', 'The team provided excellent IT solutions that helped our business grow rapidly. Highly recommended!', '/images/acc1.jpg', 1),
('Michael Lee', 'Operations Manager at GreenSoft', 'Professional, responsive, and knowledgeable. We are very satisfied with their services.', '/images/acc3.jpg', 2),
('Linda Zhang', 'Founder of StartUp Hub', 'Their support and expertise made a real difference in our workflow efficiency.', '/images/acc2.jpg', 3);

-- Partners
INSERT INTO partners (name, logo, display_order) VALUES
('Cisco', '/images/cisco.png', 1),
('Ericsson', '/images/eric.png', 2),
('Sophos', '/images/sophos.png', 3),
('ZTE', '/images/zte.png', 4);

-- Stats
INSERT INTO stats (label, value, display_order) VALUES
('Years of Experience', '10+', 1),
('Happy Clients', '100+', 2),
('Projects Completed', '150+', 3),
('Support Available', '24/7', 4);
