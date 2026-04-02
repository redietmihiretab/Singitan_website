import { useRef } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

export default function Footer({ data }) {
  data = data || {};
  const targetRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const footerY = useTransform(smoothProgress, [0, 1], [150, 0]);
  const footerOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const { phone1, phone2, email, address, mapEmbed } = data.contact || {};
  const socialLinks = data.socialLinks || [];

  const getImgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('/uploads')) return `${API_URL}${path}`;
    if (path.startsWith('http')) return path;
    return path;
  };

  return (
    <footer ref={targetRef} id="footer" className="bg-white dark:bg-black text-black dark:text-white border-t border-gray-100 dark:border-secondary overflow-hidden transition-colors duration-500">
      <motion.div 
        style={{ y: footerY, opacity: footerOpacity }}
        className="section-container py-10"
      >
        <div className="flex flex-col md:flex-row gap-10 md:gap-6">
          {/* Contact Info */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-secondary mb-5">Contact Us</h3>
            <div className="flex flex-col gap-4">
              <p className="flex items-start gap-3 text-black/80 dark:text-fontwhite text-sm">
                <Phone size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                <span>{phone1}<br />{phone2}</span>
              </p>
              <p className="flex items-center gap-3 text-black/80 dark:text-fontwhite text-sm">
                <Mail size={20} className="text-secondary flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors no-underline text-black/80 dark:text-fontwhite">
                  {email}
                </a>
              </p>
              <p className="flex items-start gap-3 text-black/80 dark:text-fontwhite text-sm">
                <MapPin size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-secondary mb-5">Follow Us</h3>
            <div className="flex gap-5 flex-wrap">
              {socialLinks.map(s => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="hover:opacity-70 hover:scale-110 transition-all duration-200"
                >
                  <img src={getImgUrl(s.icon)} alt={s.name} className="w-8 h-8 object-contain" />
                </a>
              ))}
              {socialLinks.length === 0 && (
                <div className="text-xs opacity-30 italic">Connect with us online</div>
              )}
            </div>

            {/* Logo */}
            <Link to="/" className="mt-8 inline-block transition-opacity hover:opacity-80">
              {/* Light logo for light theme */}
              <img
                src={data.logos?.dark?.startsWith('/uploads') ? `${API_URL}${data.logos.dark}` : (data.logos?.dark || "/images/logo_horizontal.svg")}
                alt="Sington Engineering"
                className="h-10 w-auto opacity-80 dark:hidden"
              />
              {/* Optional: use light version on dark background */}
              <img
                src={data.logos?.light?.startsWith('/uploads') ? `${API_URL}${data.logos.light}` : (data.logos?.light || "/images/logo_horizontal_light.svg")}
                alt="Sington Engineering"
                className="h-10 w-auto opacity-90 hidden dark:inline-block"
              />
            </Link>
          </div>

          {/* Map */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-secondary mb-5">Our Location</h3>
            <iframe
              src={mapEmbed}
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sington Engineering Location"
            />
          </div>
        </div>
      </motion.div>

      <div className="border-t border-gray-100 dark:border-white/10 py-4 text-center">
        <p className="text-black/50 dark:text-white/50 text-sm">
          &copy; {new Date().getFullYear()} Sington Engineering PLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
