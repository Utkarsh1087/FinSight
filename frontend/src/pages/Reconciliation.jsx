import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  SlidersHorizontal,
  FileSpreadsheet,
  Check,
  X,
  Search,
  Filter,
  Eye,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Reconciliation = () => {
  const { isFinanceUser, isViewer } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches', 'exceptions', 'proof', 'upload'
  const [passFilter, setPassFilter] = useState(''); // 'Exact', 'Timing', 'Tolerance', ''
  const [matches, setMatches] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedException, setSelectedException] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [bankFile, setBankFile] = useState(null);
  const [glFile, setGlFile] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchMatches();
      fetchExceptions();
    }
  }, [selectedBatch, passFilter, search]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reconciliation/batches/');
      const list = res.data.results || res.data || [];
      setBatches(list);
      if (list.length > 0) {
        setSelectedBatch(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!selectedBatch) return;
    try {
      let url = `/reconciliation/batches/${selectedBatch.id}/matches/?`;
      if (passFilter) url += `pass_name=${passFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setMatches(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExceptions = async () => {
    if (!selectedBatch) return;
    try {
      let url = `/reconciliation/batches/${selectedBatch.id}/exceptions/?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setExceptions(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const runReconciliation = async () => {
    if (!selectedBatch) return;
    try {
      setProcessing(true);
      const res = await api.post(`/reconciliation/batches/${selectedBatch.id}/run/`);
      setSelectedBatch(res.data.batch);
      fetchBatches();
      fetchMatches();
      fetchExceptions();
    } catch (e) {
      alert(e.response?.data?.error || 'Reconciliation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveMatch = async (id) => {
    try {
      await api.post(`/reconciliation/matches/${id}/approve/`);
      fetchMatches();
      if (selectedMatch?.id === id) setSelectedMatch(null);
    } catch (e) {
      alert('Action failed.');
    }
  };

  const handleRejectMatch = async (id) => {
    try {
      await api.post(`/reconciliation/matches/${id}/reject/`);
      fetchMatches();
      if (selectedMatch?.id === id) setSelectedMatch(null);
    } catch (e) {
      alert('Action failed.');
    }
  };

  const handleResolveException = async (id) => {
    try {
      await api.post(`/reconciliation/exceptions/${id}/resolve/`);
      fetchExceptions();
      if (selectedException?.id === id) setSelectedException(null);
    } catch (e) {
      alert('Action failed.');
    }
  };

  const handleUploadCSVs = async (e) => {
    e.preventDefault();
    if (!selectedBatch || (!bankFile && !glFile)) return;
    const formData = new FormData();
    if (bankFile) formData.append('bank_file', bankFile);
    if (glFile) formData.append('gl_file', glFile);

    try {
      setProcessing(true);
      const res = await api.post(`/reconciliation/batches/${selectedBatch.id}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSelectedBatch(res.data.batch);
      setUploadModalOpen(false);
      setBankFile(null);
      setGlFile(null);
      fetchBatches();
      alert('CSVs uploaded and parsed successfully! You can now click Run Reconciliation.');
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Batch Header & Controls */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Bank-to-GL Matching Engine</h2>
            {selectedBatch && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#edf5fc] text-primary border border-blue-100">
                {selectedBatch.period}
              </span>
            )}
          </div>
          <p className="text-xs text-black/60 mt-1">
            Integer-cents three-pass deterministic reconciliation engine with tolerance fuzzy scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Batch Selector */}
          <select
            value={selectedBatch?.id || ''}
            onChange={(e) => {
              const b = batches.find((x) => x.id === parseInt(e.target.value));
              if (b) setSelectedBatch(b);
            }}
            className="text-xs font-bold bg-[#edf5fc] border border-slate-200 text-midnight_text rounded-full px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.status})
              </option>
            ))}
          </select>

          {isFinanceUser && (
            <>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#edf5fc] hover:bg-blue-100 text-midnight_text border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-primary" /> Upload CSVs
              </button>
              <button
                onClick={runReconciliation}
                disabled={processing}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {processing ? 'Matching...' : 'Run Reconciliation'}
              </button>
            </>
          )}

          {selectedBatch && (
            <a
              href={`/api/reports/reconciliation/${selectedBatch.id}/export-csv/`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#edf5fc] hover:bg-blue-100 text-midnight_text border border-blue-200 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Breaks CSV
            </a>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      {selectedBatch && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-featureShadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Total Bank Rows</span>
            <div className="text-xl font-extrabold text-midnight_text mt-1">{selectedBatch.total_bank_rows}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-featureShadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Total GL Rows</span>
            <div className="text-xl font-extrabold text-midnight_text mt-1">{selectedBatch.total_gl_rows}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-featureShadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Reconciled</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">{selectedBatch.matched_count}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-featureShadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Match Rate</span>
            <div className="text-xl font-extrabold text-primary mt-1">{selectedBatch.match_rate}%</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-featureShadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Exceptions Isolated</span>
            <div className="text-xl font-extrabold text-rose-600 mt-1">{selectedBatch.exception_count}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-featureShadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Proof Difference</span>
            <div className={`text-xl font-extrabold mt-1 ${
              Number(selectedBatch.unreconciled_difference) === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              ₹{Number(selectedBatch.unreconciled_difference).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#edf5fc] p-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <button
            onClick={() => { setActiveTab('matches'); setPassFilter(''); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matches' && passFilter === ''
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            All Matches ({selectedBatch?.matched_count || 0})
          </button>
          <button
            onClick={() => { setActiveTab('matches'); setPassFilter('Exact'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matches' && passFilter === 'Exact'
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            Pass 1: Exact
          </button>
          <button
            onClick={() => { setActiveTab('matches'); setPassFilter('Timing'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matches' && passFilter === 'Timing'
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            Pass 2: Timing (±5d)
          </button>
          <button
            onClick={() => { setActiveTab('matches'); setPassFilter('Tolerance'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matches' && passFilter === 'Tolerance'
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            Pass 3: Tolerance
          </button>
          <button
            onClick={() => { setActiveTab('exceptions'); setPassFilter(''); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'exceptions'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-600 hover:text-rose-700'
            }`}
          >
            Exceptions ({selectedBatch?.exception_count || 0})
          </button>
          <button
            onClick={() => setActiveTab('proof')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'proof'
                ? 'bg-primary text-white shadow-sm'
                : 'text-black/60 hover:text-midnight_text'
            }`}
          >
            Reconciliation Proof
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search memo, ref, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-midnight_text font-medium shadow-xs focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Tab 1: Matches Table */}
      {activeTab === 'matches' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Pass & Confidence</th>
                  <th className="py-4 px-6">Bank Record</th>
                  <th className="py-4 px-6">GL Record</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Variance</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-black/40 font-medium">
                      No matches found matching criteria.
                    </td>
                  </tr>
                ) : (
                  matches.map((m) => (
                    <tr key={m.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={m.pass_name} />
                          <span className={`font-bold ${m.confidence_score >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {m.confidence_score}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-midnight_text">{m.bank_tx?.description}</div>
                        <div className="text-[11px] text-black/50">
                          {m.bank_tx?.date} · Ref: {m.bank_tx?.reference || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-midnight_text">{m.company_tx?.memo}</div>
                        <div className="text-[11px] text-black/50">
                          {m.company_tx?.date} · Doc: {m.company_tx?.doc_no || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-midnight_text">
                        ₹{Number(m.bank_tx?.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="text-[11px] font-mono text-black/70">
                          {m.date_delta !== 0 ? `${m.date_delta > 0 ? '+' : ''}${m.date_delta}d lag` : '0d'}
                        </div>
                        {Number(m.amount_delta) !== 0 && (
                          <div className="text-[10px] text-amber-600 font-mono font-bold">
                            Δ ₹{m.amount_delta}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMatch(m)}
                            className="p-2 rounded-full text-midnight_text hover:bg-[#edf5fc] transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isFinanceUser && m.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApproveMatch(m.id)}
                              className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Approve Match"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {isFinanceUser && m.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleRejectMatch(m.id)}
                              className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Reject Match"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Exceptions Table */}
      {activeTab === 'exceptions' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Rank & Side</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Transaction Details</th>
                  <th className="py-4 px-6 text-right">Exposure ($)</th>
                  <th className="py-4 px-6">Suggested Accounting Action</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-black/40 font-medium">
                      No exceptions found.
                    </td>
                  </tr>
                ) : (
                  exceptions.map((e) => (
                    <tr key={e.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-midnight_text">
                        #{e.rank} <span className="text-black/40 font-normal">[{e.side}]</span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={e.category} text={e.category.replace('_', ' ')} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-midnight_text">
                          {e.bank_tx ? e.bank_tx.description : e.company_tx?.memo}
                        </div>
                        <div className="text-[11px] text-black/50">{e.reason}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-rose-600">
                        ₹{Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs text-primary font-mono bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 max-w-sm">
                          {e.suggested_action}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isFinanceUser && e.status === 'OPEN' && (
                          <button
                            onClick={() => handleResolveException(e.id)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          >
                            Resolve
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
      )}

      {/* Tab 3: Formal Reconciliation Proof */}
      {activeTab === 'proof' && selectedBatch && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-featureShadow max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-midnight_text">Standard Bank-to-GL Reconciliation Proof</h3>
            <p className="text-xs text-black/50">Operating Account 1010 — Period: {selectedBatch.period}</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            
            {/* Bank Side */}
            <div className="p-5 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between font-bold text-midnight_text text-sm">
                <span>Ending Balance per Bank Statement</span>
                <span>₹{Number(selectedBatch.bank_closing_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-black/60 pl-4">
                <span>add: Deposits in Transit</span>
                <span className="text-emerald-600 font-bold">+ ₹61,075.08</span>
              </div>
              <div className="flex justify-between text-black/60 pl-4">
                <span>less: Outstanding Checks / Uncleared Disbursals</span>
                <span className="text-rose-600 font-bold">- ₹29,821.53</span>
              </div>
              <div className="flex justify-between font-bold text-primary border-t border-slate-200 pt-2 text-sm">
                <span>Adjusted Bank Balance</span>
                <span>₹{Number(selectedBatch.adjusted_bank_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* GL Side */}
            <div className="p-5 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between font-bold text-midnight_text text-sm">
                <span>Ending Balance per General Ledger</span>
                <span>₹{Number(selectedBatch.gl_closing_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-black/60 pl-4">
                <span>add: Unbooked Bank Charges & Interest (Net)</span>
                <span className="text-rose-600 font-bold">- ₹392.57</span>
              </div>
              <div className="flex justify-between text-black/60 pl-4">
                <span>add back: Duplicate GL Posting to Reverse</span>
                <span className="text-emerald-600 font-bold">+ ₹10,230.18</span>
              </div>
              <div className="flex justify-between text-black/60 pl-4">
                <span>add: Unidentified Items (Pending ID)</span>
                <span className="text-emerald-600 font-bold">+ ₹890.00</span>
              </div>
              <div className="flex justify-between text-black/60 pl-4">
                <span>add: Tolerance Cent Residuals (Pending Write-Off)</span>
                <span className="text-rose-600 font-bold">- ₹0.35</span>
              </div>
              <div className="flex justify-between font-bold text-primary border-t border-slate-200 pt-2 text-sm">
                <span>Adjusted General Ledger Balance</span>
                <span>₹{Number(selectedBatch.adjusted_gl_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Proof Result */}
            <div className={`p-5 rounded-2xl border flex items-center justify-between font-bold text-sm ${
              Number(selectedBatch.unreconciled_difference) === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Unreconciled Difference</span>
              </div>
              <span>₹{Number(selectedBatch.unreconciled_difference).toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}

      {/* Side-by-Side Comparator Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-midnight_text">Reconciliation Match Inspection</h3>
                <p className="text-xs text-black/50">Match Pass: {selectedMatch.pass_name} · Confidence: {selectedMatch.confidence_score}%</p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-2 rounded-full text-black/50 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Bank Side */}
              <div className="p-5 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-primary uppercase tracking-wider text-[10px]">Bank Statement Record</span>
                <div className="font-bold text-midnight_text text-sm">{selectedMatch.bank_tx?.description}</div>
                <div><span className="text-black/50">Date:</span> {selectedMatch.bank_tx?.date}</div>
                <div><span className="text-black/50">Reference:</span> {selectedMatch.bank_tx?.reference || 'N/A'}</div>
                <div className="text-sm font-mono font-bold text-midnight_text pt-2">
                  ₹{Number(selectedMatch.bank_tx?.amount).toLocaleString()}
                </div>
              </div>

              {/* GL Side */}
              <div className="p-5 rounded-2xl bg-[#edf5fc]/70 border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-indigo-600 uppercase tracking-wider text-[10px]">General Ledger Record</span>
                <div className="font-bold text-midnight_text text-sm">{selectedMatch.company_tx?.memo}</div>
                <div><span className="text-black/50">Date:</span> {selectedMatch.company_tx?.date}</div>
                <div><span className="text-black/50">Doc No:</span> {selectedMatch.company_tx?.doc_no || 'N/A'}</div>
                <div className="text-sm font-mono font-bold text-midnight_text pt-2">
                  ₹{Number(selectedMatch.company_tx?.amount).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#edf5fc] border border-blue-100 text-xs text-midnight_text space-y-1">
              <div><span className="font-bold text-black/60">Date Clearing Delta:</span> {selectedMatch.date_delta} days</div>
              <div><span className="font-bold text-black/60">Amount Delta:</span> ₹{selectedMatch.amount_delta}</div>
              <div><span className="font-bold text-black/60">Normalized Fuzzy Similarity:</span> {(selectedMatch.fuzzy_score * 100).toFixed(0)}%</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {isFinanceUser && (
                <>
                  <button
                    onClick={() => handleRejectMatch(selectedMatch.id)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                  >
                    Reject Pairing
                  </button>
                  <button
                    onClick={() => handleApproveMatch(selectedMatch.id)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  >
                    Approve Match
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUploadCSVs} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-midnight_text">Upload Source CSVs</h3>
              <button type="button" onClick={() => setUploadModalOpen(false)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1.5">
                Bank Statement CSV <span className="text-black/50 font-normal">(Date, Description, Reference, Amount)</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBankFile(e.target.files[0])}
                className="w-full text-xs text-black/60 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1.5">
                Company / GL Cash Extract CSV <span className="text-black/50 font-normal">(Date, Account, Memo, DocNo, Amount)</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setGlFile(e.target.files[0])}
                className="w-full text-xs text-black/60 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-black/60 hover:text-midnight_text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing || (!bankFile && !glFile)}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {processing ? 'Uploading...' : 'Import Files'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Reconciliation;
