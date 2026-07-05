import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MagicLink = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Simulate sending magic link & log in as standard user in test mode
    setTimeout(async () => {
      setLoading(false);
      setSent(true);
      // Auto-authenticate with quick demo login as Finance User after a short delay
      setTimeout(async () => {
        await quickDemoLogin('FINANCE_USER');
        navigate('/dashboard');
      }, 1200);
    }, 800);
  };

  if (sent) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3 animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#001b50]">Magic Link Verified!</h4>
          <p className="text-xs text-emerald-700 mt-1">
            Logging in with email <span className="font-mono font-bold">{email}</span>...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 text-start">
        <label className="block text-xs font-semibold text-[#001b50]">
          Work Email
        </label>
        <input
          type="email"
          placeholder="your.email@company.com"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-primary bg-[#102C46] px-5 py-3.5 text-sm font-bold text-white transition duration-300 ease-in-out hover:bg-[#001b50] shadow-md active:scale-98 disabled:opacity-70"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" /> Send Magic Link
          </>
        )}
      </button>
    </form>
  );
};

export default MagicLink;
