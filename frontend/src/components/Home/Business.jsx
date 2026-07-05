import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Business = () => {
  return (
    <section className="py-16 lg:py-24 bg-white" id="business">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Text & Link */}
          <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-start">
            <h2 className="text-midnight_text text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
              Make your business easy with FinSight<span className="text-primary">.</span>
            </h2>
            <p className="text-black/75 text-lg font-normal leading-relaxed pt-4 max-w-xl mx-auto lg:mx-0">
              Manage multi-entity cash positioning, automate invoice aging calculations, and execute atomic warehouse inventory transfers without manual errors.
            </p>
            <div className="pt-6">
              <Link
                to="/inventory"
                className="text-primary hover:text-blue-700 text-lg font-medium inline-flex items-center gap-2 pt-2 mx-auto lg:mx-0 group"
              >
                <span>Learn more</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Business Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-[600px] w-full">
              <img
                src="/images/business/business.png"
                alt="Business Management"
                className="w-full h-auto object-contain drop-shadow-xl hover:scale-[1.01] transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/hero/banner.png';
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Business;
