import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { API_URL } from '../config';

function StatCounter({ value, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const isNumeric = /^\d+/.test(value);
  const numPart = parseInt(value);
  const suffix = value.replace(String(numPart), '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    let start = 0;
    const duration = 1400;
    const step = Math.ceil(numPart / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numPart) { setCount(numPart); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, numPart, isNumeric]);

  return (
    <div
      ref={ref}
      className="flex-1 min-w-[120px] glass-card text-center px-4 py-3 card-shadow card-shadow-hover"
    >
      <div className="text-3xl md:text-4xl font-bold text-primary">
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div className="text-black/70 dark:text-fontwhite/70 text-sm mt-1 transition-colors duration-500">{label}</div>
    </div>
  );
}

function ProjectCard({ project, index, scrollYProgress }) {
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  // Stagger the animation of each card based on its index
  // They will all assemble as the section scrolls into view
  const cardY = useTransform(smoothProgress, [0, 1], [150 + (index * 50), 0]);
  const cardOpacity = useTransform(smoothProgress, [0, 0.8], [0, 1]);

  return (
    <motion.div
      style={{ y: cardY, opacity: cardOpacity }}
      className="glass-card overflow-hidden border-primary dark:border-white/10 card-shadow card-shadow-hover flex flex-col h-full group"
    >
      <Link to={`/projects/${project.id}`} className="block overflow-hidden h-56 relative">
        <div className="absolute inset-0 bg-primary/20 transition-opacity opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center">
          <span className="bg-white text-primary font-bold px-6 py-2 rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-transform">View Project</span>
        </div>
        {project.image ? (
          <img
            src={project.image?.startsWith('/uploads') ? `${API_URL}${project.image}` : project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-primary/20 to-secondary/10">
            <div className="text-primary/40 font-bold text-4xl italic opacity-20 select-none">SINGTON</div>
          </div>
        )}
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-primary mb-2">{project.title}</h3>
        <p className="text-black/75 dark:text-fontwhite/80 text-sm mb-4 transition-colors duration-500 line-clamp-2">{project.description}</p>
        <p className="text-black/75 dark:text-fontwhite/80 text-sm mb-4 transition-colors duration-500 line-clamp-2">{project.description}</p>
        <Link to={`/projects/${project.id}`} className="mt-3 text-primary/70 font-regular hover:text-secondary inline-flex items-center gap-1 group/link transition-colors no-underline">
          Read Details
          <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Projects({ stats, projects }) {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const headerY = useTransform(smoothProgress, [0, 1], [50, 0]);
  const headerOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section ref={targetRef} id="projects" className="py-20 scroll-mt-20 overflow-hidden">
      <div className="section-container">
        <motion.div style={{ y: headerY, opacity: headerOpacity }}>
          <h2 className="section-title text-black dark:text-fontwhite transition-colors duration-500">Recent Projects</h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap gap-5 mt-6 mb-10"
          style={{
            opacity: useTransform(smoothProgress, [0.2, 1], [0, 1]),
            scale: useTransform(smoothProgress, [0.2, 1], [0.9, 1])
          }}
        >
          {stats.map(s => (
            <StatCounter key={s.id} value={s.value} label={s.label} />
          ))}
        </motion.div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
