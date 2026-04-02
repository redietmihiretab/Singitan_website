import { useState, useRef } from 'react';
import { User, Mail, MessageSquare } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

import { API_URL } from '../config';

const NAME_REGEX = /^[a-zA-Z\s\-']{3,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MSG_RESTRICT = /[<>{}[\]]/;

function validate({ name, email, message }) {
  if (!NAME_REGEX.test(name.trim())) return 'Please enter a valid full name (3–50 letters).';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  const msg = message.trim();
  if (msg.length < 20 || msg.length > 500) return 'Message must be between 20 and 500 characters.';
  if (MSG_RESTRICT.test(msg)) return 'Message contains invalid characters.';
  return null;
}

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text: string }
  const [loading, setLoading] = useState(false);
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const headerY = useTransform(smoothProgress, [0, 1], [50, 0]);
  const headerOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const formY = useTransform(smoothProgress, [0, 1], [150, 0]);
  const formOpacity = useTransform(smoothProgress, [0, 0.8], [0, 1]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(null);

    const err = validate(form);
    if (err) return setStatus({ type: 'error', text: err });

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', text: data.message });
        setForm({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.message.includes('fetch')
          ? 'Network error. Please check your connection.'
          : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full border border-lightblack/20 dark:border-white/10 rounded-lg py-3.5 pl-11 pr-4
                      text-base outline-none focus:border-primary focus:ring-2
                      focus:ring-primary/20 transition-all duration-200 bg-white dark:bg-white/5 dark:text-fontwhite`;

  return (
    <section ref={targetRef} id="contact" className="py-20 scroll-mt-20 overflow-hidden transition-colors duration-500">
      <div className="section-container">
        <motion.div style={{ y: headerY, opacity: headerOpacity }}>
          <h2 className="section-title text-black dark:text-fontwhite transition-colors duration-500">Send Us a Message</h2>
        </motion.div>

        <motion.div
          style={{ y: formY, opacity: formOpacity }}
          className="mt-8 max-w-2xl"
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white dark:bg-white/5 backdrop-blur-md border border-secondary dark:border-white/10 rounded-2xl p-8 md:p-10
                       shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Name */}
            <div className="mb-5">
              <label htmlFor="name" className="block text-darkblack dark:text-fontwhite font-medium mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleChange}
                  placeholder="Enter your full name"
                  minLength={3} maxLength={50} required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-darkblack dark:text-fontwhite font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-darkblack dark:text-fontwhite font-medium mb-1.5">
                Your Message
              </label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3.5 top-4 text-primary" />
                <textarea
                  id="message" name="message"
                  value={form.message} onChange={handleChange}
                  placeholder="Type your message here…"
                  minLength={20} maxLength={500} required
                  rows={5}
                  className={`${inputClass} pt-4 pl-11 resize-y min-h-[130px]`}
                />
              </div>
              <p className="text-xs text-lightblack dark:text-fontwhite/50 mt-1 text-right">
                {form.message.length}/500
              </p>
            </div>

            {/* Status */}
            {status && (
              <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium text-center
                ${status.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'}`}
              >
                {status.text}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-gradient-to-r from-primary to-secondary text-white
                           font-semibold rounded-xl text-base transition-all duration-300
                           hover:-translate-y-1 hover:shadow-lg disabled:opacity-60
                           disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
