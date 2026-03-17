import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Loader() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const hideTimer = setTimeout(() => setHidden(true), 2000);
    const removeTimer = setTimeout(() => setRemoved(true), 3200);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center z-[9999] transition-colors duration-500"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <img
          src={isDarkMode ? "/images/logo_horizontal_light.svg" : "/images/logo_horizontal.svg"}
          alt="Sington Engineering"
          className="w-48 h-auto"
        />
      </motion.div>
    </motion.div>
  );
}
