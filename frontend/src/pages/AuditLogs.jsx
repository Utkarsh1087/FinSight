import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  Activity,
  Terminal,
} from 'lucide-react';
import api from '../services/api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/audit-logs/?';
      if (actionFilter) url += `action=${actionFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setLogs(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const actionCategories = [
    { id: '', label: 'All Events' },
    { id: 'RECONCILIATION', label: 'Reconciliation' },
    { id: 'INVOICE', label: 'Invoices' },
    { id: 'EXPENSE', label: 'Expenses' },
    { id: 'INVENTORY', label: 'Inventory' },
    { id: 'CONTROL', label: 'Controls' },
    { id: 'USER', label: 'Auth & Roles' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Immutable Financial Audit Trail</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              SOC 2 / SOX Audit Ready
            </span>
          </div>
          <p className="text-xs text-black/60 mt-1">
            Complete chronological record of user actions, file imports, ledger approvals, transfers, and system exceptions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {actionCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActionFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                actionFilter === cat.id
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
            placeholder="Search audit details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-midnight_text font-medium shadow-xs focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Actor & Role</th>
                <th className="py-4 px-6">Action Type</th>
                <th className="py-4 px-6">Entity</th>
                <th className="py-4 px-6">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-black/40 font-medium">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                    <td className="py-4 px-6 text-black/60 whitespace-nowrap font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-midnight_text">{log.user_email}</div>
                      <span className="text-[10px] text-primary font-bold">{log.user_role}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-midnight_text font-medium">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                    </td>
                    <td className="py-4 px-6 text-black/70 max-w-md font-medium leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AuditLogs;
