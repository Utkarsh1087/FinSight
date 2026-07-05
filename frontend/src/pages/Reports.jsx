import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Boxes,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

export const Reports = () => {
  const [overview, setOverview] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [ovRes, bRes] = await Promise.allSettled([
        api.get('/reports/overview/'),
        api.get('/reconciliation/batches/'),
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data);
      if (bRes.status === 'fulfilled') {
        const bl = bRes.value.data.results || bRes.value.data || [];
        setBatches(bl);
        if (bl.length > 0) setSelectedBatchId(bl[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Reconciliation Exceptions Deliverable',
      description: 'Multi-tab ranked break analysis, isolating dollar exposure, probable root cause, and standard Journal Entry actions.',
      icon: ArrowLeftRight,
      color: 'emerald',
      actionUrl: selectedBatchId ? `/api/reports/reconciliation/${selectedBatchId}/export-csv/` : null,
      actionText: 'Download Breaks CSV',
      extraSelector: true,
    },
    {
      title: 'Accounts Payable & Receivable Aging Ledger',
      description: 'Comprehensive invoice register with due date aging, outstanding balance, partial payments, and dispute tracking.',
      icon: Receipt,
      color: 'amber',
      actionUrl: '/api/reports/invoices/export-csv/',
      actionText: 'Download Invoices CSV',
    },
    {
      title: 'Corporate Operational Expenses Ledger',
      description: 'Complete departmental expense records categorized by travel, software, logistics, payroll, and facility operations.',
      icon: CreditCard,
      color: 'indigo',
      actionUrl: '/api/reports/expenses/export-csv/',
      actionText: 'Download Expenses CSV',
    },
    {
      title: 'Global Multi-Warehouse Stock Valuation',
      description: 'Itemized inventory valuation report across India, USA, and Germany warehouses with unit costs and safety thresholds.',
      icon: Boxes,
      color: 'sky',
      actionUrl: '/api/reports/inventory/export-csv/',
      actionText: 'Download Inventory CSV',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow">
        <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Financial Reporting & Export Center</h2>
        <p className="text-xs text-black/60 mt-1">
          Export close-ready financial deliverables, audit schedules, and operational spreadsheets in CSV and Excel formats.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((rc, i) => {
          const Icon = rc.icon;
          return (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col justify-between space-y-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-midnight_text">{rc.title}</h3>
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Export
                    </span>
                  </div>
                </div>
                <p className="text-xs text-black/60 leading-relaxed">{rc.description}</p>
              </div>

              {rc.extraSelector && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-midnight_text mb-1.5">Select Batch Period</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text font-semibold focus:ring-2 focus:ring-primary outline-none"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.period})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <a
                  href={rc.actionUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> {rc.actionText}
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Reports;
