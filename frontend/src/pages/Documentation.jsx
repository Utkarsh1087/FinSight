import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const MODULE_DOCS = [
  {
    id: 'reconciliation',
    title: '3-Pass Reconciliation Engine',
    badge: 'Core Engine',
    imgSrc: '/images/features/signal.svg',
    summary: 'Deterministic Integer-Cents multi-currency transaction matching and break resolution pipeline.',
    steps: [
      {
        num: '01',
        title: 'Pass 1 — Exact Match (100% Confidence)',
        desc: 'Matches bank transactions with internal GL entries where amount (integer cents), currency, and reference ID match with zero settlement delay.',
      },
      {
        num: '02',
        title: 'Pass 2 — Settlement Lag Match (±3 Business Days)',
        desc: 'Identifies credit card and ACH pipeline delays where transaction amounts match exactly but bank posting date has a multi-day settlement delta.',
      },
      {
        num: '03',
        title: 'Pass 3 — Tolerance & Multi-Split Match',
        desc: 'Detects micro-cent bank processing fees or split batch invoices within configured tolerance thresholds (e.g. ±$0.05).',
      },
      {
        num: '04',
        title: 'Break Resolution & Maker-Checker Journaling',
        desc: 'Unmatched breaks are ranked by risk score. Adjustments above threshold require dual maker-checker authorization before ledger posting.',
      },
    ],
    ctaText: 'Open Reconciliation Workspace',
    ctaLink: '/reconciliation',
  },
  {
    id: 'invoices',
    title: 'Accounts Payable & Receivable Aging',
    badge: 'Ledgers & Cashflow',
    imgSrc: '/images/features/dollar.svg',
    summary: 'Automated invoice lifecycle tracking, days-overdue buckets, and settlement management.',
    steps: [
      {
        num: '01',
        title: 'Dynamic Aging Ledger Buckets',
        desc: 'Invoices are dynamically calculated and categorized into aging buckets: Current, 1-30 Days, 31-60 Days, 61-90 Days, and 90+ Days.',
      },
      {
        num: '02',
        title: 'Invoice Lifecycle Management',
        desc: 'Track invoice states seamlessly from Draft → Issued → Partially Paid → Paid / Overdue with instant telemetry sync.',
      },
      {
        num: '03',
        title: 'Disbursement & Cash Matching',
        desc: 'Record partial or full disbursements with real-time balance reduction and automatic GL reconciliation ledger triggers.',
      },
    ],
    ctaText: 'Open Invoices & Aging',
    ctaLink: '/invoices',
  },
  {
    id: 'inventory',
    title: 'Multi-Warehouse Inventory Valuation',
    badge: 'Supply Chain',
    imgSrc: '/images/features/time.svg',
    summary: 'Global multi-facility stock management across India, USA, and Germany with atomic ledger transfers.',
    steps: [
      {
        num: '01',
        title: 'Global Facility Nodes',
        desc: 'Manage discrete inventory pools across Mumbai (India), Delaware (USA), and Frankfurt (Germany).',
      },
      {
        num: '02',
        title: 'Atomic Inter-Warehouse Transfers',
        desc: 'Moving stock between warehouses automatically logs debit/credit in-transit entries to maintain continuous balance sheet auditability.',
      },
      {
        num: '03',
        title: 'Weighted Average Valuation',
        desc: 'Calculates real-time unit valuations and flags low-stock or negative inventory triggers across facilities.',
      },
    ],
    ctaText: 'Open Inventory Hub',
    ctaLink: '/inventory',
  },
  {
    id: 'controls',
    title: 'Internal Controls & Governance',
    badge: 'Compliance & Audit',
    imgSrc: '/images/features/signal.svg',
    summary: 'Role-based access control (RBAC), dual maker-checker authorization, and immutable audit logs.',
    steps: [
      {
        num: '01',
        title: 'Role-Based Access Control (RBAC)',
        desc: 'Administrator (full governance), Finance User (daily operations), and Viewer/Auditor (read-only telemetry).',
      },
      {
        num: '02',
        title: 'Dual Maker-Checker Workflows',
        desc: 'Operational entries created by one user cannot be approved by the same user if they exceed threshold policies.',
      },
      {
        num: '03',
        title: 'Immutable Audit Trail',
        desc: 'Every login, match execution, ledger adjustment, and report export is timestamped with actor ID and IP address.',
      },
    ],
    ctaText: 'Open Control Center',
    ctaLink: '/controls',
  },
];

