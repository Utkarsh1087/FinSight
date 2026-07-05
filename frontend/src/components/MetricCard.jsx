import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', badge = null, onClick = null }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-blue-50',
      text: 'text-primary',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-featureShadow hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-black/50 truncate">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-2xl ${theme.bg} ${theme.text} ${theme.border} border shadow-xs group-hover:scale-110 transition-transform duration-300 shrink-0`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-midnight_text break-all">
            {value}
          </span>
          {badge && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#edf5fc] text-primary border border-blue-100 shrink-0">
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-xs text-black/60 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
