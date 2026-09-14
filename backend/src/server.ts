import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import { connectDB, isMongoConnected } from './config/database';
import { connectRedis, isRedisConnected } from './config/redis';
import routes from './routes';
import { seedDemoData } from './seed/demoData';

const app = express();

app.use(helmet());
// Allow configured clientUrl, comma-separated origins, or all origins in demo mode
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.clientUrl === '*' || config.demoMode) {
      return callback(null, true);
    }
    const allowedOrigins = config.clientUrl.split(',').map(s => s.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for SIH cloud demos
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

app.use('/api/v1', routes);

const startServer = async () => {
  await connectDB();
  connectRedis();

  if (config.demoMode) {
    await seedDemoData();
  }

  app.listen(config.port, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📊 MongoDB connected: ${isMongoConnected}`);
    console.log(`🗄️ Redis connected: ${isRedisConnected}`);
    console.log(`🧪 Demo Mode: ${config.demoMode}`);
    console.log(`=================================`);
  });
};

startServer();
