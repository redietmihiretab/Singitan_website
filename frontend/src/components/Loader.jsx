import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

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
          src="/images/logo_horizontal.svg"
          alt="Sington Engineering"
          className="w-48 h-auto"
        />
      </motion.div>
    </motion.div>
  );
}
