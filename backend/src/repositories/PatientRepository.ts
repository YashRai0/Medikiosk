import { PatientModel, IPatient } from '../models/Patient';
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
