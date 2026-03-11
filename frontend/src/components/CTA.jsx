import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function CTA({ data }) {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const sectionY = useTransform(smoothProgress, [0, 1], [100, 0]);
  const sectionOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section ref={targetRef} className="py-20 relative overflow-hidden bg-gradient-to-r from-secondary to-primary">
      {/* Content */}
      <motion.div 
        style={{ y: sectionY, opacity: sectionOpacity }}
        className="section-container relative z-10 text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {data.headline} <span className="text-primary bg-white px-3 py-1 rounded-lg ml-2">{data.headlineAccent}</span>
        </h2>
        <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          {data.subtext}
        </p>
        
        <a 
          href={data.ctaLink}
          onClick={e => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-block px-10 py-4 bg-white text-primary font-bold rounded-xl
                     shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]
                     transition-all duration-300"
        >
          {data.ctaLabel}
        </a>
      </motion.div>
    </section>
  );
}
