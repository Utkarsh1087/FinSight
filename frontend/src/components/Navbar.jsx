import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = ({ title = 'Dashboard', subtitle = '', onToggleSidebar = null }) => {
  const { unreadCount, setIsOpen } = useNotifications();

  return (
    <header className="h-20 px-6 sm:px-8 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-midnight_text hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg lg:text-xl font-extrabold text-midnight_text tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-black/50 hidden sm:block font-normal mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right Action Toolbar */}
      <div className="flex items-center gap-3.5">
        {/* Notifications Bell */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2.5 rounded-full text-midnight_text hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
