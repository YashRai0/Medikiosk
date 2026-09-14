import mongoose from 'mongoose';
import { config } from './env';

export let isMongoConnected = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 1500,
    } as mongoose.ConnectOptions);
    isMongoConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.warn('MongoDB connection failed/offline. Using resilient in-memory fallback.');
    isMongoConnected = false;
  }
};
