import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { facilitiesApi } from '../../api/facilitiesApi';
import { Grid, ChevronDown, Sun, Search, Bell, HelpCircle } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [facilityCount, setFacilityCount] = useState(12);

  useEffect(() => {
    facilitiesApi.getSummary()
      .then(res => {
        if (res.data && res.data.total_facilities) {
          setFacilityCount(res.data.total_facilities);
        }
      })
      .catch(err => console.error('Error fetching facility summary in navbar:', err));
  }, []);
  
  const getBreadcrumb = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center">
        <div className="text-sm text-gray-500">
          Home <span className="mx-1">&gt;</span> <span className="text-gray-900 font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 ml-8">
        <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <Grid className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">All Facilities ({facilityCount})</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="flex items-center justify-center flex-1 space-x-3">
        <span className="text-sm text-gray-600">Today, {currentDate}</span>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          Real-time
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
            <Grid className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700">68%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-gray-700">32%</span>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-48"
          />
        </div>

        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>
        
        <button className="text-gray-500 hover:text-gray-700">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <button className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-gray-900 leading-tight">{user?.full_name || 'System Admin'}</div>
            <div className="text-xs text-gray-500 leading-tight">{user?.role || 'Administrator'}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
