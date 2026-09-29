import React from 'react';
import { NavLink } from 'react-router-dom';
import { prefetchPage } from '../../router/pageLoaders';
import { 
  LayoutDashboard, 
  Building2, 
  Zap, 
  Receipt, 
  Sun, 
  BarChart2, 
  TrendingUp, 
  Bell, 
  FileText, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const alertCount = 3;
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Facilities', path: '/facilities', icon: Building2 },
    { label: 'Energy Monitoring', path: '/energy-monitoring', icon: Zap },
    { label: 'Billing', path: '/billing', icon: Receipt },
    { label: 'Renewable Energy', path: '/renewable-energy', icon: Sun },
    { label: 'Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'Forecast', path: '/forecast', icon: TrendingUp },
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: alertCount },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-60 bg-slate-900 text-white flex flex-col h-screen overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-white text-xl">G</div>
        <div>
          <h1 className="font-bold text-white tracking-tight">GreenGrid</h1>
          <p className="text-xs text-slate-400">Smart Energy System</p>
        </div>
      </div>
      
      <div className="border-t border-slate-800 mx-4 mb-4"></div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => prefetchPage(item.path)}
              onFocus={() => prefetchPage(item.path)}
              onTouchStart={() => prefetchPage(item.path)}
              className={({ isActive }) => 
                `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-green-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-slate-300">Online • All Metrology Nodes Active</span>
        </div>
        <div className="text-xs text-slate-500 ml-4">v2.4.1</div>
      </div>
    </div>
  );
};

export default Sidebar;
