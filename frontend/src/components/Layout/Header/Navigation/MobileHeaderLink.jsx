import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const MobileHeaderLink = ({ item, onNavigate }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const isHomePage = currentPath === '/' || currentPath === '/home';

  const handleToggle = (e) => {
    if (item.submenu && item.submenu.length > 0) {
      e.preventDefault();
      setSubmenuOpen(!submenuOpen);
    } else if (onNavigate) {
      onNavigate();
    }
  };

  const isAnchor = item.href.startsWith("#");

  return (
    <div className="relative w-full border-b border-slate-100/60 pb-1">
      {isAnchor ? (
        isHomePage ? (
          <a
            href={item.href}
            onClick={onNavigate}
            className="flex items-center justify-between w-full py-2 text-base font-semibold text-midnight_text hover:text-primary transition-colors focus:outline-hidden"
          >
            {item.label}
          </a>
        ) : (
          <Link
            to={`/${item.href}`}
            onClick={onNavigate}
            className="flex items-center justify-between w-full py-2 text-base font-semibold text-midnight_text hover:text-primary transition-colors focus:outline-hidden"
          >
            {item.label}
          </Link>
        )
      ) : (
        <Link
          to={item.href}
          onClick={handleToggle}
          className="flex items-center justify-between w-full py-2 text-base font-semibold text-midnight_text hover:text-primary transition-colors focus:outline-hidden"
        >
          <span>{item.label}</span>
          {item.submenu && item.submenu.length > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.3em"
              height="1.3em"
              viewBox="0 0 24 24"
              className={`transition-transform duration-200 ${submenuOpen ? "rotate-180 text-primary" : ""}`}
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m7 10l5 5l5-5"
              />
            </svg>
          )}
        </Link>
      )}

      {submenuOpen && item.submenu && (
        <div className="bg-slate-50 rounded-xl p-2 w-full mt-1 space-y-1">
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.href}
              onClick={onNavigate}
              className="block py-2 px-3 rounded-lg text-sm text-slate-700 hover:bg-white hover:text-primary font-medium"
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileHeaderLink;
