import { Request, Response } from 'express';
import { SummaryService } from '../services/ai/SummaryService';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { v4 as uuidv4 } from 'uuid';

const summaryService = new SummaryService();

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { sessionId, touchData, messages } = req.body;
    
    // Retrieve conversation if not provided in payload
    let conversationMessages = messages;
    if (!conversationMessages && sessionId) {
      conversationMessages = await ConversationRepository.findBySessionId(sessionId);
    }

    // Build structured history draft
    let draft;
    if (touchData) {
      draft = {
        chiefComplaint: touchData.complaint || 'Fever',
        duration: touchData.duration || '2-3 days',
        symptoms: [touchData.complaint || 'Fever', touchData.secondary || 'Weakness'].filter(Boolean),
        severity: touchData.severity || 'Moderate',
        relevantHistory: touchData.relevantHistory || 'Not reported',
        currentMedications: touchData.medications === 'Yes' ? (touchData.medicationNames || 'Reported') : 'None reported',
        allergies: touchData.allergies === 'Yes' ? (touchData.allergyDetails || 'Reported') : 'Not reported',
        previousMedicalHistory: 'Not reported',
        patientReportedInfo: `Touch questionnaire responses: ${touchData.complaint || 'Fever'} for ${touchData.duration || '2-3 days'}, severity: ${touchData.severity || 'Moderate'}.`,
        additionalNotes: 'Not reported'
      };
    } else {
      // Rule-based / LLM extraction from conversation
      draft = await summaryService.generateSummary({ conversationMessages, sessionId });
    }

    // Check if clinical history already exists for this session
    let history = await ClinicalHistoryRepository.findBySessionId(sessionId);
    if (history) {
      history = await ClinicalHistoryRepository.updateBySessionId(sessionId, {
        draft,
        updatedAt: new Date()
      });
    } else {
      history = await ClinicalHistoryRepository.create({
        id: uuidv4(),
        sessionId,
        draft,
        approvalStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (sessionId) {
      await SessionRepository.update(sessionId, { status: 'summary_generated' });
    }
    
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const history = await ClinicalHistoryRepository.findBySessionId(req.params.sessionId);
    if (!history) return res.status(404).json({ error: 'Not found' });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
