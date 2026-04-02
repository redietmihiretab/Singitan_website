import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Edit2, Check, X, Eye, Image as ImageIcon, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { API_URL } from '../../config';

export default function AdminBlogs({ handleLogout }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/blogs/admin`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}` }
      });
      const d = await res.json();
      if (d.success) setBlogs(d.data);
      else if (res.status === 401 || res.status === 403) handleLogout();
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const newBlog = {
      title: 'New Blog Post',
      author: 'Singitan Admin',
      image: '',
      paragraph_1: 'Start writing here...',
      paragraph_2: '',
      paragraph_3: '',
      paragraph_4: '',
      paragraph_5: '',
      image_1: '',
      image_2: '',
      image_3: '',
      display_order: blogs.length,
      is_active: 0 // Default to inactive
    };
    setEditFormData(newBlog);
    setEditingId('new');
  };

  const handleEdit = (blog) => {
    setEditFormData({ ...blog });
    setEditingId(blog.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`${API_URL}/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}` }
      });
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== id));
        setStatus({ t: 'success', m: 'Blog deleted' });
      }
    } catch (err) {
      setStatus({ t: 'error', m: 'Failed to delete' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    const isNew = editingId === 'new';
    const url = isNew ? `${API_URL}/api/blogs` : `${API_URL}/api/blogs/${editingId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sington_admin_token')}`
        },
        body: JSON.stringify(editFormData)
      });
      const d = await res.json();
      if (d.success) {
        setStatus({ t: 'success', m: isNew ? 'Blog created' : 'Blog updated' });
        setEditingId(null);
        fetchBlogs();
      } else {
        setStatus({ t: 'error', m: d.message || 'Error saving' });
      }
    } catch (err) {
      setStatus({ t: 'error', m: 'Network error' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const updateField = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark dark:text-fontwhite">Blog Posts</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary transition-colors shadow-sm"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      {status && (
        <div className={`p-3 rounded-lg text-white text-center text-sm font-medium ${status.t === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {status.m}
        </div>
      )}

      {editingId ? (
        <div className="bg-gray-50 dark:bg-black/40 p-8 rounded-2xl border border-primary/20 shadow-xl space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary">{editingId === 'new' ? 'Creating New Blog' : 'Editing Blog'}</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-dark dark:text-fontwhite font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-secondary flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                Save
              </button>
            </div>
          </div>

          {/* Header Metadata Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Blog Title</label>
                <input 
                  type="text" 
                  value={editFormData.title} 
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Enter a compelling title..."
                  className="w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-lg font-bold text-dark dark:text-fontwhite transition-all shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Author Name</label>
                  <input 
                    type="text" 
                    value={editFormData.author || ''} 
                    onChange={e => updateField('author', e.target.value)}
                    placeholder="Author name"
                    className="w-full p-3 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-dark dark:text-fontwhite"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Display Settings</label>
                  <div className="flex items-center gap-6 h-[46px] px-3 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={editFormData.is_active === 1 || editFormData.is_active === true} 
                        onChange={e => updateField('is_active', e.target.checked ? 1 : 0)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-dark dark:text-white/70 group-hover:text-primary transition-colors">Published</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dark dark:text-white/70">Order:</span>
                      <input 
                        type="number" 
                        value={editFormData.display_order} 
                        onChange={e => updateField('display_order', parseInt(e.target.value))}
                        className="w-12 p-1 bg-gray-50 dark:bg-white/5 border-none rounded text-dark dark:text-fontwhite text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ImageUpload
                label="Main Feature Image"
                value={editFormData.image}
                onChange={val => updateField('image', val)}
              />
            </div>
          </div>

          {/* Content Writing Section */}
          <div className="space-y-8 pt-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                <h4 className="font-bold text-secondary dark:text-primary">Opening Section</h4>
              </div>
              <div className="bg-white dark:bg-black/20 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Main Introduction Paragraph</label>
                <textarea 
                  value={editFormData.paragraph_1} 
                  onChange={e => updateField('paragraph_1', e.target.value)}
                  rows={8}
                  placeholder="The first paragraph is also shown in the blog list preview..."
                  className="w-full p-4 bg-transparent border-none outline-none text-dark dark:text-fontwhite leading-relaxed resize-y scrollbar-hide"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImageUpload label="Gallery Image 1" value={editFormData.image_1} onChange={val => updateField('image_1', val)} />
                <ImageUpload label="Gallery Image 2" value={editFormData.image_2} onChange={val => updateField('image_2', val)} />
                <ImageUpload label="Gallery Image 3" value={editFormData.image_3} onChange={val => updateField('image_3', val)} />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/5 pt-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                <h4 className="font-bold text-secondary dark:text-primary">Detailed Content</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider underline decoration-primary/30 underline-offset-4">Paragraph 2</label>
                    <textarea value={editFormData.paragraph_2} onChange={e => updateField('paragraph_2', e.target.value)} rows={6} className="w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-dark dark:text-fontwhite text-sm leading-relaxed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider underline decoration-primary/30 underline-offset-4">Paragraph 3</label>
                    <textarea value={editFormData.paragraph_3} onChange={e => updateField('paragraph_3', e.target.value)} rows={6} className="w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-dark dark:text-fontwhite text-sm leading-relaxed" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider underline decoration-primary/30 underline-offset-4">Paragraph 4</label>
                    <textarea value={editFormData.paragraph_4} onChange={e => updateField('paragraph_4', e.target.value)} rows={6} className="w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-dark dark:text-fontwhite text-sm leading-relaxed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider underline decoration-primary/30 underline-offset-4">Paragraph 5</label>
                    <textarea value={editFormData.paragraph_5} onChange={e => updateField('paragraph_5', e.target.value)} rows={6} className="w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-dark dark:text-fontwhite text-sm leading-relaxed" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 flex items-center gap-4 hover:border-primary/30 transition-all shadow-sm group">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/30 shrink-0">
                {blog.image ? (
                  <img src={blog.image.startsWith('/uploads') ? `${API_URL}${blog.image}` : blog.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={24} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${blog.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <h3 className="font-bold text-dark dark:text-fontwhite truncate">{blog.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/40">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(blog.posted_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 font-bold"><Eye size={12} /> {blog.is_active ? 'Published' : 'Draft'}</span>
                  <span>Order: {blog.display_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(blog)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(blog.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && <p className="text-center py-10 opacity-40 italic">No blog posts yet. Click "New Post" to start.</p>}
        </div>
      )}
    </div>
  );
}
