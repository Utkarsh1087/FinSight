import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ white = false }) => {
  return (
    <Link to="/" className="inline-flex items-center gap-3 group select-none">
      {/* FinSight Icon Symbol */}
      <img
        src="/images/logo/icon.svg"
        alt="FinSight Logo"
        width={38}
        height={38}
        className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
      />
      {/* FinSight Brand Text */}
      <span className={`font-extrabold text-2xl sm:text-[26px] tracking-tight ${white ? 'text-white' : 'text-midnight_text'}`}>
        FinSight<span className="text-primary">.</span>
      </span>
    </Link>
  );
};

export default Logo;
