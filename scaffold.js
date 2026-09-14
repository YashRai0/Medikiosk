const fs = require('fs');
const path = require('path');

const root = 'c:\\New folder\\backend';

const dirs = [
  'src',
  'src/config',
  'src/models',
  'src/repositories',
  'src/services',
  'src/services/ai',
  'src/services/asr',
  'src/services/ocr',
  'src/services/fhir',
  'src/services/ayush',
  'src/services/cache',
  'src/controllers',
  'src/routes',
  'src/seed',
  'uploads'
];

const files = {
  'package.json': `{
  "name": "medikiosk-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "helmet": "^7.1.0",
    "ioredis": "^5.4.1",
    "mongoose": "^8.7.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.7.0",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.2"
  }
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}`,
  '.env': `PORT=5000
MONGODB_URI=mongodb://localhost:27017/medikiosk
REDIS_URL=redis://localhost:6379
DEMO_MODE=true
CLIENT_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
JWT_SECRET=supersecret
`,
  'src/config/env.ts': `import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/medikiosk',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  demoMode: process.env.DEMO_MODE === 'true',
  aiApiKey: process.env.AI_API_KEY || '',
  asrApiKey: process.env.ASR_API_KEY || '',
  ocrApiKey: process.env.OCR_API_KEY || '',
  bhashiniApiKey: process.env.BHASHINI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
};
`,
  'src/config/database.ts': `import mongoose from 'mongoose';
import { config } from './env';

export let isMongoConnected = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    isMongoConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection failed. Using in-memory fallback.', error);
    isMongoConnected = false;
  }
};
`,
  'src/config/redis.ts': `import Redis from 'ioredis';
import { config } from './env';

export let isRedisConnected = false;
export let redisClient: Redis | null = null;

export const connectRedis = () => {
  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
         console.warn('Redis connection lost. Using in-memory fallback.', err.message);
      }
      isRedisConnected = false;
    });
  } catch (error) {
    console.warn('Redis setup failed. Using in-memory fallback.', error);
    isRedisConnected = false;
  }
};
`,
  'src/models/Patient.ts': `import mongoose from 'mongoose';

export interface IPatient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  language: string;
  abhaStatus: 'has_abha' | 'no_abha';
  abhaId?: string;
  createdAt: Date;
}

const patientSchema = new mongoose.Schema<IPatient>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  language: { type: String, required: true },
  abhaStatus: { type: String, enum: ['has_abha', 'no_abha'], required: true },
  abhaId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const PatientModel = mongoose.model<IPatient>('Patient', patientSchema);
`,
  'src/models/Session.ts': `import mongoose from 'mongoose';

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
`,
  'src/models/Conversation.ts': `import mongoose from 'mongoose';

export interface IConversation {
  id: string;
  sessionId: string;
  role: 'ai' | 'patient';
  message: string;
  transcript?: string;
  timestamp: Date;
}

const conversationSchema = new mongoose.Schema<IConversation>({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  role: { type: String, enum: ['ai', 'patient'], required: true },
  message: { type: String, required: true },
  transcript: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const ConversationModel = mongoose.model<IConversation>('Conversation', conversationSchema);
`,
  'src/models/Document.ts': `import mongoose from 'mongoose';

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
`,
  'src/models/ClinicalHistory.ts': `import mongoose from 'mongoose';

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
`,
  'src/models/AyushRecord.ts': `import mongoose from 'mongoose';

export interface IAyushRecord {
  id: string;
  sessionId: string;
  dashavidha: {
    prakriti: string;
    vikriti: string;
    sara: string;
    samhanana: string;
    pramana: string;
    satmya: string;
    satva: string;
    aharaShakti: string;
    vyayamaShakti: string;
    vaya: string;
  };
  trividhaPariksha?: { darshana: string; sparshana: string; prashna: string; };
  ashtavidhaPariksha?: { nadi: string; mutra: string; mala: string; jihva: string; shabda: string; sparsha: string; druk: string; akriti: string; };
  createdAt: Date;
  updatedAt: Date;
}

const ayushRecordSchema = new mongoose.Schema<IAyushRecord>({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  dashavidha: {
    prakriti: String,
    vikriti: String,
    sara: String,
    samhanana: String,
    pramana: String,
    satmya: String,
    satva: String,
    aharaShakti: String,
    vyayamaShakti: String,
    vaya: String
  },
  trividhaPariksha: { darshana: String, sparshana: String, prashna: String },
  ashtavidhaPariksha: { nadi: String, mutra: String, mala: String, jihva: String, shabda: String, sparsha: String, druk: String, akriti: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const AyushRecordModel = mongoose.model<IAyushRecord>('AyushRecord', ayushRecordSchema);
`,
  'src/repositories/InMemoryStore.ts': `export class InMemoryStore<T extends { id: string }> {
  private store: Map<string, T> = new Map();

  async find(query: Partial<T>): Promise<T[]> {
    const results: T[] = [];
    for (const item of this.store.values()) {
      let match = true;
      for (const key in query) {
        if ((item as any)[key] !== (query as any)[key]) {
          match = false;
          break;
        }
      }
      if (match) results.push(item);
    }
    return results;
  }

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) || null;
  }

  async create(data: T): Promise<T> {
    this.store.set(data.id, data);
    return data;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() } as T;
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
`,
  'src/repositories/PatientRepository.ts': `import { PatientModel, IPatient } from '../models/Patient';
import { isMongoConnected } from '../config/database';
import { InMemoryStore } from './InMemoryStore';

const inMemoryStore = new InMemoryStore<IPatient>();

export const PatientRepository = {
  async findById(id: string): Promise<IPatient | null> {
    if (isMongoConnected) return PatientModel.findOne({ id }).lean();
    return inMemoryStore.findById(id);
  },
  async create(data: IPatient): Promise<IPatient> {
    if (isMongoConnected) return PatientModel.create(data);
    return inMemoryStore.create(data);
  }
};
`,
  'src/repositories/SessionRepository.ts': `import { SessionModel, ISession } from '../models/Session';
import { isMongoConnected } from '../config/database';
import { InMemoryStore } from './InMemoryStore';

const inMemoryStore = new InMemoryStore<ISession>();

export const SessionRepository = {
  async findById(id: string): Promise<ISession | null> {
    if (isMongoConnected) return SessionModel.findOne({ id }).lean();
    return inMemoryStore.findById(id);
  },
  async create(data: ISession): Promise<ISession> {
    if (isMongoConnected) return SessionModel.create(data);
    return inMemoryStore.create(data);
  },
  async update(id: string, data: Partial<ISession>): Promise<ISession | null> {
    if (isMongoConnected) return SessionModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return inMemoryStore.update(id, data);
  },
  async findAll(): Promise<ISession[]> {
    if (isMongoConnected) return SessionModel.find().lean();
    return inMemoryStore.find({});
  }
};
`,
  'src/repositories/ConversationRepository.ts': `import { ConversationModel, IConversation } from '../models/Conversation';
import { isMongoConnected } from '../config/database';
import { InMemoryStore } from './InMemoryStore';

const inMemoryStore = new InMemoryStore<IConversation>();

export const ConversationRepository = {
  async findBySessionId(sessionId: string): Promise<IConversation[]> {
    if (isMongoConnected) return ConversationModel.find({ sessionId }).sort({ timestamp: 1 }).lean();
    return inMemoryStore.find({ sessionId });
  },
  async create(data: IConversation): Promise<IConversation> {
    if (isMongoConnected) return ConversationModel.create(data);
    return inMemoryStore.create(data);
  }
};
`,
  'src/repositories/DocumentRepository.ts': `import { DocumentModel, IDocument } from '../models/Document';
import { isMongoConnected } from '../config/database';
import { InMemoryStore } from './InMemoryStore';

const inMemoryStore = new InMemoryStore<IDocument>();

export const DocumentRepository = {
  async findById(id: string): Promise<IDocument | null> {
    if (isMongoConnected) return DocumentModel.findOne({ id }).lean();
    return inMemoryStore.findById(id);
  },
  async findBySessionId(sessionId: string): Promise<IDocument[]> {
    if (isMongoConnected) return DocumentModel.find({ sessionId }).lean();
    return inMemoryStore.find({ sessionId });
  },
  async create(data: IDocument): Promise<IDocument> {
    if (isMongoConnected) return DocumentModel.create(data);
    return inMemoryStore.create(data);
  },
  async update(id: string, data: Partial<IDocument>): Promise<IDocument | null> {
    if (isMongoConnected) return DocumentModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return inMemoryStore.update(id, data);
  }
};
`,
  'src/repositories/ClinicalHistoryRepository.ts': `import { ClinicalHistoryModel, IClinicalHistory } from '../models/ClinicalHistory';
import { isMongoConnected } from '../config/database';
import { InMemoryStore } from './InMemoryStore';

const inMemoryStore = new InMemoryStore<IClinicalHistory>();

export const ClinicalHistoryRepository = {
  async findBySessionId(sessionId: string): Promise<IClinicalHistory | null> {
    if (isMongoConnected) return ClinicalHistoryModel.findOne({ sessionId }).lean();
    const records = await inMemoryStore.find({ sessionId });
    return records[0] || null;
  },
  async create(data: IClinicalHistory): Promise<IClinicalHistory> {
    if (isMongoConnected) return ClinicalHistoryModel.create(data);
    return inMemoryStore.create(data);
  },
  async update(id: string, data: Partial<IClinicalHistory>): Promise<IClinicalHistory | null> {
    if (isMongoConnected) return ClinicalHistoryModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return inMemoryStore.update(id, data);
  }
};
`,
  'src/repositories/AyushRecordRepository.ts': `import { AyushRecordModel, IAyushRecord } from '../models/AyushRecord';
import { isMongoConnected } from '../config/database';
import { InMemoryStore } from './InMemoryStore';

const inMemoryStore = new InMemoryStore<IAyushRecord>();

export const AyushRecordRepository = {
  async findBySessionId(sessionId: string): Promise<IAyushRecord | null> {
    if (isMongoConnected) return AyushRecordModel.findOne({ sessionId }).lean();
    const records = await inMemoryStore.find({ sessionId });
    return records[0] || null;
  },
  async create(data: IAyushRecord): Promise<IAyushRecord> {
    if (isMongoConnected) return AyushRecordModel.create(data);
    return inMemoryStore.create(data);
  },
  async update(id: string, data: Partial<IAyushRecord>): Promise<IAyushRecord | null> {
    if (isMongoConnected) return AyushRecordModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return inMemoryStore.update(id, data);
  }
};
`,
  'src/services/ai/LLMProvider.ts': `export interface ClinicalDraft {
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
`,
  'src/services/ai/SummaryService.ts': `import { ClinicalDraft, ILLMProvider } from './LLMProvider';
import { config } from '../../config/env';

export class SummaryService implements ILLMProvider {
  async generateSummary(history: any): Promise<ClinicalDraft> {
    if (config.demoMode) {
      return {
        chiefComplaint: 'Fever',
        duration: '3 days',
        symptoms: ['Fever', 'Weakness'],
        severity: 'Not reported',
        relevantHistory: 'Not reported',
        currentMedications: 'None reported',
        allergies: 'Not reported',
        previousMedicalHistory: 'Not reported',
        patientReportedInfo: 'Patient reports fever for 3 days with associated weakness. No current medications.',
        additionalNotes: 'Not reported'
      };
    }
    return {
      chiefComplaint: 'Not reported',
      duration: 'Not reported',
      symptoms: [],
      severity: 'Not reported',
      relevantHistory: 'Not reported',
      currentMedications: 'Not reported',
      allergies: 'Not reported',
      previousMedicalHistory: 'Not reported',
      patientReportedInfo: 'Not reported',
      additionalNotes: 'Not reported'
    };
  }
}
`,
  'src/services/asr/ASRProvider.ts': `export interface IASRProvider {
  transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }>;
}
`,
  'src/services/asr/DemoASR.ts': `import { IASRProvider } from './ASRProvider';

export class DemoASR implements IASRProvider {
  async transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      text: "Mujhe 3 din se bukhar aur kamzori lag rahi hai.",
      confidence: 0.95
    };
  }
}
`,
  'src/services/asr/PrimaryASR.ts': `import { IASRProvider } from './ASRProvider';

export class PrimaryASR implements IASRProvider {
  async transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }> {
    return { text: "Real API transcription", confidence: 0.9 };
  }
}
`,
  'src/services/asr/BhashiniASR.ts': `import { IASRProvider } from './ASRProvider';

export class BhashiniASR implements IASRProvider {
  async transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }> {
    return { text: "Bhashini transcription fallback", confidence: 0.85 };
  }
}
`,
  'src/services/ocr/OCRProvider.ts': `export interface IOCRProvider {
  processDocument(filePath: string): Promise<{ extractedText: string; fields: Record<string, any>; confidence: number; }>;
}
`,
  'src/services/ocr/MockOCR.ts': `import { IOCRProvider } from './OCRProvider';

export class MockOCR implements IOCRProvider {
  async processDocument(filePath: string): Promise<{ extractedText: string; fields: Record<string, any>; confidence: number; }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      extractedText: "Dr. Sharma Medical Clinic\\nDate: 10/09/2026\\nRx\\n1. Tab Paracetamol 500mg - TDS x 3 days\\n2. Tab Cetirizine 10mg - OD x 5 days\\nDiagnosis: Viral Fever\\nFollow-up: After 3 days",
      fields: {
        doctorName: "Dr. Sharma",
        date: "10/09/2026",
        medications: ["Tab Paracetamol 500mg - TDS x 3 days", "Tab Cetirizine 10mg - OD x 5 days"],
        diagnosis: "Viral Fever",
        followUp: "After 3 days"
      },
      confidence: 0.78
    };
  }
}
`,
  'src/services/fhir/FHIRService.ts': `export class FHIRService {
  generateBundle(patient: any, clinicalHistory: any, session: any) {
    return {
      resourceType: "Bundle",
      type: "document",
      entry: [
        {
          fullUrl: \`urn:uuid:\${patient.id}\`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            name: [{ text: patient.name }],
            gender: patient.gender,
            birthDate: \`\${new Date().getFullYear() - patient.age}-01-01\`
          }
        },
        {
          fullUrl: \`urn:uuid:\${session.id}\`,
          resource: {
            resourceType: "Encounter",
            id: session.id,
            status: "finished",
            class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB" },
            subject: { reference: \`urn:uuid:\${patient.id}\` }
          }
        },
        {
          fullUrl: \`urn:uuid:\${clinicalHistory.id}\`,
          resource: {
            resourceType: "Condition",
            id: clinicalHistory.id,
            clinicalStatus: { coding: [{ code: "active" }] },
            subject: { reference: \`urn:uuid:\${patient.id}\` },
            code: { text: clinicalHistory.draft.chiefComplaint }
          }
        }
      ]
    };
  }
}
`,
  'src/services/ayush/AyushService.ts': `import { config } from '../../config/env';

export class AyushService {
  async processAssessment(data: any) {
    if (config.demoMode) {
      return {
        prakriti: "Vata-Pitta",
        vikriti: "Kapha",
        sara: "Madhyama",
        samhanana: "Madhyama",
        pramana: "Sama",
        satmya: "Vyami",
        satva: "Avara",
        aharaShakti: "Pravara",
        vyayamaShakti: "Madhyama",
        vaya: "Madhyama"
      };
    }
    return data;
  }
}
`,
  'src/services/cache/CacheService.ts': `import { redisClient, isRedisConnected } from '../../config/redis';

const inMemoryCache = new Map<string, { value: string; expiry: number }>();

export const CacheService = {
  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    if (isRedisConnected && redisClient) {
      await redisClient.setex(key, ttlSeconds, value);
    } else {
      inMemoryCache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
    }
  },
  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      return redisClient.get(key);
    } else {
      const item = inMemoryCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        inMemoryCache.delete(key);
        return null;
      }
      return item.value;
    }
  },
  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    } else {
      inMemoryCache.delete(key);
    }
  }
};
`,
  'src/controllers/sessionController.ts': `import { Request, Response } from 'express';
import { SessionRepository } from '../repositories/SessionRepository';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { patientId, inputMode, language } = req.body;
    const id = \`MK-2026-\${Math.floor(100000 + Math.random() * 900000)}\`;
    const session = await SessionRepository.create({
      id,
      patientId,
      consent: { given: false },
      inputMode,
      language,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await SessionRepository.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const recordConsent = async (req: Request, res: Response) => {
  try {
    const session = await SessionRepository.update(req.params.id, {
      consent: { given: true, timestamp: new Date() },
      status: 'consent_given'
    });
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await SessionRepository.findAll();
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const session = await SessionRepository.update(req.params.id, req.body);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/conversationController.ts': `import { Request, Response } from 'express';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { v4 as uuidv4 } from 'uuid';

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, role, message, transcript } = req.body;
    const conv = await ConversationRepository.create({
      id: uuidv4(),
      sessionId,
      role,
      message,
      transcript,
      timestamp: new Date()
    });
    res.status(201).json(conv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const convs = await ConversationRepository.findBySessionId(req.params.sessionId);
    res.json(convs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    res.json({ question: "Could you tell me more about your symptoms?" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/asrController.ts': `import { Request, Response } from 'express';
import { DemoASR } from '../services/asr/DemoASR';

const asrProvider = new DemoASR(); // Demo by default

export const transcribe = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file required' });
    const result = await asrProvider.transcribe(req.file.buffer, req.body.language || 'en');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/ocrController.ts': `import { Request, Response } from 'express';
import { MockOCR } from '../services/ocr/MockOCR';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { v4 as uuidv4 } from 'uuid';

const ocrProvider = new MockOCR();

export const processDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Document file required' });
    const sessionId = req.body.sessionId;
    const result = await ocrProvider.processDocument(req.file.path);
    
    const doc = await DocumentRepository.create({
      id: uuidv4(),
      sessionId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      documentType: req.body.documentType || 'other',
      extractedText: result.extractedText,
      extractedFields: result.fields,
      confidence: result.confidence,
      status: 'processed',
      createdAt: new Date()
    });
    
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentRepository.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/summaryController.ts': `import { Request, Response } from 'express';
import { SummaryService } from '../services/ai/SummaryService';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { v4 as uuidv4 } from 'uuid';

const summaryService = new SummaryService();

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const draft = await summaryService.generateSummary({});
    
    const history = await ClinicalHistoryRepository.create({
      id: uuidv4(),
      sessionId,
      draft,
      approvalStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.findBySessionId(req.params.sessionId);
    if (!history) return res.status(404).json({ error: 'Not found' });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/physicianController.ts': `import { Request, Response } from 'express';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.findBySessionId(req.params.sessionId);
    if (!history) return res.status(404).json({ error: 'Not found' });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHistory = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.update(req.params.sessionId, req.body);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveHistory = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.update(req.params.sessionId, {
      approvalStatus: 'approved',
      approvedBy: req.body.doctorId || 'doc-123',
      approvedAt: new Date()
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectHistory = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.update(req.params.sessionId, { approvalStatus: 'rejected' });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendBack = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.update(req.params.sessionId, { approvalStatus: 'sent_back' });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/fhirController.ts': `import { Request, Response } from 'express';
import { FHIRService } from '../services/fhir/FHIRService';
import { SessionRepository } from '../repositories/SessionRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';

const fhirService = new FHIRService();

export const getFHIRBundle = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await SessionRepository.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const patient = await PatientRepository.findById(session.patientId);
    const history = await ClinicalHistoryRepository.findBySessionId(sessionId);
    
    if (!patient || !history) return res.status(404).json({ error: 'Incomplete data for FHIR generation' });
    
    const bundle = fhirService.generateBundle(patient, history, session);
    res.json(bundle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/controllers/ayushController.ts': `import { Request, Response } from 'express';
import { AyushRecordRepository } from '../repositories/AyushRecordRepository';
import { AyushService } from '../services/ayush/AyushService';
import { v4 as uuidv4 } from 'uuid';

const ayushService = new AyushService();

export const createAyushRecord = async (req: Request, res: Response) => {
  try {
    const { sessionId, data } = req.body;
    const processed = await ayushService.processAssessment(data);
    const record = await AyushRecordRepository.create({
      id: uuidv4(),
      sessionId,
      dashavidha: processed,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAyushRecord = async (req: Request, res: Response) => {
  try {
    const record = await AyushRecordRepository.findBySessionId(req.params.sessionId);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAyushRecord = async (req: Request, res: Response) => {
  try {
    const record = await AyushRecordRepository.update(req.params.sessionId, req.body);
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
`,
  'src/routes/sessionRoutes.ts': `import { Router } from 'express';
import { createSession, getSession, recordConsent, listSessions, updateSession } from '../controllers/sessionController';

const router = Router();
router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/:id/consent', recordConsent);
router.put('/:id', updateSession);
export default router;
`,
  'src/routes/conversationRoutes.ts': `import { Router } from 'express';
import { addMessage, getConversation, getNextQuestion } from '../controllers/conversationController';

const router = Router();
router.post('/message', addMessage);
router.get('/:sessionId', getConversation);
router.post('/next-question', getNextQuestion);
export default router;
`,
  'src/routes/asrRoutes.ts': `import { Router } from 'express';
import multer from 'multer';
import { transcribe } from '../controllers/asrController';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
router.post('/transcribe', upload.single('audio'), transcribe);
export default router;
`,
  'src/routes/ocrRoutes.ts': `import { Router } from 'express';
import multer from 'multer';
import { processDocument, getDocument } from '../controllers/ocrController';
import { config } from '../config/env';

const upload = multer({ dest: config.uploadDir });
const router = Router();
router.post('/process', upload.single('document'), processDocument);
router.get('/:documentId', getDocument);
export default router;
`,
  'src/routes/summaryRoutes.ts': `import { Router } from 'express';
import { generateSummary, getSummary } from '../controllers/summaryController';

const router = Router();
router.post('/generate', generateSummary);
router.get('/:sessionId', getSummary);
export default router;
`,
  'src/routes/physicianRoutes.ts': `import { Router } from 'express';
import { getHistory, updateHistory, approveHistory, rejectHistory, sendBack } from '../controllers/physicianController';

const router = Router();
router.get('/:sessionId', getHistory);
router.put('/:sessionId', updateHistory);
router.post('/:sessionId/approve', approveHistory);
router.post('/:sessionId/reject', rejectHistory);
router.post('/:sessionId/send-back', sendBack);
export default router;
`,
  'src/routes/fhirRoutes.ts': `import { Router } from 'express';
import { getFHIRBundle } from '../controllers/fhirController';

const router = Router();
router.get('/:sessionId', getFHIRBundle);
export default router;
`,
  'src/routes/ayushRoutes.ts': `import { Router } from 'express';
import { createAyushRecord, getAyushRecord, updateAyushRecord } from '../controllers/ayushController';

const router = Router();
router.post('/', createAyushRecord);
router.get('/:sessionId', getAyushRecord);
router.put('/:sessionId', updateAyushRecord);
export default router;
`,
  'src/routes/index.ts': `import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import conversationRoutes from './conversationRoutes';
import asrRoutes from './asrRoutes';
import ocrRoutes from './ocrRoutes';
import summaryRoutes from './summaryRoutes';
import physicianRoutes from './physicianRoutes';
import fhirRoutes from './fhirRoutes';
import ayushRoutes from './ayushRoutes';

const router = Router();
router.use('/sessions', sessionRoutes);
router.use('/conversation', conversationRoutes);
router.use('/asr', asrRoutes);
router.use('/ocr', ocrRoutes);
router.use('/summary', summaryRoutes);
router.use('/physician', physicianRoutes);
router.use('/fhir', fhirRoutes);
router.use('/ayush', ayushRoutes);
export default router;
`,
  'src/seed/demoData.ts': `import { PatientRepository } from '../repositories/PatientRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { v4 as uuidv4 } from 'uuid';

export const seedDemoData = async () => {
  try {
    const patientId = 'PAT-DEMO-1';
    
    const existing = await PatientRepository.findById(patientId);
    if (existing) return; // already seeded

    await PatientRepository.create({
      id: patientId,
      name: 'Demo Patient',
      age: 42,
      gender: 'male',
      language: 'Hindi',
      abhaStatus: 'no_abha',
      createdAt: new Date()
    });

    const sessionId = 'MK-DEMO-001';
    await SessionRepository.create({
      id: sessionId,
      patientId,
      consent: { given: true, timestamp: new Date() },
      inputMode: 'voice',
      language: 'Hindi',
      status: 'history_complete',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const messages = [
      { role: 'ai', message: 'Hello! How can I help you today?' },
      { role: 'patient', message: 'I have had a fever and weakness for 3 days.' },
      { role: 'ai', message: 'Are you taking any medications for the fever?' },
      { role: 'patient', message: 'No, I have not taken any medication.' }
    ];

    for (const msg of messages) {
      await ConversationRepository.create({
        id: uuidv4(),
        sessionId,
        role: msg.role as any,
        message: msg.message,
        timestamp: new Date()
      });
    }

    await ClinicalHistoryRepository.create({
      id: uuidv4(),
      sessionId,
      draft: {
        chiefComplaint: 'Fever',
        duration: '3 days',
        symptoms: ['Fever', 'Weakness'],
        severity: 'Not reported',
        relevantHistory: 'Not reported',
        currentMedications: 'None reported',
        allergies: 'Not reported',
        previousMedicalHistory: 'Not reported',
        patientReportedInfo: 'Patient reports fever for 3 days with associated weakness. No current medications.',
        additionalNotes: 'Not reported'
      },
      approvalStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Demo data seeded successfully!');
  } catch (err) {
    console.error('Error seeding demo data', err);
  }
};
`,
  'src/server.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import { connectDB, isMongoConnected } from './config/database';
import { connectRedis, isRedisConnected } from './config/redis';
import routes from './routes';
import { seedDemoData } from './seed/demoData';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

app.use('/api/v1', routes);

const startServer = async () => {
  await connectDB();
  connectRedis();

  if (config.demoMode) {
    await seedDemoData();
  }

  app.listen(config.port, () => {
    console.log(\`=================================\`);
    console.log(\`🚀 Server running on port \${config.port}\`);
    console.log(\`📊 MongoDB connected: \${isMongoConnected}\`);
    console.log(\`🗄️ Redis connected: \${isRedisConnected}\`);
    console.log(\`🧪 Demo Mode: \${config.demoMode}\`);
    console.log(\`=================================\`);
  });
};

startServer();
`
};

dirs.forEach(d => {
  const fullPath = path.join(root, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

for (const [relPath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, relPath), content);
}
console.log('Scaffolding complete.');
