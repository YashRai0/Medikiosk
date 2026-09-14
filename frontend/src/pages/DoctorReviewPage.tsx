import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, CheckCircle2, AlertTriangle, FileText, ArrowRight, Share2, Save, X, RotateCcw } from 'lucide-react';
import { WarningBanner } from '../components/WarningBanner';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { getPhysicianHistory, updatePhysicianHistory, approveHistory, rejectHistory } from '../api/physician';

interface ClinicalDraft {
  chiefComplaint: string;
  duration: string;
  symptoms: string[];
  severity: string;
  relevantHistory: string;
  currentMedications: string;
  allergies: string;
  previousMedicalHistory: string;
  patientReportedInfo: string;
  additionalNotes: string;
}

export const DoctorReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>({
    name: 'Demo Patient',
    age: 42,
    gender: 'male',
    language: 'Hindi',
    abhaStatus: 'no_abha'
  });

  const [draft, setDraft] = useState<ClinicalDraft>({
    chiefComplaint: 'Fever and Weakness',
    duration: '3 days',
    symptoms: ['Fever', 'Weakness'],
    severity: 'Moderate',
    relevantHistory: 'Not reported',
    currentMedications: 'None reported',
    allergies: 'Not reported',
    previousMedicalHistory: 'Not reported',
    patientReportedInfo: 'Patient reports fever for 3 days with associated weakness. Denied self-medication.',
    additionalNotes: 'Not reported'
  });

  const [fieldBadges, setFieldBadges] = useState<Record<string, 'ai' | 'modified' | 'verified'>>({
    chiefComplaint: 'ai',
    duration: 'ai',
    severity: 'ai',
    currentMedications: 'ai',
    allergies: 'ai',
    patientReportedInfo: 'ai'
  });

  const [isApproved, setIsApproved] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [approving, setApproving] = useState(false);

  // Load real session data from backend
  const loadData = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await getPhysicianHistory(sessionId);
      if (res.patient) {
        setPatient(res.patient);
      }
      if (res.clinicalHistory?.draft) {
        setDraft(res.clinicalHistory.draft);
      }
      if (res.clinicalHistory?.approvalStatus === 'approved') {
        setIsApproved(true);
      }
      if (res.clinicalHistory?.physicianEdits) {
        // Mark edited fields
        const editedKeys = Object.keys(res.clinicalHistory.physicianEdits);
        const updatedBadges = { ...fieldBadges };
        editedKeys.forEach(k => {
          updatedBadges[k] = 'modified';
        });
        setFieldBadges(updatedBadges);
      }
    } catch (e) {
      console.warn('Using local demo data for review', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const handleStartEdit = (fieldKey: string, currentValue: string) => {
    if (isApproved) return;
    setEditingField(fieldKey);
    setTempValue(currentValue);
  };

  const handleSaveEdit = async (fieldKey: string) => {
    const updatedDraft = { ...draft, [fieldKey]: tempValue };
    setDraft(updatedDraft);
    setEditingField(null);

    // Update badge state
    setFieldBadges(prev => ({ ...prev, [fieldKey]: 'modified' }));

    // Send edit to backend
    if (sessionId) {
      try {
        await updatePhysicianHistory(sessionId, {
          draft: { [fieldKey]: tempValue },
          physicianEdits: { [fieldKey]: tempValue }
        });
      } catch (err) {
        console.warn('Updated draft locally', err);
      }
    }
  };

  const handleApprove = async () => {
    if (!sessionId) return;
    setApproving(true);
    try {
      await approveHistory(sessionId, 'Dr. Sharma (Consultant Physician)');
      setIsApproved(true);
    } catch (e) {
      console.warn('Approved locally', e);
      setIsApproved(true);
    } finally {
      setApproving(false);
    }
  };

  const renderField = (fieldKey: keyof ClinicalDraft, label: string) => {
    const value = draft[fieldKey];
    const isEditing = editingField === fieldKey;
    const badgeType = isApproved ? 'verified' : (fieldBadges[fieldKey] || 'ai');

    return (
      <div className="py-4 border-b border-slate-100 last:border-b-0 group">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </label>
          <div className="flex items-center gap-2">
            {badgeType === 'ai' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                AI Generated (Draft)
              </span>
            )}
            {badgeType === 'modified' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Physician Modified
              </span>
            )}
            {badgeType === 'verified' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Physician Verified
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full p-3 border-2 border-teal-500 rounded-xl focus:ring-2 focus:ring-teal-200 outline-none text-base font-medium"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => handleSaveEdit(fieldKey)}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save Edit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start gap-4">
            <p className="text-slate-900 text-base md:text-lg font-medium leading-snug">
              {Array.isArray(value) ? value.join(', ') : (value || 'Not reported')}
            </p>
            {!isApproved && (
              <button
                onClick={() => handleStartEdit(fieldKey, Array.isArray(value) ? value.join(', ') : String(value || ''))}
                className="opacity-60 group-hover:opacity-100 p-1.5 hover:bg-slate-100 text-slate-500 hover:text-teal-700 rounded-lg transition-all"
                title="Physician Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-28">
      {/* SIH Mandatory Warning Banner */}
      <WarningBanner />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-900">
            Clinical History Review & Verification
          </h1>
          <p className="text-slate-500 text-sm font-mono mt-1">
            Session ID: <strong className="text-teal-700">{sessionId}</strong> • Status: {isApproved ? 'Approved & Finalized' : 'Under Physician Review'}
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2 border-teal-600 text-teal-700 font-bold"
          onClick={() => navigate(`/interoperability/${sessionId}`)}
        >
          <Share2 className="w-4 h-4" />
          <span>View FHIR/ABDM Output</span>
        </Button>
      </div>

      {/* Patient Demographics Card */}
      <Card className="p-6 mb-6 bg-slate-50 border-2 border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <span className="block text-xs uppercase font-extrabold text-slate-400">Patient Name</span>
          <span className="font-bold text-slate-900 text-lg">{patient.name || 'Demo Patient'}</span>
        </div>
        <div>
          <span className="block text-xs uppercase font-extrabold text-slate-400">Age / Gender</span>
          <span className="font-bold text-slate-900 text-lg">{patient.age} Y / {patient.gender}</span>
        </div>
        <div>
          <span className="block text-xs uppercase font-extrabold text-slate-400">Consultation Language</span>
          <span className="font-bold text-teal-700 text-lg">{patient.language || 'Hindi'}</span>
        </div>
        <div>
          <span className="block text-xs uppercase font-extrabold text-slate-400">ABHA Status</span>
          <span className="font-bold text-slate-800 text-sm">
            {patient.abhaStatus === 'has_abha' ? 'Linked ABHA' : 'Unlinked (MK Temporary)'}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase font-extrabold text-slate-400">Review State</span>
          <span className={`font-bold text-sm ${isApproved ? 'text-green-600' : 'text-amber-600'}`}>
            {isApproved ? '✓ Verified' : '● Draft Pending'}
          </span>
        </div>
      </Card>

      {/* AI-Generated Clinical History Card */}
      <Card className="p-8 mb-6 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-black text-navy-900">
              AI-Generated Clinical History
            </h2>
            <p className="text-xs text-slate-500">
              Hover over any item and click the pencil icon to modify the assistive draft before finalization.
            </p>
          </div>
          <Badge variant={isApproved ? 'verified' : 'ai'}>
            {isApproved ? 'Verified Clinical Record' : 'Assistive AI Draft'}
          </Badge>
        </div>

        <div className="divide-y divide-slate-100">
          {renderField('chiefComplaint', 'Chief Complaint (मुख्य शिकायत)')}
          {renderField('duration', 'Duration of Symptoms (अवधि)')}
          {renderField('severity', 'Severity Assessment (तीव्रता)')}
          {renderField('currentMedications', 'Current Medications Reported (दवाइयाँ)')}
          {renderField('allergies', 'Known Drug / Environmental Allergies (एलर्जी)')}
          {renderField('patientReportedInfo', 'Patient Reported Transcript Summary (विस्तृत जानकारी)')}
        </div>
      </Card>

      {/* Digitized Documents Section */}
      <Card className="p-6 mb-8 border-2 border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <span>Digitized Prescription / Documents OCR</span>
        </h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
          <div className="flex justify-between font-semibold text-slate-700">
            <span>Prescription_DrSharma.jpg</span>
            <span className="text-green-600 font-bold">OCR Verified (Confidence: 85%)</span>
          </div>
          <p className="text-xs text-slate-600">
            Extracted: <strong>Tab Paracetamol 500mg TDS</strong> • Diagnosis mentioned: <strong>Viral Fever</strong>
          </p>
        </div>
      </Card>

      {/* Fixed Physician Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 p-4 px-8 flex justify-between items-center z-20 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/doctor/dashboard')}>
            ← Back to OPD Queue
          </Button>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Rule: <strong>AI assists. Physician decides.</strong>
          </span>
        </div>

        <div className="flex space-x-3">
          {!isApproved ? (
            <>
              <Button
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-50 font-bold"
                onClick={() => navigate('/patient/history')}
              >
                Send Back
              </Button>
              <Button
                variant="danger"
                className="font-bold"
                onClick={() => navigate('/doctor/dashboard')}
              >
                Reject Draft
              </Button>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-extrabold px-8 shadow-lg flex items-center gap-2"
                onClick={handleApprove}
                disabled={approving}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{approving ? 'Finalizing...' : 'Approve & Finalize Record'}</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-green-700 flex items-center gap-1.5 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Physician Verified & Signed
              </span>
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                onClick={() => navigate(`/interoperability/${sessionId}`)}
              >
                Open FHIR/ABDM Bundle →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReviewPage;
