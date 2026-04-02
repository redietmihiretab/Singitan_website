import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { API_URL } from '../config';

function ServiceCard({ service }) {
  return (
    <div className="w-full h-full glass-card overflow-hidden border-primary dark:border-white/10 card-shadow card-shadow-hover flex flex-col">
      <div className="h-48 overflow-hidden">
        {service.image ? (
          <img
            src={
              service.image?.startsWith('/uploads')
                ? `${API_URL}${service.image}`
                : service.image
            }
            alt={service.title}
            className="w-full h-full object-cover rounded-t-2xl"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/20 to-secondary/10">
            <div className="text-primary/40 font-bold text-3xl italic opacity-20 select-none">
              SINGTON
            </div>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-secondary leading-snug mb-3">{service.title}</h3>
        <p className="text-black/75 dark:text-fontwhite/80 text-[13px] text-justify mb-4 leading-relaxed transition-colors duration-500">{service.description}</p>
        <a
          href={`/services/${service.id}`}
          className="w-fit px-5 py-2 bg-primary text-white font-semibold mt-auto
                     rounded-lg text-sm hover:bg-secondary transition-colors duration-200 no-underline"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}

export default function Services({ data }) {
  const targetRef = useRef(null);
  const carouselRef = useRef(null);
  // Removed intervalRef

  // Scroll Scrubbing Setup
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Assemble properties
  const sectionOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const sectionY = useTransform(smoothProgress, [0, 1], [100, 0]);
  const sectionScale = useTransform(smoothProgress, [0, 1], [0.95, 1]);

  // Navigation handlers are defined inline

  return (
    <section ref={targetRef} id="services" className="py-20 scroll-mt-20 transition-colors duration-500 overflow-hidden">
      <motion.div
        className="section-container"
        style={{ opacity: sectionOpacity, y: sectionY, scale: sectionScale }}
      >
        <div>
          <h2 className="section-title text-black dark:text-fontwhite transition-colors duration-500">Our Services</h2>
        </div>

        <div className="relative mt-10">
          {/* Carousel Wrapper */}
          <div className="overflow-hidden px-4 md:px-0">
            <div
              ref={carouselRef}
              className="flex gap-6 lg:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {data.map(service => (
                <div key={service.id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-21.33px)] snap-start">
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => { carouselRef.current?.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' }); }}
            className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 text-primary dark:text-fontwhite
                       w-10 h-10 rounded-full flex items-center justify-center 
                       hover:text-lightblack dark:hover:text-primary hover:scale-110 transition-all duration-200 hidden md:flex"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => { carouselRef.current?.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' }); }}
            className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 text-primary dark:text-fontwhite
                       w-10 h-10 rounded-full flex items-center justify-center 
                       hover:text-lightblack dark:hover:text-primary hover:scale-110 transition-all duration-200 hidden md:flex"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
