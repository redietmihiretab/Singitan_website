// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ChevronDown } from 'lucide-react';

export default function Hero({ data }) {
  const { headline, headlineHighlight, subtext, ctaLabel, ctaLink } = data;

  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const yText = useTransform(smoothY, [0, 600], [0, 250]);
  const yImg = useTransform(smoothY, [0, 600], [0, -150]);
  const heroOpacity = useTransform(smoothY, [0, 500], [1, 0]);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18 } },
  };
  const item = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
  };

  const scrollDown = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden
                 bg-[url('/images/backg.jpg')] bg-cover bg-center"
    >
      {/* Overlay - adapts to dark mode - 60% White / 30% Black rule */}
      <div className="absolute inset-0 bg-white/70 dark:bg-black/85 backdrop-blur-[1px] transition-colors duration-500" />

      <motion.div style={{ opacity: heroOpacity }} className="section-container relative z-10 w-full">
        <div className="flex flex-col md:flex-row items-center gap-10 py-16">
          {/* Text */}
          <motion.div
            className="flex-[7] text-left relative"
            variants={container}
            initial="hidden"
            animate="visible"
            style={{ y: yText }}
          >
            <motion.h1
              variants={item}
              className="text-3xl md:text-5xl lg:text-5xl font-bold leading-tight
                         tracking-tight text-black dark:text-fontwhite mb-6 transition-colors duration-500
                         min-h-[160px] sm:min-h-[150px] md:min-h-[150px] lg:min-h-[170px]"
            >
              <div className="inline-block w-full">
                {headline}{' '}
                <br />
                {headlineHighlight && (
                  <TypeAnimation
                    sequence={[
                      headlineHighlight, 3000,
                      '', 500
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                    className="inline-block text-secondary font-extrabold tracking-wide dark:drop-shadow-[0_0_15px_rgba(247,147,30,0.6)]"
                  />
                )}
              </div>
            </motion.h1>
            <motion.p
              variants={item}
              className="text-black/80 dark:text-fontwhite/80 text-sm md:text-base mb-8 max-w-xl text-justify transition-colors duration-500"
            >
              {subtext}
            </motion.p>
            <motion.a
              variants={item}
              href={ctaLink}
              onClick={e => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
            >
              {ctaLabel}
            </motion.a>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="flex-[3] flex justify-center items-center relative"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ y: yImg }}
          >
            {/* Soft Neon Glow Behind Image */}
            <div className="absolute inset-0  blur-[60px]  scale-75 -z-10 animate-neon-pulse" />
            <img
              src={data.image?.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${data.image}` : (data.image || '/images/hero.png')}
              alt="Singitan Engineering"
              className="w-full max-w-sm md:max-w-md "
              loading="eager"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll-down indicator */}
      <motion.button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        aria-label="Scroll down"
      >
        <ChevronDown size={36} strokeWidth={1.5} />
      </motion.button>
    </section>
  );
}
