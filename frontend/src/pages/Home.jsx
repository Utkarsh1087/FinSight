import React from 'react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { Hero } from '../components/Home/Hero';
import { People } from '../components/Home/People';
import { Features } from '../components/Home/Features';
import { Business } from '../components/Home/Business';
import { Payment } from '../components/Home/Payment';
import { Pricing } from '../components/Home/Pricing';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <Header />
      <main>
        <Hero />
        <People />
        <Features />
        <Business />
        <Payment />
        <Pricing />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
