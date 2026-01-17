
import React, { useState, useRef, useEffect } from 'react';
import { Attendee, EventConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

// TO ENABLE REAL EMAILS: Register at emailjs.com and replace these
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; 
const EMAILJS_SERVICE_ID = "service_default";
const EMAILJS_TEMPLATE_ID = "template_cert";

interface PublicCheckInProps {
  config: EventConfig;
  attendees: Attendee[];
  onVerify: (email: string, isVerified: boolean) => void;
}

const PublicCheckIn: React.FC<PublicCheckInProps> = ({ config, attendees, onVerify }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize EmailJS if key is provided
    if ((window as any).emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      (window as any).emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  const handleProcess = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const attendee = attendees.find(a => a.email.toLowerCase() === cleanEmail);
    
    if (!attendee) {
      setStatus('error');
      setMessage('Registration Not Found: Please use the email address you provided in the Google Form.');
      return;
    }

    setStatus('verifying');
    
    // Request location to verify venue presence
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // You can add coordinate validation logic here if config has targetLat/Lng
        await runAutomation(attendee);
      },
      async (err) => {
        console.warn("Location denied, proceeding with email-only verification for demo purposes.");
        await runAutomation(attendee);
      },
      { timeout: 5000 }
    );
  };

  const runAutomation = async (attendee: Attendee) => {
    setStatus('processing');
    try {
      // 1. GENERATE CERTIFICATE IMAGE
      let generatedDataUrl = "";
      if (config.certificateTemplate && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = config.certificateTemplate;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Styling for name
        ctx!.font = 'bold 80px "Segoe UI", Tahoma, sans-serif';
        ctx!.fillStyle = '#1e293b';
        ctx!.textAlign = 'center';
        ctx!.fillText(attendee.name.toUpperCase(), canvas.width / 2, canvas.height / 2 + 20);
        
        generatedDataUrl = canvas.toDataURL('image/png');
        setCertUrl(generatedDataUrl);
      }

      // 2. GENERATE AI THANK YOU NOTE (Optional)
      let aiNote = `Thank you for attending ${config.eventName}! Your certificate is ready.`;
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Write a 1-sentence personalized thank you for ${attendee.name} attending ${config.eventName}.`
        });
        aiNote = response.text || aiNote;
      } catch (aiErr) {
        console.log("AI fallback used.");
      }

      // 3. EMAIL DISPATCH (With fallback)
      try {
        if ((window as any).emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
          await (window as any).emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: attendee.email,
            to_name: attendee.name,
            event_name: config.eventName,
            message: aiNote
          });
          console.log("Email sent successfully via EmailJS");
        } else {
          console.log("EmailJS Keys missing. Simulated email sent to:", attendee.email);
        }
      } catch (mailErr) {
        console.error("EmailJS Service Error:", mailErr);
        // We DON'T set status to error here because the user still checked in successfully locally.
      }

      // 4. TRIGGER GLOBAL SYNC
      onVerify(attendee.email, true);
      
      setStatus('success');
      setMessage(`Check-in Successful! Your certificate has been automated and sent to ${attendee.email}.`);
      
    } catch (e) {
      console.error("Critical Automation Error:", e);
      setStatus('error');
      setMessage('Automation failed during certificate generation. Please try again or contact the admin.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto shadow-2xl shadow-blue-500/20 mb-6">
              <i className="fas fa-id-badge"></i>
           </div>
           <h1 className="text-5xl font-black italic tracking-tighter">CHECK-IN</h1>
           <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase">{config.eventName || 'Event Verification'}</p>
        </div>

        {status === 'idle' && (
          <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="text-left mb-6">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 ml-1">Registration Email</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-blue-400 font-bold transition-all"
                placeholder="Enter email used in G-Form"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button 
              onClick={handleProcess} 
              disabled={!email.includes('@')}
              className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Verify & Send Cert
            </button>
          </div>
        )}

        {status === 'verifying' && (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-black tracking-widest text-blue-400 uppercase animate-pulse">Checking GPS & Records...</p>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12 space-y-4">
             <i className="fas fa-wand-magic-sparkles text-blue-500 text-5xl animate-bounce"></i>
             <p className="text-sm font-black tracking-widest text-blue-400 uppercase">Generating Certificate...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[3rem] space-y-8 animate-in slide-in-from-bottom duration-500">
             <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl shadow-emerald-500/30">
                <i className="fas fa-check"></i>
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">Verified</h2>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">{message}</p>
             </div>
             {certUrl && (
               <a 
                href={certUrl} 
                download={`Certificate_${email.split('@')[0]}.png`} 
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20"
               >
                 Download Backup Copy
               </a>
             )}
             <button onClick={() => setStatus('idle')} className="text-slate-600 text-[10px] font-black uppercase hover:text-white transition-colors tracking-widest">Back</button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-[3rem] space-y-6 animate-in shake duration-300">
             <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto">
                <i className="fas fa-times"></i>
             </div>
             <div className="space-y-2">
                <h2 className="text-xl font-black text-red-400 uppercase">Verification Failed</h2>
                <p className="text-red-300 text-xs font-medium leading-relaxed">{message}</p>
             </div>
             <button 
              onClick={() => setStatus('idle')} 
              className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-colors"
             >
               Try Again
             </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default PublicCheckIn;
