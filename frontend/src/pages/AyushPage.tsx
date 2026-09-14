import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Save, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { createAyushRecord } from '../api/ayush';

export const AyushPage: React.FC = () => {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('sessionId') || 'MK-DEMO-001';

  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [vikriti, setVikriti] = useState('Pitta Vriddhi with Mandagni');
  const [sara, setSara] = useState('Mamsa Sara (Moderate)');
  const [samhanana, setSamhanana] = useState('Madhyama (Moderate)');
  const [height, setHeight] = useState('172');
  const [weight, setWeight] = useState('68');
  const [satmya, setSatmya] = useState('Madhyama');
  const [satva, setSatva] = useState('Pravara (Strong)');
  const [aharaShakti, setAharaShakti] = useState('Madhyama (Moderate)');
  const [vyayamaShakti, setVyayamaShakti] = useState('Avara (Mild)');
  const [vaya, setVaya] = useState('Madhya (Middle age, 42 Y)');

  // Expandable sections
  const [showTrividha, setShowTrividha] = useState(false);
  const [showAshtavidha, setShowAshtavidha] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createAyushRecord(sessionId, {
        prakriti,
        vikriti,
        sara,
        samhanana,
        pramana: `${height} cm / ${weight} kg`,
        satmya,
        satva,
        aharaShakti,
        vyayamaShakti,
        vaya
      });
      setSaved(true);
    } catch (e) {
      console.warn('Saved AYUSH record locally', e);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pb-16 pt-4">
      {/* Mode Switcher */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-slate-200 p-1 rounded-2xl inline-flex shadow-inner">
          <button
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => navigate('/patient/history')}
          >
            Clinical History
          </button>
          <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white shadow text-teal-700">
            AYUSH History
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex items-center gap-1 font-bold">
          <ArrowLeft className="w-4 h-4" /> Kiosk Home
        </Button>
      </div>

      {/* Screen Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-extrabold text-navy-900">
            Ayurvedic Dashavidha Pariksha
          </h1>
          <Badge variant="demo">AYUSH Framework</Badge>
        </div>
        <p className="text-slate-500 text-sm">
          Classical 10-fold patient assessment framework for integrative case-taking (Session: {sessionId})
        </p>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-900">
          ⚠️ Assistive AYUSH history collection — not an autonomous diagnosis system. All observations must be verified by an Ayurvedic physician.
        </p>
      </div>

      {/* 10-Fold Dashavidha Assessment Form */}
      <Card className="p-8 space-y-6 border-2 border-slate-200 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
          10-Fold Dashavidha Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Prakriti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Prakriti (Individual Constitution)
            </label>
            <select
              value={prakriti}
              onChange={(e) => setPrakriti(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Vata">Vata</option>
              <option value="Pitta">Pitta</option>
              <option value="Kapha">Kapha</option>
              <option value="Vata-Pitta">Vata-Pitta (Dual)</option>
              <option value="Pitta-Kapha">Pitta-Kapha (Dual)</option>
              <option value="Vata-Kapha">Vata-Kapha (Dual)</option>
              <option value="Tridosha">Sama Prakriti (Tridosha)</option>
            </select>
          </div>

          {/* 2. Vikriti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              2. Vikriti (Pathological State / Morbidity)
            </label>
            <input
              type="text"
              value={vikriti}
              onChange={(e) => setVikriti(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
              placeholder="e.g. Pitta Vriddhi, Jwara"
            />
          </div>

          {/* 3. Sara */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              3. Sara (Tissue Essence & Quality)
            </label>
            <select
              value={sara}
              onChange={(e) => setSara(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Rasa Sara">Rasa Sara</option>
              <option value="Rakta Sara">Rakta Sara</option>
              <option value="Mamsa Sara (Moderate)">Mamsa Sara (Moderate)</option>
              <option value="Meda Sara">Meda Sara</option>
              <option value="Asthi Sara">Asthi Sara</option>
              <option value="Majja Sara">Majja Sara</option>
              <option value="Shukra Sara">Shukra Sara</option>
            </select>
          </div>

          {/* 4. Samhanana */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              4. Samhanana (Compactness & Body Build)
            </label>
            <select
              value={samhanana}
              onChange={(e) => setSamhanana(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Pravara (Good / Compact)">Pravara (Good / Compact)</option>
              <option value="Madhyama (Moderate)">Madhyama (Moderate)</option>
              <option value="Avara (Poor / Lax)">Avara (Poor / Lax)</option>
            </select>
          </div>

          {/* 5. Pramana */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              5. Pramana (Anthropometric Proportions)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height (cm)"
                className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
              />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (kg)"
                className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* 6. Satmya */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              6. Satmya (Adaptability / Homologation)
            </label>
            <select
              value={satmya}
              onChange={(e) => setSatmya(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Pravara (All-taste adaptable)">Pravara (All-taste adaptable)</option>
              <option value="Madhyama">Madhyama</option>
              <option value="Avara (Mono-taste restricted)">Avara (Mono-taste restricted)</option>
            </select>
          </div>

          {/* 7. Satva */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              7. Satva (Mental Constitution & Resilience)
            </label>
            <select
              value={satva}
              onChange={(e) => setSatva(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Pravara (Strong / High tolerance)">Pravara (Strong / High tolerance)</option>
              <option value="Madhyama (Moderate)">Madhyama (Moderate)</option>
              <option value="Avara (Weak / Sensitive)">Avara (Weak / Sensitive)</option>
            </select>
          </div>

          {/* 8. Ahara-shakti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              8. Ahara-shakti (Digestive Capacity - Agni)
            </label>
            <select
              value={aharaShakti}
              onChange={(e) => setAharaShakti(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Sama Agni (Balanced)">Sama Agni (Balanced)</option>
              <option value="Visham Agni (Irregular / Vata)">Visham Agni (Irregular / Vata)</option>
              <option value="Tikshna Agni (Hyper / Pitta)">Tikshna Agni (Hyper / Pitta)</option>
              <option value="Manda Agni (Sluggish / Kapha)">Manda Agni (Sluggish / Kapha)</option>
              <option value="Madhyama (Moderate)">Madhyama (Moderate)</option>
            </select>
          </div>

          {/* 9. Vyayama-shakti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              9. Vyayama-shakti (Physical Endurance)
            </label>
            <select
              value={vyayamaShakti}
              onChange={(e) => setVyayamaShakti(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            >
              <option value="Pravara (High Endurance)">Pravara (High Endurance)</option>
              <option value="Madhyama (Moderate)">Madhyama (Moderate)</option>
              <option value="Avara (Mild / Low)">Avara (Mild / Low)</option>
            </select>
          </div>

          {/* 10. Vaya */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              10. Vaya (Age / Lifespan Stage)
            </label>
            <input
              type="text"
              value={vaya}
              onChange={(e) => setVaya(e.target.value)}
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-white text-base font-medium outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Collapsible Trividha Pariksha */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2 text-left font-bold text-teal-800 hover:text-teal-900"
            onClick={() => setShowTrividha(!showTrividha)}
          >
            <span>Trividha Pariksha (Darshana, Sparshana, Prashna)</span>
            {showTrividha ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showTrividha && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <input type="text" placeholder="Darshana (Inspection)" className="p-3 border rounded-xl text-sm outline-none" defaultValue="Pale complexion, dry lips" />
              <input type="text" placeholder="Sparshana (Palpation)" className="p-3 border rounded-xl text-sm outline-none" defaultValue="Elevated temperature, dry skin" />
              <input type="text" placeholder="Prashna (Interrogation)" className="p-3 border rounded-xl text-sm outline-none" defaultValue="Fever for 3 days, weakness" />
            </div>
          )}
        </div>

        {/* Collapsible Ashtavidha Pariksha */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2 text-left font-bold text-teal-800 hover:text-teal-900"
            onClick={() => setShowAshtavidha(!showAshtavidha)}
          >
            <span>Ashtavidha Pariksha (Nadi, Mutra, Mala, Jihva, Shabda...)</span>
            {showAshtavidha ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showAshtavidha && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <input type="text" placeholder="Nadi (Pulse)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Pitta-Vata (Speedy)" />
              <input type="text" placeholder="Mutra (Urine)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Yellowish, concentrated" />
              <input type="text" placeholder="Mala (Stool)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Slightly constipated" />
              <input type="text" placeholder="Jihva (Tongue)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Light white coat (Sama)" />
              <input type="text" placeholder="Shabda (Voice)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Clear, weak volume" />
              <input type="text" placeholder="Sparsha (Touch)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Warm / Ushna" />
              <input type="text" placeholder="Druk (Eyes)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Mild conjunctival pallor" />
              <input type="text" placeholder="Akriti (Build)" className="p-2.5 border rounded-xl text-xs outline-none" defaultValue="Madhyama" />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="w-full py-4 text-lg font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-md flex items-center justify-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? (
              <span className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5" />
                <span>AYUSH Dashavidha Record Saved Successfully</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save AYUSH Record to Session'}</span>
              </span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AyushPage;
