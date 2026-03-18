
-- 1. Core Tables
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

-- 2. Content Tables (Settings & Unique Sections)
CREATE TABLE IF NOT EXISTS web_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- 3. Entity Tables (Multiple Items)
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

-- 4. Seed Data

-- Admin User
INSERT INTO auser (username, password_hash) 
VALUES ('admin', '$2a$10$8AnhMN1M2PUznIiNavZ25OsZpSycVGlUrd9zFJH2oJBufrM1zHDke')
ON CONFLICT (username) DO NOTHING;

-- Site Settings (Single Sections)
INSERT INTO web_settings (key, value) VALUES
('logos', '{"light": "/images/logo_horizontal_light.svg", "dark": "/images/logo_horizontal.svg"}'),
('hero', '{"headline":"TRANSFORM YOUR ","headlineHighlight":"ADVANCED IT SOLUTIONS","subtext":"Unlock new levels of efficiency, agility, and growth. Our cutting-edge IT solutions from cloud infrastructure and intelligent automation to enterprise networks and telecom engineering are tailored to propel your business forward.","ctaLabel":"GET STARTED","ctaLink":"#contact"}'),
('about', '{"sectionTitle":"Get to know Us","heading":"Leading IT Solutions Provider Since 2012","body":"Sington Engineering PLC is a premier IT solutions provider specializing in advanced technology services for businesses across various industries. With our headquarters in Guangdong, we serve clients globally with cutting-edge solutions. Our team of certified professionals combines technical expertise with business acumen to deliver solutions that drive growth, efficiency, and competitive advantage.","ctaLabel":"Our Services","ctaLink":"#services"}'),
('cta', '{"headline":"READY TO TRANSFORM","headlineAccent":"YOUR BUSINESS?","subtext":"Contact us today to discover how our advanced IT solutions can help your business thrive.","ctaLabel":"GET IN TOUCH","ctaLink":"#contact"}'),
('contact', '{"phone1":"+251909090928","phone2":"+251975040521","email":"info@singitanengineering.com","address":"Bole, Atlas, Addis Ababa, Ethiopia","linkedin":"https://www.linkedin.com/company/singitan-engineering/","facebook":"https://facebook.com","instagram":"https://instagram.com","twitter":"https://twitter.com","mapEmbed":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6544577528375!2d38.78409179999999!3d9.0039078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b859272a60d37%3A0x5176c0938998331a!2sSingitan%20Engineering%20PLC!5e0!3m2!1sen!2set!4v1757323258167!5m2!1sen!2set"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Services
INSERT INTO services (title, description, image, paragraphs, bullets, additional_images, display_order) VALUES
('Modern Data Center and Cloud', 'Cloud services offer a significantly more cost effective solution, particularly for small businesses. They minimize upfront investment and operational overhead while providing scalable infrastructure that adapts seamlessly to evolving data demands.', '/images/2.jpg', '["In the rapidly evolving digital landscape, a modernized infrastructure serves as the essential foundation for any successful enterprise. Our cloud solutions are designed to bridge the gap between legacy systems and future-ready architectures, ensuring that your organization can scale seamlessly while maintaining peak performance.", "Security and reliability are at the core of our cloud strategy. We implement multi-layered defense mechanisms and redundant systems to protect your critical data against emerging threats and system failures. By leveraging advanced virtualization technologies, we empower your IT teams to focus on innovation.", "Our approach is highly collaborative, working closely with your stakeholders to tailor solutions that meet specific business objectives. Whether you are pursuing a public, private, or hybrid cloud strategy, we provide the expertise needed to navigate complex migrations and consolidations with focus on cost-optimization."]', '["Strategic Public, Private, and Hybrid Cloud Architectures", "Seamless Data Center Migration & Infrastructure Consolidation", "Advanced Disaster Recovery & Business Continuity Planning", "High-Performance Server Virtualization (VMware, Hyper-V)"]', '["/images/2.jpg", "/images/1.jpg", "/images/3.jpg"]', 1),
('Enterprise Network Services', 'We deliver comprehensive network solutions encompassing physical, virtual, and logical design. Our approach integrates advanced software, hardware, and protocols to ensure secure, reliable, and efficient data transmission aligned with your business objectives.', '/images/1.jpg', '["A robust and resilient network is the lifeline of modern business operations, connecting teams, tools, and customers across the globe. We design and implement networking infrastructures that are not only fast and reliable but also inherently secure.", "Software-Defined Networking (SD-WAN) and intelligent traffic management are central to our enterprise solutions. By decoupling network control from hardware, we provide greater flexibility and visibility into your network performance.", "Beyond initial deployment, we provide comprehensive auditing and continuous monitoring services to keep your network optimized and secure. Our team performs detailed wireless site surveys and security assessments to identify and mitigate potential vulnerabilities proactively."]', '["Professional LAN & WAN Design and Implementation", "Next-Gen Software-Defined Networking (SD-WAN) Solutions", "Comprehensive Wireless Network Surveys and Optimization", "Deep Network Infrastructure Security Audits & Remediation"]', '["/images/1.jpg", "/images/2.jpg", "/images/3.jpg"]', 2),
('Business Automation and Intelligence', 'Transform data into strategic insights. Our technology driven process analyzes complex information and delivers actionable intelligence, empowering executives, managers, and teams to drive efficiency, innovation, and competitive advantage.', '/images/3.jpg', '["Unlocking the true potential of your data is the key to gaining a competitive edge in today''s data-driven economy. Our business intelligence solutions transform raw information into actionable insights, providing executives with a clear view of organizational performance.", "Automation is the ultimate driver of operational efficiency, eliminating tedious manual tasks and reducing the risk of human error. We analyze your business workflows to identify high-impact automation opportunities, implementing solutions that streamline processes.", "Our expertise extends into the realms of predictive analytics and complex data warehousing, ensuring that your data architecture is built for the future. By implementing machine learning models, we help you anticipate market trends and customer behavior."]', '["Intelligent Workflow & Process Automation (RPA)", "Custom Interactive Dashboard Development (PowerBI, Tableau)", "Scalable Data Warehousing & Modern Data Architecture", "Predictive Analytics & Trend Forecasting Models"]', '["/images/3.jpg", "/images/1.jpg", "/images/2.jpg"]', 3),
('Cybersecurity Solutions', 'Protect your business with enterprise-grade cybersecurity. We offer threat detection, firewall management, endpoint protection, and compliance solutions to keep your data and operations safe from modern cyber threats.', '/images/2.jpg', '["In an era where cyber threats are becoming increasingly sophisticated, a proactive and comprehensive security posture is non-negotiable. We offer end-to-end cybersecurity frameworks that protect your most sensitive assets while ensuring compliance.", "We implement cutting-edge Security Information and Event Management (SIEM) systems alongside Endpoint Detection and Response (EDR) tools to provide 24/7 visibility into your digital environment, allowing for rapid threat detection and response.", "A truly secure organization is one that is constantly evolving. We conduct regular vulnerability assessments and rigorous penetration testing to identify weaknesses in your defenses and provide expert remediation guidance consistently."]', '["Advanced Next-Gen Firewall & Perimeter Security", "Managed Endpoint Detection & Response (EDR) Solutions", "Regular Vulnerability Assessments & Penetration Testing", "Enterprise SIEM Implementation & Security Monitoring"]', '["/images/2.jpg", "/images/1.jpg", "/images/3.jpg"]', 4);

-- Projects
INSERT INTO projects (title, description, image, tags, paragraphs, bullets, additional_images, display_order) VALUES
('Banking System Modernization', 'Complete infrastructure overhaul for a leading financial institution with enhanced security and cloud migration.', '/images/21.jpg', '["Cloud Migration", "Security", "FinTech"]' , '["We partnered with a major regional bank to modernize their core infrastructure, moving critical workloads to a secure private cloud environment. This transition was designed to enhance operational resilience while reducing long-term hardware maintenance costs.", "Security was the paramount concern. We implemented zero-trust architecture and multi-factor authentication across all banking tiers. The migration was executed over six months with meticulous planning to ensure zero interruption to daily banking services.", "The final result was a 40% improvement in system response times and a significantly hardened security posture. The bank now enjoys a flexible platform that supports rapid deployment of new digital banking features."]', '["Full Private Cloud Migration of Core Services", "Implementation of Zero-Trust Security Framework", "Real-time Data Replication for Disaster Recovery", "Scalable API Layer for Mobile Banking Integration"]', '["/images/21.jpg", "/images/1.jpg", "/images/2.jpg"]', 1),
('Hospital Network Infrastructure', 'Designed and implemented a secure, HIPAA-compliant network for a regional hospital system.', '/images/22.jpg', '["Healthcare", "Compliance", "Networking"]', '["Healthcare provider connectivity requires extreme reliability and strict compliance with privacy regulations. Our team designed a high-availability network layout that connects multiple hospital campuses with low-latency fiber optics.", "We integrated advanced medical device isolation protocols to prevent potential security breaches through specialized equipment. The network supports high-bandwidth medical imaging transfers and real-time electronic health record synchronization.", "This infrastructure upgrade has enabled the hospital to roll out telehealth services more broadly, providing reliable care to remote patients while maintaining the highest standards of data security and regulatory compliance."]', '["HIPAA-Compliant Network Segmentation", "High-Availability Campus Connectivity (Fiber Backbone)", "Secure Medical Device Isolation & Monitoring", "24/7 Managed Security Operations Center Support"]', '["/images/22.jpg", "/images/3.jpg", "/images/1.jpg"]', 2),
('E-commerce Platform Scaling', 'Scaled infrastructure for high-traffic e-commerce platform during peak season with zero downtime.', '/images/3.jpg', '["Scalability", "Cloud", "E-commerce"]', '["An emerging e-commerce giant faced significant performance degradation during peak holiday sales. We performed a rapid audit and implemented an auto-scaling cloud strategy to handle up to 50x normal traffic volume.", "By offloading static assets to a global Content Delivery Network (CDN) and optimizing database queries, we slashed page load times by 65%. We also implemented a robust load balancing layer to distribute traffic efficiently across multiple regions.", "The project resulted in zero downtime during the year''s busiest shopping days, leading to record-breaking sales for the client. The platform is now built on a modern microservices architecture that can scale elastically as the business grows."]', '["Elastic Auto-Scaling for Peak Load Management", "Database Performance Tuning & Query Optimization", "Global Content Delivery Network (CDN) Integration", "Multi-Region Redundancy for Maximum Uptime"]', '["/images/3.jpg", "/images/2.jpg", "/images/21.jpg"]', 3);

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
