import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleSocialClick = (provider) => {
    setError(`Direct ${provider} SSO authentication requires enterprise SAML setup. Please sign in with your corporate email and password.`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col lg:flex-row">
      
      {/* LEFT COLUMN: Clean Form Panel (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen">
        <div>
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/60 hover:text-primary transition-colors mb-10"
          >
            <ChevronLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-midnight_text tracking-tight">
                Sign In
              </h1>
              <p className="text-xs sm:text-sm text-black/50">
                Enter your registered email and password to sign in!
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Social Sign In Button (Google) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-[#f4f7fb] hover:bg-slate-200/80 border border-slate-200/60 text-xs font-bold text-midnight_text transition-all cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-xs text-slate-400 font-medium absolute">Or</span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1.5">
                  Email<span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-midnight_text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1.5">
                  Password<span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-xs text-midnight_text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Keep me logged in & Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me logged in</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl text-sm font-bold bg-[#4361ee] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-3">
              <span className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-primary hover:underline">
                  Sign Up
                </Link>
              </span>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 mt-6">
          © 2026 FinSight Platform. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Midnight Navy Branding Box (50%) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#001b50] relative flex-col items-center justify-center p-12 text-center overflow-hidden">
        
        {/* Subtle Geometric Grid Lines Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #6493ea 1px, transparent 1px), linear-gradient(to bottom, #6493ea 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Radial Glow */}
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md space-y-4">
          
          {/* Logo Badge */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-3 shadow-2xl shadow-blue-500/30">
              <img
                src="/images/logo/icon.svg"
                alt="FinSight"
                className="w-full h-full object-contain filter brightness-0 invert"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/features/signal.svg';
                }}
              />
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              FinSight<span className="text-blue-400">.</span>
            </h2>
          </div>

          <p className="text-sm text-white/70 font-normal leading-relaxed pt-2">
            Enterprise-grade finance operations, 3-pass automated bank reconciliation, and multi-warehouse stock ledgers.
          </p>

          <div className="pt-8 flex items-center justify-center gap-6 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOC 2 Type II
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOX 404 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Integer-Cents Match
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
