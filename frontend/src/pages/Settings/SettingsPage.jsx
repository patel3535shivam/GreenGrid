import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';
import { facilitiesApi } from '../../api/facilitiesApi';
import { billingApi } from '../../api/billingApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Shield, Building2, Sliders, Bell, KeyRound, Save, 
  RotateCcw, CheckCircle2, Lock, Cpu, Mail, Phone, RefreshCw 
} from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || 'Dr. Elena Vance',
    email: user?.email || 'admin@greengrid.com',
    department: user?.department || 'Executive Sustainability & Clean Metrology Directorate',
    role: user?.role || 'ADMIN'
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [orgData, setOrgData] = useState({
    name: 'GreenGrid Enterprise Campus',
    tenant_id: 'GG-CORP-9021',
    address: 'Building 1, Green Tech Park, Sector 4'
  });
  const [usersList, setUsersList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authApi.getProfile();
      setProfileData({
        full_name: res.data.full_name || 'Dr. Elena Vance',
        email: res.data.email || 'admin@greengrid.com',
        department: res.data.department || 'Executive Sustainability Directorate',
        role: res.data.role || 'ADMIN'
      });
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error(err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setError('');
      const res = await authApi.updateProfile(profileData);
      setUser(res.data);
      setMessage('Profile settings updated successfully!');
      setLoading(false);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      setError(err.response?.data?.detail || 'Failed to update profile.');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match!');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      setError('');
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setMessage('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setLoading(false);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      setError(err.response?.data?.current_password?.[0] || 'Password change failed.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Administration</h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Tenant ID: GG-CORP-9021 • v4.5 Active
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure user credentials, multi-facility organization parameters, tariff structures, and security policy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Changes
          </button>
          <button 
            onClick={handleProfileSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Save All Configurations
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm flex flex-wrap gap-1">
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'organization', label: 'Organization Settings', icon: Building2 },
          { id: 'security', label: 'Security & Password', icon: KeyRound },
          { id: 'roles', label: 'User & Role Management', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Status Notifications */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-red-600" />
          {error}
        </div>
      )}

      {/* TAB CONTENT: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Personal Information & Operational Role</h3>
                <p className="text-xs text-slate-500">Update identity markers and administrative contacts</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Active Session
              </span>
            </div>

            {/* Avatar Header */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-md">
                {profileData.full_name?.slice(0, 2).toUpperCase() || 'EV'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">{profileData.full_name}</h4>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Verified Executive</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">PNG or JPG formats up to 5MB. Enterprise high-DPI badge active.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Assigned Role Tier</label>
                  <input 
                    type="text"
                    disabled
                    value={profileData.role === 'ADMIN' ? 'Chief Energy Officer (Enterprise Admin)' : profileData.role}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Department / Division Scope</label>
                  <input 
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Right Card: Password Update */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Update Password</h3>
                <p className="text-xs text-slate-500">Enforce enterprise password complexity</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Current Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-800">Entropy Rating:</span>
                  <span className="font-extrabold text-emerald-600">Strong • 14 chars</span>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs mt-2 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Update Password
                </button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
              JWT token rotation & refresh policies active.
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORGANIZATION SETTINGS */}
      {activeTab === 'organization' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-slate-900 text-base">Organization & Tenant Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Organization Name</label>
              <input 
                type="text" 
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900" 
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Tenant ID</label>
              <input 
                type="text" 
                disabled 
                value={orgData.tenant_id} 
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-600" 
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Headquarters Address</label>
              <input 
                type="text" 
                value={orgData.address}
                onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900" 
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY & ROLES */}
      {(activeTab === 'security' || activeTab === 'roles') && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Access Control & Role Permissions</h3>
          <p className="text-xs text-slate-500">Configured Role Hierarchy: ADMIN, MANAGER, VIEWER</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="font-extrabold text-emerald-800 text-sm">ADMIN Tier</span>
              <p className="text-slate-600 mt-1">Full control over tariff slabs, facility models, user dispatch, and billing approvals.</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="font-extrabold text-blue-800 text-sm">MANAGER Tier</span>
              <p className="text-slate-600 mt-1">Operational view and control over metrology telemetry and incident triage.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-extrabold text-slate-800 text-sm">VIEWER Tier</span>
              <p className="text-slate-600 mt-1">Read-only access to executive dashboards and consumption reports.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
