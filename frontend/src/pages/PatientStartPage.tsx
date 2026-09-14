import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { createSession } from '../api/sessions';

const PatientStartPage: React.FC = () => {
  const [mode, setMode] = useState<'select' | 'abha' | 'manual'>('select');
  const [name, setName] = useState('Demo Patient');
  const [age, setAge] = useState('42');
  const [gender, setGender] = useState('male');
  const [abhaId, setAbhaId] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLang = localStorage.getItem('medikiosk_language') || 'Hindi';
    setLanguage(savedLang);
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const consentGiven = localStorage.getItem('medikiosk_consent') === 'true';
      const consentTimestamp = localStorage.getItem('medikiosk_consent_timestamp') || new Date().toISOString();

      const res = await createSession({
        name: name.trim() || 'Demo Patient',
        age: parseInt(age, 10) || 42,
        gender: gender || 'male',
        language: language || 'Hindi',
        abhaStatus: mode === 'abha' ? 'has_abha' : 'no_abha',
        abhaId: mode === 'abha' ? abhaId.trim() : undefined,
        inputMode: 'both',
        consent: {
          given: consentGiven,
          timestamp: consentTimestamp
        }
      });

      const sid = res?.session?.id || `MK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('sessionId', sid);
      localStorage.setItem('medikiosk_patient_name', name.trim() || 'Demo Patient');
      localStorage.setItem('medikiosk_patient_age', age || '42');
      localStorage.setItem('medikiosk_patient_gender', gender || 'male');
      localStorage.setItem('medikiosk_language', language);

      navigate('/patient/history');
    } catch (err: any) {
      console.warn('Fallback to local session creation', err);
      const fallbackId = `MK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('sessionId', fallbackId);
      localStorage.setItem('medikiosk_patient_name', name || 'Demo Patient');
      localStorage.setItem('medikiosk_patient_age', age || '42');
      localStorage.setItem('medikiosk_patient_gender', gender || 'male');
      localStorage.setItem('medikiosk_language', language);
      navigate('/patient/history');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="flex-1 flex flex-col items-center pt-8 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy-900 mb-2 text-center">
          Digital Health Identity
        </h1>
        <p className="text-slate-500 text-center mb-8">
          Selected Language: <strong className="text-teal-700">{language}</strong> • Choose an intake method
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {/* Option 1: Has ABHA */}
          <Card
            className="p-8 cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all flex flex-col items-center border-2 border-slate-200 text-center group"
            onClick={() => setMode('abha')}
          >
            <div className="w-20 h-20 bg-teal-50 group-hover:bg-teal-100 rounded-3xl flex items-center justify-center mb-6 transition-colors">
              <QrCode className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I have an ABHA ID</h2>
            <p className="text-slate-500 text-sm">
              Ayushman Bharat Health Account (14-digit number or ABHA address)
            </p>
            <span className="mt-6 text-teal-600 font-bold text-sm flex items-center gap-1">
              Select ABHA flow <ArrowRight className="w-4 h-4" />
            </span>
          </Card>

          {/* Option 2: No ABHA */}
          <Card
            className="p-8 cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all flex flex-col items-center border-2 border-slate-200 text-center group"
            onClick={() => setMode('manual')}
          >
            <div className="w-20 h-20 bg-teal-50 group-hover:bg-teal-100 rounded-3xl flex items-center justify-center mb-6 transition-colors">
              <User className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Continue without ABHA</h2>
            <p className="text-slate-500 text-sm">
              Temporary Session ID generated for instant OPD registration & later reconciliation
            </p>
            <span className="mt-6 text-teal-600 font-bold text-sm flex items-center gap-1">
              Select Quick Intake <ArrowRight className="w-4 h-4" />
            </span>
          </Card>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center max-w-xl text-xs md:text-sm text-amber-900">
          <strong>ABHA-less Policy:</strong> Patients without an active ABHA account can still complete case-taking without delay. The session ID will be reconciled upon physician verification.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center pt-4 max-w-xl mx-auto w-full">
      <div className="w-full mb-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setMode('select')} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Change Method
        </Button>
        <Badge variant="demo">Prototype Workflow</Badge>
      </div>

      <Card className="p-8 w-full border-2 border-slate-200 shadow-md">
        <h2 className="text-2xl font-bold text-navy-900 mb-2">
          {mode === 'abha' ? 'Enter ABHA Credentials' : 'Basic Patient Information'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Language: <strong className="text-teal-700">{language}</strong>
        </p>

        <form onSubmit={handleCreateSession} className="space-y-5">
          {mode === 'abha' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                14-Digit ABHA ID / Health Address
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="e.g. 91-1234-5678-9012"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 text-lg font-mono outline-none"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Mock validation for SIH prototype demo</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name / पूरा नाम</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Demo Patient"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 text-lg outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Age / उम्र</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
                min="1"
                max="120"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 text-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Gender / लिंग</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 text-lg outline-none bg-white"
              >
                <option value="male">Male (पुरुष)</option>
                <option value="female">Female (महिला)</option>
                <option value="other">Other (अन्य)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full py-4 text-xl font-bold rounded-xl bg-teal-600 hover:bg-teal-700 shadow-md"
              disabled={loading}
            >
              {loading ? 'Creating Session...' : 'Start Case-Taking Session →'}
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-4 text-xs text-slate-500 text-center max-w-md">
        You can continue without an existing ABHA ID. The session can later be reconciled with the appropriate digital health identity.
      </p>
    </div>
  );
};

export default PatientStartPage;
