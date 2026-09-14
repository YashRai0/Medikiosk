import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Stethoscope, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

const KioskHome: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/patient/consent');
  };

  const handleJuryDemo = () => {
    localStorage.setItem('sessionId', 'MK-DEMO-001');
    localStorage.setItem('medikiosk_language', 'Hindi');
    localStorage.setItem('medikiosk_patient_name', 'Demo Patient');
    localStorage.setItem('medikiosk_patient_age', '42');
    localStorage.setItem('medikiosk_patient_gender', 'Male');
    navigate('/doctor/review/MK-DEMO-001');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[84vh] max-w-2xl mx-auto text-center py-6">
      {/* 1. SIH Prototype Eyebrow Badge */}
      <div className="mb-4">
        <span className="text-xs uppercase font-extrabold tracking-widest px-3.5 py-1.5 bg-slate-200/80 text-slate-700 rounded-full border border-slate-300 shadow-xs">
          SMART INDIA HACKATHON • PROTOTYPE
        </span>
      </div>

      {/* 2. Hero Product Brand Icon & Heading */}
      <div className="w-20 h-20 bg-teal-50 border-2 border-teal-200 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
        <Activity className="w-10 h-10 text-teal-600" />
      </div>

      <h1 className="text-5xl md:text-6xl font-black text-navy-900 tracking-tight mb-3">
        MEDIKIOSK
      </h1>

      {/* 3. Subtitle */}
      <p className="text-lg md:text-xl font-semibold text-slate-700 max-w-lg mb-3 leading-snug">
        AI-Powered Multimodal Clinical History-Taking & Document Digitization
      </p>

      {/* 4. Core Principle Eyebrow */}
      <div className="mb-8">
        <span className="text-xs md:text-sm font-black tracking-widest uppercase text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
          AI ASSISTS. PHYSICIAN DECIDES.
        </span>
      </div>

      {/* 5. Primary Start Action Card */}
      <Card className="w-full p-8 mb-6 border-2 border-slate-200 hover:border-teal-500 shadow-lg transition-all rounded-3xl bg-white">
        <p className="text-base text-slate-600 mb-6">
          Capture patient history and documents in your language before physician consultation.
        </p>

        <Button
          size="lg"
          className="w-full text-2xl py-6 rounded-2xl shadow-md bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01]"
          onClick={handleStart}
        >
          <span>START PATIENT SESSION</span>
          <ArrowRight className="w-7 h-7" />
        </Button>
      </Card>

      {/* 6. Secondary Navigation Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-6">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <span>Physician Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/ayush')}
          className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>AYUSH Mode</span>
        </button>
      </div>

      {/* 7. Subtle Status & Quick Demo */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
          DEMO MODE
        </span>

        <button
          onClick={handleJuryDemo}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Load Demo Case (MK-DEMO-001)</span>
        </button>
      </div>
    </div>
  );
};

export default KioskHome;
