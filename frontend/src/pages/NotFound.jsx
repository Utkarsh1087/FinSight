import React from 'react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { HeroSub } from '../components/SharedComponent/HeroSub';
import { NotFoundContent } from '../components/NotFound';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        <HeroSub title="404" description="Page Not Found" />
        <NotFoundContent />
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
