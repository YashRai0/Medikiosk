import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Languages, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const LanguagePage: React.FC = () => {
  const [selected, setSelected] = useState<string>('Hindi');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('medikiosk_language');
    if (saved) setSelected(saved);
  }, []);

  const handleSelect = (lang: string) => {
    setSelected(lang);
    localStorage.setItem('medikiosk_language', lang);
  };

  const handleContinue = () => {
    localStorage.setItem('medikiosk_language', selected);
    navigate('/patient/start');
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl md:text-4xl font-extrabold text-navy-900 mb-2 text-center">
        Select Your Language
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-teal-700 mb-8 text-center">
        अपनी भाषा चुनें
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {/* English */}
        <Card
          className={`p-8 cursor-pointer transition-all border-2 rounded-2xl ${
            selected === 'English'
              ? 'ring-4 ring-teal-500 border-teal-500 bg-teal-50 shadow-md'
              : 'hover:border-teal-400 hover:bg-slate-50 border-slate-200'
          }`}
          onClick={() => handleSelect('English')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Globe className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">English</h3>
            <p className="text-slate-500 text-sm mt-1">Standard clinical intake</p>
          </div>
        </Card>

        {/* Hindi */}
        <Card
          className={`p-8 cursor-pointer transition-all border-2 rounded-2xl ${
            selected === 'Hindi'
              ? 'ring-4 ring-teal-500 border-teal-500 bg-teal-50 shadow-md'
              : 'hover:border-teal-400 hover:bg-slate-50 border-slate-200'
          }`}
          onClick={() => handleSelect('Hindi')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Languages className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">हिन्दी</h3>
            <p className="text-teal-700 font-semibold text-sm mt-1">Hindi (Recommended)</p>
          </div>
        </Card>

        {/* Hinglish */}
        <Card
          className={`p-8 cursor-pointer transition-all border-2 rounded-2xl ${
            selected === 'Hinglish'
              ? 'ring-4 ring-teal-500 border-teal-500 bg-teal-50 shadow-md'
              : 'hover:border-teal-400 hover:bg-slate-50 border-slate-200'
          }`}
          onClick={() => handleSelect('Hinglish')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <div className="flex items-center text-teal-600">
                <Languages className="w-7 h-7" />
                <Globe className="w-5 h-5 -ml-1" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Hinglish</h3>
            <p className="text-slate-500 text-sm mt-1">Hindi + English mix</p>
          </div>
        </Card>
      </div>

      <div className="w-full max-w-md mb-8">
        <Button
          size="lg"
          className="w-full py-4 text-xl font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-md flex items-center justify-center gap-2"
          onClick={handleContinue}
        >
          <span>Continue with {selected}</span>
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center max-w-xl text-xs md:text-sm text-slate-600">
        ℹ️ Language support is being expanded for Tamil, Telugu, Bengali, and Marathi via the pluggable Bhashini ASR architecture.
      </div>
    </div>
  );
};

export default LanguagePage;
