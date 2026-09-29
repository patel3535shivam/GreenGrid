import React, { useState, useEffect } from 'react';
import { energyApi } from '../../api/energyApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import { 
  Zap, Activity, BarChart2, ShieldAlert, Cpu, Download, Sliders, CheckCircle2, 
  AlertTriangle, RefreshCw, Layers, Check, Calendar
} from 'lucide-react';

export default function EnergyMonitoringPage() {
  const [telemetry, setTelemetry] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedRange, setSelectedRange] = useState('Today');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const telemetryRequest = energyApi.getLiveTelemetry().then((response) => {
        setTelemetry(response.data);
        setLastUpdated(new Date());
        setLoading(false);
        return response;
      });
      const [telemetryRes, chartRes] = await Promise.all([
        telemetryRequest,
        energyApi.getConsumptionChart()
      ]);
      setTelemetry(telemetryRes.data);
      setChartData(chartRes.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error("Error loading metrology telemetry:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  if (loading && !telemetry.length) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Polled metrology telemetry...
        </div>
      </div>
    );
  }

  // Calculate aggregated stats from telemetry directory
  const filteredMeters = selectedFacility === 'ALL' 
    ? telemetry 
    : telemetry.filter(t => t.facility_name === selectedFacility);

  const currentDemand = filteredMeters.reduce((acc, curr) => acc + curr.current_kw, 0);
  const todaysConsumption = filteredMeters.reduce((acc, curr) => acc + curr.today_kwh, 0);
  const avgPF = filteredMeters.length ? filteredMeters.reduce((acc, curr) => acc + curr.power_factor, 0) / filteredMeters.length : 0.96;
  const estimatedDailyCost = todaysConsumption * 0.13;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Energy Monitoring & Metrology</h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Telemetry Engine v2.1
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time telemetry, high-precision power electronics & substation consumption monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold shadow-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Autorefresh: 30s
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs">
            <Sliders className="w-3.5 h-3.5" />
            Calibrate Sub-meters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-xs">
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Facility:</label>
            <select 
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Facilities (Campus Wide)</option>
              <option value="Main Administration Building">Main Administration Building</option>
              <option value="Computer Lab & Data Hub">Computer Lab & Data Hub</option>
              <option value="Central Engineering Workshops">Central Engineering Workshops</option>
              <option value="Student Hostel (Wing Block)">Student Hostel (Wing Block)</option>
              <option value="Central Dining & Kitchen Complex">Central Dining & Kitchen Complex</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Phase:</label>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 px-3 py-1.5 focus:outline-none">
              <option>3-Phase Aggregated (L1-L2-L3)</option>
              <option>Single Phase (L1)</option>
            </select>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 self-start md:self-auto">
          {['Today', '7 Days', '30 Days', 'Custom'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedRange === range 
                  ? 'bg-white text-slate-900 font-bold shadow-xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Metrology KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CURRENT DEMAND */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Demand</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{currentDemand.toLocaleString(undefined, {maximumFractionDigits:1})}</span>
              <span className="text-xs font-semibold text-slate-500">kW</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Live active grid load</div>
          </div>
        </div>

        {/* TODAY'S CONSUMPTION */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Consumption</span>
            <BarChart2 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{todaysConsumption.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              <span className="text-xs font-semibold text-slate-500">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Accumulated today</div>
          </div>
        </div>

        {/* PEAK DEMAND (24H) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Peak Demand (24H)</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">3,890.0</span>
              <span className="text-xs font-semibold text-slate-500">kW</span>
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">Peak window: 14:00 - 15:30</div>
          </div>
        </div>

        {/* POWER FACTOR */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Power Factor (PF)</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{avgPF.toFixed(3)}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Optimal (Target &gt; 0.95)</div>
          </div>
        </div>

        {/* DAILY ENERGY COST */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Energy Cost</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">$</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">${estimatedDailyCost.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Avg rate: $0.13 / kWh</div>
          </div>
        </div>
      </div>

      {/* Metrology & Power Quality Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Metrology Telemetry Bar */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Real-Time Metrology Telemetry</h3>
              <p className="text-xs text-slate-500">Live 3-phase instantaneous electrical vector readings</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
              Main Incomer [MTR-MAIN-01]
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'VOLTAGE (L-L)', value: '415.2', unit: 'V', sub: 'Nominal 415.0V (+0.05%)', color: 'text-slate-900' },
              { label: 'CURRENT (TOTAL)', value: '4,762.4', unit: 'A', sub: 'L1: 1,580A | L2: 1,595A | L3: 1,587A', color: 'text-slate-900' },
              { label: 'ACTIVE POWER (P)', value: currentDemand.toFixed(1), unit: 'kW', sub: 'Total active load', color: 'text-emerald-600' },
              { label: 'REACTIVE POWER (Q)', value: '998.4', unit: 'kVAR', sub: 'Inductive lag', color: 'text-slate-900' },
              { label: 'FREQUENCY', value: '50.02', unit: 'Hz', sub: 'Grid nominal 50.00 Hz', color: 'text-slate-900' },
              { label: 'POWER FACTOR', value: avgPF.toFixed(3), unit: '', sub: 'Capacitor bank ACTIVE', color: 'text-purple-600' }
            ].map((metric, i) => (
              <div key={i} className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                <div className="my-1">
                  <span className={`text-xl font-extrabold ${metric.color}`}>{metric.value}</span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">{metric.unit}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">{metric.sub}</span>
              </div>
            ))}
          </div>

          {/* Load Curve Chart */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Instantaneous Demand vs Baseline (24H)</h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="demand_kw" name="Actual kW" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  <Line type="monotone" dataKey="baseline_kw" name="Baseline kW" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Power Quality & Harmonics Panel */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Power Quality & Harmonics</h3>
                <p className="text-xs text-slate-500">IEEE 519 compliance monitoring</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-200">
                IEEE 519 Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Voltage Stability</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">99.4%</div>
                <div className="text-[10px] text-slate-400">Tolerance +/-2%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">THD Voltage</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">2.1%</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Threshold &lt; 5.0%</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Harmonics Order Spectrum</h4>
              {[
                { order: '3rd Harmonic (150 Hz)', val: '1.8%', pct: 36 },
                { order: '5th Harmonic (250 Hz)', val: '2.5%', pct: 50 },
                { order: '7th Harmonic (350 Hz)', val: '1.6%', pct: 32 },
                { order: '11th Harmonic (550 Hz)', val: '0.8%', pct: 16 },
              ].map((h, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{h.order}</span>
                    <span>{h.val}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${h.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Harmonic Filter:</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Online & Suppressing
            </span>
          </div>
        </div>
      </div>

      {/* Live Sentinels & Warnings Feed */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Live Metrology & Load Sentinels</h3>
            <p className="text-xs text-slate-500">Autonomous threshold anomaly detection logs</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">Real-Time Anomaly Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900">THD Warning: Computer Lab</span>
                <span className="text-[10px] text-red-500 font-semibold">12m ago</span>
              </div>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Total Harmonic Distortion exceeded 5% threshold on sub-meter MTR-2-SUB1. Filter engaged.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Reactive Power Surge</span>
                <span className="text-[10px] text-amber-600 font-semibold">1h ago</span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Power factor dropped to 0.88 on Substation 4 during high motor startup. Capacitor bank steps engaged.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Voltage Nominal</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Substation 1 voltage stable at 415.2V across all 3 phases. Zero Phase imbalance detected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-meter Telemetry Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">Sub-meter Telemetry Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Active smart meters and sub-meter metrology channels</p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredMeters.length} operational sub-meters
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Meter ID</th>
                <th className="px-5 py-3.5">Facility & Location</th>
                <th className="px-5 py-3.5 min-w-[200px]">Current Load & Capacity</th>
                <th className="px-5 py-3.5 text-right">Today's Total</th>
                <th className="px-5 py-3.5 text-center">Power Factor</th>
                <th className="px-5 py-3.5 text-center">Last Calibrated</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMeters.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <span className="font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
                      {m.meter_id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-800">{m.facility_name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{m.meter_type} Incomer</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-900">{m.current_kw.toFixed(1)} kW</span>
                      <span className="text-[10px] text-slate-400">Cap: {m.rated_capacity_kw} kW ({m.load_pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          m.load_pct > 85 ? 'bg-red-500' : m.load_pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, m.load_pct)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                    {m.today_kwh.toLocaleString()} <span className="text-slate-400 text-[10px] font-semibold">kWh</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      m.power_factor >= 0.95 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {m.power_factor.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-slate-500 text-[11px]">
                    {m.last_calibrated}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {m.status}
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
