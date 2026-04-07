import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_URL } from '../config';

const getImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  if (path.startsWith('http')) return path;
  return path;
};

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch site content for header/footer
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSiteContent(d.data);
      })
      .catch(err => console.error('Failed to fetch content:', err));

    // Fetch blogs
    fetch(`${API_URL}/api/blogs`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setBlogs(d.data);
      })
      .catch(err => console.error('Failed to fetch blogs:', err))
      .finally(() => setLoading(false));
  }, []);

  const footerData = siteContent || {
    contact: {
      phone1: '+251 909 090 928',
      phone2: '+251 975 040 521',
      email: 'info@singitanengineering.com',
      address: 'Bole, Atlas, Addis Ababa',
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

  return (
    <div className="bg-white dark:bg-black transition-colors duration-500 min-h-screen">
      <Header logos={footerData.logos} />

      <main className="pt-28 pb-20">
        <div className="section-container">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-4xl font-bold text-black dark:text-white mb-6">
              Our <span className="text-primary italic">Blog</span>
            </h1>
            <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
              Stay updated with the latest trends, news, and engineering insights from Singitan Engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.id}`}
                className="group flex flex-col bg-gray-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500 no-underline"
              >
                <div className="relative h-64 overflow-hidden">
                  {blog.image ? (
                    <img
                      src={getImgUrl(blog.image)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                      <div className="text-primary/20 font-bold text-3xl italic">SINGTON</div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {new Date(blog.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-black/70 dark:text-white/70 mb-5 line-clamp-3 leading-relaxed">
                    {blog.paragraph_1}
                  </p>
                  <div className="mt-auto flex items-center text-primary font-bold gap-2 group/btn text-sm">
                    Read More
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-black/40 dark:text-white/40 italic">No blog posts found.</p>
            </div>
          )}
        </div>
      </main>

      <Footer data={footerData} />
    </div>
  );
}
