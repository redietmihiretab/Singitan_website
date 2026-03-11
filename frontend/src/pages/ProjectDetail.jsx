import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  if (path.startsWith('http')) return path;
  return path;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [siteContent, setSiteContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSiteContent(d.data);
      })
      .catch((err) => {
        console.error('Failed to fetch project content:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const projects = siteContent?.projects || [];
  const currentIndex = projects.findIndex(p => String(p.id) === String(id));
  const project = projects[currentIndex];

  // Fallback for header/footer data if fetch fails
  const footerData = siteContent || {
    contact: {
      phone1: '+251 909 090 928',
      phone2: '+251 975 040 521',
      email: 'info@singitanengineering.com',
      address: 'Bole, Atlas, Addis Ababa',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6544577528375!2d38.78409179999999!3d9.0039078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b859272a60d37%3A0x5176c0938998331a!2sSingitan%20Engineering%20PLC!5e0!3m2!1sen!2set!4v1757323258167!5m2!1sen!2set'
    },
    logos: {
      dark: "/images/logo_horizontal.svg",
      light: "/images/logo_horizontal_light.svg"
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-6">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  return (
    <div className="bg-white dark:bg-black transition-colors duration-500 min-h-screen">
      <Header logos={footerData.logos} />
      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/#projects" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-medium mb-8 transition-colors no-underline">
            <ArrowLeft size={20} />
            Back to Projects
          </Link>

          {project.image ? (
            <img
              src={getImgUrl(project.image)}
              alt={project.title}
              className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-xl mb-10 border border-primary/20 dark:border-white/10"
            />
          ) : (
            <div className="w-full h-64 md:h-96 rounded-3xl shadow-xl mb-10 border border-primary/20 dark:border-white/10 bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
              <div className="text-primary/40 font-bold text-5xl italic opacity-20 select-none">
                SINGTON
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags?.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-8 border-b-4 border-primary pb-4 inline-block">
            {project.title}
          </h1>

          <div className="space-y-8 text-black/80 dark:text-fontwhite/90 text-lg leading-relaxed text-justify">
            {(project.paragraphs || []).map((p, i) => (
              <p key={i} className={i === 0 ? "text-xl font-medium text-black dark:text-white" : ""}>
                {p}
              </p>
            ))}

            {project.bullets && project.bullets.length > 0 && (
              <>
                <h3 className="text-3xl font-semibold text-secondary dark:text-primary mt-12 mb-6 pt-4 border-t border-gray-100 dark:border-white/5">
                  Project Highlights
                </h3>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                  {project.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/50 transition-colors duration-300">
                      <CheckCircle2 className="text-primary flex-shrink-0 mt-1" size={22} />
                      <span className="text-base text-black/90 dark:text-fontwhite">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {project.additionalImages && project.additionalImages.some(img => img) && (
              <div className="mt-16">
                <h3 className="text-3xl font-semibold text-secondary dark:text-primary mb-8 pt-4 border-t border-gray-100 dark:border-white/5">
                  Project Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {project.additionalImages.filter(img => img).map((img, i) => (
                    <div key={i} className="aspect-video overflow-hidden rounded-2xl shadow-md border border-gray-100 dark:border-white/10">
                      <img 
                        src={getImgUrl(img)} 
                        alt={`${project.title} gallery ${i + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-20 pt-10 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
            <Link 
              to={`/projects/${prevProject.id}`}
              className="group flex items-center gap-4 no-underline"
            >
              <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <ArrowLeft className="text-black dark:text-white group-hover:text-white transition-colors" size={20} />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest font-semibold block mb-1">Previous</span>
                <span className="text-sm font-bold text-black dark:text-white group-hover:text-primary transition-colors">{prevProject.title}</span>
              </div>
            </Link>

            <Link 
              to={`/projects/${nextProject.id}`}
              className="group flex items-center gap-4 text-right no-underline"
            >
              <div className="hidden sm:block">
                <span className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest font-semibold block mb-1">Next</span>
                <span className="text-sm font-bold text-black dark:text-white group-hover:text-primary transition-colors">{nextProject.title}</span>
              </div>
              <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <ArrowRight className="text-black dark:text-white group-hover:text-white transition-colors" size={20} />
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer data={footerData} />
    </div>
  );
}
