import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Header/Logo';

const socialLinks = [
  {
    imgSrc: '/images/footer/facebook.svg',
    name: 'Facebook',
    link: '#',
  },
  {
    imgSrc: '/images/footer/instagram.svg',
    name: 'Instagram',
    link: '#',
  },
  {
    imgSrc: '/images/footer/twitter.svg',
    name: 'Twitter',
    link: '#',
  },
];

const navLinks = [
  { link: 'Product', href: '#features' },
  { link: 'Pricing', href: '#pricing' },
  { link: 'Features', href: '#features' },
  { link: 'Docs', href: '/documentation' },
];

export const Footer = () => {
  return (
    <footer className="bg-midnight_text">
      <div className="mx-auto max-w-2xl pt-4 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        
        {/* Main Grid */}
        <div className="my-12 grid grid-cols-1 gap-y-10 sm:grid-cols-6 lg:grid-cols-12 items-center">
          
          {/* COLUMN-1: Logo */}
          <div className="sm:col-span-6 lg:col-span-3">
            <Logo white={true} />
          </div>

          {/* COLUMN-2: Nav Links */}
          <div className="sm:col-span-6 lg:col-span-5 flex items-center">
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {navLinks.map((item, i) => (
                item.href.startsWith('#') ? (
                  <a
                    key={i}
                    href={item.href}
                    className="text-lg font-normal text-white hover:text-primary transition-colors flex items-center justify-center"
                  >
                    {item.link}
                  </a>
                ) : (
                  <Link
                    key={i}
                    to={item.href}
                    className="text-lg font-normal text-white hover:text-primary transition-colors flex items-center justify-center"
                  >
                    {item.link}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* COLUMN-3: Social Media Links */}
          <div className="sm:col-span-6 lg:col-span-4">
            <div className="flex gap-4 lg:justify-end">
              {socialLinks.map((item, i) => (
                <a
                  href={item.link}
                  key={i}
                  aria-label={item.name}
                  className="bg-white/20 h-12 w-12 shadow-xl rounded-full flex items-center justify-center p-3 text-white hover:bg-white hover:brightness-0 transition-all duration-300"
                >
                  <img
                    src={item.imgSrc}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 pb-10 lg:flex items-center justify-between border-t border-t-white/20">
          <h4 className="text-base sm:text-lg text-center md:text-start font-normal text-white opacity-70">
            © 2026. All rights reserved by{' '}
            <span className="text-white font-semibold">
              FinSight Platform
            </span>
          </h4>

          <div className="flex gap-5 mt-6 lg:mt-0 justify-center md:justify-start items-center">
            <Link
              to="/privacy-policy"
              className="opacity-70 hover:opacity-100 text-base sm:text-lg font-normal text-white transition-opacity"
            >
              Privacy policy
            </Link>
            <div className="h-4 bg-white opacity-40 w-0.5"></div>
            <Link
              to="/terms-and-conditions"
              className="opacity-70 hover:opacity-100 text-base sm:text-lg font-normal text-white transition-opacity"
            >
              Terms & conditions
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
