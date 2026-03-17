import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50 bg-primary text-white p-3 rounded-full shadow-lg
                     hover:bg-secondary hover:-translate-y-1 transition-all duration-200"
          aria-label="Scroll to top"
        >
          <ChevronUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
