import React from "react";

export const HeroSub = ({ title }) => {
  return (
    <section className="py-24 sm:py-32 md:py-40 bg-herosub-bg bg-no-repeat bg-cover lg:mt-24 sm:mt-20 mt-16 text-center sm:text-start shadow-xl relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <h2 className="text-white md:text-56 text-36 font-extrabold tracking-tight">
          {title}
        </h2>
      </div>
    </section>
  );
};

export default HeroSub;
