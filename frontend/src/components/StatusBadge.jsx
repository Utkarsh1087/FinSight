import React from 'react';

export const StatusBadge = ({ status, type = 'general', text = null }) => {
  const label = text || status;
  if (!status) return null;

  const s = String(status).toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  // Matches
  if (s === 'APPROVED' || s === 'PAID' || s === 'COMPLETED' || s === 'RESOLVED' || s === 'EXACT') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
  } else if (s === 'TIMING') {
    styles = 'bg-sky-50 text-sky-700 border-sky-200 font-bold';
  } else if (s === 'TOLERANCE' || s === 'PARTIALLY_PAID' || s === 'PENDING_REVIEW' || s === 'INVESTIGATING') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
  } else if (s === 'OVERDUE' || s === 'REJECTED' || s === 'CRITICAL' || s === 'HIGH' || s === 'DISPUTED') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
  } else if (s === 'OPEN' || s === 'PENDING') {
    styles = 'bg-blue-50 text-primary border-blue-200 font-bold';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
