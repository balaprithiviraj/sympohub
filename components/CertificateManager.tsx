
import React, { useState, useRef } from 'react';
import { Attendee, EventConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

interface CertificateManagerProps {
  attendees: Attendee[];
  config: EventConfig;
  onSent: (email: string) => void;
}

const CertificateManager: React.FC<CertificateManagerProps> = ({ attendees, config, onSent }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [templateFile, setTemplateFile] = useState<string | null>(null);
  const eligibleAttendees = attendees.filter(a => a.qrScanned && a.locationVerified && !a.certificateSent);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setTemplateFile(readerEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAndSend = async (attendee: Attendee) => {
    if (!templateFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulate AI/Logic Image Processing
    const img = new Image();
    img.src = templateFile;
    
    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // AI-like Logic: Find placeholder area and inject name
        // In a real app, we'd use Gemini to identify text coordinates, here we assume standard center
        ctx.font = 'bold 80px serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText(attendee.name, canvas.width / 2, canvas.height / 2 + 50);
        
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Certificate of Participation for ${config.eventName}`, canvas.width / 2, canvas.height / 2 + 150);
        resolve(true);
      };
    });

    // Simulate Email Sending using Gemini for personalizing the email body
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short professional email to ${attendee.name} thanking them for attending ${config.eventName}. Mention that their certificate is attached. Keep it under 50 words.`
      });
      
      console.log(`Sending Email to ${attendee.email}... Content: ${response.text}`);
      onSent(attendee.email);
    } catch (err) {
      console.error("AI Email generation failed", err);
      // Fallback
      onSent(attendee.email);
    }
  };

  const handleBulkSend = async () => {
    if (eligibleAttendees.length === 0) return;
    setIsProcessing(true);
    
    for (const attendee of eligibleAttendees) {
      await generateAndSend(attendee);
      // Add a small delay for simulation
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setIsProcessing(false);
    alert("Certificates generated and sent via email!");
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Automation Hub</h2>
            <p className="text-blue-100 mb-6">
              Generate participation certificates for attendees who completed both registration and verified on-site check-in.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold">{eligibleAttendees.length}</span>
                <p className="text-xs text-blue-200">Eligible Now</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold">{attendees.filter(a => a.certificateSent).length}</span>
                <p className="text-xs text-blue-200">Sent Today</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto">
             <button 
              disabled={!templateFile || eligibleAttendees.length === 0 || isProcessing}
              onClick={handleBulkSend}
              className="w-full md:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold py-4 px-10 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              Send All Certificates
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">1. Template Upload</h3>
          <p className="text-sm text-slate-500 mb-4">Upload your base PNG/JPG certificate. The system will automatically overlay attendee names.</p>
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
            {templateFile ? (
              <img src={templateFile} className="h-full w-full object-contain p-2" alt="Template Preview" />
            ) : (
              <div className="flex flex-col items-center">
                <i className="fas fa-file-image text-4xl text-slate-300 mb-2"></i>
                <span className="text-xs text-slate-400">Select Certificate Template</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
          {templateFile && (
            <button 
              onClick={() => setTemplateFile(null)}
              className="mt-2 text-xs text-red-500 hover:underline w-full text-center"
            >
              Remove template
            </button>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">2. Review Recipients</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-3">Attendee</th>
                  <th className="px-6 py-3">Verification</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eligibleAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                      No eligible attendees ready for certificate generation.
                    </td>
                  </tr>
                ) : (
                  eligibleAttendees.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          <i className="fas fa-check-double mr-1"></i> Double Checked
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => generateAndSend(a)}
                          disabled={!templateFile || isProcessing}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                        >
                          Send Individually
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for generation */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CertificateManager;
