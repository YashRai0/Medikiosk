import mongoose from 'mongoose';

export interface IDocument {
  id: string;
  sessionId: string;
  fileName: string;
  filePath: string;
  documentType: 'prescription' | 'lab_report' | 'discharge_summary' | 'other';
  extractedText?: string;
  extractedFields?: Record<string, any>;
  confidence?: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  createdAt: Date;
}

const documentSchema = new mongoose.Schema<IDocument>({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  documentType: { type: String, required: true },
  extractedText: { type: String },
  extractedFields: { type: mongoose.Schema.Types.Mixed },
  confidence: { type: Number },
  status: { type: String, required: true, default: 'uploaded' },
  createdAt: { type: Date, default: Date.now }
});

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
