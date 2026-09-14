import { Request, Response } from 'express';
import { getOCRProvider } from '../services/ocr/OCRProvider';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { v4 as uuidv4 } from 'uuid';

export const processDocument = async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId || 'MK-DEMO-001';
    let fileName = 'Prescription_DrSharma.jpg';
    let filePath = 'sample_prescription.jpg';

    if (req.file) {
      fileName = req.file.originalname;
      filePath = req.file.path;
    }

    const ocrProvider = getOCRProvider();
    const result = await ocrProvider.processDocument(filePath);
    
    const doc = await DocumentRepository.create({
      id: uuidv4(),
      sessionId,
      fileName,
      filePath,
      documentType: req.body.documentType || 'prescription',
      extractedText: result.extractedText,
      extractedFields: result.fields,
      confidence: result.confidence,
      status: 'processed',
      createdAt: new Date()
    });

    if (sessionId) {
      await SessionRepository.update(sessionId, { status: 'documents_uploaded' });
    }
    
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentRepository.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessionDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await DocumentRepository.findBySessionId(req.params.sessionId);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
