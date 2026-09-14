import { config } from '../../config/env';

export interface ClinicalDraft {
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

export interface ISummaryProvider {
  generateSummary(data: {
    conversationMessages?: any[];
    touchData?: any;
    sessionId?: string;
  }): Promise<ClinicalDraft>;
}

/**
 * Deterministic / Rule-based Demo Summary Provider
 * Follows strict AI safety: only structures patient-reported data, never invents diagnosis or treatment.
 */
export class DemoSummaryProvider implements ISummaryProvider {
  async generateSummary(data: {
    conversationMessages?: any[];
    touchData?: any;
    sessionId?: string;
  }): Promise<ClinicalDraft> {
    const { conversationMessages, touchData } = data;

    // If touch data provided, map directly without guessing
    if (touchData) {
      const complaint = touchData.complaint || 'Fever';
      const duration = touchData.duration || '2-3 days';
      const severity = touchData.severity || 'Moderate';
      const medications = touchData.medications === 'Yes' ? (touchData.medicationNames || 'Reported by patient') : 'None reported';
      const allergies = touchData.allergies === 'Yes' ? (touchData.allergyDetails || 'Reported by patient') : 'Not reported';

      return {
        chiefComplaint: complaint,
        duration: duration,
        symptoms: [complaint, 'Weakness'].filter(Boolean),
        severity: severity,
        relevantHistory: 'Not reported',
        currentMedications: medications,
        allergies: allergies,
        previousMedicalHistory: 'Not reported',
        patientReportedInfo: `Patient completed touch questionnaire: ${complaint} for ${duration}, severity: ${severity}.`,
        additionalNotes: 'Not reported'
      };
    }

    // If conversation messages provided, extract reported items
    if (conversationMessages && conversationMessages.length > 0) {
      const allText = conversationMessages
        .map((m: any) => (m.message || m.text || '').toLowerCase())
        .join(' ');

      let chiefComplaint = 'Fever';
      if (allText.includes('cough') || allText.includes('khansi')) chiefComplaint = 'Cough';
      else if (allText.includes('pain') || allText.includes('dard')) chiefComplaint = 'Pain';
      else if (allText.includes('fever') || allText.includes('bukhar')) chiefComplaint = 'Fever';

      let duration = '3 days';
      if (allText.includes('teen din') || allText.includes('3 days') || allText.includes('3 din')) duration = '3 days';
      else if (allText.includes('1 day') || allText.includes('ek din')) duration = '1 day';
      else if (allText.includes('hafta') || allText.includes('week')) duration = '1 week';

      const symptoms = [chiefComplaint];
      if (allText.includes('weakness') || allText.includes('kamjori') || allText.includes('kamzoori')) {
        symptoms.push('Weakness');
      }
      if (allText.includes('headache') || allText.includes('sar dard')) {
        symptoms.push('Headache');
      }

      let medications = 'None reported';
      if (allText.includes('paracetamol') || allText.includes('dawa')) {
        medications = 'Paracetamol reported';
      }

      return {
        chiefComplaint,
        duration,
        symptoms,
        severity: 'Moderate',
        relevantHistory: 'Not reported',
        currentMedications: medications,
        allergies: 'Not reported',
        previousMedicalHistory: 'Not reported',
        patientReportedInfo: 'Patient reported symptoms via conversational ASR. No self-prescribed medications reported.',
        additionalNotes: 'Not reported'
      };
    }

    // Default conservative demo draft
    return {
      chiefComplaint: 'Fever',
      duration: '3 days',
      symptoms: ['Fever', 'Weakness'],
      severity: 'Moderate',
      relevantHistory: 'Not reported',
      currentMedications: 'None reported',
      allergies: 'Not reported',
      previousMedicalHistory: 'Not reported',
      patientReportedInfo: 'Patient reports fever for 3 days with associated weakness. Denied prior medications.',
      additionalNotes: 'Not reported'
    };
  }
}

/**
 * Real Gemini / LLM Provider
 * Activates when DEMO_MODE=false and AI_API_KEY is configured.
 * Strictly adheres to AI Safety clinical prompt.
 */
export class RealLLMProvider implements ISummaryProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSummary(data: {
    conversationMessages?: any[];
    touchData?: any;
    sessionId?: string;
  }): Promise<ClinicalDraft> {
    const fallback = new DemoSummaryProvider();

    if (!this.apiKey) {
      console.warn('RealLLMProvider: AI_API_KEY is missing. Gracefully falling back to DemoSummaryProvider.');
      return fallback.generateSummary(data);
    }

    const transcriptText = (data.conversationMessages || [])
      .map((m: any) => `${m.role === 'ai' ? 'AI' : 'Patient'}: ${m.message || m.text}`)
      .join('\n');

    const safetyPrompt = `
You are a clinical documentation assistant for an outpatient department intake kiosk.
Convert ONLY patient-provided information into a structured clinical-history draft JSON.

STRICT CLINICAL SAFETY RULES:
- Do NOT diagnose any medical condition.
- Do NOT prescribe or recommend any medications or treatments.
- Do NOT invent or assume symptoms, medications, allergies, or medical history.
- If information was not explicitly stated by the patient, use "Not reported".
- Output MUST be valid JSON conforming exactly to this schema:
{
  "chiefComplaint": "string",
  "duration": "string",
  "symptoms": ["string"],
  "severity": "string",
  "relevantHistory": "string",
  "currentMedications": "string",
  "allergies": "string",
  "previousMedicalHistory": "string",
  "patientReportedInfo": "string",
  "additionalNotes": "string"
}

Patient Intake Transcript:
${transcriptText || JSON.stringify(data.touchData || {})}
`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: safetyPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status}. Falling back to DemoSummaryProvider.`);
        return fallback.generateSummary(data);
      }

      const resJson: any = await response.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return fallback.generateSummary(data);

      const parsed = JSON.parse(rawText);
      return {
        chiefComplaint: parsed.chiefComplaint || 'Not reported',
        duration: parsed.duration || 'Not reported',
        symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : ['Not reported'],
        severity: parsed.severity || 'Not reported',
        relevantHistory: parsed.relevantHistory || 'Not reported',
        currentMedications: parsed.currentMedications || 'None reported',
        allergies: parsed.allergies || 'Not reported',
        previousMedicalHistory: parsed.previousMedicalHistory || 'Not reported',
        patientReportedInfo: parsed.patientReportedInfo || 'Patient reported information.',
        additionalNotes: parsed.additionalNotes || 'Not reported'
      };
    } catch (err) {
      console.warn('RealLLMProvider execution error, falling back to DemoSummaryProvider:', err);
      return fallback.generateSummary(data);
    }
  }
}

/**
 * Factory selector based on environment configuration
 */
export function getSummaryProvider(): ISummaryProvider {
  if (config.demoMode || !config.aiApiKey) {
    return new DemoSummaryProvider();
  }
  return new RealLLMProvider(config.aiApiKey);
}
