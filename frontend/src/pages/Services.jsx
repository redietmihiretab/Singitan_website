import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import ScrollToTop from '../components/ScrollToTop';

import { API_URL } from '../config';

export default function Services() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setContent(d.data);
      })
      .catch(err => console.error('Error fetching services:', err))
      .finally(() => setLoading(false));
  }, []);

  const getImgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('/uploads')) return `${API_URL}${path}`;
    if (path.startsWith('http')) return path;
    return path;
  };

  if (loading) return <Loader />;

  const services = content?.services || [];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header logos={content?.logos} />
      
      <main className="pt-32 pb-20">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">
              Our <span className="text-primary">Services</span>
            </h1>
            <p className="text-lg text-black/60 dark:text-white/60 font-light leading-relaxed">
              Comprehensive engineering solutions tailored to meet the evolving needs of modern infrastructure and industrial sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="group flex flex-col bg-gray-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500 no-underline"
              >
                <div className="relative h-64 overflow-hidden">
                  {service.image ? (
                    <img
                      src={getImgUrl(service.image)}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                      <Settings className="text-primary/20 animate-spin-slow" size={64} />
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-black/70 dark:text-white/70 mb-6 line-clamp-3 leading-relaxed font-light">
                    {service.paragraphs?.[0] || 'Learn more about our professional engineering services and expertise.'}
                  </p>
                  <div className="mt-auto flex items-center text-primary font-bold gap-2 group/btn text-sm">
                    View Details
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-black/40 dark:text-white/40 italic">Coming soon...</p>
            </div>
          )}
        </div>
      </main>

      <Footer data={content} />
      <ScrollToTop />
    </div>
  );
}
