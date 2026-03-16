import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Save, LayoutDashboard, Loader2, Sun, Moon, X, Eye, EyeOff, Bell, CheckCircle, Check, Inbox, Image as ImageIcon, Home, Info, Briefcase, BarChart3, FolderGit2, MessageSquare, Link as LinkIcon, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ImageUpload from '../../components/ImageUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [inboxFilter, setInboxFilter] = useState('all'); // 'all', 'unhandled', 'handled'
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [credentials, setCredentials] = useState({ newUsername: '', newPassword: '', confirmPassword: '' });
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [activeTab, setActiveTab] = useState('logos');

  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [passFeedback, setPassFeedback] = useState({
    len: false, upper: false, lower: false, num: false, sym: false, match: true
  });

  useEffect(() => {
    const p = credentials.newPassword;
    setPassFeedback({
      len: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      num: /[0-9]/.test(p),
      sym: /[!@#$%^&*]/.test(p),
      match: p === credentials.confirmPassword
    });
  }, [credentials.newPassword, credentials.confirmPassword]);

  useEffect(() => {
    // Fetch both content and profile
    const loadData = async () => {
      try {
        const token = localStorage.getItem('sington_admin_token');

        const [contentRes, profileRes, submissionsRes] = await Promise.all([
          fetch(`${API_URL}/api/content`),
          fetch(`${API_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/contact/submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        const contentData = await contentRes.json();
        const profileData = await profileRes.json();
        const submissionsData = await submissionsRes.json();

        if (contentData.success) setData(contentData.data);
        if (profileData.success) setCredentials(prev => ({ ...prev, newUsername: profileData.username }));
        if (submissionsRes.ok && submissionsData.success) {
          setSubmissions(submissionsData.data || []);
          setSubmissionsError(null);
        } else if (submissionsRes.status === 401 || submissionsRes.status === 403) {
          handleLogout();
        } else {
          setSubmissionsError(submissionsData.message || 'Failed to load submissions.');
        }

        if (!contentRes.ok && contentRes.status === 401) handleLogout();
      } catch (err) {
        console.error('Loader error:', err);
        setStatus({ t: 'error', m: 'Failed to load dashboard data.' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

const refreshSubmissions = async () => {
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    try {
      const res = await fetch(`${API_URL}/api/contact/submissions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}` },
      });
      const d = await res.json();
      if (res.ok && d.success) setSubmissions(d.data || []);
      else {
        if (res.status === 401 || res.status === 403) handleLogout();
        throw new Error(d.message || 'Failed to load submissions.');
      }
    } catch (err) {
      setSubmissionsError(err.message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

// Mark submission as handled (non-reversible)
  const handleToggleHandled = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/contact/submissions/${id}/handle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}`
        },
        body: JSON.stringify({})
      });
      const d = await res.json();
      if (res.ok && d.success) {
        // Update local state
        setSubmissions(prev => prev.map(s => 
          s.id === id 
            ? { ...s, is_handled: 1, handled_at: new Date().toISOString() }
            : s
        ));
      } else {
        if (res.status === 401 || res.status === 403) handleLogout();
        throw new Error(d.message || 'Failed to update status.');
      }
    } catch (err) {
      setStatus({ t: 'error', m: err.message });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sington_admin_token');
    navigate('/sington-cms-portal');
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}`
        },
        body: JSON.stringify(data)
      });
      const d = await res.json();
      if (res.ok) setStatus({ t: 'success', m: 'Changes saved! They are now live.' });
      else {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
        } else throw new Error(d.message);
      }
    } catch (err) {
      setStatus({ t: 'error', m: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!credentials.newUsername && !credentials.newPassword) return;

    // Strong Password Validation
    if (credentials.newPassword) {
      if (credentials.newPassword !== credentials.confirmPassword) {
        setStatus({ t: 'error', m: 'Passwords do not match!' });
        return;
      }

      // 8+ chars, uppercase, lowercase, number, symbol
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!strongRegex.test(credentials.newPassword)) {
        setStatus({ t: 'error', m: 'Password must be 8+ chars with Uppercase, Lowercase, Number, and Symbol (!@#$%^&*)' });
        return;
      }
    }

    setUpdatingCreds(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/update-credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}`
        },
        body: JSON.stringify(credentials)
      });
      const d = await res.json();
      if (res.ok) {
        setStatus({ t: 'success', m: 'Credentials updated! Please log in again.' });
        setTimeout(handleLogout, 2000);
      } else throw new Error(d.message);
    } catch (err) {
      setStatus({ t: 'error', m: err.message });
    } finally {
      setUpdatingCreds(false);
    }
  };

  // Simple nested state updater
  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // Array item updater
  const updateArrayItem = (section, index, field, value) => {
    setData(prev => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const removeArrayItem = (section, index) => {
    setData(prev => {
      const newArray = [...prev[section]];
      newArray.splice(index, 1);
      return { ...prev, [section]: newArray };
    });
  };

  const addStat = () => {
    setData(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { id: Date.now(), value: '0', label: 'New Stat' }]
    }));
  };

  const addService = () => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, { 
        id: Date.now(), 
        title: 'New Service', 
        description: 'Brief description for carousel', 
        image: '',
        paragraphs: ['', '', ''],
        bullets: ['Feature 1'],
        additionalImages: ['', '', '']
      }]
    }));
  };

  const addServiceBullet = (svcIdx) => {
    setData(prev => {
      const services = [...prev.services];
      services[svcIdx] = { ...services[svcIdx], bullets: [...(services[svcIdx].bullets || []), ''] };
      return { ...prev, services };
    });
  };

  const updateServiceBullet = (svcIdx, bulletIdx, value) => {
    setData(prev => {
      const services = [...prev.services];
      const bullets = [...services[svcIdx].bullets];
      bullets[bulletIdx] = value;
      services[svcIdx] = { ...services[svcIdx], bullets };
      return { ...prev, services };
    });
  };

  const removeServiceBullet = (svcIdx, bulletIdx) => {
    setData(prev => {
      const services = [...prev.services];
      const bullets = services[svcIdx].bullets.filter((_, i) => i !== bulletIdx);
      services[svcIdx] = { ...services[svcIdx], bullets };
      return { ...prev, services };
    });
  };

  const updateServiceParagraph = (svcIdx, pIdx, value) => {
    setData(prev => {
      const services = [...prev.services];
      const paragraphs = [...(services[svcIdx].paragraphs || ['', '', ''])];
      paragraphs[pIdx] = value;
      services[svcIdx] = { ...services[svcIdx], paragraphs };
      return { ...prev, services };
    });
  };

  const updateServiceAdditionalImage = (svcIdx, imgIdx, value) => {
    setData(prev => {
      const services = [...prev.services];
      const additionalImages = [...(services[svcIdx].additionalImages || ['', '', ''])];
      additionalImages[imgIdx] = value;
      services[svcIdx] = { ...services[svcIdx], additionalImages };
      return { ...prev, services };
    });
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { 
        id: Date.now(), 
        title: 'New Project', 
        description: 'Description', 
        tags: ['Tag'], 
        image: '',
        paragraphs: ['', '', ''],
        bullets: ['Highlight 1'],
        additionalImages: ['', '', '']
      }]
    }));
  };

  const addProjectBullet = (projIdx) => {
    setData(prev => {
      const projects = [...prev.projects];
      projects[projIdx] = { ...projects[projIdx], bullets: [...(projects[projIdx].bullets || []), ''] };
      return { ...prev, projects };
    });
  };

  const updateProjectBullet = (projIdx, bulletIdx, value) => {
    setData(prev => {
      const projects = [...prev.projects];
      const bullets = [...(projects[projIdx].bullets || [])];
      bullets[bulletIdx] = value;
      projects[projIdx] = { ...projects[projIdx], bullets };
      return { ...prev, projects };
    });
  };

  const removeProjectBullet = (projIdx, bulletIdx) => {
    setData(prev => {
      const projects = [...prev.projects];
      const bullets = projects[projIdx].bullets.filter((_, i) => i !== bulletIdx);
      projects[projIdx] = { ...projects[projIdx], bullets };
      return { ...prev, projects };
    });
  };

  const updateProjectParagraph = (projIdx, pIdx, value) => {
    setData(prev => {
      const projects = [...prev.projects];
      const paragraphs = [...(projects[projIdx].paragraphs || ['', '', ''])];
      paragraphs[pIdx] = value;
      projects[projIdx] = { ...projects[projIdx], paragraphs };
      return { ...prev, projects };
    });
  };

  const updateProjectAdditionalImage = (projIdx, imgIdx, value) => {
    setData(prev => {
      const projects = [...prev.projects];
      const additionalImages = [...(projects[projIdx].additionalImages || ['', '', ''])];
      additionalImages[imgIdx] = value;
      projects[projIdx] = { ...projects[projIdx], additionalImages };
      return { ...prev, projects };
    });
  };

  const addTestimonial = () => {
    setData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { id: Date.now(), name: 'Client Name', position: 'Position', quote: 'Their quote...', photo: '' }]
    }));
  };

  // Handle generic tag comma separation array for projects
  const updateTags = (index, value) => {
    const tagsArray = value.split(',').map(t => t.trim()).filter(Boolean);
    updateArrayItem('projects', index, 'tags', tagsArray);
  };

  const TABS = [
    { id: 'logos', label: 'Site Logos', icon: ImageIcon },
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'about', label: 'About Section', icon: Info },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'stats', label: 'Company Stats', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'cta', label: 'Call to Action', icon: LinkIcon },
    { id: 'contact', label: 'Contact/Footer', icon: LayoutDashboard },
    { id: 'partners', label: 'Partners', icon: Users },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-500">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 transition-colors duration-500">
      {/* Top Bar */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80">
            <img
              src={isDarkMode ? "/images/logo_horizontal_light.svg" : "/images/logo_horizontal.svg"}
              alt="Sington Engineering"
              className="h-8 w-auto"
            />
            <div className="h-6 w-px bg-gray-200 dark:bg-white/20 mx-2" />
            <h1 className="text-lg font-bold text-dark dark:text-fontwhite hidden sm:block">Content Management Portal</h1>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary
                         transition-colors flex items-center gap-2 font-medium disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>

{/* Notifications - Opens Inbox */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInbox(true)}
                className="relative p-2 rounded-full text-black dark:text-fontwhite hover:bg-primary/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Notifications"
                title="Contact submissions inbox"
              >
                <Inbox size={20} />
                {submissions.filter(s => !s.is_handled).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {submissions.filter(s => !s.is_handled).length > 99 ? '99+' : submissions.filter(s => !s.is_handled).length}
                  </span>
                )}
              </button>
            </div>

            {/* Account menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAccountMenu(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/10 text-sm text-dark dark:text-fontwhite hover:bg-primary/10 dark:hover:bg-white/20 transition-colors"
              >
                <span className="hidden sm:inline font-medium">Account</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold">
                  {credentials.newUsername?.[0]?.toUpperCase() || 'A'}
                </span>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl shadow-lg py-1 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                      setShowAccountMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm flex items-center justify-between text-dark dark:text-fontwhite hover:bg-gray-50 dark:hover:bg-white/10"
                  >
                    <span>Toggle dark mode</span>
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAccountSettings(true);
                      setShowAccountMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-dark dark:text-fontwhite hover:bg-gray-50 dark:hover:bg-white/10 text-left"
                  >
                    Account settings
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-sm flex items-center justify-between text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <span>Logout</span>
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Status Toast */}
      {status && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-medium
          ${status.t === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {status.m}
        </div>
      )}

      {/* Editor Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 transition-colors duration-500 overflow-x-auto lg:overflow-visible flex lg:flex-col gap-2 scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 w-full space-y-8 min-w-0 pb-12">
          
          {activeTab === 'logos' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-colors duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-semibold text-secondary dark:text-primary mb-6 border-b border-gray-100 dark:border-white/10 pb-2">Site Logos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageUpload
                  label="Horizontal Logo (Dark Theme - Light Version)"
                  value={data.logos?.light || '/images/logo_horizontal_light.svg'}
                  onChange={val => setData(prev => ({ ...prev, logos: { ...prev.logos, light: val } }))}
                />
                <ImageUpload
                  label="Horizontal Logo (Light Theme - Dark Version)"
                  value={data.logos?.dark || '/images/logo_horizontal.svg'}
                  onChange={val => setData(prev => ({ ...prev, logos: { ...prev.logos, dark: val } }))}
                />
              </div>
            </section>
          )}

          {activeTab === 'hero' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-semibold text-secondary dark:text-primary mb-6 border-b border-gray-100 dark:border-white/10 pb-2">Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Part 1</label>
                  <input type="text" value={data.hero.headline} onChange={e => updateField('hero', 'headline', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-dark dark:text-fontwhite transition-colors duration-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Part 2 (Orange)</label>
                  <input type="text" value={data.hero.headlineHighlight} onChange={e => updateField('hero', 'headlineHighlight', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-dark dark:text-fontwhite transition-colors duration-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtext</label>
                  <textarea value={data.hero.subtext} onChange={e => updateField('hero', 'subtext', e.target.value)} rows={3}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-dark dark:text-fontwhite transition-colors duration-500" />
                </div>
                <ImageUpload
                  label="Hero Image"
                  value={data.hero.image || '/images/hero.png'}
                  onChange={val => updateField('hero', 'image', val)}
                />
              </div>
            </section>
          )}

          {activeTab === 'about' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-semibold text-secondary dark:text-primary mb-6 border-b border-gray-100 dark:border-white/10 pb-2">About Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
                  <input type="text" value={data.about.heading} onChange={e => updateField('about', 'heading', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-dark dark:text-fontwhite transition-colors duration-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Text</label>
                  <textarea value={data.about.body} onChange={e => updateField('about', 'body', e.target.value)} rows={6}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-dark dark:text-fontwhite transition-colors duration-500" />
                </div>
                <ImageUpload
                  label="About Image"
                  value={data.about.image || '/images/m.jpg'}
                  onChange={val => updateField('about', 'image', val)}
                />
              </div>
            </section>
          )}

          {activeTab === 'services' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Services</h2>
                <button onClick={addService} className="text-sm bg-primary/5 hover:bg-primary/10 text-dark dark:text-fontwhite px-3 py-1.5 rounded-md font-medium transition-colors">
                  + Add Service
                </button>
              </div>
              <div className="space-y-12">
                {data.services.map((svc, idx) => (
                  <div key={svc.id} className="p-6 border border-gray-200 dark:border-white/10 rounded-2xl relative bg-white dark:bg-white/5 transition-colors duration-500 shadow-sm">
                    <button
                      onClick={() => removeArrayItem('services', idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-semibold text-sm p-2"
                    >Remove</button>
                    
                    <div className="grid grid-cols-1 gap-6 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title</label>
                          <input type="text" value={svc.title} onChange={e => updateArrayItem('services', idx, 'title', e.target.value)}
                            className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                        </div>
                        <div>
                          <ImageUpload
                            label="Main Image (Carousel & Header)"
                            value={svc.image}
                            onChange={val => updateArrayItem('services', idx, 'image', val)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description (for Carousel)</label>
                        <textarea value={svc.description} onChange={e => updateArrayItem('services', idx, 'description', e.target.value)} rows={2}
                          className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>

                      <div className="border-t border-gray-100 dark:border-white/10 pt-6">
                        <h3 className="text-md font-semibold text-secondary dark:text-primary mb-4">Detailed Content (Service Page)</h3>
                        
                        <div className="space-y-4">
                          {[0, 1, 2].map(pIdx => (
                            <div key={pIdx}>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Paragraph {pIdx + 1}</label>
                              <textarea 
                                value={svc.paragraphs ? svc.paragraphs[pIdx] : ''} 
                                onChange={e => updateServiceParagraph(idx, pIdx, e.target.value)} 
                                rows={4}
                                className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" 
                                placeholder={`Detailed paragraph ${pIdx + 1}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-md font-semibold text-secondary dark:text-primary">Bullet Points</h3>
                          <button onClick={() => addServiceBullet(idx)} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors">
                            + Add Bullet
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(svc.bullets || []).map((bullet, bIdx) => (
                            <div key={bIdx} className="flex gap-2">
                              <input 
                                type="text" 
                                value={bullet} 
                                onChange={e => updateServiceBullet(idx, bIdx, e.target.value)}
                                className="flex-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-xs text-dark dark:text-fontwhite"
                              />
                              <button onClick={() => removeServiceBullet(idx, bIdx)} className="text-red-400 hover:text-red-600 px-1">✕</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-white/10 pt-6">
                        <h3 className="text-md font-semibold text-secondary dark:text-primary mb-4">Additional Images (Gallery)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[0, 1, 2].map(imgIdx => (
                            <ImageUpload
                              key={imgIdx}
                              label={`Image ${imgIdx + 1}`}
                              value={svc.additionalImages ? svc.additionalImages[imgIdx] : ''}
                              onChange={val => updateServiceAdditionalImage(idx, imgIdx, val)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'stats' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Company Stats</h2>
                <button onClick={addStat} className="text-sm bg-primary/5 hover:bg-primary/10 text-dark dark:text-fontwhite px-3 py-1.5 rounded-md font-medium transition-colors">
                  + Add Stat
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(data.stats || []).map((stat, idx) => (
                  <div key={stat.id} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl relative bg-white dark:bg-white/5 transition-colors duration-500">
                    <button
                      onClick={() => removeArrayItem('stats', idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold text-xs"
                    >Remove</button>
                    <div className="space-y-3 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Value (e.g. 10+)</label>
                        <input type="text" value={stat.value} onChange={e => updateArrayItem('stats', idx, 'value', e.target.value)}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
                        <input type="text" value={stat.label} onChange={e => updateArrayItem('stats', idx, 'label', e.target.value)}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'projects' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Projects</h2>
                <button onClick={addProject} className="text-sm bg-primary/5 hover:bg-primary/10 text-dark dark:text-fontwhite px-3 py-1.5 rounded-md font-medium transition-colors">
                  + Add Project
                </button>
              </div>
              <div className="space-y-8">
                {data.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl relative bg-white dark:bg-white/5 transition-colors duration-500">
                    <button
                      onClick={() => removeArrayItem('projects', idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-semibold text-sm"
                    >Remove</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input type="text" value={proj.title} onChange={e => updateArrayItem('projects', idx, 'title', e.target.value)}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                      <div className="md:col-span-2">
                        <ImageUpload
                          label="Project Image"
                          value={proj.image || ''}
                          onChange={val => updateArrayItem('projects', idx, 'image', val)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Comma separated)</label>
                        <input type="text" value={proj.tags?.join(', ')} onChange={e => updateTags(idx, e.target.value)}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea value={proj.description} onChange={e => updateArrayItem('projects', idx, 'description', e.target.value)} rows={2}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>

                      {/* Project Details */}
                      <div className="md:col-span-2 border-t border-gray-100 dark:border-white/10 pt-4 mt-2">
                        <h3 className="text-sm font-semibold text-secondary dark:text-primary mb-3">Project Page Content</h3>
                        
                        <div className="space-y-3 mb-4">
                          {[0, 1, 2].map(pIdx => (
                            <div key={pIdx}>
                              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Paragraph {pIdx + 1}</label>
                              <textarea 
                                value={proj.paragraphs ? proj.paragraphs[pIdx] : ''} 
                                onChange={e => updateProjectParagraph(idx, pIdx, e.target.value)} 
                                rows={3}
                                className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-xs text-dark dark:text-fontwhite transition-colors duration-500" 
                                placeholder={`Detailed paragraph ${pIdx + 1}...`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Highlights / Bullets</label>
                            <button onClick={() => addProjectBullet(idx)} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded hover:bg-primary/20 transition-colors">
                              + Add
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(proj.bullets || []).map((bullet, bIdx) => (
                              <div key={bIdx} className="flex gap-1">
                                <input 
                                  type="text" 
                                  value={bullet} 
                                  onChange={e => updateProjectBullet(idx, bIdx, e.target.value)}
                                  className="flex-1 p-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-[11px] text-dark dark:text-fontwhite"
                                />
                                <button onClick={() => removeProjectBullet(idx, bIdx)} className="text-red-400 hover:text-red-600 px-1 text-xs">✕</button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">Gallery Images</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[0, 1, 2].map(imgIdx => (
                              <ImageUpload
                                key={imgIdx}
                                label={`Image ${imgIdx + 1}`}
                                value={proj.additionalImages ? proj.additionalImages[imgIdx] : ''}
                                onChange={val => updateProjectAdditionalImage(idx, imgIdx, val)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'testimonials' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Testimonials</h2>
                <button onClick={addTestimonial} className="text-sm bg-primary/5 hover:bg-primary/10 text-dark dark:text-fontwhite px-3 py-1.5 rounded-md font-medium transition-colors">
                  + Add Testimonial
                </button>
              </div>
              <div className="space-y-8">
                {data.testimonials.map((test, idx) => (
                  <div key={test.id} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl relative bg-white dark:bg-white/5 transition-colors duration-500">
                    <button
                      onClick={() => removeArrayItem('testimonials', idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-semibold text-sm"
                    >Remove</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" value={test.name} onChange={e => updateArrayItem('testimonials', idx, 'name', e.target.value)}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                        <input type="text" value={test.position} onChange={e => updateArrayItem('testimonials', idx, 'position', e.target.value)}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                      <div className="md:col-span-2">
                        <ImageUpload
                          label="Client Photo"
                          value={test.photo}
                          onChange={val => updateArrayItem('testimonials', idx, 'photo', val)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote</label>
                        <textarea value={test.quote} onChange={e => updateArrayItem('testimonials', idx, 'quote', e.target.value)} rows={3}
                          className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'cta' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-semibold text-secondary dark:text-primary mb-6 border-b border-gray-100 dark:border-white/10 pb-2">Call to Action (CTA)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Part 1</label>
                  <input type="text" value={data.cta?.headline || ''} onChange={e => updateField('cta', 'headline', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Part 2 (Dark Text)</label>
                  <input type="text" value={data.cta?.headlineAccent || ''} onChange={e => updateField('cta', 'headlineAccent', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtext</label>
                  <textarea value={data.cta?.subtext || ''} onChange={e => updateField('cta', 'subtext', e.target.value)} rows={3}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'contact' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-semibold text-secondary dark:text-primary mb-6 border-b border-gray-100 dark:border-white/10 pb-2">Contact Details Footer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone 1</label>
                  <input type="text" value={data.contact.phone1} onChange={e => updateField('contact', 'phone1', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone 2</label>
                  <input type="text" value={data.contact.phone2} onChange={e => updateField('contact', 'phone2', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="text" value={data.contact.email} onChange={e => updateField('contact', 'email', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input type="text" value={data.contact.address} onChange={e => updateField('contact', 'address', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-dark dark:text-fontwhite transition-colors duration-500 outline-none focus:border-primary" />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'partners' && (
            <section className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Technology Partners</h2>
                <button
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      partners: [...prev.partners, { id: Date.now(), name: 'New Partner', logo: '' }]
                    }));
                  }}
                  className="text-sm bg-primary/5 hover:bg-primary/10 text-dark dark:text-fontwhite px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  + Add Partner
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.partners.map((p, idx) => (
                  <div key={p.id} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl relative bg-white dark:bg-white/5 transition-colors duration-500">
                    <button
                      onClick={() => removeArrayItem('partners', idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold text-xs transition-colors"
                    >Remove</button>
                    <div className="space-y-3">
                      <input
                        type="text" value={p.name} onChange={e => updateArrayItem('partners', idx, 'name', e.target.value)}
                        placeholder="Partner Name"
                        className="w-full p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-colors duration-500"
                      />
                      <ImageUpload
                        value={p.logo}
                        onChange={val => updateArrayItem('partners', idx, 'logo', val)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
{/* Account settings modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-black w-full max-w-2xl mx-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Account Settings</h2>
              <button
                type="button"
                onClick={() => setShowAccountSettings(false)}
                className="p-1 rounded-full text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close account settings"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateCredentials} className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Username</label>
                  <input
                    type="text"
                    value={credentials.newUsername}
                    onChange={e => setCredentials(prev => ({ ...prev, newUsername: e.target.value }))}
                    className="w-full p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-all duration-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={credentials.newPassword}
                      onChange={e => setCredentials(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Strong password required"
                      className={`w-full p-3 pr-11 bg-white dark:bg-black/20 border ${credentials.newPassword && !Object.values(passFeedback).slice(0, 5).every(Boolean) ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-all duration-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {credentials.newPassword && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className={`text-[10px] flex items-center gap-1 ${passFeedback.len ? 'text-green-500' : 'text-red-400'}`}>
                        {passFeedback.len ? '✓' : '○'} 8+ Characters
                      </p>
                      <p className={`text-[10px] flex items-center gap-1 ${passFeedback.upper ? 'text-green-500' : 'text-red-400'}`}>
                        {passFeedback.upper ? '✓' : '○'} Uppercase Letter
                      </p>
                      <p className={`text-[10px] flex items-center gap-1 ${passFeedback.lower ? 'text-green-500' : 'text-red-400'}`}>
                        {passFeedback.lower ? '✓' : '○'} Lowercase Letter
                      </p>
                      <p className={`text-[10px] flex items-center gap-1 ${passFeedback.num ? 'text-green-500' : 'text-red-400'}`}>
                        {passFeedback.num ? '✓' : '○'} One Number
                      </p>
                      <p className={`text-[10px] flex items-center gap-1 ${passFeedback.sym ? 'text-green-500' : 'text-red-400'}`}>
                        {passFeedback.sym ? '✓' : '○'} One Symbol (!@#$%^&*)
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={credentials.confirmPassword}
                      onChange={e => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password"
                      className={`w-full p-3 pr-11 bg-white dark:bg-black/20 border ${!passFeedback.match && credentials.confirmPassword ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl outline-none focus:border-primary text-sm text-dark dark:text-fontwhite transition-all duration-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!passFeedback.match && credentials.confirmPassword && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium ml-1 flex items-center gap-1">
                      <X className="w-2.5 h-2.5" /> Passwords don't match
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountSettings(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingCreds}
                  className="bg-secondary text-white py-2.5 px-6 rounded-xl text-sm font-semibold hover:bg-dark transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingCreds && <Loader2 className="w-4 h-4 animate-spin" />}
                  {updatingCreds ? 'Updating...' : 'Update Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inbox Modal */}
      {showInbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-black w-full max-w-3xl mx-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Inbox size={22} className="text-primary" />
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Contact Messages</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {submissions.filter(s => !s.is_handled).length} unread
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshSubmissions}
                  disabled={submissionsLoading}
                  className="text-xs bg-primary/5 hover:bg-primary/10 text-dark dark:text-fontwhite px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-60"
                >
                  {submissionsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInbox(false)}
                  className="p-1.5 rounded-full text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close inbox"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <button
                onClick={() => setInboxFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  inboxFilter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setInboxFilter('unhandled')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  inboxFilter === 'unhandled' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                Unread ({submissions.filter(s => !s.is_handled).length})
              </button>
              <button
                onClick={() => setInboxFilter('handled')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  inboxFilter === 'handled' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                Handled ({submissions.filter(s => s.is_handled).length})
              </button>
            </div>

{/* Messages List */}
            <div className="flex-1 overflow-auto">
              {submissionsError && (
                <div className="px-6 py-4 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-b border-red-100 dark:border-red-900/30">
                  {submissionsError}
                </div>
              )}

              {submissionsLoading && submissions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {submissions
                    .filter(s => {
                      if (inboxFilter === 'unhandled') return !s.is_handled;
                      if (inboxFilter === 'handled') return s.is_handled;
                      return true;
                    })
                    .map((s) => (
                      <div 
                        key={s.id} 
                        className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                          !s.is_handled ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold text-dark dark:text-fontwhite ${!s.is_handled ? 'font-bold' : ''}`}>
                                {s.name}
                              </span>
                              {!s.is_handled && (
                                <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
                              )}
                              {s.is_handled === 1 && (
                                <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle size={10} /> Handled
                                </span>
                              )}
                            </div>
<a
                              href={`mailto:${s.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:text-secondary no-underline break-all"
                            >
                              {s.email}
                            </a>
                            <div className="mt-2 text-sm text-gray-700 dark:text-white/80 whitespace-pre-wrap">
                              {s.message}
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500 dark:text-white/50">
                              <span>{s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</span>
                              {s.handled_at && (
                                <span className="flex items-center gap-1">
                                  <Check size={12} /> Handled: {new Date(s.handled_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
<div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleToggleHandled(s.id)}
                              disabled={s.is_handled === 1}
                              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                s.is_handled === 1
                                  ? 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {s.is_handled === 1 ? (
                                <>
                                  <CheckCircle size={14} /> Handled
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Mark Handled
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {submissions.filter(s => {
                    if (inboxFilter === 'unhandled') return !s.is_handled;
                    if (inboxFilter === 'handled') return s.is_handled;
                    return true;
                  }).length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500 dark:text-white/60">
                      {inboxFilter === 'unhandled' 
                        ? 'No unread messages.' 
                        : inboxFilter === 'handled' 
                          ? 'No handled messages.' 
                          : 'No messages yet.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
