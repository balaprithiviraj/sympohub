
import React, { useEffect, useState } from 'react';
import { Attendee } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  attendees: Attendee[];
}

const Dashboard: React.FC<DashboardProps> = ({ attendees }) => {
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    // Simulate real-time website visit tracking via local storage
    const visits = localStorage.getItem('certiflow_visit_count') || '0';
    setTotalVisits(parseInt(visits));
  }, []);

  const registered = attendees.length;
  const verified = attendees.filter(a => a.locationVerified).length;
  const certsSent = attendees.filter(a => a.certificateSent).length;

  const data = [
    { name: 'G-Form Data', value: registered, color: '#3b82f6' },
    { name: 'Web Entries', value: totalVisits, color: '#f59e0b' },
    { name: 'Verified', value: verified, color: '#10b981' },
    { name: 'Certs Sent', value: certsSent, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="fa-database" label="G-Form Data" value={registered} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon="fa-globe" label="Website Entries" value={totalVisits} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon="fa-user-check" label="Verified Users" value={verified} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon="fa-wand-magic-sparkles" label="Auto-Processed" value={certsSent} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold mb-8 text-slate-800">Automation Funnel</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: number; color: string; bg: string }> = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5 transition-transform hover:scale-[1.02]">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
