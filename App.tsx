
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, Attendee, EventConfig } from './types';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import CertificateManager from './components/CertificateManager';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import PublicCheckIn from './components/PublicCheckIn';

const STORAGE_KEY_ATTENDEES = 'certiflow_attendees';
const STORAGE_KEY_CONFIG = 'certiflow_config';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [config, setConfig] = useState<EventConfig>({
    eventName: 'My Tech Event',
    targetLat: 0,
    targetLng: 0,
    radiusMeters: 50,
  });

  const urlParams = new URLSearchParams(window.location.search);
  const isPublicMode = urlParams.get('mode') === 'checkin';

  useEffect(() => {
    const savedAttendees = localStorage.getItem(STORAGE_KEY_ATTENDEES);
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedAttendees) setAttendees(JSON.parse(savedAttendees));
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => {
    const handleSync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ATTENDEES && e.newValue) {
        setAttendees(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const saveAttendees = (data: Attendee[]) => {
    setAttendees(data);
    localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(data));
  };

  const addAttendees = (newAttendees: Attendee[]) => {
    setAttendees(prev => {
      const existingEmails = new Set(prev.map(a => a.email.toLowerCase()));
      const filtered = newAttendees.filter(a => !existingEmails.has(a.email.toLowerCase()));
      const updated = [...prev, ...filtered];
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(updated));
      return updated;
    });
  };

  const markAttendance = useCallback((email: string, isVerified: boolean) => {
    setAttendees(prev => {
      const updated = prev.map(a => 
        a.email.toLowerCase() === email.toLowerCase() 
          ? { ...a, qrScanned: true, locationVerified: isVerified, certificateSent: true } 
          : a
      );
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  if (isPublicMode) {
    return <PublicCheckIn config={config} attendees={attendees} onVerify={markAttendance} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">CertiFlow</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{config.eventName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase text-slate-400">System Live</span>
          </div>
        </header>
        <div className="max-w-6xl mx-auto">
          {activeTab === AppTab.DASHBOARD && <Dashboard attendees={attendees} />}
          {activeTab === AppTab.REGISTRATION && <Registration onAddAttendees={addAttendees} attendees={attendees} />}
          {activeTab === AppTab.CERTIFICATES && <CertificateManager attendees={attendees} config={config} onSent={(email) => markAttendance(email, true)} />}
          {activeTab === AppTab.SETTINGS && <Settings config={config} setConfig={(c) => { setConfig(c); localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(c)); }} />}
        </div>
      </main>
    </div>
  );
};

export default App;
