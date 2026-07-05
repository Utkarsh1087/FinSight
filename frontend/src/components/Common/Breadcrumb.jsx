import React from "react";
import { Link } from "react-router-dom";

export const Breadcrumb = ({ pageName, pageDescription }) => {
  return (
    <div className="relative z-10 overflow-hidden pb-[50px] pt-[120px] md:pt-[140px] lg:pt-[160px] bg-gradient-to-b from-[#d5f2ff] via-[#e5f5fd] to-transparent">
      <div className="from-stroke/0 via-slate-200 to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
      <div className="container mx-auto px-4">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4">
            <div className="text-center">
              <h1 className="text-[#001b50] mb-3 text-3xl font-bold sm:text-4xl md:text-[40px] md:leading-[1.2]">
                {pageName}
              </h1>
              {pageDescription && (
                <p className="text-black/60 mb-5 text-base max-w-xl mx-auto">
                  {pageDescription}
                </p>
              )}

              <ul className="flex items-center justify-center gap-[10px]">
                <li>
                  <Link
                    to="/"
                    className="text-[#001b50] hover:text-[#0057ff] flex items-center gap-[10px] text-sm font-semibold transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <p className="text-black/40 flex items-center gap-[10px] text-sm font-medium">
                    <span> / </span>
                    <span className="text-[#0057ff] font-semibold">{pageName}</span>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
