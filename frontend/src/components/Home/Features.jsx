import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { featureData } from '../../data/homeData';

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-[#edf5fc]">
      <div className="container">
        
        {/* Section Header */}
        <h2 className="text-4xl sm:text-5xl font-semibold text-midnight_text text-center mb-6 tracking-tight">
          Amazing Features<span className="text-primary">.</span>
        </h2>
        <p className="text-black/60 text-lg text-center max-w-[70%] mx-auto leading-relaxed">
          Engineered for modern financial operations to automate cash reconciliation, track overdue aging, and enforce internal compliance.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-6 lg:gap-x-8 mt-12">
          {featureData.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 shadow-featureShadow border border-slate-100/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.imgSrc}
                  alt={item.heading}
                  width={55}
                  height={55}
                  className="mb-4 object-contain"
                />
                
                <h3 className="text-2xl font-semibold text-black mt-4 mb-2">
                  {item.heading}
                </h3>
                
                <h4 className="text-base text-black/50 leading-relaxed font-normal my-2">
                  {item.paragraph}
                </h4>
              </div>

              <Link
                to={item.link || '/dashboard'}
                className="text-primary hover:text-blue-700 text-lg font-medium flex items-center gap-2 mt-8 pb-1 group"
              >
                Learn more
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
