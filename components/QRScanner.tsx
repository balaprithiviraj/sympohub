
import React, { useState } from 'react';
import { Attendee, EventConfig } from '../types';

interface QRScannerProps {
  config: EventConfig;
  attendees: Attendee[];
  onVerify: (email: string, isVerified: boolean) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ config, attendees, onVerify }) => {
  const [qrImage, setQrImage] = useState<string | null>(null);

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setQrImage(result);
        // Save to local storage so the public link can potentially access it or just for persistence
        localStorage.setItem('certiflow_master_qr', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
            <i className="fas fa-qrcode"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Event Master QR</h3>
            <p className="text-sm text-slate-500">Upload the QR code that will be displayed physically at your event venue.</p>
          </div>
        </div>

        <div className="space-y-6">
          <label className="group relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all overflow-hidden">
            {qrImage ? (
              <div className="relative w-full h-full group">
                <img src={qrImage} className="h-full w-full object-contain p-8" alt="Event QR" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm">Change QR Image</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-upload-alt text-slate-400 text-3xl"></i>
                </div>
                <p className="text-slate-600 font-bold">Click to upload Master QR</p>
                <p className="text-xs text-slate-400 mt-2">Supports PNG, JPG (Max 5MB)</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
          </label>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
            <i className="fas fa-info-circle text-amber-500 mt-1"></i>
            <div className="text-sm text-amber-800">
              <p className="font-bold">Instructions for Attendees:</p>
              <p className="mt-1 opacity-90">Distribute the <span className="font-mono bg-amber-100 px-1 rounded text-xs">Public Check-in Link</span> from Settings. Attendees will use that link on their mobile devices to scan this QR code while standing within the verified 20m radius.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
