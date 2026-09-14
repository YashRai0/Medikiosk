import mongoose from 'mongoose';

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
