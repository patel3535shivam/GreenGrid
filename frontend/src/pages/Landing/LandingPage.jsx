import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import {
  Zap,
  Sun,
  TrendingUp,
  Receipt,
  Building2,
  BarChart2,
  ShieldCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Flame,
  Leaf,
  Layers,
  Database,
  Lock,
  ChevronRight,
  Sparkles,
  Server,
  Radio,
  FileCheck,
  Compass,
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('metrology');

  // Campus summary stats
  const metrics = [
    { label: 'Campus Facilities', val: '12', sub: 'Active distributed zones', icon: Building2 },
    { label: 'Ingested Telemetry', val: '41,800+', sub: 'Sub-second vector readings', icon: Database },
    { label: 'Smart Metrology Meters', val: '24', sub: 'Bi-directional IoT nodes', icon: Radio },
    { label: 'Renewable Share', val: '32.4%', sub: 'Solar PV + BESS dispatch', icon: Sun },
    { label: 'Compliance Grade', val: 'ISO 50001', sub: 'Verified energy accounting', icon: FileCheck },
  ];

  // Core feature modules
  const features = [
    {
      id: 'metrology',
      title: 'Real-Time Metrology & Load Profiling',
      tag: 'Core Metrology Engine',
      desc: 'Capture continuous sub-second electrical parameters: Active Power (kW), Reactive (kVAR), Voltage, Current, Frequency, and Power Factor across campus feeders.',
      metrics: [
        { label: 'Active Demand', value: '3,420 kW', trend: '+1.8% vs baseline' },
        { label: 'Power Factor', value: '0.984 PF', trend: 'Nominal / Balanced' },
        { label: 'Total Harmonics (THD)', value: '2.1% THD', trend: 'Well within IEEE 519' },
      ],
      icon: Zap,
      accent: 'emerald',
    },
    {
      id: 'renewable',
      title: 'Renewable PV & BESS Microgrid Dispatch',
      tag: 'Clean Energy & Net Metering',
      desc: 'Automate rooftop solar PV harvesting, monitor Battery Energy Storage Systems (BESS) state-of-charge, and optimize grid export with bidirectional net metering.',
      metrics: [
        { label: 'Solar Fleet Yield', value: '890 kW Active', trend: 'Peak 920 kW at midday' },
        { label: 'Storage SoC (BESS)', value: '92% Charged', trend: 'Discharging ready' },
        { label: 'Carbon Avoidance', value: '730 kg CO₂ / day', trend: 'Clean green offset' },
      ],
      icon: Sun,
      accent: 'amber',
    },
    {
      id: 'forecast',
      title: 'Predictive Load Forecasting & Sentinel',
      tag: 'Scikit-Learn ML Models',
      desc: 'Machine learning models predict daily energy consumption and peak demand across 1, 3, 7, and 14-day horizons, enabling proactive peak shaving before tariff penalty thresholds.',
      metrics: [
        { label: '7-Day Projected Load', value: '256,963 kWh', trend: '80% confidence interval' },
        { label: 'Predicted Peak Demand', value: '2,186 kW', trend: 'Below 4,000 kW ceiling' },
        { label: 'Peak Sentinel Guard', value: 'Armed & Active', trend: 'Auto-shedding active' },
      ],
      icon: TrendingUp,
      accent: 'blue',
    },
    {
      id: 'billing',
      title: 'Automated HT Utility Billing & Tariff Slabs',
      tag: 'Fiscal Audit & Cost Control',
      desc: 'Transparent facility-by-facility cost allocation supporting High Tension (HT) commercial multi-tier slab tariffs, peak-hour surcharges, GST calculations, and audit CSV exports.',
      metrics: [
        { label: 'Current Period Total', value: '₹69,25,033', trend: '12 facilities allocated' },
        { label: 'Base Unit Tariff', value: '₹5.50 - ₹8.50/kWh', trend: 'Tiered commercial slabs' },
        { label: 'Peak Hour Surcharge', value: '₹10.50/kWh', trend: '13:00-17:00 window' },
      ],
      icon: Receipt,
      accent: 'purple',
    },
  ];

  const activeFeature = features.find((f) => f.id === activeTab) || features[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* ── 1. Top Navbar (Reuses exact GreenGrid Navbar design) ── */}
      <Navbar isLanding={true} />

      {/* ── 2. Hero Section ── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/40">
        {/* Subtle decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Smart Energy Management Information System (EMIS) • Real-time • Sustainable</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Intelligent Energy Management for a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 underline decoration-emerald-300 decoration-wavy decoration-2">
                  Sustainable Future.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                GreenGrid unifies real-time energy monitoring, renewable integration, smart billing, advanced analytics and forecasting across multi-campus facilities — helping institutions reduce costs, lower emissions and accelerate the clean energy transition.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
                >
                  <span>Explore Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* 3 Core Value Props below CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/90">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Optimize Energy Usage</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Reduce operational costs & avoid peak surcharges</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-100/80 text-amber-700 mt-0.5">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Integrate Renewables</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Solar PV, BESS & automated microgrid dispatch</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100/80 text-blue-700 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Predict Demand</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Machine learning load forecasting & peak shaving</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic / Telemetry Display (5 Cols) */}
            <div className="lg:col-span-5 relative">
              {/* Glow backdrop */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-blue-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

              <div className="relative bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl text-white overflow-hidden">
                {/* Campus Photography Showcase Banner */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden rounded-xl mb-4 border border-slate-700/60 shadow-inner group">
                  <img
                    src="/images/campus-solar-hero.jpg"
                    alt="GreenGrid Campus & Solar Canopy Infrastructure"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent pointer-events-none" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 text-[11px] font-semibold text-emerald-400 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Campus Solar Grid • Live Facility Node</span>
                  </div>
                  <div className="absolute bottom-2 right-2.5 text-[10px] font-mono text-slate-300 bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-700/70">
                    REAL-TIME METROLOGY
                  </div>
                </div>

                {/* Header bar inside card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">GreenGrid Metrology Hub</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    CAMPUS-WIDE ACTIVE
                  </span>
                </div>

                {/* Main Hero Metric Vector */}
                <div className="py-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Live Campus Demand</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      +1.8% Peak Normal
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">3,420.0</span>
                    <span className="text-lg font-bold text-emerald-400">kW</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Ceiling Capacity: 4,000 kW</span>
                    <span className="font-semibold text-slate-300">85.5% Load</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-2 rounded-full w-[85.5%]" />
                  </div>
                </div>

                {/* Sub-grid of Live Vectors */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Solar Generation</span>
                    </div>
                    <div className="text-lg font-bold text-white">890.0 kW</div>
                    <div className="text-[10px] text-amber-300/90 font-medium">32.4% Clean Share</div>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span>Power Factor</span>
                    </div>
                    <div className="text-lg font-bold text-white">0.984 PF</div>
                    <div className="text-[10px] text-blue-300/90 font-medium">Unity Target Met</div>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>Peak Sentinel</span>
                    </div>
                    <div className="text-lg font-bold text-white">Armed</div>
                    <div className="text-[10px] text-emerald-400 font-medium">No active breaches</div>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Carbon Saved</span>
                    </div>
                    <div className="text-lg font-bold text-white">730.0 kg</div>
                    <div className="text-[10px] text-emerald-300/90 font-medium">Avoided today</div>
                  </div>
                </div>

                {/* Floating Sentinel Alert Badge */}
                <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">AI Optimization Engine v4.2 Running</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">98.4% Confidence</span>
                </div>
              </div>

              {/* Floating Pill Card - Bottom Left */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl items-center gap-3 text-slate-800 z-20">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">12 Campus Facilities</div>
                  <div className="text-[11px] text-slate-500">24 Smart Metrology Meters Synced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Live Metrics Banner (Enterprise Scale) ── */}
      <section className="bg-white border-b border-slate-200 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className={`flex items-center gap-3.5 ${i !== 0 ? 'md:pl-6' : ''} ${i > 1 ? 'pt-4 md:pt-0' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-emerald-600 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">{m.val}</div>
                    <div className="text-xs font-bold text-slate-700 leading-tight">{m.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Interactive Feature Showcase (Flagship Capabilities) ── */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Unified EMIS Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              One Command Platform for Institutional Energy
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Designed specifically for multi-campus educational institutions, industrial parks, and smart complexes to deliver end-to-end metrology, forecasting, and automated utility billing.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {features.map((f) => {
              const Icon = f.icon;
              const isActive = activeTab === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{f.title.split('&')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {activeFeature.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {activeFeature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {activeFeature.desc}
                </p>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Live automated ingestion with zero manual meter-reading errors</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time sentinel alerts with diagnostic inspection logs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Full audit logging and exportable ISO 50001 compliant archives</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 group"
                  >
                    <span>View live interactive module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Metrology Cards */}
              <div className="lg:col-span-6 bg-slate-900 rounded-xl p-6 text-white border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                  <span className="font-bold text-slate-300">Live Telemetry Inspection</span>
                  <span className="text-emerald-400 font-mono text-[11px]">UPDATED REAL-TIME</span>
                </div>

                {activeTab === 'renewable' && (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden border border-slate-700/80 shadow-inner group">
                    <img
                      src="/images/solar-infrastructure.jpg"
                      alt="Commercial Rooftop Solar Photovoltaic Array"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-xs font-semibold text-white">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Commercial Rooftop PV Array • High-Tension Fed</span>
                    </div>
                    <div className="absolute top-2.5 right-3 bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded shadow-xs">
                      890 kW Active Yield
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeFeature.metrics.map((m, i) => (
                    <div key={i} className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</div>
                      <div className="text-lg font-extrabold text-white mt-1">{m.value}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">{m.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Telemetry Wave preview box */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="text-[11px] font-semibold">Continuous Metrology Stream</span>
                    <span className="text-[10px] text-slate-500">24 Nodes Active</span>
                  </div>
                  <div className="h-16 flex items-end gap-1.5 px-1">
                    {[40, 55, 48, 65, 72, 85, 90, 78, 62, 54, 70, 82, 88, 92, 84, 76, 68, 60, 74, 86, 90, 85, 78, 80].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xs hover:brightness-125 transition-all"
                        style={{ height: `${h}%` }}
                        title={`Hour ${i}:00`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. End-to-End Infrastructure Flow ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Hardware to Insight
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How GreenGrid Powers Institutional Campuses
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              A distributed pipeline capturing edge power parameters, computing predictive analytics, and enforcing automated grid compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs mb-4">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Edge Ingestion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart meters and Modbus/BACnet gateways stream sub-second kW, V, I, and THD across 24 meters in 12 facilities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs mb-4">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Telemetry Bus</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized high-throughput DRF metrology backend validates readings, aggregates daily metrics, and detects anomalies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs mb-4">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Predictive AI</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scikit-Learn damped trend models predict 14-day load curves and trigger the Peak Sentinel before utility penalties bite.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs mb-4">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Audit & Billing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculates tiered commercial energy bills, fixed capacity charges, solar net metering credits, and generates CSV reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 12 Campus Facilities Showcase ── */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Enterprise Scale
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                12 Connected Campus Facilities
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Real-time sub-meter telemetry actively monitored across all academic, research, and support blocks.
              </p>
            </div>
            <Link
              to="/login"
              className="mt-4 sm:mt-0 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              <span>Explore Facilities Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Main Admin Block', type: 'Administrative', load: '380 kW' },
              { name: 'Computer Lab & Data Center', type: 'Critical Computing', load: '620 kW' },
              { name: 'Factory & Workshops', type: 'High Heavy Load', load: '850 kW' },
              { name: 'Hostel & Student Center', type: 'Residential', load: '240 kW' },
              { name: 'Canteen & Dining Complex', type: 'Commercial Kitchen', load: '190 kW' },
              { name: 'Generic Block 1', type: 'Academic Lecture', load: '180 kW' },
              { name: 'Generic Block 2', type: 'Faculty Offices', load: '175 kW' },
              { name: 'Generic Block 3', type: 'Research Labs', load: '210 kW' },
              { name: 'Generic Block 4', type: 'Auditorium Hall', load: '160 kW' },
              { name: 'Generic Block 5', type: 'Library & Media', load: '150 kW' },
              { name: 'Generic Block 6', type: 'Sports Arena', load: '130 kW' },
              { name: 'Generic Block 7', type: 'Innovation Center', load: '135 kW' },
            ].map((fac, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="text-[10px] font-semibold uppercase">{fac.type}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">Connected Load</span>
                  <span className="font-bold text-slate-800">{fac.load}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Call To Action Banner ── */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Production Campus Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Accelerate Your Campus Toward Net-Zero Energy Operations.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Gain immediate visibility over peak demand penalties, maximize rooftop solar self-consumption, and automate billing compliance with GreenGrid.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              <span>Sign In to Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center font-bold text-white text-base">
                  G
                </div>
                <span className="font-bold text-white text-base tracking-tight">GreenGrid</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Smart Energy Management Information System (EMIS) unifying distributed metrology, solar microgrids, and load forecasting.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Platform Modules</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Executive Dashboard</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Real-Time Metrology</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Renewable & Microgrid</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Predictive Forecast</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Utility Billing Engine</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Compliance & Standards</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 50001 Energy Management</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> IEEE 519 Harmonics Grade</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CEA Net Metering Standard</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Modbus RTU / TCP Protocol</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Institutional Access</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                Authorized institutional access only. Multi-factor authentication & role-based controls enforced.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 transition-colors"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Authorized Login</span>
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
            <div>&copy; {new Date().getFullYear()} GreenGrid Systems. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Powered by GreenGrid v2.4.1 Enterprise</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
