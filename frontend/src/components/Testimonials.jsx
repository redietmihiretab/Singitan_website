import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Testimonials({ data }) {
  const targetRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const headerY = useTransform(smoothProgress, [0, 1], [50, 0]);
  const headerOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const cardY = useTransform(smoothProgress, [0, 1], [150, 0]);
  const cardOpacity = useTransform(smoothProgress, [0, 0.8], [0, 1]);

  return (
    <section ref={targetRef} id="testimonials" className="py-20 scroll-mt-20 overflow-hidden">
      <div className="section-container">
        <motion.div style={{ y: headerY, opacity: headerOpacity }}>
          <h2 className="section-title text-dark dark:text-fontwhite transition-colors duration-500">What Our Clients Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-8">
          {data.map((t, i) => {
            const cardY = useTransform(scrollYProgress, [0, 1], [150 + (i * 50), 0]);
            const cardOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

            return (
              <motion.div 
                key={t.id} 
                style={{ y: cardY, opacity: cardOpacity }}
                className="glass-card p-7 flex flex-col items-center
                           card-shadow card-shadow-hover"
              >
                {t.photo ? (
                  <img
                    src={
                      t.photo?.startsWith('/uploads')
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${t.photo}`
                        : t.photo
                    }
                    alt={t.name}
                    className="w-16 h-16 rounded-full object-cover border-[3px] border-primary shadow-md mb-4"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-[3px] border-primary shadow-md mb-4 flex items-center justify-center bg-primary/10 text-primary font-semibold">
                    {t.name?.[0] || 'S'}
                  </div>
                )}
                <p className="text-black/80 dark:text-fontwhite/80 text-xs italic text-justify mb-5 leading-relaxed transition-colors duration-500">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <h4 className="font-semibold text-secondary text-base">{t.name}</h4>
                <span className="text-lightblack dark:text-fontwhite/60 text-sm">{t.position}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
