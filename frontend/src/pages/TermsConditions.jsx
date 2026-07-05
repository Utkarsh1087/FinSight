import React from 'react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { Breadcrumb } from '../components/Common/Breadcrumb';
import { Scale, CheckCircle2, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-[#edf5fc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        <Breadcrumb
          pageName="Terms & Conditions"
          pageDescription="Terms of service, platform usage guidelines, and licensing for the FinSight finance operations hub."
        />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 space-y-10">
            
            {/* Top Overview Banner */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <div className="w-12 h-12 rounded-xl bg-[#001b50] text-white flex items-center justify-center shrink-0 shadow-md">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-midnight_text text-base sm:text-lg">
                  Master Subscription & Services Agreement
                </h3>
                <p className="text-xs sm:text-sm text-black/60">
                  Effective Date: July 2026 • Governing access to FinSight SaaS & APIs.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-primary" /> 1. License & Permitted Use
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                Subject to the terms of this Agreement, FinSight grants Customer a non-exclusive, non-transferable, worldwide right to access and utilize our 3-pass reconciliation engine, accounts payable ledger tracking, multi-warehouse stock valuations, and audit reporting modules for internal corporate operations.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-primary" /> 2. Role-Based Access Control (RBAC) & Segregation of Duties
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                Customer is responsible for maintaining administrative control over user role permissions (`Administrator`, `Finance User`, and `Viewer`). The system enforces strict maker-checker controls where reconciliation adjustments exceeding configured thresholds require independent dual authorization.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-primary" /> 3. Service Level Agreement (SLA) & Computation Guarantee
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                FinSight targets 99.95% API uptime for transaction processing feeds. All financial match computations are executed using deterministic integer-cents arithmetic to guarantee zero floating-point calculation discrepancies.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-primary" /> 4. Limitation of Liability
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                FinSight provides automated discrepancy telemetry and match suggestions, but the final certification of financial statements remains under the statutory responsibility of the enterprise finance controller and certified public accountants.
              </p>
            </div>

            {/* Bottom Contact */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <span>Legal inquiries: <strong className="text-midnight_text">legal@finsight.com</strong></span>
              <span className="font-semibold text-primary">FinSight Legal & Regulatory Affairs</span>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
