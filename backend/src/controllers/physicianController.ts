import { Request, Response } from 'express';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const history = await ClinicalHistoryRepository.findBySessionId(sessionId);
    const session = await SessionRepository.findById(sessionId);
    let patient = null;
    if (session) {
      patient = await PatientRepository.findById(session.patientId);
    }
    const documents = await DocumentRepository.findBySessionId(sessionId);

    if (!history && !session) {
      return res.status(404).json({ error: 'Session record not found' });
    }

    res.json({
      clinicalHistory: history,
      session,
      patient,
      documents
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const existing = await ClinicalHistoryRepository.findBySessionId(sessionId);
    
    if (!existing) {
      return res.status(404).json({ error: 'Clinical history not found for session' });
    }

    const updatedDraft = {
      ...existing.draft,
      ...(req.body.draft || req.body)
    };

    const physicianEdits = {
      ...(existing.physicianEdits || {}),
      ...(req.body.physicianEdits || req.body),
      editedAt: new Date()
    };

    const updated = await ClinicalHistoryRepository.updateBySessionId(sessionId, {
      draft: updatedDraft,
      physicianEdits,
      updatedAt: new Date()
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const doctorId = req.body.doctorId || 'Dr. Sharma (Consultant Physician)';

    const history = await ClinicalHistoryRepository.updateBySessionId(sessionId, {
      approvalStatus: 'approved',
      approvedBy: doctorId,
      approvedAt: new Date(),
      updatedAt: new Date()
    });

    await SessionRepository.update(sessionId, {
      status: 'approved',
      updatedAt: new Date()
    });

    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const history = await ClinicalHistoryRepository.updateBySessionId(sessionId, {
      approvalStatus: 'rejected',
      updatedAt: new Date()
    });
    await SessionRepository.update(sessionId, {
      status: 'rejected',
      updatedAt: new Date()
    });
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendBack = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const history = await ClinicalHistoryRepository.updateBySessionId(sessionId, {
      approvalStatus: 'sent_back',
      updatedAt: new Date()
    });
    await SessionRepository.update(sessionId, {
      status: 'sent_back',
      updatedAt: new Date()
    });
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
