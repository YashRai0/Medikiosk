import os
import json

root_dir = r"C:\Medikiosk\backend"

def write_file(rel_path, content):
    full_path = os.path.join(root_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created {rel_path}")

write_file('package.json', """{
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
}""")

write_file('tsconfig.json', """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}""")

write_file('src/config/env.ts', """import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') }); // Root .env

export const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/medikiosk',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    demoMode: process.env.DEMO_MODE === 'true' || true,
    aiApiKey: process.env.AI_API_KEY || '',
    asrApiKey: process.env.ASR_API_KEY || '',
    ocrApiKey: process.env.OCR_API_KEY || '',
    bhashiniApiKey: process.env.BHASHINI_API_KEY || '',
    jwtSecret: process.env.JWT_SECRET || 'supersecret',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024,
};""")

write_file('src/config/database.ts', """import mongoose from 'mongoose';
import { config } from './env';

export let isMongoConnected = false;

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        isMongoConnected = true;
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.warn('MongoDB connection failed, falling back to in-memory store:', error);
        isMongoConnected = false;
    }
};""")

write_file('src/config/redis.ts', """import Redis from 'ioredis';
import { config } from './env';

export let isRedisConnected = false;
export let redisClient: Redis | null = null;

export const connectRedis = async () => {
    try {
        redisClient = new Redis(config.redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
            lazyConnect: true
        });

        redisClient.on('connect', () => {
            isRedisConnected = true;
            console.log('Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            console.warn('Redis connection failed, falling back to in-memory cache:', err.message);
            isRedisConnected = false;
        });

        await redisClient.connect().catch(() => {});
    } catch (error) {
        console.warn('Failed to setup Redis, using in-memory cache');
        isRedisConnected = false;
    }
};""")

write_file('src/models/Patient.ts', """import mongoose, { Schema, Document } from 'mongoose';

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

const PatientSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    language: { type: String, required: true },
    abhaStatus: { type: String, enum: ['has_abha', 'no_abha'], required: true },
    abhaId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const PatientModel = mongoose.model<IPatient & Document>('Patient', PatientSchema);""")

write_file('src/models/Session.ts', """import mongoose, { Schema, Document } from 'mongoose';

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

const SessionSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    consent: {
        given: { type: Boolean, default: false },
        timestamp: { type: Date }
    },
    inputMode: { type: String, enum: ['voice', 'touch', 'both'], required: true },
    language: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const SessionModel = mongoose.model<ISession & Document>('Session', SessionSchema);""")

write_file('src/models/Conversation.ts', """import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation {
    id: string;
    sessionId: string;
    role: 'ai' | 'patient';
    message: string;
    transcript?: string;
    timestamp: Date;
}

const ConversationSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true },
    role: { type: String, enum: ['ai', 'patient'], required: true },
    message: { type: String, required: true },
    transcript: { type: String },
    timestamp: { type: Date, default: Date.now }
});

export const ConversationModel = mongoose.model<IConversation & Document>('Conversation', ConversationSchema);""")

write_file('src/models/Document.ts', """import mongoose, { Schema, Document } from 'mongoose';

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

const DocumentSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    documentType: { type: String, required: true },
    extractedText: { type: String },
    extractedFields: { type: Schema.Types.Mixed },
    confidence: { type: Number },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const DocumentModel = mongoose.model<IDocument & Document>('Document', DocumentSchema);""")

write_file('src/models/ClinicalHistory.ts', """import mongoose, { Schema, Document } from 'mongoose';

export interface IClinicalDraft {
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

export interface IClinicalHistory {
    id: string;
    sessionId: string;
    draft: IClinicalDraft;
    physicianEdits?: Record<string, any>;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'sent_back';
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ClinicalHistorySchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true },
    draft: { type: Schema.Types.Mixed, required: true },
    physicianEdits: { type: Schema.Types.Mixed },
    approvalStatus: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const ClinicalHistoryModel = mongoose.model<IClinicalHistory & Document>('ClinicalHistory', ClinicalHistorySchema);""")

write_file('src/models/AyushRecord.ts', """import mongoose, { Schema, Document } from 'mongoose';

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
    trividhaPariksha?: {
        darshana: string;
        sparshana: string;
        prashna: string;
    };
    ashtavidhaPariksha?: {
        nadi: string;
        mutra: string;
        mala: string;
        jihva: string;
        shabda: string;
        sparsha: string;
        druk: string;
        akriti: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AyushRecordSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true },
    dashavidha: { type: Schema.Types.Mixed, required: true },
    trividhaPariksha: { type: Schema.Types.Mixed },
    ashtavidhaPariksha: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const AyushRecordModel = mongoose.model<IAyushRecord & Document>('AyushRecord', AyushRecordSchema);""")

write_file('src/repositories/InMemoryStore.ts', """export class InMemoryStore<T> {
    private store = new Map<string, T>();

    async create(item: T & { id: string }): Promise<T> {
        this.store.set(item.id, item);
        return item;
    }

    async findById(id: string): Promise<T | null> {
        return this.store.get(id) || null;
    }

    async findAll(): Promise<T[]> {
        return Array.from(this.store.values());
    }

    async findBy(filter: Partial<T>): Promise<T[]> {
        return Array.from(this.store.values()).filter(item => {
            return Object.entries(filter).every(([key, value]) => (item as any)[key] === value);
        });
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const existing = this.store.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...data };
        this.store.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.store.delete(id);
    }
}""")

repos = [
    { 'name': 'Patient', 'iface': 'IPatient', 'model': 'PatientModel' },
    { 'name': 'Session', 'iface': 'ISession', 'model': 'SessionModel' },
    { 'name': 'Conversation', 'iface': 'IConversation', 'model': 'ConversationModel' },
    { 'name': 'Document', 'iface': 'IDocument', 'model': 'DocumentModel' },
    { 'name': 'ClinicalHistory', 'iface': 'IClinicalHistory', 'model': 'ClinicalHistoryModel' },
    { 'name': 'AyushRecord', 'iface': 'IAyushRecord', 'model': 'AyushRecordModel' }
]

for repo in repos:
    content = f"""import {{ {repo['iface']}, {repo['model']} }} from '../models/{repo['name']}';
import {{ InMemoryStore }} from './InMemoryStore';
import {{ isMongoConnected }} from '../config/database';

const inMemoryStore = new InMemoryStore<{repo['iface']}>();

export class {repo['name']}Repository {{
    static async create(item: {repo['iface']}): Promise<{repo['iface']}> {{
        if (isMongoConnected) {{
            const doc = new {repo['model']}(item);
            await doc.save();
            return doc.toObject();
        }}
        return inMemoryStore.create(item as any);
    }}

    static async findById(id: string): Promise<{repo['iface']} | null> {{
        if (isMongoConnected) {{
            const doc = await {repo['model']}.findOne({{ id }});
            return doc ? doc.toObject() : null;
        }}
        return inMemoryStore.findById(id);
    }}

    static async findAll(): Promise<{repo['iface']}[]> {{
        if (isMongoConnected) {{
            const docs = await {repo['model']}.find();
            return docs.map(d => d.toObject());
        }}
        return inMemoryStore.findAll();
    }}

    static async findBy(filter: Partial<{repo['iface']}>): Promise<{repo['iface']}[]> {{
        if (isMongoConnected) {{
            const docs = await {repo['model']}.find(filter);
            return docs.map(d => d.toObject());
        }}
        return inMemoryStore.findBy(filter);
    }}

    static async update(id: string, data: Partial<{repo['iface']}>): Promise<{repo['iface']} | null> {{
        if (isMongoConnected) {{
            const doc = await {repo['model']}.findOneAndUpdate({{ id }}, data, {{ new: true }});
            return doc ? doc.toObject() : null;
        }}
        return inMemoryStore.update(id, data);
    }}

    static async delete(id: string): Promise<boolean> {{
        if (isMongoConnected) {{
            const res = await {repo['model']}.deleteOne({{ id }});
            return res.deletedCount > 0;
        }}
        return inMemoryStore.delete(id);
    }}
}}
"""
    write_file(f"src/repositories/{repo['name']}Repository.ts", content)


write_file('src/services/ai/LLMProvider.ts', """import { IClinicalDraft } from '../../models/ClinicalHistory';

export type ClinicalDraft = IClinicalDraft;

export interface ILLMProvider {
    generateSummary(conversationMessages: any[], touchData?: any): Promise<ClinicalDraft>;
}""")

write_file('src/services/ai/SummaryService.ts', """import { ILLMProvider, ClinicalDraft } from './LLMProvider';
import { config } from '../../config/env';

export class SummaryService implements ILLMProvider {
    async generateSummary(conversationMessages: any[], touchData?: any): Promise<ClinicalDraft> {
        if (config.demoMode || !config.aiApiKey) {
            const isDemo = conversationMessages.some(m => m.message?.includes('bukhar'));
            if (isDemo) {
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
                chiefComplaint: touchData?.chiefComplaint || 'Not reported',
                duration: touchData?.duration || 'Not reported',
                symptoms: touchData?.symptoms || [],
                severity: 'Not reported',
                relevantHistory: 'Not reported',
                currentMedications: 'None reported',
                allergies: 'Not reported',
                previousMedicalHistory: 'Not reported',
                patientReportedInfo: 'Patient information extracted from conversation.',
                additionalNotes: 'Not reported'
            };
        }
        throw new Error('Real AI not implemented');
    }
}""")

write_file('src/services/asr/ASRProvider.ts', """export interface IASRProvider {
    transcribe(audioData: any, language: string): Promise<{ text: string; confidence: number; provider: string; }>;
}""")

write_file('src/services/asr/DemoASR.ts', """import { IASRProvider } from './ASRProvider';

export class DemoASR implements IASRProvider {
    private demoResponses = [
        "Mujhe pichhle teen din se bukhar hai.",
        "Teen din se.",
        "Nahi.",
        "Weakness feel ho rahi hai."
    ];
    private currentIndex = 0;

    async transcribe(audioData: any, language: string): Promise<{ text: string; confidence: number; provider: string; }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const text = this.demoResponses[this.currentIndex];
                this.currentIndex = (this.currentIndex + 1) % this.demoResponses.length;
                resolve({
                    text,
                    confidence: 0.92,
                    provider: 'demo'
                });
            }, 500);
        });
    }
}""")

write_file('src/services/asr/PrimaryASR.ts', """import { IASRProvider } from './ASRProvider';

export class PrimaryASR implements IASRProvider {
    async transcribe(audioData: any, language: string): Promise<{ text: string; confidence: number; provider: string; }> {
        throw new Error('Real ASR not configured');
    }
}""")

write_file('src/services/asr/BhashiniASR.ts', """import { IASRProvider } from './ASRProvider';

export class BhashiniASR implements IASRProvider {
    async transcribe(audioData: any, language: string): Promise<{ text: string; confidence: number; provider: string; }> {
        throw new Error('Bhashini not configured');
    }
}""")

write_file('src/services/ocr/OCRProvider.ts', """export interface IOCRProvider {
    processDocument(filePath: string, documentType: string): Promise<{
        extractedText: string;
        fields: Record<string, any>;
        confidence: number;
        provider: string;
    }>;
}""")

write_file('src/services/ocr/MockOCR.ts', """import { IOCRProvider } from './OCRProvider';

export class MockOCR implements IOCRProvider {
    async processDocument(filePath: string, documentType: string) {
        return new Promise<{ extractedText: string; fields: Record<string, any>; confidence: number; provider: string; }>((resolve) => {
            setTimeout(() => {
                resolve({
                    extractedText: "Dr. Sharma Medical Clinic\\nDate: 10/09/2026\\nPatient: Demo Patient\\n\\nRx\\n1. Tab Paracetamol 500mg - TDS x 3 days\\n2. Tab Cetirizine 10mg - OD x 5 days\\n\\nDiagnosis: Viral Fever\\nFollow-up: After 3 days",
                    fields: {
                        doctorName: "Dr. Sharma",
                        clinicName: "Dr. Sharma Medical Clinic",
                        date: "10/09/2026",
                        medications: ["Tab Paracetamol 500mg - TDS x 3 days", "Tab Cetirizine 10mg - OD x 5 days"],
                        diagnosis: "Viral Fever",
                        followUp: "After 3 days"
                    },
                    confidence: 0.78,
                    provider: 'mock-ocr'
                });
            }, 800);
        });
    }
}""")

write_file('src/services/fhir/FHIRService.ts', """export class FHIRService {
    generateBundle(patient: any, clinicalHistory: any, session: any, documents?: any[]) {
        return {
            resourceType: "Bundle",
            type: "document",
            timestamp: new Date().toISOString(),
            meta: {
                profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
            },
            entry: [
                {
                    fullUrl: `urn:uuid:${patient.id}`,
                    resource: {
                        resourceType: "Patient",
                        id: patient.id,
                        name: [{ text: patient.name }],
                        gender: patient.gender,
                        birthDate: new Date(new Date().getFullYear() - patient.age, 0, 1).toISOString().split('T')[0]
                    }
                },
                {
                    fullUrl: `urn:uuid:${session.id}`,
                    resource: {
                        resourceType: "Encounter",
                        id: session.id,
                        status: "finished",
                        class: { code: "AMB" },
                        subject: { reference: `urn:uuid:${patient.id}` },
                        period: { start: session.createdAt, end: session.updatedAt }
                    }
                },
                {
                    fullUrl: `urn:uuid:${clinicalHistory.id}-cond`,
                    resource: {
                        resourceType: "Condition",
                        id: `${clinicalHistory.id}-cond`,
                        clinicalStatus: { coding: [{ code: "active" }] },
                        code: { text: clinicalHistory.draft?.chiefComplaint || "Unknown" },
                        subject: { reference: `urn:uuid:${patient.id}` }
                    }
                }
            ]
        };
    }
}""")

write_file('src/services/ayush/AyushService.ts', """import { AyushRecordRepository } from '../../repositories/AyushRecordRepository';
import { v4 as uuidv4 } from 'uuid';

export class AyushService {
    async createRecord(sessionId: string, data: any) {
        return AyushRecordRepository.create({
            id: uuidv4(),
            sessionId,
            dashavidha: data.dashavidha,
            trividhaPariksha: data.trividhaPariksha,
            ashtavidhaPariksha: data.ashtavidhaPariksha,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    async getRecord(sessionId: string) {
        const records = await AyushRecordRepository.findBy({ sessionId });
        return records[0] || null;
    }

    async updateRecord(sessionId: string, data: any) {
        const record = await this.getRecord(sessionId);
        if (record) {
            return AyushRecordRepository.update(record.id, { ...data, updatedAt: new Date() });
        }
        return null;
    }

    getDemoRecord() {
        return {
            dashavidha: {
                prakriti: "Vata-Pitta",
                vikriti: "Vata vriddhi",
                sara: "Madhyama",
                samhanana: "Madhyama",
                pramana: "Madhyama",
                satmya: "Sarva Rasa",
                satva: "Madhyama",
                aharaShakti: "Avara",
                vyayamaShakti: "Madhyama",
                vaya: "Madhyama"
            }
        };
    }
}""")

write_file('src/services/cache/CacheService.ts', """import { isRedisConnected, redisClient } from '../../config/redis';

class CacheService {
    private inMemoryCache = new Map<string, { value: string, expiry?: number }>();

    async get(key: string): Promise<string | null> {
        if (isRedisConnected && redisClient) {
            return redisClient.get(key);
        }
        const item = this.inMemoryCache.get(key);
        if (!item) return null;
        if (item.expiry && Date.now() > item.expiry) {
            this.inMemoryCache.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (isRedisConnected && redisClient) {
            if (ttlSeconds) {
                await redisClient.set(key, value, 'EX', ttlSeconds);
            } else {
                await redisClient.set(key, value);
            }
            return;
        }
        const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.inMemoryCache.set(key, { value, expiry });
    }

    async del(key: string): Promise<void> {
        if (isRedisConnected && redisClient) {
            await redisClient.del(key);
            return;
        }
        this.inMemoryCache.delete(key);
    }
}

export const cacheService = new CacheService();""")

write_file('src/controllers/sessionController.ts', """import { Request, Response } from 'express';
import { SessionRepository } from '../repositories/SessionRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req: Request, res: Response) => {
    try {
        const { name, age, gender, language, abhaStatus, abhaId } = req.body;
        const patientId = uuidv4();
        const sessionId = `MK-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        const patient = await PatientRepository.create({
            id: patientId,
            name, age, gender, language, abhaStatus, abhaId,
            createdAt: new Date()
        });

        const session = await SessionRepository.create({
            id: sessionId,
            patientId,
            consent: { given: false },
            inputMode: 'voice',
            language,
            status: 'created',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({ patient, session });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getSession = async (req: Request, res: Response) => {
    try {
        const session = await SessionRepository.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Not found' });
        const patient = await PatientRepository.findById(session.patientId);
        res.json({ session, patient });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const listSessions = async (req: Request, res: Response) => {
    try {
        const sessions = await SessionRepository.findAll();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const recordConsent = async (req: Request, res: Response) => {
    try {
        const updated = await SessionRepository.update(req.params.id, {
            consent: { given: true, timestamp: new Date() },
            status: 'consent_given',
            updatedAt: new Date()
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateSession = async (req: Request, res: Response) => {
    try {
        const updated = await SessionRepository.update(req.params.id, { ...req.body, updatedAt: new Date() });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/conversationController.ts', """import { Request, Response } from 'express';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { v4 as uuidv4 } from 'uuid';

export const addMessage = async (req: Request, res: Response) => {
    try {
        const { sessionId, role, message, transcript } = req.body;
        const msg = await ConversationRepository.create({
            id: uuidv4(),
            sessionId,
            role,
            message,
            transcript,
            timestamp: new Date()
        });
        res.status(201).json(msg);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getConversation = async (req: Request, res: Response) => {
    try {
        const messages = await ConversationRepository.findBy({ sessionId: req.params.sessionId });
        messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getNextQuestion = async (req: Request, res: Response) => {
    try {
        const { sessionId, lastMessage } = req.body;
        const questions = [
            "Namaste. Aapko sabse zyada kis problem ki wajah se doctor se milna hai?",
            "Bukhar kab se hai?",
            "Kya aap koi medicine le rahe hain?",
            "Kya aapko koi aur problem ho rahi hai?",
            "Dhanyavaad. Aapki jaankari le li gayi hai."
        ];
        
        const messages = await ConversationRepository.findBy({ sessionId });
        const aiMessages = messages.filter(m => m.role === 'ai').length;
        
        let next = questions[aiMessages] || questions[questions.length - 1];
        res.json({ question: next });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/asrController.ts', """import { Request, Response } from 'express';
import { DemoASR } from '../services/asr/DemoASR';
import { PrimaryASR } from '../services/asr/PrimaryASR';
import { config } from '../config/env';

const demoAsr = new DemoASR();
const primaryAsr = new PrimaryASR();

export const transcribe = async (req: Request, res: Response) => {
    try {
        const asr = config.demoMode ? demoAsr : primaryAsr;
        const result = await asr.transcribe(req.body.audioData, req.body.language || 'hi');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/ocrController.ts', """import { Request, Response } from 'express';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { MockOCR } from '../services/ocr/MockOCR';
import { v4 as uuidv4 } from 'uuid';

const ocr = new MockOCR();

export const processDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const { sessionId, documentType } = req.body;
        
        const docId = uuidv4();
        await DocumentRepository.create({
            id: docId,
            sessionId,
            fileName: req.file.originalname,
            filePath: req.file.path,
            documentType: documentType || 'other',
            status: 'processing',
            createdAt: new Date()
        });

        const result = await ocr.processDocument(req.file.path, documentType);
        
        const updated = await DocumentRepository.update(docId, {
            extractedText: result.extractedText,
            extractedFields: result.fields,
            confidence: result.confidence,
            status: 'processed'
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getDocument = async (req: Request, res: Response) => {
    try {
        const doc = await DocumentRepository.findById(req.params.id);
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getSessionDocuments = async (req: Request, res: Response) => {
    try {
        const docs = await DocumentRepository.findBy({ sessionId: req.params.sessionId });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/summaryController.ts', """import { Request, Response } from 'express';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { SummaryService } from '../services/ai/SummaryService';
import { v4 as uuidv4 } from 'uuid';

const summaryService = new SummaryService();

export const generateSummary = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;
        const messages = await ConversationRepository.findBy({ sessionId });
        
        const draft = await summaryService.generateSummary(messages);
        
        let history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        if (history) {
            history = await ClinicalHistoryRepository.update(history.id, { draft, updatedAt: new Date() }) as any;
        } else {
            history = await ClinicalHistoryRepository.create({
                id: uuidv4(),
                sessionId,
                draft,
                approvalStatus: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        await SessionRepository.update(sessionId, { status: 'summary_generated', updatedAt: new Date() });
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getSummary = async (req: Request, res: Response) => {
    try {
        const history = await ClinicalHistoryRepository.findBy({ sessionId: req.params.sessionId });
        res.json(history[0] || null);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/physicianController.ts', """import { Request, Response } from 'express';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { PatientRepository } from '../repositories/PatientRepository';

export const getHistory = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        if (!history) return res.status(404).json({ error: 'Not found' });
        
        const session = await SessionRepository.findById(sessionId);
        const patient = session ? await PatientRepository.findById(session.patientId) : null;
        
        res.json({ history, session, patient });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateHistory = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        if (!history) return res.status(404).json({ error: 'Not found' });
        
        const updated = await ClinicalHistoryRepository.update(history.id, {
            physicianEdits: { ...(history.physicianEdits || {}), ...req.body },
            updatedAt: new Date()
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const approveHistory = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        if (!history) return res.status(404).json({ error: 'Not found' });
        
        const updated = await ClinicalHistoryRepository.update(history.id, {
            approvalStatus: 'approved',
            approvedAt: new Date(),
            updatedAt: new Date()
        });
        await SessionRepository.update(sessionId, { status: 'approved', updatedAt: new Date() });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const rejectHistory = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        if (!history) return res.status(404).json({ error: 'Not found' });
        
        const updated = await ClinicalHistoryRepository.update(history.id, {
            approvalStatus: 'rejected',
            updatedAt: new Date()
        });
        await SessionRepository.update(sessionId, { status: 'rejected', updatedAt: new Date() });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const sendBack = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        if (!history) return res.status(404).json({ error: 'Not found' });
        
        const updated = await ClinicalHistoryRepository.update(history.id, {
            approvalStatus: 'sent_back',
            updatedAt: new Date()
        });
        await SessionRepository.update(sessionId, { status: 'sent_back', updatedAt: new Date() });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/fhirController.ts', """import { Request, Response } from 'express';
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
        const history = await ClinicalHistoryRepository.findBy({ sessionId }).then(h => h[0]);
        
        if (!patient || !history) return res.status(404).json({ error: 'Data incomplete' });
        
        const bundle = fhirService.generateBundle(patient, history, session);
        res.json(bundle);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/controllers/ayushController.ts', """import { Request, Response } from 'express';
import { AyushService } from '../services/ayush/AyushService';

const ayushService = new AyushService();

export const createAyushRecord = async (req: Request, res: Response) => {
    try {
        const record = await ayushService.createRecord(req.body.sessionId, req.body);
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getAyushRecord = async (req: Request, res: Response) => {
    try {
        const record = await ayushService.getRecord(req.params.sessionId);
        if (!record) return res.status(404).json({ error: 'Not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateAyushRecord = async (req: Request, res: Response) => {
    try {
        const record = await ayushService.updateRecord(req.params.sessionId, req.body);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};""")

write_file('src/routes/sessionRoutes.ts', """import { Router } from 'express';
import { createSession, getSession, listSessions, recordConsent, updateSession } from '../controllers/sessionController';

const router = Router();
router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/:id/consent', recordConsent);
router.put('/:id', updateSession);

export default router;""")

write_file('src/routes/conversationRoutes.ts', """import { Router } from 'express';
import { addMessage, getConversation, getNextQuestion } from '../controllers/conversationController';

const router = Router();
router.post('/message', addMessage);
router.get('/:sessionId', getConversation);
router.post('/next-question', getNextQuestion);

export default router;""")

write_file('src/routes/asrRoutes.ts', """import { Router } from 'express';
import { transcribe } from '../controllers/asrController';

const router = Router();
router.post('/transcribe', transcribe);

export default router;""")

write_file('src/routes/ocrRoutes.ts', """import { Router } from 'express';
import { processDocument, getDocument, getSessionDocuments } from '../controllers/ocrController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/process', upload.single('document'), processDocument);
router.get('/document/:id', getDocument);
router.get('/session/:sessionId', getSessionDocuments);

export default router;""")

write_file('src/routes/summaryRoutes.ts', """import { Router } from 'express';
import { generateSummary, getSummary } from '../controllers/summaryController';

const router = Router();
router.post('/generate', generateSummary);
router.get('/:sessionId', getSummary);

export default router;""")

write_file('src/routes/physicianRoutes.ts', """import { Router } from 'express';
import { getHistory, updateHistory, approveHistory, rejectHistory, sendBack } from '../controllers/physicianController';

const router = Router();
router.get('/:sessionId', getHistory);
router.put('/:sessionId', updateHistory);
router.post('/:sessionId/approve', approveHistory);
router.post('/:sessionId/reject', rejectHistory);
router.post('/:sessionId/send-back', sendBack);

export default router;""")

write_file('src/routes/fhirRoutes.ts', """import { Router } from 'express';
import { getFHIRBundle } from '../controllers/fhirController';

const router = Router();
router.get('/:sessionId', getFHIRBundle);

export default router;""")

write_file('src/routes/ayushRoutes.ts', """import { Router } from 'express';
import { createAyushRecord, getAyushRecord, updateAyushRecord } from '../controllers/ayushController';

const router = Router();
router.post('/', createAyushRecord);
router.get('/:sessionId', getAyushRecord);
router.put('/:sessionId', updateAyushRecord);

export default router;""")

write_file('src/routes/index.ts', """import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import conversationRoutes from './conversationRoutes';
import asrRoutes from './asrRoutes';
import ocrRoutes from './ocrRoutes';
import summaryRoutes from './summaryRoutes';
import physicianRoutes from './physicianRoutes';
import fhirRoutes from './fhirRoutes';
import ayushRoutes from './ayushRoutes';
import { config } from '../config/env';
import { isMongoConnected } from '../config/database';
import { isRedisConnected } from '../config/redis';

const router = Router();

router.use('/sessions', sessionRoutes);
router.use('/conversation', conversationRoutes);
router.use('/asr', asrRoutes);
router.use('/ocr', ocrRoutes);
router.use('/summary', summaryRoutes);
router.use('/physician', physicianRoutes);
router.use('/fhir', fhirRoutes);
router.use('/ayush', ayushRoutes);

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        demoMode: config.demoMode,
        mongoConnected: isMongoConnected,
        redisConnected: isRedisConnected
    });
});

export default router;""")

write_file('src/seed/demoData.ts', """import { PatientRepository } from '../repositories/PatientRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { v4 as uuidv4 } from 'uuid';

export const seedDemoData = async () => {
    try {
        const existing = await PatientRepository.findById('PAT-DEMO-001');
        if (existing) {
            console.log('Demo data already exists.');
            return;
        }

        await PatientRepository.create({
            id: 'PAT-DEMO-001',
            name: 'Demo Patient',
            age: 42,
            gender: 'male',
            language: 'Hindi',
            abhaStatus: 'no_abha',
            createdAt: new Date()
        });

        await SessionRepository.create({
            id: 'MK-DEMO-001',
            patientId: 'PAT-DEMO-001',
            consent: { given: true, timestamp: new Date() },
            inputMode: 'voice',
            language: 'Hindi',
            status: 'summary_generated',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const messages = [
            { role: 'ai', message: 'Namaste. Aapko sabse zyada kis problem ki wajah se doctor se milna hai?' },
            { role: 'patient', message: 'Mujhe pichhle teen din se bukhar hai.' },
            { role: 'ai', message: 'Bukhar kab se hai?' },
            { role: 'patient', message: 'Teen din se.' },
            { role: 'ai', message: 'Kya aap koi medicine le rahe hain?' },
            { role: 'patient', message: 'Nahi.' },
            { role: 'ai', message: 'Kya aapko koi aur problem ho rahi hai?' },
            { role: 'patient', message: 'Weakness feel ho rahi hai.' }
        ];

        for (const msg of messages) {
            await ConversationRepository.create({
                id: uuidv4(),
                sessionId: 'MK-DEMO-001',
                role: msg.role as 'ai' | 'patient',
                message: msg.message,
                timestamp: new Date()
            });
        }

        await ClinicalHistoryRepository.create({
            id: uuidv4(),
            sessionId: 'MK-DEMO-001',
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

        console.log('Demo data seeded successfully.');
    } catch (error) {
        console.error('Failed to seed demo data:', error);
    }
};""")

write_file('src/server.ts', """import { config } from './config/env';
import { connectDB, isMongoConnected } from './config/database';
import { connectRedis, isRedisConnected } from './config/redis';
import routes from './routes';
import { seedDemoData } from './seed/demoData';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Root .env

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(config.uploadDir));

app.use('/api/v1', routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const startServer = async () => {
    await connectDB();
    await connectRedis();

    if (!fs.existsSync(config.uploadDir)) {
        fs.mkdirSync(config.uploadDir, { recursive: true });
    }

    if (config.demoMode) {
        await seedDemoData();
    }

    app.listen(config.port, () => {
        console.log(`=================================`);
        console.log(`Server started on port ${config.port}`);
        console.log(`MongoDB Connected: ${isMongoConnected}`);
        console.log(`Redis Connected: ${isRedisConnected}`);
        console.log(`Demo Mode: ${config.demoMode}`);
        console.log(`=================================`);
    });
};

startServer();""")
