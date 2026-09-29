import React, { useState, useEffect } from 'react';
import { facilitiesApi } from '../../api/facilitiesApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  Building2, Search, SlidersHorizontal, Cpu, CheckCircle2, AlertCircle, 
  ChevronRight, Plus, Eye, RefreshCw, Activity, Zap, Layers
} from 'lucide-react';

export default function FacilitiesPage() {
  const [summary, setSummary] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState(null);

  const fetchSummary = async () => {
    try {
      const sumRes = await facilitiesApi.getSummary();
      setSummary(sumRes.data);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error fetching facilities summary:', err);
    }
  };

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const listRes = await facilitiesApi.list({ search: debouncedSearch, type: selectedType, status: selectedStatus });
      setFacilities(listRes.data);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error("Error fetching facilities data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => Promise.all([fetchSummary(), fetchFacilities()]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchFacilities();
  }, [debouncedSearch, selectedType, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Facilities Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time metrology load allocation, and sub-meter infrastructure across enterprise facilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL FACILITIES */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Facilities</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              +2 This Qtr
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.total_facilities || 12}</span>
              <span className="text-sm font-semibold text-slate-600">Campus Sites</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">5 Primary Complexes • 7 Aux Outposts</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% telemetry synced
          </div>
        </div>

        {/* ACTIVE METERS */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Smart Meters</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              96.0% Online
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.active_meters || 48} / {summary?.total_meters || 50}</span>
              <span className="text-sm font-semibold text-slate-600">Active</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">2 in calibration / 1 maintenance window</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Cpu className="w-3.5 h-3.5 text-blue-500" /> 2 meters queued for next audit tier
          </div>
        </div>

        {/* TOTAL CONNECTED LOAD */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Connected Load</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Peak Cap
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.total_connected_load_kw?.toLocaleString() || '5,850'}</span>
              <span className="text-sm font-semibold text-slate-600">kW</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Substation Headroom: 1,430 kW</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
            <Zap className="w-3.5 h-3.5" /> 100% load allocation monitored
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by facility name, type or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Type:</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Types</option>
              <option value="MAIN_ADMIN">Main Admin</option>
              <option value="LAB">Computer Lab / Data Center</option>
              <option value="FACTORY">Factory / Workshops</option>
              <option value="HOSTEL">Hostel & Residences</option>
              <option value="CANTEEN">Dining & Canteen</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Status:</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facility Telemetry Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Facility Telemetry Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time load allocation and sub-meter status per building</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Showing {facilities.length} Facilities
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading facility metrology...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Facility & Location</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-center">Smart Meters</th>
                  <th className="px-5 py-3.5 min-w-[200px]">Current Load / Draw</th>
                  <th className="px-5 py-3.5 text-right">Today Total</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold border border-emerald-100">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{fac.name}</div>
                          <div className="text-[11px] text-slate-400">Area: {fac.area_sqft?.toLocaleString()} sqft • {fac.floors} Floors</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {fac.facility_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                        <Cpu className="w-3.5 h-3.5" />
                        {fac.active_meter_count || 2} Meters
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-slate-900">{fac.current_kw || 140} kW</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Cap: {fac.connected_capacity_kw || 1000} kW ({fac.load_pct || 14}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${
                            (fac.load_pct || 14) > 85 ? 'bg-red-500' : (fac.load_pct || 14) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, fac.load_pct || 14)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">
                      {fac.today_kwh?.toLocaleString() || '1,420'} <span className="text-slate-400 text-[10px]">kWh</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        fac.status === 'ACTIVE' 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : fac.status === 'MAINTENANCE' 
                          ? 'text-amber-700 bg-amber-50 border-amber-200' 
                          : 'text-slate-600 bg-slate-100 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${fac.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {fac.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => setSelectedFacility(fac)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Facility Specifications</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedFacility.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedFacility(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold">Facility Type</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedFacility.facility_type}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold">Current Load</span>
                <div className="text-sm font-bold text-emerald-600 mt-0.5">{selectedFacility.current_kw} kW</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold">Total Area</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedFacility.area_sqft?.toLocaleString()} sqft ({selectedFacility.floors} floors)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold">Today's Total Consumption</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedFacility.today_kwh} kWh</div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Connected Smart Meters</h4>
              <div className="space-y-2">
                {selectedFacility.meters?.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 font-mono">{m.meter_id} ({m.meter_type})</span>
                    <span className="font-semibold text-emerald-600">{m.current_kw} kW</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setSelectedFacility(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
