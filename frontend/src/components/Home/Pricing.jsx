import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

const pricingPlans = [
  {
    heading: 'Lite',
    role: 'ADMIN',
    price: {
      monthly: 19,
      yearly: 190,
    },
    subscriber: 0.5,
    button: 'Start free trial',
    isComingSoon: false,
    option: [
      'Basic invoice generation',
      'Downloadable PDF invoice',
      'Unlimited transactions',
      'Emails for all the updates',
    ],
    category: ['monthly', 'yearly'],
    imgSrc: '/images/pricing/starone.svg',
  },
  {
    heading: 'Basic',
    role: 'FINANCE_USER',
    price: {
      monthly: 29,
      yearly: 290,
    },
    subscriber: 0.5,
    button: 'Coming Soon',
    isComingSoon: true,
    option: [
      'All Lite features',
      'Custom invoice templates',
      'Tax calculation support',
      'Automatic invoice reminders',
    ],
    category: ['monthly', 'yearly'],
    imgSrc: '/images/pricing/startwo.svg',
  },
  {
    heading: 'Plus',
    role: 'ADMIN',
    price: {
      monthly: 59,
      yearly: 590,
    },
    subscriber: 0.5,
    button: 'Coming Soon',
    isComingSoon: true,
    option: [
      'All Basic features',
      'Multi-currency support',
      'Invoice payment tracking',
      'Priority customer support',
    ],
    category: ['monthly', 'yearly'],
    imgSrc: '/images/pricing/starthree.svg',
  },
];

export const Pricing = () => {
  const [selectedCategory, setSelectedCategory] = useState('yearly');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePlanAction = (item) => {
    if (item.isComingSoon) return;
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const filteredData = pricingPlans.filter((item) =>
    item.category.includes(selectedCategory)
  );

  return (
    <section id="pricing" className="bg-header relative py-24 overflow-hidden">
      {/* Decorative Upper & Lower Vector Lines */}
      <img
        src="/images/pricing/upperline.png"
        alt="upperline"
        className="absolute top-[140px] left-[60px] hidden lg:block opacity-60 pointer-events-none"
        onError={(e) => (e.target.style.display = 'none')}
      />
      <img
        src="/images/pricing/lowerline.png"
        alt="lowerline"
        className="absolute bottom-[20px] right-[60px] hidden lg:block opacity-60 pointer-events-none"
        onError={(e) => (e.target.style.display = 'none')}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <h3 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold text-midnight_text tracking-tight">
          Our Pricing Plan<span className="text-primary">.</span>
        </h3>

        <p className="text-base sm:text-lg font-normal text-center text-black/60 pt-4 max-w-2xl mx-auto leading-relaxed">
          Transparent, enterprise-ready plans for corporate treasury, automated multi-pass ledger reconciliation, and compliance audit teams.
        </p>

        {/* Yearly/Monthly Toggle Pill */}
        <div className="mt-8 relative">
          <div className="flex justify-center">
            <div className="bg-deepSlate flex py-1.5 px-1.5 rounded-full shadow-lg">
              <button
                type="button"
                className={`text-sm sm:text-lg font-bold transition-all duration-300 rounded-full cursor-pointer ${
                  selectedCategory === 'yearly'
                    ? 'text-primary bg-white shadow-md py-2.5 px-6 sm:py-3.5 sm:px-14'
                    : 'text-white hover:text-white/80 py-2.5 px-6 sm:py-3.5 sm:px-14'
                }`}
                onClick={() => setSelectedCategory('yearly')}
              >
                Yearly
              </button>
              <button
                type="button"
                className={`text-sm sm:text-lg font-bold transition-all duration-300 rounded-full cursor-pointer ${
                  selectedCategory === 'monthly'
                    ? 'text-primary bg-white shadow-md py-2.5 px-6 sm:py-3.5 sm:px-14'
                    : 'text-white hover:text-white/80 py-2.5 px-6 sm:py-3.5 sm:px-14'
                }`}
                onClick={() => setSelectedCategory('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-16 gap-8">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="pt-10 pb-24 px-8 sm:px-10 bg-white rounded-3xl shadow-xl shadow-blue-900/5 relative cursor-pointer hover:bg-primary group transition-all duration-300 border border-slate-100 hover:scale-[1.02] overflow-hidden"
            >
              {/* Star Vector SVG in Corner */}
              <img
                src={item.imgSrc}
                alt="star-vector"
                className="absolute bottom-0 right-0 w-36 h-36 opacity-90 pointer-events-none group-hover:opacity-40 transition-opacity"
                onError={(e) => (e.target.style.display = 'none')}
              />

              <div className="flex items-center justify-between mb-6">
                <h4 className="text-3xl sm:text-4xl font-extrabold text-midnight_text group-hover:text-white transition-colors">
                  {item.heading}
                </h4>
                {item.isComingSoon && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 group-hover:bg-white group-hover:text-primary transition-colors">
                    Coming Soon
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePlanAction(item)}
                disabled={item.isComingSoon}
                className={`text-base sm:text-lg font-bold w-full rounded-full py-3.5 px-8 mb-6 shadow-md transition-all ${
                  item.isComingSoon
                    ? 'bg-slate-200 text-slate-600 group-hover:bg-white/20 group-hover:text-white border-2 border-transparent cursor-not-allowed opacity-90'
                    : 'text-white bg-primary group-hover:bg-deepSlate border-2 border-primary group-hover:border-deepSlate active:scale-95 cursor-pointer'
                }`}
              >
                {item.button}
              </button>

              <h2 className="text-4xl sm:text-5xl font-black text-midnight_text mb-2 group-hover:text-white transition-colors">
                $
                {selectedCategory === 'monthly'
                  ? item.price.monthly
                  : item.price.yearly}
                /<span className="text-slate-400 group-hover:text-white/70 text-2xl font-normal">mo</span>
              </h2>

              <p className="text-base font-semibold text-black group-hover:text-white transition-colors">
                ${item.subscriber}
                <span>/ Subscriber</span>
              </p>
              <p className="text-sm font-normal text-black/50 mb-6 group-hover:text-white/70 transition-colors">
                (per subscriber per month)
              </p>

              {/* Plan Features with Green Circle-Check Icons */}
              <div className="mt-6 space-y-3.5 border-t border-slate-100 group-hover:border-white/20 pt-6">
                {item.option.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 group-hover:text-emerald-300 transition-colors" />
                    <p className="text-sm sm:text-base font-medium text-black/70 group-hover:text-white/90 transition-colors">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;
