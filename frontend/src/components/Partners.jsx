import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { API_URL } from '../config';
export default function Partners({ data }) {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'start center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const headerY = useTransform(smoothProgress, [0, 1], [50, 0]);
  const headerOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={targetRef}
      id="partners"
      className="py-16 overflow-hidden transition-colors duration-500"
    >
      <div className="section-container mb-8">
        <motion.div style={{ y: headerY, opacity: headerOpacity }}>
          <h2 className="section-title text-dark dark:text-fontwhite transition-colors duration-500">
            Technology Partners
          </h2>
        </motion.div>
      </div>

      <div className="section-container">
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 lg:gap-16">
          {data.map((partner) => (
            <motion.div
              key={partner.id}
              style={{ opacity: headerOpacity }}
              className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 hover:-translate-y-2"
            >
              <img
                src={
                  partner.logo?.startsWith('/uploads')
                    ? `${API_URL}${partner.logo}`
                    : partner.logo
                }
                alt={partner.name}
                className="h-10 sm:h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
