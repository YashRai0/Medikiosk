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

export interface ILLMProvider {
  generateSummary(history: any): Promise<ClinicalDraft>;
}
