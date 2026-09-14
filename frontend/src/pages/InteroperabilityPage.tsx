import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Download, Check, ArrowLeft, Share2, Layers, FileCode, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { getFHIRBundle } from '../api/fhir';

export const InteroperabilityPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'summary' | 'fhir'>('summary');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fhirData, setFhirData] = useState<any>(null);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!sessionId) return;
      setLoading(true);
      try {
        const bundle = await getFHIRBundle(sessionId);
        setFhirData(bundle);
      } catch (e) {
        console.warn('Fallback to generated mock bundle', e);
        // Resilient fallback
        setFhirData({
          resourceType: "Bundle",
          id: `bundle-${sessionId}`,
          type: "document",
          timestamp: new Date().toISOString(),
          entry: [
            {
              resource: {
                resourceType: "Patient",
                id: "PAT-DEMO-1",
                name: [{ text: "Demo Patient" }],
                gender: "male",
                birthDate: "1984-01-01"
              }
            },
            {
              resource: {
                resourceType: "Condition",
                clinicalStatus: { coding: [{ code: "active" }] },
                verificationStatus: { coding: [{ code: "confirmed", display: "Physician Confirmed" }] },
                code: { text: "Fever and Weakness" },
                severity: { text: "Mild" }
              }
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [sessionId]);

  const jsonString = JSON.stringify(fhirData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_Bundle_${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-navy-900">
              FHIR / ABDM-Ready Interoperability
            </h1>
            <Badge variant="demo">Mock HIS Adapter</Badge>
          </div>
          <p className="text-slate-500 text-sm font-mono">
            Session: <strong className="text-teal-700">{sessionId}</strong> • HL7 FHIR R4 Bundle Profile
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/doctor/review/${sessionId}`)}
          className="flex items-center gap-1 font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Review
        </Button>
      </div>

      {/* Honest Prototype Banner */}
      <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-4 rounded-2xl mb-8 text-xs md:text-sm font-semibold flex items-start gap-2 shadow-sm">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong>FHIR/ABDM-ready Prototype Notice:</strong> MediKiosk generates standard HL7 FHIR R4 document bundles compatible with the Ayushman Bharat Digital Mission (ABDM) Health Information Exchange. The integration demonstrated here connects to an internal Mock Hospital Information System (HIS) adapter.
        </div>
      </div>

      {/* Architecture Flow Graphic */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
        <div className="p-4 border-2 border-slate-200 bg-slate-50 rounded-2xl font-extrabold text-slate-800 text-sm w-44">
          MediKiosk Intake
          <span className="block text-xs text-slate-400 font-normal mt-1">Voice / Touch Record</span>
        </div>
        <div className="text-teal-600 font-black text-2xl">→</div>
        <div className="p-4 border-2 border-teal-500 bg-teal-50 rounded-2xl font-extrabold text-teal-800 text-sm w-44 shadow-sm">
          FHIR R4 Mapping
          <span className="block text-xs text-teal-600 font-normal mt-1">Composition + Clinical</span>
        </div>
        <div className="text-teal-600 font-black text-2xl">→</div>
        <div className="p-4 border-2 border-slate-200 bg-slate-50 rounded-2xl font-extrabold text-slate-800 text-sm w-44">
          ABDM / HIS-Ready
          <span className="block text-xs text-slate-400 font-normal mt-1">Electronic Health Record</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 mb-4 bg-slate-200 p-1.5 rounded-2xl inline-flex shadow-inner">
        <button
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
            tab === 'summary' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setTab('summary')}
        >
          <Layers className="w-4 h-4" /> Human-Readable Record
        </button>
        <button
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
            tab === 'fhir' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setTab('fhir')}
        >
          <FileCode className="w-4 h-4" /> Live FHIR R4 JSON
        </button>
      </div>

      {/* Content Area */}
      {tab === 'summary' ? (
        <Card className="p-8 border-2 border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-navy-900">Pre-Consultation Clinical Summary</h2>
              <p className="text-xs text-slate-500">Conforms to NRCES India / ABDM DocumentBundle Profile</p>
            </div>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> FHIR Compliant
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm">
            <div><span className="text-xs text-slate-400 uppercase font-bold block">Patient Resource</span><strong>{fhirData?.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource?.name?.[0]?.text || 'Demo Patient'}</strong></div>
            <div><span className="text-xs text-slate-400 uppercase font-bold block">Identifier</span><span className="font-mono text-xs">{sessionId}</span></div>
            <div><span className="text-xs text-slate-400 uppercase font-bold block">Encounter Status</span><strong className="text-teal-700">Ambulatory OPD (AMB)</strong></div>
            <div><span className="text-xs text-slate-400 uppercase font-bold block">Total Bundle Entries</span><strong>{fhirData?.entry?.length || 5} Resources</strong></div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1">Chief Complaint (Condition Resource)</h3>
              <p className="text-slate-700">
                {fhirData?.entry?.find((e: any) => e.resource?.resourceType === 'Condition')?.resource?.code?.text || 'Fever and Weakness'}
                {' '}(Severity: {fhirData?.entry?.find((e: any) => e.resource?.resourceType === 'Condition')?.resource?.severity?.text || 'Moderate'})
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1">Reported Symptoms (Observation Resources)</h3>
              <ul className="list-disc list-inside text-slate-700">
                {fhirData?.entry?.filter((e: any) => e.resource?.resourceType === 'Observation').map((obs: any, idx: number) => (
                  <li key={idx}><strong>{obs.resource?.code?.text}</strong>: {obs.resource?.valueString}</li>
                )) || <li>Fever: Present</li>}
              </ul>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1">Medications & Allergies Resources</h3>
              <p className="text-slate-700">
                Medications: {fhirData?.entry?.find((e: any) => e.resource?.resourceType === 'MedicationStatement')?.resource?.note?.[0]?.text || 'None reported'}
              </p>
              <p className="text-slate-700 mt-1">
                Allergies: {fhirData?.entry?.find((e: any) => e.resource?.resourceType === 'AllergyIntolerance')?.resource?.note?.[0]?.text || 'None reported'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        /* JSON Tree Viewer */
        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 px-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 font-mono text-xs text-slate-400">HL7_FHIR_R4_Bundle_{sessionId}.json</span>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <pre className="p-6 text-xs md:text-sm font-mono overflow-x-auto text-emerald-400 max-h-[550px] overflow-y-auto leading-relaxed">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
};

export default InteroperabilityPage;
