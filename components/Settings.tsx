
import React, { useState } from 'react';
import { EventConfig } from '../types';

interface SettingsProps {
  config: EventConfig;
  setConfig: (config: EventConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const [form, setForm] = useState<EventConfig>({ ...config });
  const [publicLink, setPublicLink] = useState('');

  const handleSave = () => {
    setConfig(form);
    const baseUrl = window.location.origin + window.location.pathname;
    setPublicLink(`${baseUrl}?mode=checkin`);
    alert("Settings saved! Email-based automation is now active.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof EventConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, [field]: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(prev => ({ ...prev, targetLat: pos.coords.latitude, targetLng: pos.coords.longitude }));
    }, (err) => {
      alert("GPS Error: Please enable location to set event coordinates.");
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-6">1. Event Identity</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Name</label>
              <input 
                className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                value={form.eventName}
                onChange={e => setForm({...form, eventName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latitude</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono"
                  value={form.targetLat}
                  placeholder="0.000"
                  readOnly
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Longitude</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono"
                  value={form.targetLng}
                  placeholder="0.000"
                  readOnly
                />
              </div>
            </div>
            <button onClick={fetchLocation} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm transition-colors hover:bg-blue-100">
              <i className="fas fa-location-dot mr-2"></i>
              Update to Current GPS
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-6">2. Certificate Template</h2>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block text-center">Base Certificate Image</label>
            <label className="block w-full aspect-video border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer overflow-hidden hover:bg-slate-50 transition-all">
              {form.certificateTemplate ? (
                <img src={form.certificateTemplate} className="w-full h-full object-cover" />
              ) : (
                <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                  <i className="fas fa-file-certificate text-3xl text-slate-300 mb-4"></i>
                  <span className="text-sm font-bold text-slate-400">Upload Blank Certificate</span>
                  <p className="text-[10px] text-slate-300 mt-2">The system will overlay names automatically</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'certificateTemplate')} />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
        <h2 className="text-xl font-bold mb-6 text-blue-600">3. Automation Activation</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Once activated, the link below will allow attendees to verify their presence using their registered email and current GPS location.
        </p>
        <button onClick={handleSave} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl mb-6 hover:bg-black transition-all">
          Generate Verification Link
        </button>

        {publicLink && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem]">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3">Attendee Access URL</h4>
            <div className="flex gap-2">
              <input readOnly value={publicLink} className="flex-1 bg-white border border-blue-200 p-3 rounded-xl text-xs font-mono text-blue-700" />
              <button onClick={() => {navigator.clipboard.writeText(publicLink); alert("Copied!")}} className="bg-blue-600 text-white px-5 rounded-xl font-bold text-xs">Copy</button>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex gap-3 text-[10px] text-blue-800/70">
                <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                <p>GPS verification within 20m of set coordinates.</p>
              </div>
              <div className="flex gap-3 text-[10px] text-blue-800/70">
                <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                <p>Email cross-reference with Google Form imports.</p>
              </div>
              <div className="flex gap-3 text-[10px] text-blue-800/70">
                <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                <p>Instant certificate generation & email delivery.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
