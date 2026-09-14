import { AyushRecordModel, IAyushRecord } from '../models/AyushRecord';
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
