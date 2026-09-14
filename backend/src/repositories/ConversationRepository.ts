import { ConversationModel, IConversation } from '../models/Conversation';
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
