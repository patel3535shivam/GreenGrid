import React, { useState, useEffect } from 'react';
import { billingApi } from '../../api/billingApi';
import { isRequestCanceled } from '../../api/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ComposedChart 
} from 'recharts';
import { 
  Receipt, Download, FileText, Calendar, Zap, CreditCard, CheckCircle, 
  Clock, ArrowUpRight, Percent, Sliders, AlertCircle, RefreshCw
} from 'lucide-react';

export default function BillingPage() {
  const [summary, setSummary] = useState(null);
  const [tariff, setTariff] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingBill, setGeneratingBill] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, tariffRes, histRes] = await Promise.all([
        billingApi.getSummary(),
        billingApi.getTariff(),
        billingApi.getHistory(),
      ]);
      setSummary(sumRes.data);
      setTariff(tariffRes.data);
      setHistory(histRes.data);
      setLoading(false);

      const [breakRes, trendRes] = await Promise.all([
        billingApi.getFacilityBreakdown(),
        billingApi.getTrends(),
      ]);
      setBreakdown(breakRes.data);
      setTrends(trendRes.data);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error loading billing data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateBill = async () => {
    try {
      setGeneratingBill(true);
      await billingApi.generateBill();
      await fetchData();
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error generating bill:', err);
    } finally {
      setGeneratingBill(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await billingApi.exportCsv();
      const downloadUrl = window.URL.createObjectURL(response.data);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'greengrid-billing.csv';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      console.error('Error exporting billing CSV:', err);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading utility billing telemetry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Utility Billing</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Main electricity tariff, tier, and billing performance across business facilities
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-xs">
            <FileText className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-xs">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button onClick={handleGenerateBill} disabled={generatingBill} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs">
            <Receipt className="w-3.5 h-3.5" />
            Generate Bill
          </button>
        </div>
      </div>

      {/* Top 5 Billing KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CURRENT MONTH BILL */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Month Bill</span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
              15 Days Due
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹{summary?.current_month_bill?.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Due {summary?.due_date}</div>
          </div>
        </div>

        {/* TOTAL CONSUMPTION */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Consumption</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{summary?.total_consumption_kwh?.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Daily Average: {summary?.daily_average_kwh?.toLocaleString()} kWh</div>
          </div>
        </div>

        {/* ENERGY CHARGES */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Energy Charges</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Active Tier</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹{summary?.energy_charges?.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">{summary?.current_month_bill ? ((summary.energy_charges / summary.current_month_bill) * 100).toFixed(1) : 0}% of account bill</div>
          </div>
        </div>

        {/* FIXED CHARGES */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fixed Charges</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Contract Slab</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹{summary?.fixed_charges?.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Monthly contracted charge</div>
          </div>
        </div>

        {/* AVERAGE COST / UNIT */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Cost / Unit</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹{summary?.avg_cost_per_unit}</span>
              <span className="text-xs font-semibold text-slate-500">/ kWh</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Effective net rate</div>
          </div>
        </div>
      </div>

      {/* Bill Summary & Tariff Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Bill Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Current Bill Summary
                </h3>
                <p className="text-xs text-slate-500">Aggregated breakdown for current billing cycle</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                Status: {summary?.status === 'PAID' ? 'Paid' : summary?.status === 'OVERDUE' ? 'Overdue' : 'Payment Due'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600 font-medium">
                <span>Billing Period:</span>
                <span className="font-bold text-slate-900">{summary?.billing_period}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600 font-medium">
                <span>Total Consumption:</span>
                <span className="font-bold text-slate-900">{summary?.total_consumption_kwh?.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600 font-medium">
                <span>Energy Charges:</span>
                <span className="font-bold text-slate-900">₹{summary?.energy_charges?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600 font-medium">
                <span>Fixed Charges:</span>
                <span className="font-bold text-slate-900">₹{summary?.fixed_charges?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600 font-medium">
                <span>Taxes & Duties (GST 12%):</span>
                <span className="font-bold text-slate-900">₹{summary?.tax_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-emerald-50/70 text-emerald-900 px-3 rounded-lg font-bold border border-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Renewable Energy Credit (Solar Self-Consumption):
                </span>
                <span className="text-emerald-700">-₹{summary?.renewable_credit?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final Payable Amount</span>
              <div className="text-3xl font-black text-slate-900">₹{summary?.current_month_bill?.toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm">
                Pay Now / Approve
              </button>
            </div>
          </div>
        </div>

        {/* Tariff Configuration Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Tariff Configuration</h3>
                <p className="text-xs text-slate-500">Active HT Time-of-Use slabs</p>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-lg">
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>0 - 100 kWh:</span>
                  <span className="text-emerald-600">₹{tariff?.tier1_rate} / kWh</span>
                </div>
                <p className="text-[10px] text-slate-400">Tier 1 Base Allowance</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>101 - 500 kWh:</span>
                  <span className="text-emerald-600">₹{tariff?.tier2_rate} / kWh</span>
                </div>
                <p className="text-[10px] text-slate-400">Tier 2 Intermediate Rate</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>501+ kWh:</span>
                  <span className="text-emerald-600">₹{tariff?.tier3_rate} / kWh</span>
                </div>
                <p className="text-[10px] text-slate-400">Tier 3 Standard Commercial</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex justify-between font-bold text-amber-900 mb-1">
                  <span>13:00 - 17:00 Peak Tariff:</span>
                  <span className="text-amber-700">₹{tariff?.peak_surcharge_rate} / kWh</span>
                </div>
                <p className="text-[10px] text-amber-700">Time-of-Use Peak Window Rate</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
            Current Active Tariff Slab ID: HT-2B Commercial
          </div>
        </div>
      </div>

      {/* Billing Trends & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bill Trend */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Monthly Bill Trend</h3>
            <p className="text-xs text-slate-500">Historical monthly electricity costs (₹)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="cost" name="Monthly Cost (₹)" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumption vs Cost */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Consumption (kWh) vs Cost (₹)</h3>
            <p className="text-xs text-slate-500">Dual-axis correlation of load volume vs total bill</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="kwh" name="Consumption (kWh)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Electricity Cost (₹)" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Facility Billing Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Facility Billing & Cost Allocation</h3>
          <p className="text-xs text-slate-500 mt-0.5">Apportioned energy charges across individual campus facilities</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Facility Name</th>
                <th className="px-5 py-3.5 text-right">Consumption</th>
                <th className="px-5 py-3.5 text-right">Energy Charges</th>
                <th className="px-5 py-3.5 text-right">Fixed Charges</th>
                <th className="px-5 py-3.5 text-right">Tax</th>
                <th className="px-5 py-3.5 text-right">Total Bill</th>
                <th className="px-5 py-3.5 text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {breakdown.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{item.facility_name}</td>
                  <td className="px-5 py-3.5 text-right font-semibold">{item.consumption_kwh?.toLocaleString()} kWh</td>
                  <td className="px-5 py-3.5 text-right">₹{item.energy_charges?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">₹{item.fixed_charges?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">₹{item.tax?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">₹{item.total_bill?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Bill History & Audit Log</h3>
          <p className="text-xs text-slate-500 mt-0.5">Completed billing cycles for financial year 2026-27</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Month</th>
                <th className="px-5 py-3.5">Billing Period</th>
                <th className="px-5 py-3.5 text-right">Consumption</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5 text-center">Due Date</th>
                <th className="px-5 py-3.5 text-center">Financial Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{h.billing_period}</td>
                  <td className="px-5 py-3.5 text-slate-500">{h.start_date} to {h.end_date}</td>
                  <td className="px-5 py-3.5 text-right font-semibold">{h.total_kwh?.toLocaleString()} kWh</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">₹{h.net_payable?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center text-slate-500">{h.due_date}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      h.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {h.status}
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
