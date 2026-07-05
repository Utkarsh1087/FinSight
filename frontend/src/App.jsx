import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';

import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Reconciliation } from './pages/Reconciliation';
import { Invoices } from './pages/Invoices';
import { Expenses } from './pages/Expenses';
import { Inventory } from './pages/Inventory';
import { ControlCenter } from './pages/ControlCenter';
import { AIAssistant } from './pages/AIAssistant';
import { AuditLogs } from './pages/AuditLogs';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Documentation } from './pages/Documentation';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { NotFound } from './pages/NotFound';
import { ScrollUp } from './components/Common/ScrollUp';
import { PreLoader } from './components/Common/PreLoader';

const PAGE_TITLES = {
  '/dashboard': { title: 'Finance Operations Dashboard', subtitle: 'Live telemetry across treasury, aging ledgers, and controls' },
  '/reconciliation': { title: '3-Pass Bank Reconciliation', subtitle: 'Integer-cents cash matching engine and ranked break analysis' },
  '/invoices': { title: 'Accounts Payable & Receivable', subtitle: 'Invoice lifecycle, overdue aging, and settlement management' },
  '/expenses': { title: 'Corporate Expense Management', subtitle: 'Departmental disbursements and policy-compliant spending trends' },
  '/inventory': { title: 'Multi-Warehouse Inventory Hub', subtitle: 'Global stock management across India, USA, and Germany facilities' },
  '/controls': { title: 'Financial Control Center', subtitle: 'Rule-based compliance engine, fraud prevention, and audit oversight' },
  '/ai-assistant': { title: 'AI Finance Assistant', subtitle: 'Context-bounded discrepancy analysis & semantic telemetry reasoning' },
  '/audit-logs': { title: 'System Audit Logs', subtitle: 'Immutable chronological ledger of all actor and automated actions' },
  '/reports': { title: 'Financial Reporting Center', subtitle: 'Export close-ready spreadsheets and reconciliation packages' },
  '/settings': { title: 'Organization & Team Settings', subtitle: 'Admin controls for company fiscal profile and team member role permissions' },
};

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading, user, isViewer, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <PreLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentMeta = PAGE_TITLES[location.pathname] || { title: 'FinSight', subtitle: 'Finance Operations' };

  return (
    <div className="min-h-screen bg-[#edf5fc] text-midnight_text">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Role Access Banner */}
        {isViewer && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-800">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <strong>Viewer (Read-Only) Role:</strong> You can view all dashboards, audit logs, and export reports. Financial mutations (creating invoices, transferring stock, approving matches) require Finance User or Admin role.
            </span>
            <span className="font-mono text-[11px] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-amber-900 font-bold">
              Read-Only Gate Active
            </span>
          </div>
        )}

        <main className="flex-1">
          {children}
        </main>
      </div>

      <NotificationDrawer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ScrollUp />
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsConditions />} />
            
            {/* Protected App Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reconciliation"
              element={
                <ProtectedLayout>
                  <Reconciliation />
                </ProtectedLayout>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedLayout>
                  <Invoices />
                </ProtectedLayout>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedLayout>
                  <Expenses />
                </ProtectedLayout>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedLayout>
                  <Inventory />
                </ProtectedLayout>
              }
            />
            <Route
              path="/controls"
              element={
                <ProtectedLayout>
                  <ControlCenter />
                </ProtectedLayout>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedLayout>
                  <AIAssistant />
                </ProtectedLayout>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedLayout>
                  <AuditLogs />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedLayout>
                  <Reports />
                </ProtectedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              }
            />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
