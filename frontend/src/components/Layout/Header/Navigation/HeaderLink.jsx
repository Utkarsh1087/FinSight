import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const HeaderLink = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const isHomePage = currentPath === '/' || currentPath === '/home';

  const handleMouseEnter = () => {
    if (item.submenu && item.submenu.length > 0) {
      setSubmenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setSubmenuOpen(false);
  };

  const isAnchor = item.href.startsWith('#');

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isAnchor ? (
        isHomePage ? (
          <a
            href={item.href}
            className="text-base sm:text-lg flex items-center gap-1 font-medium hover:text-primary transition-colors text-midnight_text"
          >
            {item.label}
          </a>
        ) : (
          <Link
            to={`/${item.href}`}
            className="text-base sm:text-lg flex items-center gap-1 font-medium hover:text-primary transition-colors text-midnight_text"
          >
            {item.label}
          </Link>
        )
      ) : (
        <Link
          to={item.href}
          className={`text-base sm:text-lg flex items-center gap-1 font-medium hover:text-primary transition-colors ${
            currentPath === item.href ? 'text-primary font-bold' : 'text-midnight_text'
          }`}
        >
          {item.label}
          {item.submenu && item.submenu.length > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.2em"
              height="1.2em"
              viewBox="0 0 24 24"
              className={`transition-transform duration-200 ${submenuOpen ? 'rotate-180 text-primary' : ''}`}
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m7 10l5 5l5-5"
              />
            </svg>
          )}
        </Link>
      )}

      {/* Dropdown Submenu */}
      {submenuOpen && item.submenu && (
        <div className="absolute py-2 left-0 mt-1 w-64 bg-white shadow-2xl rounded-2xl border border-slate-100/90 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.href}
              className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                currentPath === subItem.href
                  ? 'bg-primary text-white'
                  : 'text-[#001b50] hover:bg-slate-50 hover:text-primary'
              }`}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderLink;
