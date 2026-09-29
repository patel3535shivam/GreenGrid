import React, { useState, useEffect } from 'react';
import { renewableApi } from '../../api/renewableApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, ComposedChart, Line 
} from 'recharts';
import { 
  Sun, BatteryCharging, Zap, ShieldCheck, ArrowUpRight, Cpu, 
  RefreshCw, CheckCircle2, Leaf, Activity 
} from 'lucide-react';

export default function RenewablePage() {
  const [summary, setSummary] = useState(null);
  const [solarProfile, setSolarProfile] = useState([]);
  const [netMetering, setNetMetering] = useState([]);
  const [solarFleet, setSolarFleet] = useState([]);
  const [bessFleet, setBessFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryRequest = renewableApi.getSummary().then((response) => {
        setSummary(response.data);
        setLoading(false);
        return response;
      });
      const [sumRes, profRes, netRes, solarRes, bessRes] = await Promise.all([
        summaryRequest,
        renewableApi.getSolarProfile(),
        renewableApi.getNetMetering(),
        renewableApi.getSolarFleet(),
        renewableApi.getBessFleet()
      ]);
      setSummary(sumRes.data);
      setSolarProfile(profRes.data);
      setNetMetering(netRes.data);
      setSolarFleet(solarRes.data);
      setBessFleet(bessRes.data);
      setLoading(false);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error("Error loading renewable data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading renewable telemetry stream...
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Renewable Energy & Storage</h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Clean Energy Matrix
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time solar PV generation, BESS storage dispatch, and clean grid integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 5 Renewable KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL SOLAR GENERATED */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Solar Generated</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.total_solar_generated_kwh?.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">kWh</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">{summary?.solar_trend}</div>
          </div>
        </div>

        {/* RENEWABLE SHARE */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Renewable Share</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.renewable_share_pct}%</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Target: 35.0% {summary?.renewable_share_pct >= 35 ? 'Exceeded' : 'In progress'}</div>
          </div>
        </div>

        {/* BESS STORAGE */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">BESS Storage SoC</span>
            <BatteryCharging className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.bess_soc_pct}%</span>
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-1">{summary?.bess_current_charge_kwh} kWh / {summary?.bess_storage_capacity_kwh?.toLocaleString()} kWh Cap</div>
          </div>
        </div>

        {/* GRID EXPORT */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grid Export Volume</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.grid_export_kwh?.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Net metering active</div>
          </div>
        </div>

        {/* CARBON OFFSET */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Carbon Offset</span>
            <ShieldCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.carbon_offset_kg}</span>
              <span className="text-xs font-semibold text-slate-500">kg CO2</span>
            </div>
            <div className="text-[10px] text-teal-600 font-semibold mt-1">{summary?.co2_saved_tons} MT CO2eq YTD</div>
          </div>
        </div>
      </div>

      {/* Microgrid Power Topology & Vector Dispatch Cards */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-1">Microgrid Power Topology & Vector Dispatch</h3>
        <p className="text-xs text-slate-500 mb-4">Live interconnect power routing and storage dispatch state</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase">Solar PV Systems</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{summary?.solar_capacity_kw?.toLocaleString()} kW</div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Solar Yield: {summary?.total_solar_generated_kwh?.toLocaleString()} kWh today</p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-900 uppercase">BESS Megapack Storage</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{summary?.bess_discharge_kw?.toLocaleString()} kW Discharge</div>
            <p className="text-[11px] text-blue-700 font-medium mt-1">SoC: {summary?.bess_soc_pct}% ({summary?.bess_current_charge_kwh?.toLocaleString()} kWh / {summary?.bess_storage_capacity_kwh?.toLocaleString()} kWh)</p>
          </div>

          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-purple-900 uppercase">Grid Tie Substation</span>
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{summary?.grid_import_kw?.toLocaleString()} kW Import</div>
            <p className="text-[11px] text-purple-700 font-medium mt-1">Grid Power Share: {summary?.grid_import_share_pct}%</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-emerald-900 uppercase">Campus Total Load</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{summary?.campus_total_load_kw?.toLocaleString()} kW Demand</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">{summary?.clean_supply_pct}% Demand Met Cleanly</p>
          </div>
        </div>
      </div>

      {/* Solar Generation Profile & Net Metering Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar Generation Profile */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Solar Generation Profile</h3>
            <p className="text-xs text-slate-500">Diurnal solar PV kW output curve with solar irradiance (W/m²)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={solarProfile} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolarProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="solar_kw" name="Solar Power (kW)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSolarProf)" />
                <Line type="monotone" dataKey="irradiance" name="Irradiance (W/m²)" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grid Interaction & Net Metering Dynamics */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Grid Interaction & Net Metering Dynamics</h3>
            <p className="text-xs text-slate-500">Hourly import vs solar self-consumption vs battery discharge</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={netMetering} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="grid_import" name="Grid Import (kW)" fill="#94a3b8" stackId="a" />
                <Bar dataKey="solar_gen" name="Solar Self-Use (kW)" fill="#f59e0b" stackId="a" />
                <Bar dataKey="bess_discharge" name="BESS Discharge (kW)" fill="#3b82f6" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Solar Asset Fleet Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Solar Asset Fleet Inventory</h3>
          <p className="text-xs text-slate-500 mt-0.5">Active solar array inverters and rooftop strings</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Asset ID</th>
                <th className="px-5 py-3.5">System Name</th>
                <th className="px-5 py-3.5 text-right">Capacity (kW)</th>
                <th className="px-5 py-3.5 text-right">Current Generation</th>
                <th className="px-5 py-3.5 text-right">Today Yield</th>
                <th className="px-5 py-3.5 text-center">Efficiency</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {solarFleet.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">{s.asset_id}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{s.name}</td>
                  <td className="px-5 py-3.5 text-right">{s.capacity_kw} kW</td>
                  <td className="px-5 py-3.5 text-right font-bold text-amber-600">{s.current_generation_kw} kW</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">{s.daily_yield_kwh} kWh</td>
                  <td className="px-5 py-3.5 text-center text-emerald-600 font-bold">{s.efficiency_pct}%</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
