import React from 'react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { Breadcrumb } from '../components/Common/Breadcrumb';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#edf5fc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        <Breadcrumb
          pageName="Privacy Policy"
          pageDescription="Our commitment to safeguarding enterprise financial telemetry, accounting ledgers, and organizational data."
        />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 space-y-10">
            
            {/* Top Overview Banner */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-midnight_text text-base sm:text-lg">
                  Enterprise Data Privacy Standard
                </h3>
                <p className="text-xs sm:text-sm text-black/60">
                  Last updated: July 2026 • Compliant with SOC 2 Type II, SOX 404, and GDPR standards.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-primary" /> 1. Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                FinSight processes financial transactions, bank statement feeds, general ledger line items, and invoice metadata solely to perform automated 3-pass reconciliation and multi-warehouse inventory valuation. We do not sell or monetize customer data.
              </p>
              <ul className="space-y-2 pt-2 text-sm text-black/70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Account authentication records (work email, hashed passwords, RBAC assignments).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bank-to-GL settlement payloads and transaction reference timestamps.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Immutable audit logs recording user authorization actions and maker-checker approvals.</span>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-primary" /> 2. Cryptographic Security & Data Storage
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                All telemetry data in transit is encrypted using TLS 1.3 with Perfect Forward Secrecy (PFS). Data at rest in PostgreSQL databases and ledger archives is encrypted using AES-256 with managed KMS keys. Integer-cents monetary storage eliminates precision drift and ensures mathematically tamper-evident records.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-midnight_text flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-primary" /> 3. Data Retention & Erasure Rights
              </h2>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed">
                Organizations retain full ownership of their financial records. Administrators can request a complete export of reconciliation packages, ledger balances, and audit trails in standard close-ready formats or trigger GDPR-compliant cryptographic erasure of tenant instances upon contract termination.
              </p>
            </div>

            {/* Contact Box */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <span>Questions regarding our privacy practices? Contact: <strong className="text-midnight_text">privacy@finsight.com</strong></span>
              <span className="font-semibold text-primary">FinSight Security & Compliance Office</span>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
