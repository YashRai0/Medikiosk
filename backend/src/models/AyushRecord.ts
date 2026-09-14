import mongoose from 'mongoose';

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
