import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SocialSignUp } from './SocialSignUp';
import { Logo } from '../Layout/Header/Logo';

export const SignUpModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    role: 'FINANCE_USER',
    department: 'Finance Operations',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(formData);
    if (res.success) {
      onClose();
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white px-8 pt-12 pb-8 text-center shadow-2xl border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-all"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-start">
            {error}
          </div>
        )}

        {/* Social Sign Up */}
        <div className="mb-4">
          <SocialSignUp />
        </div>

        {/* Divider */}
        <div className="relative my-4 block text-center before:content-[''] before:absolute before:h-px before:w-[38%] before:bg-slate-200 before:left-0 before:top-2.5 after:content-[''] after:absolute after:h-px after:w-[38%] after:bg-slate-200 after:top-2.5 after:right-0">
          <span className="relative z-10 inline-block px-2 text-[11px] font-bold text-slate-400 bg-white">
            OR REGISTER
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-start">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="Work Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                    username: e.target.value.split('@')[0],
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
              >
                <option value="FINANCE_USER">Finance User</option>
                <option value="ADMIN">Administrator</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-1"
          >
            {loading ? 'Creating...' : 'Create Account'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-black/60">
          Already have an account?{' '}
          <Link
            to="/login"
            onClick={onClose}
            className="text-primary font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUpModal;
