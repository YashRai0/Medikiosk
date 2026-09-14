import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Maximize2, Minimize2, Sparkles, Activity } from 'lucide-react';
import { Badge } from './Badge';

export const Layout: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lang, setLang] = useState<string>('Hindi');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sid = localStorage.getItem('sessionId');
    setSessionId(sid);
    const savedLang = localStorage.getItem('medikiosk_language') || 'Hindi';
    setLang(savedLang === 'hi' ? 'Hindi' : savedLang === 'hinglish' ? 'Hinglish' : savedLang);
  }, [location]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleQuickDemo = () => {
    localStorage.setItem('sessionId', 'MK-DEMO-001');
    localStorage.setItem('medikiosk_language', 'Hindi');
    localStorage.setItem('medikiosk_patient_name', 'Demo Patient');
    localStorage.setItem('medikiosk_patient_age', '42');
    localStorage.setItem('medikiosk_patient_gender', 'Male');
    navigate('/doctor/review/MK-DEMO-001');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 select-none">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 text-teal-700 font-extrabold text-2xl tracking-tight hover:opacity-90">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span>MediKiosk</span>
          </Link>
          <span className="hidden sm:inline-block text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
            SIH26047 Prototype
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Language Badge */}
          <span className="hidden md:flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            🌐 {lang}
          </span>

          {/* Session ID display */}
          {sessionId && (
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {sessionId}
            </span>
          )}

          {/* 1-Click Jury Demo Shortcut */}
          <button
            onClick={handleQuickDemo}
            title="1-Click Jury Demo (Demo Patient: Hindi, MK-DEMO-001)"
            className="flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Jury Demo
          </button>

          {/* Kiosk Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen Kiosk' : 'Enter Fullscreen Kiosk'}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 w-full max-w-5xl mx-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
