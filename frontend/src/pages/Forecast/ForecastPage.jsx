import React, { useEffect, useRef, useState } from 'react';
import {
  Activity, BarChart2, CalendarDays, RefreshCw, TrendingUp, Zap, Info,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart,
  Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { forecastApi } from '../../api/forecastApi';
import { isRequestCanceled } from '../../api/axiosInstance';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v, d = 0) =>
  Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(`${v}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};

// Custom dot: only render for history (actual) points so forecast points don't
// show a dot on the actual_kwh line.
const HistoryDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.kind !== 'history' || payload.actual_kwh == null) return null;
  return <circle cx={cx} cy={cy} r={3} fill="#10b981" stroke="#fff" strokeWidth={1} />;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartPanel({ title, subtitle, children, height = 280 }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForecastPage() {
  const [filters, setFilters] = useState({ facilities: [], horizons: [] });
  const [facilityId, setFacilityId] = useState('ALL');
  const [horizonDays, setHorizonDays] = useState(7);
  const [summary, setSummary] = useState(null);
  const [consumptionSeries, setConsumptionSeries] = useState([]);
  const [facilityRows, setFacilityRows] = useState([]);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const fetchAll = async () => {
    const reqId = ++requestSequence.current;
    setLoading(true);
    setError('');
    const params = {
      horizon_days: horizonDays,
      ...(facilityId !== 'ALL' ? { facility_id: Number(facilityId) } : {}),
    };
    try {
      const promises = [
        forecastApi.getSummary(params),
        forecastApi.getConsumption(params),
        forecastApi.getFacilities(params),
        forecastApi.getConfidence(params),
      ];
      if (!filters.facilities.length) {
        promises.push(forecastApi.getFilters());
      }
      const results = await Promise.all(promises);
      if (reqId !== requestSequence.current) return;
      setSummary(results[0].data);
      setConsumptionSeries(results[1].data);
      setFacilityRows(results[2].data);
      setConfidence(results[3].data);
      if (results[4]) {
        setFilters(results[4].data);
      }
    } catch (err) {
      if (reqId !== requestSequence.current || isRequestCanceled(err)) return;
      console.error('Forecast fetch error:', err);
      setError('Forecast data could not be loaded. Please try again.');
    } finally {
      if (reqId === requestSequence.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [facilityId, horizonDays]);

  // ── Derive chart series ───────────────────────────────────────────────────
  // Split combined series into coloured segments for better readability.
  // History points have actual_kwh; forecast points have forecast_kwh.
  const chartSeries = consumptionSeries.map((pt) => ({
    ...pt,
    // Keep both fields; Recharts will handle nulls as gaps.
    date_label: fmtDate(pt.date),
  }));

  // Find the boundary date (last history date) to draw a reference line
  const lastHistoryEntry = [...consumptionSeries].reverse().find((p) => p.kind === 'history');
  const splitDate = lastHistoryEntry?.date ? fmtDate(lastHistoryEntry.date) : null;

  // Bar chart data for facility breakdown
  const facilityBarData = facilityRows.map((f) => ({
    name: f.facility_name.length > 20 ? f.facility_name.slice(0, 18) + '…' : f.facility_name,
    forecast_energy_kwh: f.forecast_energy_kwh,
    predicted_peak_demand_kw: f.predicted_peak_demand_kw,
    energy_lower_kwh: f.energy_lower_kwh,
    energy_upper_kwh: f.energy_upper_kwh,
    confidence_pct: f.confidence_pct,
  }));

  // ── Facility filter caching ─────────────────────────────────────────────
  const cachedFacilities = filters.facilities.length > 0 ? filters.facilities : [
    { id: 1, name: 'Main Admin Block' },
    { id: 2, name: 'Computer Lab & Data Center' },
    { id: 3, name: 'Factory & Advanced Workshops' },
    { id: 4, name: 'Hostel & Student Center' },
    { id: 5, name: 'Canteen & Dining Complex' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Energy Forecast &amp; Predictive Analytics
            </h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              AI Predictive Engine
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Data-driven energy consumption and peak demand forecasting using historical telemetry
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs"
          title="Refresh forecast"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ── Filter toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Facility selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Facility</label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="min-w-52 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Facilities (Campus Wide)</option>
              {cachedFacilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Model info badge */}
          {summary?.model_name ? (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-semibold text-emerald-800">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              Model: {summary.model_name}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500 animate-pulse">
              Loading model diagnostics...
            </div>
          )}
        </div>

        {/* Horizon selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 self-start lg:self-auto">
          {(filters.horizons.length ? filters.horizons : [
            { value: 1, label: '1 Day' },
            { value: 3, label: '3 Days' },
            { value: 7, label: '7 Days' },
            { value: 14, label: '14 Days' },
          ]).map((h) => (
            <button
              key={h.value}
              onClick={() => setHorizonDays(h.value)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                horizonDays === h.value
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Forecast Consumption"
          value={loading && !summary ? '...' : `${fmt(summary?.forecast_energy_kwh, 0)} kWh`}
          sub={`Next ${summary?.horizon_days ?? horizonDays} days · ${summary?.facility_name || 'Campus Wide'}`}
          icon={Zap}
          iconColor="text-emerald-500"
        />
        <KpiCard
          label="Avg Daily Consumption"
          value={loading && !summary ? '...' : `${fmt(summary?.average_daily_energy_kwh, 0)} kWh`}
          sub="Per day over forecast horizon"
          icon={BarChart2}
          iconColor="text-blue-500"
        />
        <KpiCard
          label="Predicted Peak Demand"
          value={loading && !summary ? '...' : `${fmt(summary?.predicted_peak_demand_kw, 1)} kW`}
          sub={`Range: ${fmt(summary?.peak_lower_kw, 0)}–${fmt(summary?.peak_upper_kw, 0)} kW`}
          icon={Activity}
          iconColor="text-amber-500"
        />
        <KpiCard
          label="Forecast Confidence"
          value={loading && !summary ? '...' : `${fmt(confidence?.confidence_pct, 1)}%`}
          sub={`Based on ${confidence?.history_days ?? 0} days of telemetry`}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
      </div>

      {/* ── Main charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Historical vs Forecast Consumption */}
        <ChartPanel
          title="Historical vs Forecast Consumption (kWh)"
          subtitle="Past telemetry (solid) and predicted values (dashed) with confidence band"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartSeries} margin={{ top: 8, right: 14, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fcstGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date_label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(v) => v}
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  value != null ? `${fmt(value, 0)} kWh` : '—',
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Confidence band rendered as area */}
              <Area
                type="monotone"
                dataKey="upper_kwh"
                name="Upper Bound"
                stroke="none"
                fill="#6366f1"
                fillOpacity={0.12}
                dot={false}
                legendType="none"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="lower_kwh"
                name="Lower Bound"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                dot={false}
                legendType="none"
                connectNulls={false}
              />

              {/* Actual history */}
              <Area
                type="monotone"
                dataKey="actual_kwh"
                name="Actual (kWh)"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#histGrad)"
                dot={<HistoryDot />}
                connectNulls={false}
              />

              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="forecast_kwh"
                name="Forecast (kWh)"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: '#6366f1' }}
                connectNulls={false}
              />

              {/* Today reference line */}
              {splitDate && (
                <ReferenceLine
                  x={splitDate}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: 'Today', position: 'top', fontSize: 10, fill: '#b45309' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Predicted Peak Demand */}
        <ChartPanel
          title="Predicted Peak Demand (kW)"
          subtitle="Historical peak demand and forecasted peaks with confidence range"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartSeries} margin={{ top: 8, right: 14, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="peakHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date_label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  value != null ? `${fmt(value, 1)} kW` : '—',
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Peak confidence band */}
              <Area
                type="monotone"
                dataKey="peak_upper_kw"
                name="Peak Upper"
                stroke="none"
                fill="#f59e0b"
                fillOpacity={0.12}
                dot={false}
                legendType="none"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="peak_lower_kw"
                name="Peak Lower"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                dot={false}
                legendType="none"
                connectNulls={false}
              />

              {/* Actual peak history */}
              <Area
                type="monotone"
                dataKey="actual_peak_kw"
                name="Actual Peak (kW)"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#peakHistGrad)"
                dot={false}
                connectNulls={false}
              />

              {/* Forecast peak */}
              <Line
                type="monotone"
                dataKey="predicted_peak_kw"
                name="Predicted Peak (kW)"
                stroke="#ef4444"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: '#ef4444' }}
                connectNulls={false}
              />

              {splitDate && (
                <ReferenceLine
                  x={splitDate}
                  stroke="#94a3b8"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: 'Today', position: 'top', fontSize: 10, fill: '#64748b' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* ── Confidence & model info panel ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900">Forecast Confidence &amp; Model Diagnostics</h3>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {[
            {
              label: 'Forecast Confidence',
              value: `${fmt(confidence?.confidence_pct, 1)}%`,
            },
            {
              label: 'Energy Range (Total)',
              value: `${fmt(confidence?.energy_lower_kwh, 0)} – ${fmt(confidence?.energy_upper_kwh, 0)} kWh`,
            },
            {
              label: 'Peak Demand Range',
              value: `${fmt(confidence?.peak_lower_kw, 1)} – ${fmt(confidence?.peak_upper_kw, 1)} kW`,
            },
            {
              label: 'History Used',
              value: `${confidence?.history_days ?? 0} days`,
            },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</span>
              <div className="text-sm font-extrabold text-slate-900 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900 font-medium">
            <span className="font-bold">Forecasting Model:</span> {confidence?.model_name ?? 'Damped linear trend (Scikit-learn)'}
            {' '}— historical telemetry aggregated over {confidence?.history_days ?? 0} days across all active smart meters.
          </div>
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 font-medium">
            <span className="font-bold">Confidence Interval:</span> 80% prediction interval shown as shaded bands on charts. Wider bands indicate higher uncertainty on longer horizons.
          </div>
        </div>
      </div>

      {/* ── Facility-wise forecast table ────────────────────────────────────── */}
      {facilityRows.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Facility-Wise Forecast Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Per-facility predicted energy consumption for the next {horizonDays} day{horizonDays > 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {facilityRows.length} Facilities
            </span>
          </div>

          {/* Horizontal bar chart for facility comparison */}
          <div className="p-5 border-b border-slate-100">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={facilityBarData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 10, fill: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, n) => [`${fmt(v, 0)} kWh`, n]}
                  />
                  <Bar
                    dataKey="forecast_energy_kwh"
                    name="Forecast (kWh)"
                    fill="#10b981"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detail table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Facility</th>
                  <th className="px-5 py-3.5 text-right">Forecast Energy</th>
                  <th className="px-5 py-3.5 text-right">Energy Range</th>
                  <th className="px-5 py-3.5 text-right">Peak Demand</th>
                  <th className="px-5 py-3.5 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {facilityRows.map((f) => (
                  <tr key={f.facility_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{f.facility_name}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {fmt(f.forecast_energy_kwh, 0)}{' '}
                      <span className="text-slate-400 text-[10px] font-semibold">kWh</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {fmt(f.energy_lower_kwh, 0)} – {fmt(f.energy_upper_kwh, 0)} kWh
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-amber-700">
                      {fmt(f.predicted_peak_demand_kw, 1)}{' '}
                      <span className="text-slate-400 text-[10px] font-semibold">kW</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          f.confidence_pct >= 80
                            ? 'bg-emerald-50 text-emerald-700'
                            : f.confidence_pct >= 60
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {fmt(f.confidence_pct, 1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
