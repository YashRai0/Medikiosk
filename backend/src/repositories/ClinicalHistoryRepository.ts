import { ClinicalHistoryModel, IClinicalHistory } from '../models/ClinicalHistory';
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
  },
  async updateBySessionId(sessionId: string, data: Partial<IClinicalHistory>): Promise<IClinicalHistory | null> {
    if (isMongoConnected) return ClinicalHistoryModel.findOneAndUpdate({ sessionId }, data, { new: true }).lean();
    const records = await inMemoryStore.find({ sessionId });
    if (!records || records.length === 0) return null;
    return inMemoryStore.update(records[0].id, data);
  }
};
