import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import ScrollToTop from '../components/ScrollToTop';

import { API_URL } from '../config';

export default function CareerDetail() {
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
      .catch(err => console.error('Error fetching content:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const careers = siteContent?.careers || [];
  const job = careers.find(c => String(c.id) === String(id));

  if (loading) return <Loader />;

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-6">
        <h2 className="text-2xl font-bold mb-4">Position not found</h2>
        <Link to="/career" className="text-primary hover:underline">View all positions</Link>
      </div>
    );
  }

  const requirements = [
    job.requirement_1, job.requirement_2, job.requirement_3, 
    job.requirement_4, job.requirement_5, job.requirement_6
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header logos={siteContent?.logos} />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/career" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-medium mb-10 transition-colors no-underline">
            <ArrowLeft size={20} /> Back to Careers
          </Link>

          <div className="mb-12">
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-widest border border-primary/20 leading-none flex items-center shadow-sm">
                {job.department || 'General'}
              </span>
              <span className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[11px] font-bold rounded-full uppercase tracking-widest border border-gray-200 dark:border-white/5 leading-none flex items-center shadow-sm">
                {job.type || 'Full-time'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6 leading-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-black/50 dark:text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                {job.location || 'Addis Ababa'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Posted {new Date(job.posted_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                {job.type || 'Full-time'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10 text-black/80 dark:text-white/80 leading-relaxed font-light text-lg">
              <div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-4">Role Overview</h3>
                <p className="whitespace-pre-line">{job.description}</p>
              </div>

              {requirements.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-6">Key Requirements</h3>
                  <div className="flex flex-wrap gap-3">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 px-5 py-2.5 rounded-full transition-all duration-300">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="text-primary" size={12} />
                        </div>
                        <span className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light whitespace-nowrap">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32 p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 text-center">
                <Briefcase className="mx-auto text-primary mb-6" size={48} />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Interested?</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mb-8 font-light">
                  Send your CV and cover letter to our recruitment team to apply for this position.
                </p>
                <a 
                  href={`mailto:info@singitanengineering.com?subject=Application for ${job.title}`}
                  className="block w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-secondary transition-all shadow-lg hover:shadow-primary/20 no-underline"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer data={siteContent} />
      <ScrollToTop />
    </div>
  );
}
