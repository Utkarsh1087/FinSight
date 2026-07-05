import React from "react";
import { Link } from "react-router-dom";

export const Volunteer = ({
  title = "Partner with FinSight Engineering",
  description = "Join our open financial systems developer community. Build custom ERP connector integrations, automate accounting pipelines, and shape modern treasury standards.",
  buttonText = "Join Developer Hub",
  buttonLink = "/documentation"
}) => {
  return (
    <section className="py-20 sm:py-28 bg-herosub-bg bg-no-repeat bg-cover text-white relative overflow-hidden">
      {/* Decorative Gradient Background Highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-300 block mb-3">
            Open Ecosystem & Community
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex justify-center">
            <Link
              to={buttonLink}
              className="text-white font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-white hover:to-white hover:text-[#001b50] px-8 py-3.5 rounded-full shadow-xl shadow-blue-900/30 transition-all duration-300 active:scale-95 border border-white/20"
            >
              {buttonText} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Volunteer;
