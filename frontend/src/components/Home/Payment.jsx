import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Payment = () => {
  return (
    <section className="py-16 lg:py-24 bg-white" id="payment">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Illustration Column */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-[560px] w-full">
              <img
                src="/images/payment/payment.png"
                alt="Payment Settlement & Reconciliation"
                className="w-full h-auto object-contain drop-shadow-xl hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/features/dollar.svg';
                }}
              />
            </div>
          </div>

          {/* Text Content Column */}
          <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-start">
            <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-2">
              Next-Gen Settlements
            </span>
            <h2 className="text-midnight_text text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Now it&#39;s time to modernize reconciliation & payment pipelines.
            </h2>
            <p className="text-black/75 text-base sm:text-lg font-normal leading-relaxed pt-4 max-w-xl mx-auto lg:mx-0">
              Transform slow manual matching into an automated, deterministic 3-pass reconciliation pipeline. Eliminate integer-cent rounding discrepancies and sync ledgers instantly with real-time audit protection.
            </p>
            <div className="pt-6">
              <Link
                to="/reconciliation"
                className="text-primary hover:text-blue-700 text-lg font-bold inline-flex items-center gap-2 transition-colors mx-auto lg:mx-0 group"
              >
                <span>Explore Reconciliation Engine</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Payment;
