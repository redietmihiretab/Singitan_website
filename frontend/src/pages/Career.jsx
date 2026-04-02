import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import ScrollToTop from '../components/ScrollToTop';
import { Briefcase, MapPin, Clock, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import { API_URL } from '../config';

export default function Career() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setContent(d.data);
      })
      .catch(err => console.error('Error fetching content:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const filteredCareers = (content?.careers || []).filter(job =>
    job.is_active && (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header logos={content?.logos} />

      <main className="pt-24 pb-20">


        {/* Search and Jobs */}
        <div className="section-container mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <h2 className="text-2xl font-bold text-secondary dark:text-primary">Open Positions</h2>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-dark dark:text-fontwhite transition-all"
              />
            </div>
          </div>

          {filteredCareers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredCareers.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 text-black dark:text-white text-[10px] font-bold rounded-full uppercase tracking-widest border border-gray-200 dark:border-white/5 leading-none flex items-center shadow-sm">
                          {job.department || 'General'}
                        </span>
                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 text-black dark:text-white text-[10px] font-bold rounded-full uppercase tracking-widest border border-gray-200 dark:border-white/5 leading-none flex items-center shadow-sm">
                          {job.type || 'Full-time'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-black/60 dark:text-white/60 text-sm font-light">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-primary" />
                          {job.location || 'Addis Ababa'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-primary" />
                          Posted {new Date(job.posted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/career/${job.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-secondary dark:bg-primary text-white font-bold rounded-xl hover:bg-primary dark:hover:bg-secondary transition-all no-underline shadow-lg hover:shadow-primary/20"
                    >
                      View Details
                      <ChevronRight size={18} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-dark dark:text-fontwhite mb-2">No positions found</h3>
                <p className="text-gray-500">Try adjusting your search or check back later.</p>
              </div>
            )}
          </div>
          
          {/* Spacer for banner */}
          <div className="h-24 md:h-32"></div>

          {/* Banner */}
          <div className="bg-secondary dark:bg-white/5 py-16 md:py-24 transition-colors duration-500 rounded-3xl mx-4 mb-20">
          <div className="section-container text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Join Our <span className="text-dark">Team</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white max-w-2xl mx-auto text-lg"
            >
              Small enough to care, big enough to make a difference.
              Explore opportunities to grow your career with Singitan Engineering.
            </motion.p>
          </div>
        </div>

      </main>

      <Footer data={content} />
      <ScrollToTop />
    </div>
  );
}
