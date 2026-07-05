import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Header/Logo';
import { HeaderLink } from './Header/Navigation/HeaderLink';
import { MobileHeaderLink } from './Header/Navigation/MobileHeaderLink';
import { headerData } from './Header/Navigation/menuData';
import { SignInModal } from '../Auth/SignInModal';
import { SignUpModal } from '../Auth/SignUpModal';
import { ArrowRight, X } from 'lucide-react';

export const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const mobileMenuRef = useRef(null);

  const handleScroll = () => {
    setSticky(window.scrollY >= 50);
  };

  const handleClickOutside = (event) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target) &&
      navbarOpen
    ) {
      setNavbarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navbarOpen, isSignInOpen, isSignUpOpen]);

  useEffect(() => {
    if (isSignInOpen || isSignUpOpen || navbarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSignInOpen, isSignUpOpen, navbarOpen]);

  return (
    <header
      className={`z-40 w-full transition-all fixed top-0 duration-300 ${
        sticky
          ? 'shadow-lg bg-white/95 backdrop-blur-md py-4 md:py-5'
          : 'shadow-none bg-transparent py-5 md:py-6'
      }`}
    >
      <div className="lg:py-0 py-1">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Logo */}
          <Logo />

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex grow items-center gap-8 justify-start md:ml-16">
            {headerData.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="hidden lg:flex items-center gap-2 bg-primary text-white border-2 border-primary hover:bg-blue-700 px-8 py-3 rounded-full font-bold text-base shadow-lg shadow-blue-600/25 transition-all active:scale-95"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden lg:inline-flex items-center justify-center bg-transparent text-primary border-2 hover:bg-primary border-primary hover:text-white px-8 py-3 rounded-full font-semibold text-base transition-all active:scale-95"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="hidden lg:inline-flex items-center justify-center bg-primary text-white hover:bg-transparent hover:text-primary border-2 border-primary px-8 py-3 rounded-full font-semibold text-base shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="block lg:hidden p-2 rounded-lg text-midnight_text focus:outline-hidden"
              aria-label="Toggle mobile menu"
            >
              <span className="block w-6 h-0.5 bg-black"></span>
              <span className="block w-6 h-0.5 bg-black mt-1.5"></span>
              <span className="block w-6 h-0.5 bg-black mt-1.5"></span>
            </button>
          </div>

        </div>

        {/* Mobile Backdrop */}
        {navbarOpen && (
          <div className="fixed inset-0 w-full h-full bg-black/50 z-40 backdrop-blur-xs" />
        )}

        {/* Mobile Slide-in Drawer */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-2xl transform transition-transform duration-300 max-w-xs ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-50 flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <Logo />
              <button
                onClick={() => setNavbarOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-black hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col items-start p-5 space-y-2">
              {headerData.map((item, index) => (
                <MobileHeaderLink
                  key={index}
                  item={item}
                  onNavigate={() => setNavbarOpen(false)}
                />
              ))}
            </nav>
          </div>

          <div className="p-5 border-t border-slate-100 flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setNavbarOpen(false)}
                className="w-full text-center bg-primary text-white py-3 rounded-full font-bold text-sm shadow-md"
              >
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setNavbarOpen(false)}
                  className="w-full text-center bg-transparent border-2 border-primary text-primary py-2.5 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setNavbarOpen(false)}
                  className="w-full text-center bg-primary text-white py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Modal Dialogs */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
      />
    </header>
  );
};

export default Header;
