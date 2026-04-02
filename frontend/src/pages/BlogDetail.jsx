import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_URL } from '../config';

const getImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  if (path.startsWith('http')) return path;
  return path;
};

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
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

    // Fetch single blog
    fetch(`${API_URL}/api/blogs/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setBlog(d.data);
      })
      .catch(err => console.error('Failed to fetch blog:', err))
      .finally(() => setLoading(false));

    // Fetch featured blogs (latest 3)
    fetch(`${API_URL}/api/blogs`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          // Filter out the current blog
          setFeaturedBlogs(d.data.filter(b => String(b.id) !== String(id)).slice(0, 3));
        }
      })
      .catch(err => console.error('Failed to fetch featured blogs:', err));
  }, [id]);

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

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-6 transition-colors">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Blog post not found</h2>
        <Link to="/blog" className="text-primary hover:underline">Return to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black transition-colors duration-500 min-h-screen">
      <Header logos={footerData.logos} />
      
      <main className="pt-28 pb-20">
        <article className="max-w-5xl mx-auto px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-medium mb-8 transition-colors no-underline">
            <ArrowLeft size={20} />
            Back to All Blogs
          </Link>

          <header className="mb-10 text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center gap-6 text-black/50 dark:text-white/50 text-sm font-light">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                {new Date(blog.posted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 pl-6 border-l border-gray-200 dark:border-white/10">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {blog.author || 'Singitan Admin'}
              </div>
            </div>
          </header>

          <div className="relative mb-12 rounded-3xl overflow-hidden shadow-xl border border-primary/10">
            {blog.image ? (
              <img
                src={getImgUrl(blog.image)}
                alt={blog.title}
                className="w-full h-[300px] md:h-[450px] object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center opacity-20 text-4xl font-bold">
                SINGTON
              </div>
            )}
          </div>

          <section className="space-y-8 text-black/80 dark:text-fontwhite/90 text-base md:text-lg leading-relaxed text-justify font-light max-w-none">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
              {blog.paragraph_1}
            </p>

            {(blog.image_1 || blog.image_2 || blog.image_3) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 py-8 border-y border-gray-100 dark:border-white/5">
                {blog.image_1 && (
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-white/10 font-light">
                    <img src={getImgUrl(blog.image_1)} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {blog.image_2 && (
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-white/10 font-light">
                    <img src={getImgUrl(blog.image_2)} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {blog.image_3 && (
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-white/10 font-light">
                    <img src={getImgUrl(blog.image_3)} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {blog.paragraph_2 && <p>{blog.paragraph_2}</p>}
            {blog.paragraph_3 && <p>{blog.paragraph_3}</p>}
            {blog.paragraph_4 && <p>{blog.paragraph_4}</p>}
            {blog.paragraph_5 && <p>{blog.paragraph_5}</p>}
          </section>

          {/* Featured Sections (Past Blog Collections) */}
          {featuredBlogs.length > 0 && (
            <section className="mt-24 pt-16 border-t border-gray-100 dark:border-white/10">
              <h3 className="text-3xl font-bold text-black dark:text-white mb-10 flex items-center gap-3">
                <span className="w-12 h-1 bg-primary rounded-full"></span>
                Past <span className="text-primary italic">Collections</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredBlogs.map(item => (
                  <Link 
                    key={item.id} 
                    to={`/blog/${item.id}`}
                    className="group bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden no-underline"
                  >
                    <div className="h-40 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={getImgUrl(item.image)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center opacity-30">SINGTON</div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1.5">
                        {new Date(item.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h4 className="text-sm font-bold text-black dark:text-white line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer data={footerData} />
    </div>
  );
}
