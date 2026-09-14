export type SessionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IPatient {
  name: string;
  age?: number;
  gender?: string;
  abhaId?: string;
  language?: string;
}

export interface IClinicalDraft {
  chiefComplaint: string;
  duration: string;
  symptoms: string[];
  severity: string;
  relevantHistory: string;
  currentMedications: string[];
  allergies: string[];
  previousMedicalHistory: string;
  patientReportedInfo: string;
  additionalNotes: string;
}

export interface IClinicalHistory {
  draft: IClinicalDraft;
}

export interface IAyushRecord {
  prakriti: string;
  vikriti: string;
  sara: string;
  samhanana: string;
  pramanaHeight: string;
  pramanaWeight: string;
  satmya: string;
  satva: string;
  aharaShakti: string;
  vyayamaShakti: string;
  vaya: string;
  darshana: string;
  sparshana: string;
  prashna: string;
  nadi: string;
  mutra: string;
  mala: string;
  jihva: string;
  shabda: string;
  sparsha: string;
  druk: string;
  akriti: string;
}

export interface ISession {
  id: string;
  patient: IPatient;
  status: SessionStatus;
  consentGiven: boolean;
  consentTimestamp?: string;
  history?: IClinicalHistory;
  ayush?: IAyushRecord;
  createdAt: string;
}

export interface IMessage {
  role: 'ai' | 'patient';
  text: string;
  timestamp: string;
}

export interface IConversation {
  sessionId: string;
  messages: IMessage[];
}

export interface IDocument {
  id: string;
  type: string;
  fileName: string;
  extractedText?: string;
  fields?: Record<string, string>;
  confidence?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
