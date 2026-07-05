import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  CreditCard,
  X,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Invoices = () => {
  const { isFinanceUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    invoice_number: '',
    party_name: '',
    invoice_type: 'ACCOUNTS_PAYABLE',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    total_amount: '',
    description: '',
    reference: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Bank Transfer',
    reference_no: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, [statusFilter, typeFilter, search]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let url = '/invoices/?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setInvoices(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/invoices/summary/');
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices/', formData);
      setCreateModalOpen(false);
      setFormData({
        invoice_number: '',
        party_name: '',
        invoice_type: 'ACCOUNTS_PAYABLE',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        total_amount: '',
        description: '',
        reference: '',
      });
      fetchInvoices();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.invoice_number?.[0] || 'Failed to create invoice.');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.post(`/invoices/${selectedInvoice.id}/payments/`, paymentData);
      setPayModalOpen(false);
      setPaymentData({ amount: '', payment_method: 'Bank Transfer', reference_no: '', notes: '' });
      fetchInvoices();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed.');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Actions */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Invoices & Accounts Ledger</h2>
          <p className="text-xs text-black/60 mt-1">
            Track Payables and Receivables with automated overdue aging and partial payment reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isFinanceUser && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Create Invoice
            </button>
          )}
          <a
            href="/api/reports/invoices/export-csv/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#edf5fc] hover:bg-blue-100 text-midnight_text border border-blue-200 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </a>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-featureShadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Total Invoices</span>
          <div className="text-2xl font-extrabold text-midnight_text mt-1">{summary?.total_invoices || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-featureShadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Total Outstanding</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            ₹{(summary?.total_outstanding || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-featureShadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Overdue Invoices</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{summary?.overdue_count || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-featureShadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Fully Paid</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{summary?.paid_count || 0}</div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['', 'PENDING', 'OVERDUE', 'PARTIALLY_PAID', 'PAID', 'DISPUTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-black/60 hover:text-midnight_text'
              }`}
            >
              {st === '' ? 'All Status' : st.replace('_', ' ')}
            </button>
          ))}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 text-midnight_text rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary shadow-xs"
          >
            <option value="">All Types (AP & AR)</option>
            <option value="ACCOUNTS_PAYABLE">Payables (AP)</option>
            <option value="ACCOUNTS_RECEIVABLE">Receivables (AR)</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, party..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-midnight_text font-medium shadow-xs focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Invoice # & Type</th>
                <th className="py-4 px-6">Vendor / Customer</th>
                <th className="py-4 px-6">Issue & Due Date</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6 text-right">Outstanding</th>
                <th className="py-4 px-6">Status & Aging</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-black/40 font-medium">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-midnight_text">
                      <div>{inv.invoice_number}</div>
                      <span className="text-[10px] font-normal text-black/50">
                        {inv.invoice_type === 'ACCOUNTS_PAYABLE' ? 'Payable (AP)' : 'Receivable (AR)'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-midnight_text">
                      {inv.party_name}
                    </td>
                    <td className="py-4 px-6 text-black/60">
                      <div>Issued: {inv.issue_date}</div>
                      <div className="text-[11px] text-black/40 font-normal">Due: {inv.due_date}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-midnight_text">
                      ₹{Number(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-amber-600">
                      ₹{Number(inv.outstanding_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={inv.status} />
                        {inv.days_overdue > 0 && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            +{inv.days_overdue}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isFinanceUser && inv.status !== 'PAID' && (
                        <button
                          onClick={() => { setSelectedInvoice(inv); setPayModalOpen(true); }}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-sm transition-all"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-midnight_text">Create New Invoice</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-901"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Invoice Type</label>
                <select
                  value={formData.invoice_type}
                  onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="ACCOUNTS_PAYABLE">Payable (Vendor)</option>
                  <option value="ACCOUNTS_RECEIVABLE">Receivable (Customer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Party Name (Vendor / Customer)</label>
              <input
                type="text"
                required
                placeholder="e.g. Bell Canada Infra"
                value={formData.party_name}
                onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Issue Date</label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Notes / Description</label>
              <textarea
                rows="2"
                placeholder="Scope of work or billing details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-black/60 hover:text-midnight_text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Create Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-midnight_text">Record Invoice Settlement</h3>
                <p className="text-xs text-black/50">Invoice #{selectedInvoice.invoice_number} ({selectedInvoice.party_name})</p>
              </div>
              <button type="button" onClick={() => setPayModalOpen(false)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#edf5fc] border border-blue-100 text-xs flex justify-between">
              <span className="text-black/60 font-semibold">Outstanding Balance:</span>
              <span className="font-bold text-amber-600">₹{Number(selectedInvoice.outstanding_amount).toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedInvoice.outstanding_amount}
                placeholder={selectedInvoice.outstanding_amount}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Payment Method</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer (EFT/NEFT)</option>
                  <option value="Check">Check / Cheque</option>
                  <option value="Corporate Card">Corporate Card</option>
                  <option value="Wire">Wire Remittance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Reference / Check #</label>
                <input
                  type="text"
                  placeholder="e.g. CHQ#1099"
                  value={paymentData.reference_no}
                  onChange={(e) => setPaymentData({ ...paymentData, reference_no: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-black/60 hover:text-midnight_text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Invoices;
