import mongoose from 'mongoose';

export interface IClinicalHistory {
  id: string;
  sessionId: string;
  draft: {
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
  };
  physicianEdits?: Record<string, any>;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'sent_back';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const clinicalHistorySchema = new mongoose.Schema<IClinicalHistory>({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  draft: {
    chiefComplaint: { type: String },
    duration: { type: String },
    symptoms: [{ type: String }],
    severity: { type: String },
    relevantHistory: { type: String },
    currentMedications: { type: String },
    allergies: { type: String },
    previousMedicalHistory: { type: String },
    patientReportedInfo: { type: String },
    additionalNotes: { type: String }
  },
  physicianEdits: { type: mongoose.Schema.Types.Mixed },
  approvalStatus: { type: String, required: true, default: 'pending' },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ClinicalHistoryModel = mongoose.model<IClinicalHistory>('ClinicalHistory', clinicalHistorySchema);
