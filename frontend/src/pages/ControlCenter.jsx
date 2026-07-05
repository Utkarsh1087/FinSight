import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Settings,
  X,
  Search,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const ControlCenter = () => {
  const { isAdmin, isFinanceUser } = useAuth();
  const [violations, setViolations] = useState([]);
  const [rules, setRules] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('violations'); // 'violations', 'rules'
  const [loading, setLoading] = useState(true);

  // Resolve Modal
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [resolveAction, setResolveAction] = useState('RESOLVE');
  const [resolveNotes, setResolveNotes] = useState('');

  useEffect(() => {
    fetchControlsData();
  }, [statusFilter, severityFilter, search]);

  const fetchControlsData = async () => {
    try {
      setLoading(true);
      let vUrl = '/controls/violations/?';
      if (statusFilter) vUrl += `status=${statusFilter}&`;
      if (severityFilter) vUrl += `severity=${severityFilter}&`;
      if (search) vUrl += `search=${encodeURIComponent(search)}&`;

      const [vRes, rRes] = await Promise.allSettled([
        api.get(vUrl),
        api.get('/controls/rules/'),
      ]);

      if (vRes.status === 'fulfilled') setViolations(vRes.value.data.results || vRes.value.data || []);
      if (rRes.status === 'fulfilled') setRules(rRes.value.data.results || rRes.value.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId, currentEnabled, threshold) => {
    try {
      await api.patch(`/controls/rules/${ruleId}/toggle/`, {
        is_enabled: !currentEnabled,
        threshold_amount: threshold,
      });
      fetchControlsData();
    } catch (e) {
      alert('Failed to update control rule.');
    }
  };

  const handleResolveViolation = async (e) => {
    e.preventDefault();
    if (!selectedViolation) return;
    try {
      await api.post(`/controls/violations/${selectedViolation.id}/resolve/`, {
        action: resolveAction,
        notes: resolveNotes,
      });
      setSelectedViolation(null);
      setResolveNotes('');
      fetchControlsData();
    } catch (e) {
      alert('Failed to update violation.');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Financial Control Center</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {violations.filter((v) => v.status === 'OPEN').length} Open Violations
            </span>
          </div>
          <p className="text-xs text-black/60 mt-1">
            Automated internal accounting controls, threshold approvals, and fraud prevention rule governance.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-[#edf5fc] p-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'violations'
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Policy Violations ({violations.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Governance Rules ({rules.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Policy Violations */}
      {activeTab === 'violations' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {['', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'IGNORED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-black/60 hover:text-midnight_text'
                  }`}
                >
                  {st === '' ? 'All Status' : st}
                </button>
              ))}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 text-midnight_text rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search violations, rules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-midnight_text font-medium shadow-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Violations Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {violations.length === 0 ? (
              <div className="col-span-2 bg-white rounded-3xl p-16 text-center text-black/40 text-sm font-medium border border-slate-100 shadow-featureShadow">
                No policy violations found matching selected criteria.
              </div>
            ) : (
              violations.map((viol) => (
                <div
                  key={viol.id}
                  className="bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${
                        viol.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-midnight_text">{viol.title}</h4>
                          <StatusBadge status={viol.severity} />
                        </div>
                        <span className="text-[11px] text-black/40 font-mono">
                          Rule: {viol.rule_name} · Created: {new Date(viol.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={viol.status} />
                  </div>

                  <p className="text-xs text-black/70 bg-[#edf5fc]/80 p-4 rounded-2xl border border-slate-200/60 leading-relaxed font-medium">
                    {viol.description}
                  </p>

                  {viol.resolution_notes && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <span className="font-bold">Resolution Notes:</span> {viol.resolution_notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-black/40 font-medium">
                      {viol.resolved_by_email ? `Resolved by ${viol.resolved_by_email}` : 'Pending review'}
                    </span>
                    {isFinanceUser && viol.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedViolation(viol)}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        Action / Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Control Rules Configuration */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 text-xs text-black/60 shadow-xs">
            Internal financial policy rules are evaluated automatically whenever transactions, expenses, invoices, and reconciliation batches are executed.
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-base font-extrabold text-midnight_text">{rule.name}</h4>
                    <StatusBadge status={rule.severity} />
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      rule.is_enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {rule.is_enabled ? 'Active Policy' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-black/60 max-w-2xl leading-relaxed">{rule.description}</p>
                  <span className="inline-block text-[11px] font-mono text-primary font-bold">
                    Threshold Amount: ₹{Number(rule.threshold_amount).toLocaleString()}
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.is_enabled, rule.threshold_amount)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        rule.is_enabled
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                      }`}
                    >
                      {rule.is_enabled ? 'Disable Rule' : 'Enable Rule'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Violation Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleResolveViolation} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-midnight_text">Resolve Policy Violation</h3>
                <p className="text-xs text-black/50">{selectedViolation.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedViolation(null)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Select Action</label>
              <select
                value={resolveAction}
                onChange={(e) => setResolveAction(e.target.value)}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="RESOLVE">Resolve & Approve Audit Log</option>
                <option value="INVESTIGATE">Mark as Under Investigation</option>
                <option value="IGNORE">Ignore / Mark as False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Resolution Justification</label>
              <textarea
                rows="3"
                required
                placeholder="Explain the audit resolution steps taken..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedViolation(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-black/60 hover:text-midnight_text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Submit Resolution
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ControlCenter;
