
import React from 'react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: AppTab.DASHBOARD, icon: 'fa-chart-line', label: 'Dashboard' },
    { id: AppTab.REGISTRATION, icon: 'fa-user-check', label: 'Attendees' },
    { id: AppTab.CERTIFICATES, icon: 'fa-certificate', label: 'Certificates' },
    { id: AppTab.SETTINGS, icon: 'fa-cog', label: 'Settings & Setup' },
  ];

  return (
    <nav className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col sticky top-0 z-50 overflow-x-auto md:overflow-y-auto">
      <div className="p-6 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
            <i className="fas fa-bolt"></i>
          </div>
          <span className="font-bold text-xl tracking-tight">CertiFlow</span>
        </div>
      </div>

      <div className="flex flex-row md:flex-col flex-1 px-2 md:px-4 py-2 gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="p-4 mt-auto hidden md:block">
        <div className="bg-slate-800/50 rounded-xl p-4 text-[10px] text-slate-500 border border-slate-700/50">
          <p className="font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <p>System Online: AI Automation</p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
