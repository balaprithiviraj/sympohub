
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
    eventName: 'Summer Tech Workshop 2024',
    targetLat: 0,
    targetLng: 0,
    radiusMeters: 20,
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
    localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  const addAttendees = (newAttendees: Attendee[]) => {
    setAttendees(prev => {
      const existingEmails = new Set(prev.map(a => a.email.toLowerCase()));
      const filtered = newAttendees.filter(a => !existingEmails.has(a.email.toLowerCase()));
      return [...prev, ...filtered];
    });
  };

  const markAttendance = useCallback((email: string, isVerified: boolean) => {
    setAttendees(prev => {
      const exists = prev.some(a => a.email.toLowerCase() === email.toLowerCase());
      if (!exists) return prev;
      return prev.map(a => 
        a.email.toLowerCase() === email.toLowerCase() ? { ...a, qrScanned: true, locationVerified: isVerified, certificateSent: true } : a
      );
    });
  }, []);

  const markCertificateSent = (email: string) => {
    setAttendees(prev => prev.map(a => 
      a.email === email ? { ...a, certificateSent: true } : a
    ));
  };

  if (isPublicMode) {
    return <PublicCheckIn config={config} attendees={attendees} onVerify={markAttendance} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">CertiFlow <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-2 uppercase tracking-widest">Admin</span></h1>
            <p className="text-slate-500 font-medium">{config.eventName}</p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeTab === AppTab.DASHBOARD && <Dashboard attendees={attendees} />}
          {activeTab === AppTab.REGISTRATION && <Registration onAddAttendees={addAttendees} attendees={attendees} />}
          {activeTab === AppTab.CERTIFICATES && <CertificateManager attendees={attendees} config={config} onSent={markCertificateSent} />}
          {activeTab === AppTab.SETTINGS && <Settings config={config} setConfig={setConfig} />}
        </div>
      </main>
    </div>
  );
};

export default App;
