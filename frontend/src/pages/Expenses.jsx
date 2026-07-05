import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  FileSpreadsheet,
  TrendingUp,
  Tag,
  Calendar,
  DollarSign,
  X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0057ff', '#38bdf8', '#fbbf24', '#f43f5e', '#10b981', '#a855f7', '#ec4899'];

export const Expenses = () => {
  const { isFinanceUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    vendor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'OFFICE',
    payment_method: 'Corporate Card',
    description: '',
  });

  useEffect(() => {
    fetchExpenses();
    fetchAnalytics();
  }, [categoryFilter, search]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = '/expenses/?';
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setExpenses(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/expenses/analytics/');
      setAnalytics(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses/', formData);
      setCreateModalOpen(false);
      setFormData({
        title: '',
        vendor: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'OFFICE',
        payment_method: 'Corporate Card',
        description: '',
      });
      fetchExpenses();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record expense.');
    }
  };

  const categoriesList = [
    { id: '', label: 'All Categories' },
    { id: 'TRAVEL', label: 'Travel & Entertainment' },
    { id: 'SOFTWARE', label: 'Software & Cloud' },
    { id: 'LOGISTICS', label: 'Logistics' },
    { id: 'OFFICE', label: 'Office & Facilities' },
    { id: 'INVENTORY', label: 'Inventory Procurement' },
    { id: 'SALARY', label: 'Payroll & Contractors' },
    { id: 'OTHER', label: 'Other Operational' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Corporate Expense Management</h2>
          <p className="text-xs text-black/60 mt-1">
            Departmental operational expenditures, vendor disbursements, and real-time category analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isFinanceUser && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Record Expense
            </button>
          )}
          <a
            href="/api/reports/expenses/export-csv/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#edf5fc] hover:bg-blue-100 text-midnight_text border border-blue-200 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </a>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-midnight_text flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-primary" /> Operational Spending by Category
              </h3>
              <p className="text-xs text-black/50 mt-0.5">Total expense volume per category</p>
            </div>
            <span className="text-xs font-bold text-primary bg-[#edf5fc] px-3.5 py-1 rounded-full border border-blue-100">
              Total: ₹{(analytics?.total_expenses || 0).toLocaleString()}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.by_category || []} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Total Spent']}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {(analytics?.by_category || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-midnight_text flex items-center gap-2 mb-1">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" /> Expense Health & Controls
            </h3>
            <p className="text-xs text-black/50 mb-6">Disbursement compliance summary</p>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/60 flex justify-between items-center">
                <span className="text-black/60 font-semibold">Total Disbursements:</span>
                <span className="font-bold text-midnight_text">{analytics?.expense_count || 0} entries</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/60 flex justify-between items-center">
                <span className="text-black/60 font-semibold">Average Expense:</span>
                <span className="font-bold text-primary">
                  ₹{analytics?.expense_count ? Math.round(analytics.total_expenses / analytics.expense_count).toLocaleString() : 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/60 flex justify-between items-center">
                <span className="text-black/60 font-semibold">Payments &gt; ₹100,000:</span>
                <span className="font-bold text-amber-600">Audit Flag Active</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-primary font-medium">
            Control Rule #1 actively monitors all corporate card and wire payments exceeding threshold limits.
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-black/60 hover:text-midnight_text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-midnight_text font-medium shadow-xs focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Title & Description</th>
                <th className="py-4 px-6">Vendor</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-black/40 font-medium">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                    <td className="py-4 px-6 text-black/60 font-mono">{exp.date}</td>
                    <td className="py-4 px-6 font-bold text-midnight_text">
                      <div>{exp.title}</div>
                      <div className="text-[11px] text-black/50 font-normal">{exp.description}</div>
                    </td>
                    <td className="py-4 px-6 text-midnight_text font-medium">{exp.vendor}</td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100">
                        {exp.category_display}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-black/60">{exp.payment_method}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-midnight_text">
                      ₹{Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateExpense} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-midnight_text">Record Operating Expense</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Expense Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Cloud Infrastructure Hosting"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="TRAVEL">Travel & Entertainment</option>
                  <option value="SOFTWARE">Software & Cloud</option>
                  <option value="LOGISTICS">Logistics & Shipping</option>
                  <option value="OFFICE">Office & Facilities</option>
                  <option value="INVENTORY">Inventory Procurement</option>
                  <option value="SALARY">Payroll & Contractors</option>
                  <option value="OTHER">Other Operational</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="Corporate Card">Corporate Card</option>
                <option value="EFT Bank Transfer">EFT / Bank Transfer</option>
                <option value="Direct Debit">Direct Debit (PAD)</option>
                <option value="Wire">Wire Remittance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Description / Purpose</label>
              <textarea
                rows="2"
                placeholder="Business justification or invoice reference..."
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
                Record Expense
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Expenses;
