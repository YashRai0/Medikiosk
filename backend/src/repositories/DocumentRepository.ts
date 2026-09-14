import { DocumentModel, IDocument } from '../models/Document';
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
