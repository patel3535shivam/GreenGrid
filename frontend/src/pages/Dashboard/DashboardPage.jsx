import React, { useState, useEffect } from 'react';
import { energyApi } from '../../api/energyApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, ShieldAlert, Cpu, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Today');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const kpiRequest = energyApi.getDashboardKPIs().then((response) => {
        setKpis(response.data);
        setLoading(false);
        return response;
      });
      const [kpiRes, chartRes, breakdownRes] = await Promise.all([
        kpiRequest,
        energyApi.getConsumptionChart(),
        energyApi.getFacilityBreakdown()
      ]);
      setKpis(kpiRes.data);
      setChartData(chartRes.data);
      setBreakdown(breakdownRes.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  if (loading && !kpis) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading aggregated energy telemetry...
        </div>
      </div>
    );
  }

  const demandVal = kpis?.power_demand_kw || 3420;
  const maxCap = 4000;
  const capPct = Math.round((demandVal / maxCap) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Energy Overview & Command</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time aggregated telemetry across active facilities — Updated {Math.floor((new Date() - lastUpdated) / 1000)}s ago
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Telemetry Active
          </span>
          <button 
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL CONSUMPTION */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consumption</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> {kpis?.consumption_trend || '+4.2%'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{kpis?.total_consumption_kwh?.toLocaleString()}</span>
            <span className="text-sm font-semibold text-slate-500">kWh</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Prev: 137,050 kWh</div>
        </div>

        {/* POWER DEMAND */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Power Demand</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-3 h-3" /> {kpis?.demand_trend || '+1.8%'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{kpis?.power_demand_kw?.toLocaleString()}</span>
            <span className="text-sm font-semibold text-slate-500">kW</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Ceiling: 4,000 kW ({capPct}% cap)</div>
        </div>

        {/* ACCUMULATED COST */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accumulated Cost</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingDown className="w-3 h-3" /> {kpis?.cost_trend || '-8.1%'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">${kpis?.accumulated_cost?.toLocaleString()}</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Projected: $52,400/mo</div>
        </div>

        {/* RENEWABLE SHARE */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Renewable Share</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-3 h-3" /> {kpis?.renewable_trend || '+2.4%'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{kpis?.renewable_share_pct}</span>
            <span className="text-sm font-semibold text-slate-500">%</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Solar PV: 890 kW Active</div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Energy Consumption (kWh) vs Power Demand (kW)</h3>
            <p className="text-xs text-slate-500 mt-0.5">24-hour continuous load profile with peak tariff window highlight</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
              {['Today', 'Yesterday', '7D', '30D'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 font-bold shadow-xs' 
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Legend Indicators */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            Energy Demand (Actual kW)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500 stroke-dasharray"></div>
            Contract Limit (4,000 kW)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400/50 rounded-sm"></div>
            Solar PV Offset
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '8px', 
                  border: 'none', 
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' 
                }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="demand_kw" name="Demand (kW)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemand)" />
              <Area type="monotone" dataKey="solar_offset" name="Solar Offset (kW)" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSolar)" />
              <Line type="monotone" dataKey={() => 4000} name="Contract Limit" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Facility Breakdown, Peak Sentinel, AI Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facility Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Facility Breakdown</h3>
                <p className="text-xs text-slate-500">Top consumers across campus today</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">Cycle-ranking</span>
            </div>

            <div className="space-y-4">
              {breakdown.slice(0, 5).map((fac, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      {fac.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{fac.kwh?.toLocaleString()} kWh</span>
                      <span className="text-xs text-slate-400 ml-1.5 font-medium">({fac.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-emerald-600' : i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-teal-500' : 'bg-slate-400'
                      }`} 
                      style={{ width: `${Math.min(100, fac.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a 
            href="/energy-monitoring" 
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
          >
            View metrology telemetry for all facilities
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Peak Demand Sentinel */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Peak Demand Sentinel</h3>
                <p className="text-xs text-slate-500">Automated peak surge prevention guard</p>
              </div>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Warning Active
              </span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="relative w-36 h-36 flex-shrink-0 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: demandVal }, { value: Math.max(0, maxCap - demandVal) }]}
                      cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={45} outerRadius={62}
                      dataKey="value" stroke="none"
                    >
                      <Cell fill="#f59e0b" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
                  <span className="text-2xl font-extrabold text-slate-900">{demandVal.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">kW ({capPct}%)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-400 font-semibold">Peak Today</div>
                <div className="text-sm font-bold text-red-600 mt-0.5">3,890 kW</div>
                <div className="text-[10px] text-slate-400 mt-0.5">at 14:22 hrs</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-400 font-semibold">Alert Target</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">3,600 kW</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Max Cap: 4,000 kW</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-100 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>Peak Tariff Window ends in 1h 38m — Shedding shedding ready.</span>
          </div>
        </div>

        {/* AI Energy Optimization Engine */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI Energy Optimization Engine</h3>
                <p className="text-xs text-slate-500">Autonomous dispatch models</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 border border-emerald-200 bg-emerald-50/60 rounded-xl hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">High Impact</span>
                  <span className="text-[11px] font-semibold text-emerald-800">Main Admin & Labs</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Shift High-Load HVAC & Chiller Cycles to Off-Peak</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Pre-cool Main Admin building by 2.2°C between 13:00 and 15:00 prior to peak tariff onset.
                </p>
              </div>

              <div className="p-3.5 border border-blue-200 bg-blue-50/60 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">Medium Impact</span>
                  <span className="text-[11px] font-semibold text-blue-800">Data Center & Comp Lab</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Pre-cool Computer Lab during Solar Surplus</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Harness excess solar generation during midday peak (920 kW max) to chill auxiliary water loops.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Optimization Model v4.2</span>
            <span className="text-emerald-600 font-bold">98.4% Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
