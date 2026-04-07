import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { API_URL } from '../config';

export default function About({ data }) {
  const { sectionTitle, heading, body, ctaLabel, ctaLink } = data;
  const targetRef = useRef(null);

  // Setup scroll scrubbing for the entire section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Text assembling from the left, fading in
  const textX = useTransform(smoothProgress, [0, 1], [-200, 0]);
  const textOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);

  // Image assembling from the right, fading in, scaling up slightly
  const imgX = useTransform(smoothProgress, [0, 1], [200, 0]);
  const imgOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const imgScale = useTransform(smoothProgress, [0, 1], [0.8, 1]);

  return (
    <section ref={targetRef} id="about" className="py-20 scroll-mt-20 overflow-hidden">
      <div className="section-container">
        {/* Title assembles from bottom up */}
        <motion.div 
          style={{ opacity: textOpacity, y: useTransform(scrollYProgress, [0, 1], [30, 0]) }}
        >
          <h2 className="section-title text-black dark:text-fontwhite transition-colors duration-500">{sectionTitle}</h2>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 items-center mt-6">
          {/* Text Assembles from Left */}
          <motion.div 
            className="flex-1"
            style={{ x: textX, opacity: textOpacity }}
          >
            <h3 className="text-2xl md:text-3xl font-semibold text-secondary leading-snug mb-5">
              {heading}
            </h3>
            <p className="text-black/80 dark:text-fontwhite/80 text-sm leading-relaxed mb-6 text-justify transition-colors duration-500">
              {body}
            </p>
            <a
              href={ctaLink}
              onClick={e => {
                e.preventDefault();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary"
            >
              {ctaLabel}
            </a>
          </motion.div>

          {/* Image Assembles from Right */}
          <motion.div 
            className="flex-[1.2] flex justify-center relative"
            style={{ x: imgX, opacity: imgOpacity, scale: imgScale }}
          >
            {/* Soft Neon Glow Behind Image in Dark Mode */}
            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/30 blur-[40px] rounded-full scale-90 -z-10" />
            
            <img
              src={data.image?.startsWith('/uploads') ? `${API_URL}${data.image}` : (data.image || '/images/m.webp')}
              alt="About Sington Engineering"
              className="w-full max-w-md rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(247,147,30,0.3)] object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
