import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const ConsentPage: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheck = () => {
    const newState = !checked;
    setChecked(newState);
    if (newState) {
      const now = new Date().toISOString();
      setTimestamp(now);
      localStorage.setItem('medikiosk_consent', 'true');
      localStorage.setItem('medikiosk_consent_timestamp', now);
    } else {
      setTimestamp(null);
      localStorage.removeItem('medikiosk_consent');
      localStorage.removeItem('medikiosk_consent_timestamp');
    }
  };

  const handleContinue = () => {
    navigate('/patient/language');
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-4 pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-50 border-2 border-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-9 h-9 text-teal-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy-900">
          Patient Consent / मरीज की सहमति
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Please review how your health information is used before consultation.
        </p>
      </div>

      <Card className="p-8 mb-6 bg-white border-2 border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Why are we collecting this information?
          </h2>
          <ul className="space-y-3 text-base md:text-lg text-slate-700">
            <li className="flex items-start">
              <span className="text-teal-600 mr-3 font-bold text-xl">•</span>
              <span><strong>To capture your medical history:</strong> Voice or touch inputs are collected to prepare your case details.</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 mr-3 font-bold text-xl">•</span>
              <span><strong>To digitize relevant medical documents:</strong> Previous prescriptions and lab reports are scanned via OCR.</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 mr-3 font-bold text-xl">•</span>
              <span><strong>To prepare an AI-assisted clinical-history draft:</strong> A structured summary is compiled for the doctor.</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 mr-3 font-bold text-xl">•</span>
              <span><strong>To help the physician review your information:</strong> Saves OPD waiting time and ensures accurate documentation.</span>
            </li>
          </ul>
        </div>

        {/* Prominent Safety Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm md:text-base font-semibold text-amber-900 leading-snug">
              ⚠️ MediKiosk provides AI-assisted documentation. It does not independently diagnose or prescribe treatment. All drafts require physician review.
            </p>
          </div>
        </div>

        {/* Accessible Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-center cursor-pointer p-5 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all">
            <input
              type="checkbox"
              className="w-8 h-8 rounded-lg border-2 border-slate-400 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
              checked={checked}
              onChange={handleCheck}
            />
            <div className="ml-4">
              <span className="text-lg md:text-xl font-bold text-slate-900 block">
                I understand and consent to continue.
              </span>
              <span className="text-xs text-slate-500">
                मैं समझता/समझती हूँ और आगे बढ़ने की सहमति देता/देती हूँ।
              </span>
            </div>
          </label>

          {timestamp && (
            <p className="mt-3 text-xs text-slate-500 font-mono text-center">
              ✓ Consent recorded at: {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex space-x-4 mt-auto">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 py-4 text-base font-bold rounded-xl"
          onClick={() => navigate('/')}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-[2] py-4 text-lg font-bold rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          disabled={!checked}
          onClick={handleContinue}
        >
          Give Consent & Continue
        </Button>
      </div>
    </div>
  );
};

export default ConsentPage;
