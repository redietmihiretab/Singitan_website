import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('sington_admin_token', data.token);
        navigate('/sington-cms-portal/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message.includes('fetch') ? 'Network error' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4 transition-colors duration-500">
      <div className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-none border border-transparent dark:border-white/10 w-full max-w-md transition-all duration-500">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block transition-opacity hover:opacity-80">
            <img src="/images/logo_horizontal.svg" alt="Sington" className="h-10 mx-auto mb-6 dark:hidden" />
            <img src="/images/logo_horizontal_light.svg" alt="Sington" className="h-10 mx-auto mb-6 hidden dark:block" />
          </Link>
          <h1 className="text-2xl font-bold text-dark dark:text-fontwhite">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30">{error}</div>}

          <div className="mb-5 relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
            <input
              type="text" autoFocus
              placeholder="Username" required
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-dark dark:text-fontwhite transition-all duration-500"
            />
          </div>

          <div className="mb-6 relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-11 pr-11 py-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary text-dark dark:text-fontwhite transition-all duration-500"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary
                       transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
