import { SessionModel, ISession } from '../models/Session';
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
