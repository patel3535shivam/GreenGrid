import React, { useEffect, useRef, useState } from 'react';
import {
  Activity, BarChart2, CalendarDays, ChevronDown, Gauge, RefreshCw,
  TrendingUp, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend,
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { analyticsApi } from '../../api/analyticsApi';
import { isRequestCanceled } from '../../api/axiosInstance';

const formatNumber = (value, digits = 0) => Number(value || 0).toLocaleString(undefined, {
  maximumFractionDigits: digits,
  minimumFractionDigits: digits,
});

const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
});

const formatCurrency = (value) => `₹${formatNumber(value, 0)}`;

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState({ facilities: [], ranges: [] });
  const [range, setRange] = useState('7d');
  const [facilityId, setFacilityId] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [consumption, setConsumption] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [peakDemand, setPeakDemand] = useState([]);
  const [powerFactor, setPowerFactor] = useState([]);
  const [cost, setCost] = useState([]);
  const [renewable, setRenewable] = useState([]);
  const [efficiency, setEfficiency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const fetchAnalytics = async () => {
    const requestId = ++requestSequence.current;
    if (range === 'custom' && (!startDate || !endDate)) return;
    try {
      setLoading(true);
      setError('');
      const params = {
        range,
        facility_id: facilityId === 'ALL' ? null : Number(facilityId),
        ...(range === 'custom' ? { start_date: startDate, end_date: endDate } : {}),
      };
      const dashboardResponse = await analyticsApi.getDashboard(params);
      if (requestId !== requestSequence.current) return;
      setSummary(dashboardResponse.data.summary);
      setConsumption(dashboardResponse.data.consumption);
      setFacilities(dashboardResponse.data.facilities);
      setPeakDemand(dashboardResponse.data.peak_demand);
      setPowerFactor(dashboardResponse.data.power_factor);
      setCost(dashboardResponse.data.cost);
      setRenewable(dashboardResponse.data.renewable);
      setEfficiency(dashboardResponse.data.efficiency);
    } catch (fetchError) {
      if (requestId !== requestSequence.current || isRequestCanceled(fetchError)) return;
      console.error('Error loading analytics:', fetchError);
      setError('Analytics data could not be loaded. Refresh to try again.');
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  };

  useEffect(() => {
    analyticsApi.getFilters()
      .then((response) => setFilters(response.data))
      .catch((filterError) => {
        if (!isRequestCanceled(filterError)) {
          console.error('Error loading analytics filters:', filterError);
          setError('Analytics filters could not be loaded.');
        }
      });
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [range, facilityId, startDate, endDate]);

  if (loading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading analytics from GreenGrid telemetry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Energy Analytics & Forecast</h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Operational Analytics
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Historical consumption, demand, cost, power quality, and renewable contribution.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs"
          title="Refresh analytics"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Facility</label>
            <select
              value={facilityId}
              onChange={(event) => setFacilityId(event.target.value)}
              className="min-w-56 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Facilities</option>
              {filters.facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>{facility.name}</option>
              ))}
            </select>
          </div>
          {range === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">From</label>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">To</label>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 px-3 py-2" />
              </div>
            </>
          )}
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 self-start lg:self-auto">
          {filters.ranges.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`px-3 py-1.5 rounded-md transition-all ${range === option.value ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Energy Consumption</span><Zap className="w-4 h-4 text-emerald-500" /></div>
          <div className="text-2xl font-extrabold text-slate-900">{formatNumber(summary?.total_consumption_kwh, 0)} <span className="text-xs font-semibold text-slate-500">kWh</span></div>
          <p className="text-[10px] text-slate-400 mt-1">{summary?.reporting_days ?? 0} days with telemetry</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Peak Demand</span><Activity className="w-4 h-4 text-amber-500" /></div>
          <div className="text-2xl font-extrabold text-slate-900">{formatNumber(summary?.peak_demand_kw, 1)} <span className="text-xs font-semibold text-slate-500">kW</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Coincident active-meter demand</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Power Factor</span><Gauge className="w-4 h-4 text-blue-500" /></div>
          <div className="text-2xl font-extrabold text-slate-900">{formatNumber(summary?.average_power_factor, 3)}</div>
          <p className="text-[10px] text-slate-400 mt-1">Measured across selected meters</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Energy Cost</span><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
          <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(summary?.estimated_energy_cost)}</div>
          <p className="text-[10px] text-slate-400 mt-1">Tariff-based for selected period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartPanel title="Energy Consumption Trend" subtitle="Daily measured energy use and peak demand">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={consumption} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip labelFormatter={formatDate} contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="consumption_kwh" name="Consumption (kWh)" fill="#0f766e" radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" dataKey="peak_demand_kw" name="Peak Demand (kW)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Facility Consumption Comparison" subtitle="Consumption by facility for the selected period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={facilities} layout="vertical" margin={{ top: 4, right: 20, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis type="category" dataKey="facility_name" width={140} tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="consumption_kwh" name="Consumption (kWh)" fill="#3b82f6" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Peak Demand Analysis" subtitle="Hourly coincident meter demand (kW)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={peakDemand} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs><linearGradient id="peakArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="demand_kw" name="Peak Demand (kW)" stroke="#d97706" fill="url(#peakArea)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Energy Cost Trend" subtitle="Tariff-based daily energy cost and metered consumption">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cost} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `₹${formatNumber(value)}`} tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip labelFormatter={formatDate} formatter={(value, name) => [name.includes('Cost') ? formatCurrency(value) : `${formatNumber(value)} kWh`, name]} contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="estimated_total_cost" name="Estimated Cost" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" dataKey="consumption_kwh" name="Consumption (kWh)" stroke="#6366f1" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Power Factor Analysis" subtitle="Average measured power factor by day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={powerFactor} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip labelFormatter={formatDate} formatter={(value) => [Number(value).toFixed(3), 'Power Factor']} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="average_power_factor" name="Average PF" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Renewable Contribution" subtitle="Recorded solar output compared with measured consumption">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={renewable} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip labelFormatter={formatDate} contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="solar_generation_kwh" name="Solar (kWh)" stroke="#d97706" fill="#fbbf24" fillOpacity={0.28} />
              <Area type="monotone" dataKey="consumption_kwh" name="Consumption (kWh)" stroke="#0f766e" fill="#14b8a6" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900">Energy Efficiency Indicators</h3>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <Indicator label="Energy Intensity" value={`${formatNumber(efficiency?.energy_intensity_kwh_per_sqft, 3)} kWh/sq ft`} />
          <Indicator label="Load Factor" value={`${formatNumber(efficiency?.load_factor_pct, 1)}%`} />
          <Indicator label="Average Power Factor" value={formatNumber(efficiency?.average_power_factor, 3)} />
          <Indicator label="Consumption / Active Meter" value={`${formatNumber(efficiency?.consumption_per_active_meter_kwh, 1)} kWh`} />
        </div>
        <div className="space-y-2">
          {(efficiency?.insights || []).map((insight) => (
            <div key={insight} className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700">
              <Activity className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />{insight}
            </div>
          ))}
          {!efficiency?.insights?.length && <p className="text-xs text-slate-400">No efficiency observations for this range.</p>}
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

function Indicator({ label, value }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span>
      <div className="text-base font-extrabold text-slate-900 mt-1">{value}</div>
    </div>
  );
}