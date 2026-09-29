import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reportsApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  FileText, Download, Calendar, Filter, CheckCircle2, ShieldCheck, 
  Layers, HardDrive, RefreshCw, ArrowUpRight, Zap, Check 
} from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('energy');
  const [facilityScope, setFacilityScope] = useState('ALL');
  const [format, setFormat] = useState('CSV');
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [configurations, setConfigurations] = useState({ report_types: [], formats: [], facilities: [] });
  const [preview, setPreview] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [history, setHistory] = useState([]);

  const facilityId = facilityScope === 'ALL' ? null : Number(facilityScope);

  const fetchStaticData = async () => {
    try {
      const [summaryResponse, configurationResponse, historyResponse] = await Promise.all([
        reportsApi.getSummary(),
        reportsApi.getConfigurations(),
        reportsApi.getHistory(),
      ]);
      setSummary(summaryResponse.data);
      setConfigurations(configurationResponse.data);
      setHistory(historyResponse.data);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error loading Reports summary:', err);
      setError('Reports summary could not be loaded. Refresh the page to try again.');
    }
  };

  const fetchReportPreview = async () => {
    const params = { report_type: reportType, facility_id: facilityId };
    const reportDataRequest = reportType === 'billing'
      ? reportsApi.getBilling(params)
      : reportsApi.getTelemetry(params);
    try {
      setError('');
      const [previewResponse, reportResponse] = await Promise.all([
        reportsApi.getPreview(params),
        reportDataRequest,
      ]);
      setPreview(previewResponse.data);
      setReportData(reportResponse.data);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error loading Reports preview:', err);
      setError('Report preview could not be loaded. Refresh the page to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaticData();
  }, []);

  useEffect(() => {
    fetchReportPreview();
  }, [reportType, facilityScope]);

  const formatBytes = (bytes = 0) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** unitIndex)).toFixed(unitIndex ? 1 : 0)} ${units[unitIndex]}`;
  };

  const handleDownload = async (type = reportType, scope = facilityScope, regenerate = true) => {
    try {
      setDownloading(true);
      setError('');
      const selectedFacilityId = scope === 'ALL' ? null : Number(scope);
      const params = { report_type: type, facility_id: selectedFacilityId, format };
      const res = regenerate
        ? await reportsApi.generateReport(params)
        : await reportsApi.exportCSV(type, selectedFacilityId, format);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers['content-disposition'];
      const fileName = disposition?.match(/filename="?([^";]+)"?/)?.[1];
      a.download = fileName || `GreenGrid_${type.toUpperCase()}_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      await Promise.all([fetchStaticData(), fetchReportPreview()]);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error("CSV Export failed:", err);
      setError('The report could not be generated. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading reports from GreenGrid data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Export</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Generate, schedule and audit enterprise energy billing, metrology, and IoT data streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleDownload()}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating CSV...' : 'Generate & Download Report'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Top 4 Report KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL REPORTS GENERATED */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports Generated</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.total_reports_generated?.toLocaleString() ?? 0}</span>
              <span className="text-xs font-semibold text-emerald-600">Saved exports</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Generated CSV reports recorded</p>
          </div>
        </div>

        {/* SCHEDULED AUTOMATED DISPATCH */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Dispatch</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.automated_dispatch ?? 0}</span>
              <span className="text-xs font-semibold text-slate-600">Active Pipelines</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Scheduled report pipelines</p>
          </div>
        </div>

        {/* COMPLIANCE & AUDIT READY */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Compliance</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.audit_compliance_pct ?? 0}%</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">ISO 50001</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Fully aligned with BEE & ISO metrics</p>
          </div>
        </div>

        {/* TOTAL EXPORT VOLUME */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Export Volume</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{formatBytes(summary?.total_export_bytes)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{summary?.rows_exported_quarter?.toLocaleString() ?? 0} rows exported this quarter</p>
          </div>
        </div>
      </div>

      {/* Main Configuration & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Configuration Panel */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Report Configuration</h3>
            <p className="text-xs text-slate-500">Customize parameters to generate automated Pandas CSV exports</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Facility Scope</label>
              <select 
                value={facilityScope}
                onChange={(e) => setFacilityScope(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Facilities (Campus Aggregated)</option>
                {configurations.facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>{facility.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Report Category & Stream</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {configurations.report_types.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Export Format</label>
              <div className="flex gap-2">
                  {configurations.formats.map((availableFormat) => (
                    <button
                      key={availableFormat}
                      onClick={() => setFormat(availableFormat)}
                      className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                        format === availableFormat ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Pandas {availableFormat}
                    </button>
                  ))}
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleDownload()}
                disabled={downloading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Processing Export...' : 'Generate & Download Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Executive Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live Telemetry Preview</span>
                <h3 className="font-bold text-slate-900 text-base mt-0.5">Executive Summary — {preview?.facility_name || 'Campus Wide'}</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {reportData.length.toLocaleString()} preview rows
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Consumption</span>
                <div className="text-base font-extrabold text-slate-900 mt-1">{preview?.consumption_kwh?.toLocaleString() ?? 0} kWh</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Billed Cost</span>
                <div className="text-base font-extrabold text-slate-900 mt-1">₹{preview?.billed_cost?.toLocaleString() ?? 0}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Peak Demand</span>
                <div className="text-base font-extrabold text-slate-900 mt-1">{preview?.peak_demand_kw?.toLocaleString() ?? 0} kW</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Solar Yield</span>
                <div className="text-base font-extrabold text-emerald-600 mt-1">{preview?.solar_yield_kwh?.toLocaleString() ?? 0} kWh</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900 font-medium">
                <span className="font-bold">Telemetry Coverage:</span> {preview?.audit_compliance_pct ?? 0}% of active meters reported during the current period ({preview?.telemetry_reporting_meters ?? 0} of {preview?.active_meters ?? 0}).
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 font-medium">
                <span className="font-bold">Average Power Factor:</span> {preview?.average_power_factor ?? 0} from {preview?.telemetry_rows?.toLocaleString() ?? 0} current-period readings.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-semibold flex justify-between">
            <span>Digital Signature: GreenGrid Enterprise Ledger v2.4</span>
            <span className="text-emerald-600">CSV Export Stream Enabled</span>
          </div>
        </div>
      </div>

      {/* Compiled Reports & Historical Archives Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Compiled Reports & Historical Archives</h3>
          <p className="text-xs text-slate-500 mt-0.5">Pre-calculated compliance, audit, and billing report packages</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Report Name & Description</th>
                <th className="px-5 py-3.5">Facility Scope</th>
                <th className="px-5 py-3.5">Coverage Span</th>
                <th className="px-5 py-3.5 text-right">File Size</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {history.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{report.file_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{report.row_count.toLocaleString()} data rows • Pandas CSV Engine</div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{report.facility_name || 'Campus Wide'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{new Date(report.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatBytes(report.file_size_bytes)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Ready
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button 
                      onClick={() => handleDownload(report.report_type, report.facility || 'ALL', false)}
                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-bold"
                      title="Download CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!history.length && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">No reports have been generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
