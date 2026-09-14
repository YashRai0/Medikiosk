import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/medikiosk',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  demoMode: process.env.DEMO_MODE === 'true',
  aiApiKey: process.env.AI_API_KEY || '',
  asrApiKey: process.env.ASR_API_KEY || '',
  ocrApiKey: process.env.OCR_API_KEY || '',
  bhashiniApiKey: process.env.BHASHINI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
};
