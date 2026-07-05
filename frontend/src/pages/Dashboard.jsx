import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Boxes,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, expenseRes, invRes, violRes] = await Promise.allSettled([
        api.get('/reports/overview/'),
        api.get('/expenses/analytics/'),
        api.get('/inventory/valuation/'),
        api.get('/controls/violations/?status=OPEN'),
      ]);

      if (overviewRes.status === 'fulfilled') setData(overviewRes.value.data);
      if (expenseRes.status === 'fulfilled') setExpenseData(expenseRes.value.data);
      if (invRes.status === 'fulfilled') setInventoryData(invRes.value.data);
      if (violRes.status === 'fulfilled') setViolations(violRes.value.data.results || violRes.value.data || []);
    } catch (err) {
      console.error('Error loading dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-midnight_text">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading FinSight Financial Operations...</span>
        </div>
      </div>
    );
  }

  const rec = data?.reconciliation || {};
  const inv = data?.invoices || {};
  const exp = data?.expenses || {};
  const inventory = data?.inventory || {};

  const recPieData = [
    { name: 'Matched', value: rec.matched_count || 0 },
    { name: 'Exceptions', value: rec.exception_count || 0 },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner (Matching Homepage Gradient Vibe) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Subtle Decorative Star Vector in Background */}
        <img
          src="/images/pricing/starone.svg"
          alt="star"
          className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none"
          onError={(e) => (e.target.style.display = 'none')}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#edf5fc] text-primary text-xs font-bold mb-3 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Month-End Close in Progress
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-midnight_text tracking-tight">
            Financial Operations & Control Hub<span className="text-primary">.</span>
          </h2>
          <p className="text-sm text-black/60 mt-1 max-w-xl leading-relaxed">
            Live telemetry across 3-pass bank matching, accounts payable aging, multi-warehouse valuation, and policy violations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/ai-assistant"
            className="px-5 py-3 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Ask AI Assistant
          </Link>
          <Link
            to="/reconciliation"
            className="px-5 py-3 rounded-full text-xs font-bold bg-[#edf5fc] hover:bg-blue-100 text-midnight_text border border-blue-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4 text-primary" /> Run Reconciliation
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Reconciliation Match Rate"
          value={`${rec.match_rate || 0}%`}
          subtitle={`${rec.matched_count || 0} matched · ${rec.exception_count || 0} breaks`}
          icon={ArrowLeftRight}
          color="emerald"
          badge={Number(rec.unreconciled_diff || 0) === 0 ? 'Tied ₹0.00' : `Diff: ₹${Number(rec.unreconciled_diff).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <MetricCard
          title="Outstanding Invoices"
          value={`₹${Number(inv.total_outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${inv.overdue_count || 0} overdue invoices requiring action`}
          icon={Receipt}
          color="amber"
          badge={`${inv.total_count || 0} total`}
        />
        <MetricCard
          title="Total Operating Expenses"
          value={`₹${Number(exp.total_recorded || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${exp.count || 0} recorded disbursements`}
          icon={CreditCard}
          color="indigo"
        />
        <MetricCard
          title="Inventory Valuation"
          value={`₹${Number(inventory.total_valuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${inventory.total_units || 0} units across 3 global warehouses`}
          icon={Boxes}
          color="sky"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Expense Spending Trends */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-midnight_text flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-primary" /> Monthly Operational Spending Trends
              </h3>
              <p className="text-xs text-black/50 mt-0.5">Total authorized disbursements over time</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#edf5fc] text-midnight_text border border-slate-200">
              FY 2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseData?.monthly_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0057ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0057ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Expenses']}
                />
                <Area type="monotone" dataKey="total" stroke="#0057ff" strokeWidth={3} fillOpacity={1} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reconciliation Status Pie */}
        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-midnight_text flex items-center gap-2">
              <ArrowLeftRight className="w-4.5 h-4.5 text-emerald-600" /> Reconciliation Distribution
            </h3>
            <p className="text-xs text-black/50 mt-0.5">June 2026 batch settlement breakdown</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs border-t border-slate-100 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-midnight_text font-semibold">Matched ({rec.matched_count || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-midnight_text font-semibold">Exceptions ({rec.exception_count || 0})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Open Control Violations & Warehouse Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Open Control Violations List */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-midnight_text flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500" /> Open Financial Control Violations
              </h3>
              <p className="text-xs text-black/50 mt-0.5">Automated policy checks requiring review</p>
            </div>
            <Link to="/controls" className="text-xs font-bold text-primary hover:underline">
              View All ({violations.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {violations.length === 0 ? (
              <div className="text-center py-10 text-black/40 text-xs font-medium">
                No open control violations. All financial checks passing.
              </div>
            ) : (
              violations.slice(0, 4).map((viol) => (
                <div
                  key={viol.id}
                  className="p-4 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/60 flex items-start justify-between gap-3 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                      viol.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-midnight_text">{viol.title}</h4>
                        <StatusBadge status={viol.severity} />
                      </div>
                      <p className="text-xs text-black/60 mt-1 line-clamp-1">{viol.description}</p>
                    </div>
                  </div>
                  <Link
                    to="/controls"
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 hover:bg-primary hover:text-white text-primary transition-all shrink-0"
                  >
                    Resolve
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Warehouse Inventory Distribution */}
        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-midnight_text flex items-center gap-2 mb-1">
              <Boxes className="w-4.5 h-4.5 text-primary" /> Stock by Warehouse
            </h3>
            <p className="text-xs text-black/50 mb-6">Multi-site inventory balance & valuation</p>

            <div className="space-y-3.5">
              {(inventoryData?.warehouse_breakdown || []).map((wh) => (
                <div key={wh.warehouse_code} className="p-4 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-midnight_text">{wh.warehouse_name}</span>
                    <span className="text-primary">₹{wh.total_value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-black/60">
                    <span>{wh.country}</span>
                    <span>{wh.total_units} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/inventory"
            className="mt-6 w-full py-3 rounded-full text-xs font-bold text-center bg-[#edf5fc] hover:bg-primary hover:text-white text-midnight_text border border-blue-200 transition-all block"
          >
            Manage Inventory & Stock Transfers →
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
