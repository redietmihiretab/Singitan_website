import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'HOME', href: '/#home' },
  { label: 'ABOUT', href: '/#about' },
  { label: 'SERVICES', href: '/#services' },
  { label: 'PROJECTS', href: '/#projects' },
];

export default function Header({ logos }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => setMobileOpen(false), [location]);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/90 backdrop-blur-md transition-all duration-300
          ${scrolled ? 'shadow-sm dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]' : 'shadow-none'}
          border-b border-gray-100 dark:border-white/10`}
      >
        <div className="section-container flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="z-[101] flex-shrink-0">
            <img 
              src={isDarkMode 
                ? (logos?.light?.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${logos.light}` : (logos?.light || "/images/logo_horizontal_light.svg"))
                : (logos?.dark?.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${logos.dark}` : (logos?.dark || "/images/logo_horizontal.svg"))
              } 
              alt="Sington Engineering" 
              className="h-10 w-auto" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex gap-8 list-none m-0 p-0">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={() => handleNavClick(href)}
                    className="relative text-black dark:text-fontwhite font-medium text-[15px] tracking-wide transition-colors
                               duration-200 hover:text-secondary dark:hover:text-primary group no-underline"
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-secondary
                                     transition-all duration-300 group-hover:w-full rounded" />
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="/#contact"
              onClick={() => handleNavClick('/#contact')}
              className="ml-4 px-6 py-2.5 border border-secondary text-black dark:text-fontwhite font-semibold
                         rounded-xl text-[15px] transition-all duration-300 hover:bg-primary
                         hover:text-white hover:border-primary hover:shadow-[0_0_15px_rgba(247,147,30,0.4)] no-underline"
            >
              Contact Us
            </a>

            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-full text-black dark:text-fontwhite hover:bg-primary/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>

          {/* Hamburger */}
          <div className="md:hidden flex items-center gap-4 z-[101]">
            <button
              onClick={toggleTheme}
              className="p-2 text-dark dark:text-fontwhite rounded-full hover:bg-primary/10 dark:hover:bg-white/10"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              className="p-2 text-lightblack dark:text-fontwhite"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              key="mobile-nav"
              className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-dark border-l border-gray-100 dark:border-white/10 z-50 shadow-2xl md:hidden pt-20 px-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <ul className="flex flex-col gap-6 list-none p-0 m-0">
                {navLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      onClick={() => handleNavClick(href)}
                      className="text-dark dark:text-fontwhite font-medium text-lg block hover:text-secondary
                                 dark:hover:text-primary transition-colors duration-200 no-underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/#contact"
                    onClick={() => handleNavClick('/#contact')}
                    className="block text-center py-3 bg-primary text-white font-semibold
                               rounded-xl hover:bg-secondary transition-colors duration-200 no-underline"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
