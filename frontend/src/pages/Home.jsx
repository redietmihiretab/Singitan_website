import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Projects from '../components/Projects';
import Partners from '../components/Partners';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

import { API_URL } from '../config';

// Fallback static content (shown if backend is unreachable)
const FALLBACK = {
  hero: {
    headline: 'TRANSFORM YOUR BUSINESS WITH',
    headlineHighlight: 'ADVANCED IT SOLUTIONS',
    subtext: 'Unlock new levels of efficiency, agility, and growth. Our cutting-edge IT solutions are tailored to propel your business forward.',
    ctaLabel: 'GET STARTED',
    ctaLink: '#contact',
  },
  about: {
    sectionTitle: 'Get to know Us',
    heading: 'Leading IT Solutions Provider Since 2012',
    body: 'Sington Engineering PLC is a premier IT solutions provider specializing in advanced technology services for businesses across various industries.',
    ctaLabel: 'Our Services',
    ctaLink: '#services',
  },
  stats: [
    { id: 1, value: '10+', label: 'Years of Experience' },
    { id: 2, value: '100+', label: 'Happy Clients' },
    { id: 3, value: '150+', label: 'Projects Completed' },
    { id: 4, value: '24/7', label: 'Support Available' },
  ],
  services: [
    { id: 1, title: 'Modern Data Center and Cloud', description: 'Scalable cloud infrastructure solutions.', image: null },
    { id: 2, title: 'Enterprise Network Services', description: 'Comprehensive network solutions.', image: null },
    { id: 3, title: 'Business Automation', description: 'Transform data into strategic insights.', image: null },
  ],
  projects: [
    { id: 1, title: 'Banking System Modernization', description: 'Complete infrastructure overhaul.', image: null, tags: ['Cloud', 'Security', 'FinTech'] },
    { id: 2, title: 'Hospital Network Infrastructure', description: 'HIPAA-compliant network.', image: null, tags: ['Healthcare', 'Networking'] },
    { id: 3, title: 'E-commerce Platform Scaling', description: 'Zero-downtime peak season scaling.', image: null, tags: ['Cloud', 'Scalability'] },
  ],
  partners: [
    { id: 1, name: 'Cisco', logo: '/images/cisco.webp' },
    { id: 2, name: 'Ericsson', logo: '/images/eric.webp' },
    { id: 3, name: 'Sophos', logo: '/images/sophos.webp' },
    { id: 4, name: 'ZTE', logo: '/images/zte.webp' },
  ],
  testimonials: [
    { id: 1, name: 'Jane Smith', position: 'CEO of TechNova', quote: 'Excellent IT solutions that helped our business grow.', photo: null },
    { id: 2, name: 'Michael Lee', position: 'Operations Manager at GreenSoft', quote: 'Professional, responsive, and knowledgeable.', photo: null },
    { id: 3, name: 'Linda Zhang', position: 'Founder of StartUp Hub', quote: 'Made a real difference in our workflow efficiency.', photo: null },
  ],
  cta: {
    headline: 'READY TO TRANSFORM',
    headlineAccent: 'YOUR BUSINESS?',
    subtext: 'Contact us today to discover how our advanced IT solutions can help your business thrive.',
    ctaLabel: 'GET IN TOUCH',
    ctaLink: '#contact',
  },
  contact: {
    phone1: '+251909090928',
    phone2: '+251975040521',
    email: 'info@singitanengineering.com',
    address: 'Bole, Atlas, Addis Ababa, Ethiopia',
    linkedin: 'https://www.linkedin.com/company/singitan-engineering/',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6544577528375!2d38.78409179999999!3d9.0039078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b859272a60d37%3A0x5176c0938998331a!2sSingitan%20Engineering%20PLC!5e0!3m2!1sen!2set!4v1757323258167!5m2!1sen!2set',
  },
};

export default function Home() {
  const [content, setContent] = useState(FALLBACK);

  useEffect(() => {
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => { if (d.success) setContent(d.data); })
      .catch(() => { /* use fallback silently */ });
  }, []);

  return (
    <>
      <Loader />
      <Header logos={content.logos} />
      <main>
        <Hero data={content.hero} />
        <About data={content.about} />
        <Services data={content.services} />
        <Projects stats={content.stats} projects={content.projects} />
        <Partners data={content.partners} />
        <Testimonials data={content.testimonials} />
        <CTA data={content.cta} />
        <ContactForm />
      </main>
      <Footer data={content} />
      <ScrollToTop />
    </>
  );
}
