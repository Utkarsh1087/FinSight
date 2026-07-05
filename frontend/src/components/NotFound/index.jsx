import React from "react";
import { Link } from "react-router-dom";

export const NotFoundContent = () => {
  return (
    <section className="bg-white pt-8 pb-20">
      <div className="container mx-auto px-4">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 md:w-5/12 lg:w-6/12">
            <div className="relative mx-auto aspect-129/138 max-w-[357px] text-center">
              <img
                src="/images/404.svg"
                alt="404 Page Not Found"
                className="mx-auto max-w-full h-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/features/signal.svg';
                }}
              />
            </div>
          </div>

          <div className="w-full px-4 md:w-7/12 lg:w-6/12 xl:w-5/12 text-start">
            <div>
              <h2 className="text-6xl sm:text-7xl font-extrabold text-primary mb-3">
                404
              </h2>
              <h3 className="mb-4 text-2xl sm:text-3xl font-bold text-[#001b50]">
                We Can&#39;t Seem to Find The Page You&#39;re Looking For.
              </h3>
              <p className="mb-8 text-base text-black/60 leading-relaxed">
                Oops! The page you are looking for does not exist. It might have
                been moved or deleted.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 bg-primary shadow-lg shadow-blue-500/25 active:scale-95"
              >
                Go To Home →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundContent;
