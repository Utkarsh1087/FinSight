import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Search,
  X,
  Sparkles,
  Save,
  Globe,
  DollarSign,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [orgData, setOrgData] = useState({
    name: '',
    country: 'India',
    currency: 'INR',
    tax_id: '',
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMessage, setOrgMessage] = useState('');
  const [search, setSearch] = useState('');

  // Add Member Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'FINANCE_USER',
    department: 'Finance Operations',
    password: 'Member@123',
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    fetchOrgAndMembers();
  }, []);

  const fetchOrgAndMembers = async () => {
    try {
      setLoading(true);
      const [orgRes, membersRes] = await Promise.allSettled([
        api.get('/accounts/organization/'),
        api.get('/accounts/organization/members/'),
      ]);

      if (orgRes.status === 'fulfilled') {
        setOrgData(orgRes.value.data);
      }
      if (membersRes.status === 'fulfilled') {
        setMembers(membersRes.value.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrg = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      setSavingOrg(true);
      setOrgMessage('');
      const res = await api.patch('/accounts/organization/', orgData);
      setOrgData(res.data);
      setOrgMessage('Company profile updated successfully!');
      setTimeout(() => setOrgMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update organization.');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      setInviteLoading(true);
      await api.post('/accounts/organization/members/', inviteData);
      setInviteModalOpen(false);
      setInviteData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'FINANCE_USER',
        department: 'Finance Operations',
        password: 'Member@123',
      });
      fetchOrgAndMembers();
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to add team member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    if (!isAdmin) return;
    try {
      await api.patch(`/accounts/organization/members/${memberId}/`, { role: newRole });
      fetchOrgAndMembers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change role.');
    }
  };

  const handleRemoveMember = async (memberId, memberEmail) => {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to remove ${memberEmail} from this organization?`)) {
      return;
    }
    try {
      await api.delete(`/accounts/organization/members/${memberId}/`);
      fetchOrgAndMembers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member.');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.first_name && m.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (m.last_name && m.last_name.toLowerCase().includes(search.toLowerCase())) ||
      (m.department && m.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Organization & Team Settings</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#edf5fc] text-primary border border-blue-100">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-black/60 mt-1">
            Manage company profile, base accounting currency, and assign role-based access for finance users and auditors.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Team Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Company Profile Settings (1 Col) */}
        <div className="lg:col-span-1 bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-midnight_text">Company Profile</h3>
              <p className="text-xs text-black/50">Fiscal identity & currency</p>
            </div>
          </div>

          {orgMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {orgMessage}
            </div>
          )}

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Company / Legal Name</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-midnight_text focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Country</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={orgData.country}
                  onChange={(e) => setOrgData({ ...orgData, country: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-midnight_text focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Currency</label>
                <select
                  disabled={!isAdmin}
                  value={orgData.currency}
                  onChange={(e) => setOrgData({ ...orgData, currency: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-midnight_text focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Tax Registration / GSTIN</label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. GSTIN27AABCU9603R1ZM"
                value={orgData.tax_id || ''}
                onChange={(e) => setOrgData({ ...orgData, tax_id: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-midnight_text focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
              />
            </div>

            {isAdmin && (
              <button
                type="submit"
                disabled={savingOrg}
                className="w-full py-3 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {savingOrg ? 'Saving Changes...' : 'Save Company Details'}
              </button>
            )}
          </form>
        </div>

        {/* Team Members List (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-100 shadow-featureShadow space-y-6 flex flex-col justify-between">
          
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-midnight_text">Authorized Team Members</h3>
                  <p className="text-xs text-black/50">{members.length} team members with active access</p>
                </div>
              </div>

              {/* Search Members */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-full pl-9 pr-3.5 py-1.5 text-xs text-midnight_text font-medium outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-2xl">Member</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Role & Access</th>
                    <th className="py-3.5 px-4 text-right rounded-r-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-black/40 font-medium">
                        No team members found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-midnight_text">
                            {m.first_name ? `${m.first_name} ${m.last_name || ''}` : m.username}
                          </div>
                          <div className="text-[11px] text-black/50 font-normal">{m.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-midnight_text font-medium">
                          {m.department || 'Finance'}
                        </td>
                        <td className="py-3.5 px-4">
                          {isAdmin && m.id !== user?.id ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleChangeRole(m.id, e.target.value)}
                              className="text-xs font-bold bg-[#edf5fc] border border-slate-200 text-midnight_text rounded-full px-3 py-1 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                              <option value="FINANCE_USER">Finance User (Mutations)</option>
                              <option value="ADMIN">Admin (Full Control)</option>
                              <option value="VIEWER">Viewer (Read-Only)</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                              m.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : m.role === 'FINANCE_USER'
                                ? 'bg-blue-50 text-primary border-blue-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {m.role.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isAdmin && m.id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(m.id, m.email)}
                              className="p-2 rounded-full text-black/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove Team Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {m.id === user?.id && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              You
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-primary font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>
              <strong>RBAC Isolation Active:</strong> Finance users can execute transactions & reconciliation, while Viewers have read-only audit access.
            </span>
          </div>

        </div>

      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleInviteMember} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-midnight_text">Add Company Team Member</h3>
                <p className="text-xs text-black/50">Assign role and initial credentials</p>
              </div>
              <button type="button" onClick={() => setInviteModalOpen(false)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {inviteError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={inviteData.first_name}
                  onChange={(e) => setInviteData({ ...inviteData, first_name: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Doe"
                  value={inviteData.last_name}
                  onChange={(e) => setInviteData({ ...inviteData, last_name: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Work Email Address<span className="text-rose-500">*</span></label>
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Assigned Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text font-semibold focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="FINANCE_USER">Finance User (Mutations)</option>
                  <option value="VIEWER">Viewer (Read-Only)</option>
                  <option value="ADMIN">Admin (Full Control)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Treasury"
                  value={inviteData.department}
                  onChange={(e) => setInviteData({ ...inviteData, department: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Initial Password</label>
              <input
                type="text"
                required
                placeholder="Member@123"
                value={inviteData.password}
                onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-black/60 hover:text-midnight_text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteLoading}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {inviteLoading ? 'Adding Member...' : 'Add Team Member'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Settings;
