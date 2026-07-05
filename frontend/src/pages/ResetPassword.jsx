import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { Logo } from '../components/Layout/Header/Logo';

export const ResetPassword = () => {
  const [data, setData] = useState({
    newPassword: '',
    reNewPassword: '',
  });
  const [loader, setLoader] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (data.newPassword !== data.reNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (data.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoader(true);
    setTimeout(() => {
      setLoader(false);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#edf5fc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Header />

      <main className="pt-36 pb-24 px-6 lg:px-12 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[525px] relative">
          
          <div className="relative mx-auto w-full overflow-hidden rounded-3xl bg-white px-8 py-14 text-center shadow-2xl shadow-blue-900/10 border border-slate-100 sm:px-12 md:px-[50px] z-10">
            
            {/* Top Logo */}
            <div className="mb-8 text-center">
              <div className="flex justify-center">
                <Logo />
              </div>
              <h2 className="text-2xl font-bold text-midnight_text mt-4">
                Set New Password
              </h2>
              <p className="text-xs sm:text-sm text-black/50 mt-1 max-w-xs mx-auto">
                Please enter and confirm your new secure account password.
              </p>
            </div>

            {submitted ? (
              <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-midnight_text">Password Updated!</h3>
                  <p className="text-xs text-black/60">
                    Your password has been successfully reset. Redirecting to sign in...
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-bold bg-primary hover:bg-blue-700 text-white transition-all shadow-md"
                >
                  Proceed to Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-start">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-midnight_text mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      name="newPassword"
                      value={data.newPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-5 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-midnight_text mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      name="reNewPassword"
                      value={data.reNewPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-5 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loader}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-primary bg-primary px-5 py-3.5 text-sm font-bold text-white transition duration-300 ease-in-out hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-98 disabled:opacity-70"
                >
                  {loader ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save New Password'
                  )}
                </button>
              </form>
            )}

            {/* Decorative Dotted Matrix SVGs */}
            <span className="absolute right-2 top-2 opacity-30 pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="1.4" cy="38.6" r="1.4" fill="#3056D3" />
                <circle cx="1.4" cy="2" r="1.4" fill="#3056D3" />
                <circle cx="13.7" cy="38.6" r="1.4" fill="#3056D3" />
                <circle cx="13.7" cy="2" r="1.4" fill="#3056D3" />
                <circle cx="26" cy="38.6" r="1.4" fill="#3056D3" />
                <circle cx="26" cy="2" r="1.4" fill="#3056D3" />
                <circle cx="38.3" cy="38.6" r="1.4" fill="#3056D3" />
                <circle cx="38.3" cy="2" r="1.4" fill="#3056D3" />
                <circle cx="1.4" cy="26.3" r="1.4" fill="#3056D3" />
                <circle cx="13.7" cy="26.3" r="1.4" fill="#3056D3" />
                <circle cx="26" cy="26.3" r="1.4" fill="#3056D3" />
                <circle cx="38.3" cy="26.3" r="1.4" fill="#3056D3" />
                <circle cx="1.4" cy="14" r="1.4" fill="#3056D3" />
                <circle cx="13.7" cy="14" r="1.4" fill="#3056D3" />
                <circle cx="26" cy="14" r="1.4" fill="#3056D3" />
                <circle cx="38.3" cy="14" r="1.4" fill="#3056D3" />
              </svg>
            </span>

            <span className="absolute bottom-2 left-2 opacity-30 pointer-events-none">
              <svg width="29" height="40" viewBox="0 0 29 40" fill="none">
                <circle cx="2.3" cy="26" r="1.4" fill="#3056D3" />
                <circle cx="14.6" cy="26" r="1.4" fill="#3056D3" />
                <circle cx="26.7" cy="26" r="1.4" fill="#3056D3" />
                <circle cx="2.3" cy="13.7" r="1.4" fill="#3056D3" />
                <circle cx="14.6" cy="13.7" r="1.4" fill="#3056D3" />
                <circle cx="26.7" cy="13.7" r="1.4" fill="#3056D3" />
                <circle cx="2.3" cy="38" r="1.4" fill="#3056D3" />
                <circle cx="2.3" cy="1.4" r="1.4" fill="#3056D3" />
                <circle cx="14.6" cy="38" r="1.4" fill="#3056D3" />
                <circle cx="26.7" cy="38" r="1.4" fill="#3056D3" />
                <circle cx="14.6" cy="1.4" r="1.4" fill="#3056D3" />
                <circle cx="26.7" cy="1.4" r="1.4" fill="#3056D3" />
              </svg>
            </span>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
