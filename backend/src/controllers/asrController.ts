import { Request, Response } from 'express';
import { DemoASR } from '../services/asr/DemoASR';

const asrProvider = new DemoASR(); // Demo by default

export const transcribe = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file required' });
    const result = await asrProvider.transcribe(req.file.buffer, req.body.language || 'en');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
