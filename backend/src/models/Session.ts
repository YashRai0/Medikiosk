import mongoose from 'mongoose';

export interface ISession {
  id: string;
  patientId: string;
  consent: { given: boolean; timestamp?: Date; };
  inputMode: 'voice' | 'touch' | 'both';
  language: string;
  status: 'created' | 'consent_given' | 'in_progress' | 'history_complete' | 'documents_uploaded' | 'summary_generated' | 'under_review' | 'approved' | 'rejected' | 'sent_back';
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema<ISession>({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  consent: {
    given: { type: Boolean, required: true },
    timestamp: { type: Date }
  },
  inputMode: { type: String, enum: ['voice', 'touch', 'both'], required: true },
  language: { type: String, required: true },
  status: { type: String, required: true, default: 'created' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const SessionModel = mongoose.model<ISession>('Session', sessionSchema);
