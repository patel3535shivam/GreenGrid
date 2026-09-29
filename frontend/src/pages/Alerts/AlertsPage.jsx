import React, { useState, useEffect } from 'react';
import { alertsApi } from '../../api/alertsApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Info, Search, Filter, 
  RefreshCw, Check, Zap, Cpu, Sliders, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterUnack, setFilterUnack] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchSummary = async () => {
    try {
      const sumRes = await alertsApi.getSummary();
      setSummary(sumRes.data);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error loading alert summary:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const listRes = await alertsApi.list({
        severity: filterSeverity,
        category: filterCategory,
        unacknowledged: filterUnack ? 'true' : 'false',
        search: debouncedSearch,
      });
      setAlerts(listRes.data);
          setSelectedAlert((current) =>
            listRes.data.find((alert) => alert.id === current?.id) || listRes.data[0] || null
          );
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => Promise.all([fetchSummary(), fetchAlerts()]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchAlerts();
  }, [filterSeverity, filterCategory, filterUnack, debouncedSearch]);

  const handleAcknowledge = async (id) => {
    try {
          await alertsApi.acknowledge(id);
          await fetchData();
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
          await alertsApi.resolve(id);
          await fetchData();
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error(err);
    }
  };

  if (loading && !alerts.length) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading incident diagnostics stream...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Alerts & Notifications</h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
              Incident Sentinel v2.3
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time automated incident detection, sub-meter anomaly diagnostics, and dispatch-ready resolution workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs transition-colors"
            title="Refresh Stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Alert KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CRITICAL ALERTS */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Alerts</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-red-600">{summary?.critical_count ?? 0}</span>
              <span className="text-xs font-semibold text-red-500">Open incidents</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Immediate action required</p>
          </div>
        </div>

        {/* WARNING ALERTS */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warning Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-600">{summary?.warning_count ?? 0}</span>
              <span className="text-xs font-semibold text-slate-500">Open incidents</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Operational thresholds exceeded</p>
          </div>
        </div>

        {/* ACTIVE / UNRESOLVED */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active / Unresolved</span>
            <ShieldAlert className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.active_unresolved ?? 0}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">In Triaging</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Total incidents pending triage</p>
          </div>
        </div>

        {/* RESOLVED TODAY */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.resolved_today ?? 0}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Automated</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Automated & manual resolutions</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => { setFilterSeverity('ALL'); setFilterCategory('ALL'); setFilterUnack(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterSeverity === 'ALL' && filterCategory === 'ALL' && !filterUnack 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button 
            onClick={() => { setFilterSeverity('CRITICAL'); setFilterCategory('ALL'); setFilterUnack(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterSeverity === 'CRITICAL' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            Critical Only
          </button>
          <button 
            onClick={() => { setFilterCategory('SUB_METER'); setFilterSeverity('ALL'); setFilterUnack(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'SUB_METER' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Sub-meter Anomalies
          </button>
          <button 
            onClick={() => { setFilterSeverity('ALL'); setFilterCategory('ALL'); setFilterUnack(!filterUnack); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterUnack 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            Unacknowledged ({summary?.unacknowledged_count ?? 0})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search diagnostics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Incident Directory & Diagnostic Inspector Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident Directory Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Incident Directory & Metrology Stream</h3>
              <span className="text-xs font-semibold text-slate-500">Auto-refreshing</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Alert ID</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Incident Diagnostics</th>
                    <th className="px-4 py-3">Facility & Meter</th>
                    <th className="px-4 py-3 text-right">Observed / Limit</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {alerts.map((a) => (
                    <tr 
                      key={a.id} 
                      onClick={() => setSelectedAlert(a)}
                      className={`cursor-pointer transition-colors ${
                        selectedAlert?.id === a.id ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 font-mono">{a.alert_id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                          a.severity === 'CRITICAL' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : a.severity === 'WARNING' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{a.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{a.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{a.facility_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{a.meter_id || 'MTR-MAIN'}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-red-600">{a.observed_val}</div>
                        <div className="text-[10px] text-slate-400">Limit: {a.limit_val}</div>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {!a.is_acknowledged ? (
                          <button 
                            onClick={() => handleAcknowledge(a.id)}
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold rounded-md"
                          >
                            Ack
                          </button>
                        ) : !a.is_resolved ? (
                          <button 
                            onClick={() => handleResolve(a.id)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold rounded-md"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10px]">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Diagnostic Inspector Panel */}
        {selectedAlert ? (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnostic Inspector</span>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    {selectedAlert.alert_id}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedAlert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedAlert.severity}
                    </span>
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Incident Summary</span>
                  <p className="font-bold text-slate-800 mt-1 text-sm">{selectedAlert.title}</p>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedAlert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50/70 p-3 rounded-xl border border-red-100">
                    <span className="text-red-500 font-bold text-[10px] uppercase">Observed Delta</span>
                    <div className="text-lg font-extrabold text-red-700 mt-0.5">{selectedAlert.observed_val}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Ceiling Limit</span>
                    <div className="text-lg font-extrabold text-slate-800 mt-0.5">{selectedAlert.limit_val}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Facility Location:</span>
                    <span className="font-bold text-slate-900">{selectedAlert.facility_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Target Meter ID:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAlert.meter_id}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Status:</span>
                    <span className="font-bold text-emerald-600">
                      {selectedAlert.is_resolved ? 'Resolved' : selectedAlert.is_acknowledged ? 'Acknowledged' : 'New Incident'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommended Mitigation Protocols</h4>
              <button 
                onClick={() => handleResolve(selectedAlert.id)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Execute Automated Peak Shedding & Resolve
              </button>
              <button 
                onClick={() => handleAcknowledge(selectedAlert.id)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400 font-medium">
            Select an alert to inspect diagnostic details
          </div>
        )}
      </div>
    </div>
  );
}
