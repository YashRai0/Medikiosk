import { Request, Response } from 'express';
import { AyushRecordRepository } from '../repositories/AyushRecordRepository';
import { AyushService } from '../services/ayush/AyushService';
import { v4 as uuidv4 } from 'uuid';

const ayushService = new AyushService();

export const createAyushRecord = async (req: Request, res: Response) => {
  try {
    const { sessionId, data } = req.body;
    const processed = await ayushService.processAssessment(data);
    const record = await AyushRecordRepository.create({
      id: uuidv4(),
      sessionId,
      dashavidha: processed,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAyushRecord = async (req: Request, res: Response) => {
  try {
    const record = await AyushRecordRepository.findBySessionId(req.params.sessionId);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAyushRecord = async (req: Request, res: Response) => {
  try {
    const record = await AyushRecordRepository.update(req.params.sessionId, req.body);
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
