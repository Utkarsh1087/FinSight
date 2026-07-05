import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Boxes,
  ShieldAlert,
  Bot,
  ScrollText,
  FileSpreadsheet,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Layout/Header/Logo';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Reconciliation', path: '/reconciliation', icon: ArrowLeftRight },
  { name: 'Invoices', path: '/invoices', icon: Receipt },
  { name: 'Expenses', path: '/expenses', icon: CreditCard },
  { name: 'Inventory & Warehouses', path: '/inventory', icon: Boxes },
  { name: 'Control Center', path: '/controls', icon: ShieldAlert },
  { name: 'AI Finance Assistant', path: '/ai-assistant', icon: Bot, highlight: true },
  { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
  { name: 'Financial Reports', path: '/reports', icon: FileSpreadsheet },
  { name: 'Settings & Team', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-midnight_text/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 h-screen bg-midnight_text text-white flex flex-col z-50 transition-transform duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header with Unified Logo */}
        <div className="h-20 px-6 flex items-center border-b border-white/10 shrink-0">
          <Logo white={true} />
        </div>

        {/* Nav Links (Scrollable internally if screen is short) */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-blue-500/30 font-bold'
                      : item.highlight
                      ? 'text-sky-300 hover:text-white hover:bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wide">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Profile Card */}
        <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md">
                {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email?.split('@')[0]}
                </p>
                <span className="inline-block text-[10px] font-medium text-white/60 capitalize">
                  {user?.role?.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-white/60 hover:text-rose-400 hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
