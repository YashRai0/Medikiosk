import mongoose from 'mongoose';

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
