import React from 'react';

export const People = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      
      {/* Background Decorative Graphic */}
      <img
        src="/images/people/bg-lines.png"
        alt="bg-lines"
        className="absolute top-0 right-0 w-1/3 opacity-30 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative">
              <img
                src="/images/people/testimony.png"
                alt="FinSight Customer Testimonial"
                className="w-full max-w-[480px] h-auto object-contain drop-shadow-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/hero/banner.png';
                }}
              />
            </div>
          </div>

          {/* Right Column: Quote & Testimonial */}
          <div className="lg:col-span-6 space-y-6">
            <img
              src="/images/people/quote.png"
              alt="quote"
              width={60}
              height={50}
              className="opacity-80"
            />

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#001b50] leading-[1.2] tracking-tight">
              Trusted by fast-growing finance operations teams.
            </h2>

            <p className="text-black/70 text-base sm:text-lg leading-relaxed font-normal">
              "FinSight automated our entire month-end close and bank cash reconciliation. What used to take our accounting team 4 days now completes in under 15 minutes with complete $0.00 mathematical proof."
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                <img
                  src="/images/people/user.png"
                  alt="Finance Controller"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-base text-[#001b50]">Sarah Jenkins</div>
                <div className="text-xs font-medium text-black/50">Head of Treasury & Accounting, North America</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default People;