export const Documentation = () => {
  const [activeModule, setActiveModule] = useState('reconciliation');

  const currentDoc = MODULE_DOCS.find((m) => m.id === activeModule) || MODULE_DOCS[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <Header />

      <main>
        {/* Hero Section with exact Paidin gradient & vectors */}
        <section className="bg-header relative pt-32 sm:pt-36 md:pt-44 pb-16 lg:pb-20 overflow-hidden">
          {/* Decorative Vectors */}
          <img
            src="/images/pricing/upperline.png"
            alt="upperline"
            className="absolute top-[120px] left-[60px] hidden lg:block opacity-60 pointer-events-none"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <img
            src="/images/pricing/lowerline.png"
            alt="lowerline"
            className="absolute bottom-[20px] right-[60px] hidden lg:block opacity-60 pointer-events-none"
            onError={(e) => (e.target.style.display = 'none')}
          />

          <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
            <h1 className="text-midnight_text text-4xl sm:text-6xl lg:text-[72px] font-bold tracking-tight leading-tight">
              Platform Documentation<span className="text-primary">.</span>
            </h1>

            <p className="text-black/60 text-lg font-normal pt-4 max-w-2xl mx-auto leading-relaxed">
              Step-by-step operating guides, 3-pass reconciliation rules, accounts payable aging ledgers, and multi-warehouse stock controls.
            </p>

            {/* Module Switcher Pill (Matching Homepage Pricing Toggle) */}
            <div className="mt-10 flex justify-center">
              <div className="bg-deepSlate flex flex-wrap justify-center p-1.5 rounded-full shadow-lg max-w-2xl">
                {MODULE_DOCS.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className={`text-sm sm:text-base font-semibold py-2.5 px-5 sm:px-6 rounded-full transition-all duration-300 cursor-pointer ${
                      activeModule === mod.id
                        ? 'text-primary bg-white shadow-md'
                        : 'text-white hover:text-white/80'
                    }`}
                  >
                    {mod.badge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section (Matching Homepage Features & Cards Vibe) */}
        <section className="py-16 lg:py-24 bg-[#edf5fc]">
          <div className="container mx-auto px-4 max-w-7xl">
            
            {/* Active Module Showcase Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-featureShadow border border-slate-100/90 relative overflow-hidden mb-16">
              
              {/* Corner Star Graphic */}
              <img
                src="/images/pricing/starone.svg"
                alt="star"
                className="absolute top-0 right-0 w-36 h-36 opacity-30 pointer-events-none"
                onError={(e) => (e.target.style.display = 'none')}
              />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-10 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#edf5fc] flex items-center justify-center p-3.5 shrink-0">
                    <img
                      src={currentDoc.imgSrc}
                      alt={currentDoc.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-1">
                      {currentDoc.badge}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-bold text-midnight_text tracking-tight">
                      {currentDoc.title}
                    </h2>
                  </div>
                </div>

                <Link
                  to={currentDoc.ctaLink}
                  className="text-white text-base sm:text-lg font-medium py-3.5 px-8 rounded-full transition duration-300 border border-primary bg-primary hover:bg-transparent hover:text-primary shadow-xl shadow-blue-500/20 active:scale-95 inline-flex items-center gap-2"
                >
                  <span>{currentDoc.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Summary Description */}
              <p className="text-black/75 text-lg font-normal leading-relaxed pt-8 pb-6 max-w-3xl">
                {currentDoc.summary}
              </p>

              {/* Step by Step Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {currentDoc.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-7 rounded-2xl bg-[#edf5fc]/60 border border-slate-200/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-start gap-4 group"
                  >
                    <span className="font-extrabold text-2xl text-primary/40 group-hover:text-primary transition-colors shrink-0">
                      {step.num}
                    </span>
                    <div className="space-y-1.5">
                      <h4 className="text-lg font-bold text-midnight_text group-hover:text-primary transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-sm text-black/60 leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Quickstart Developer Section (Matching Paidin Card Aesthetics) */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-featureShadow border border-slate-100/90">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="/images/features/dollar.svg"
                  alt="Quickstart"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-primary block">
                    Developer Quickstart
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-midnight_text">
                    Running FinSight Locally
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400">1. Django Backend & 5/5 Unit Tests</h4>
                  <pre className="bg-midnight_text text-emerald-300 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                    {`# Run automated test suite\npython backend/manage.py test tests\n\n# Start backend API server (Port 8000)\npython backend/manage.py runserver 8000`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400">2. React + Vite Frontend Dev Server</h4>
                  <pre className="bg-midnight_text text-cyan-300 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                    {`# Navigate to frontend and start\ncd frontend\nnpm install\nnpm run dev`}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Documentation;
