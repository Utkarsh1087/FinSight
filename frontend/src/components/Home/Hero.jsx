import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="bg-header relative pt-24 sm:pt-28 md:pt-36 pb-14 lg:pb-20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 flex flex-col justify-evenly relative z-10">
            
            {/* Star Decorative Vector */}
            <img
              src="/images/hero/star.svg"
              alt="star-image"
              width={95}
              height={97}
              className="absolute -top-[70px] sm:-top-[82px] right-[25px] sm:right-[45px] md:right-[60px] w-16 sm:w-20 md:w-24 pointer-events-none select-none"
            />
            {/* Curved Line Vector */}
            <img
              src="/images/hero/lineone.svg"
              alt="line-image"
              width={190}
              height={148}
              className="absolute -top-[80px] sm:-top-[94px] right-[25px] sm:right-[45px] md:right-[60px] w-32 sm:w-40 md:w-48 pointer-events-none select-none opacity-80"
            />
            
            {/* Headline */}
            <h1 className="text-midnight_text text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[82px] text-center lg:text-start font-bold leading-[1.08] pt-4 tracking-tight">
              Put an end to unpaid invoices<span className="text-primary">.</span>
            </h1>

            {/* Subtitle */}
            <h3 className="text-black/75 text-base sm:text-lg font-normal text-center lg:text-start pt-5 max-w-xl leading-relaxed">
              Automate bank-to-GL cash matching, accounts payable aging, multi-warehouse stock ledgers, and fraud prevention with an integer-cents deterministic engine.
            </h3>

            {/* CTA Button */}
            <div className="pt-7 mx-auto lg:mx-0">
              <button
                type="button"
                onClick={handleGetStarted}
                className="text-white text-lg sm:text-xl font-medium py-4.5 px-11 rounded-full transition duration-300 border border-primary bg-primary hover:bg-transparent hover:text-primary shadow-xl shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                Get started
              </button>
            </div>
          </div>

          {/* Right Column: Hero Banner Image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end xl:-mr-8 pt-4 lg:pt-0 relative z-10">
            <div className="w-full max-w-[600px] lg:max-w-none lg:w-[110%] xl:w-[118%] transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/images/hero/banner.png"
                alt="FinSight Operations Banner"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
