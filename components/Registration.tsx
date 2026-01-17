
import React, { useState } from 'react';
import { Attendee } from '../types';

interface RegistrationProps {
  onAddAttendees: (attendees: Attendee[]) => void;
  attendees: Attendee[];
}

const Registration: React.FC<RegistrationProps> = ({ onAddAttendees, attendees }) => {
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    setIsImporting(true);
    // Support comma or tab separated data
    const lines = csvText.split('\n').filter(l => l.trim() !== '');
    const newAttendees: Attendee[] = lines.map(line => {
      let parts = line.split(',');
      if (parts.length < 2) parts = line.split('\t');
      
      const name = parts[0]?.trim() || 'Attendee';
      const email = parts[1]?.trim() || 'no-email@example.com';
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        formFilled: true,
        qrScanned: false,
        locationVerified: false,
        certificateSent: false,
        timestamp: new Date().toISOString()
      };
    });

    onAddAttendees(newAttendees);
    setCsvText('');
    setIsImporting(false);
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
            <i className="fas fa-database"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">G-Form Data Sync</h3>
            <p className="text-slate-500 text-sm">Paste "Name, Email" rows from your Google Form responses sheet.</p>
          </div>
        </div>
        <textarea
          className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
          placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        ></textarea>
        <button
          onClick={handleImport}
          disabled={!csvText.trim()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          {isImporting ? 'Processing...' : 'Import Registration List'}
        </button>
      </section>

      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Live Directory</h3>
          <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
            {attendees.length} REGISTERED
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-6">Attendee</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center text-slate-300 italic">
                    No data imported yet.
                  </td>
                </tr>
              ) : (
                attendees.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{a.name}</span>
                        <span className="text-xs text-slate-400">{a.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${a.locationVerified ? 'bg-emerald-500' : 'bg-slate-200 animate-pulse'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {a.locationVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {a.locationVerified ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100">
                          <i className="fas fa-check-double text-[10px]"></i>
                          <span className="text-[10px] font-black uppercase tracking-widest">Automation Finished</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Awaiting Verification</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Registration;
