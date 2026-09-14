import { Request, Response } from 'express';
import { FHIRService } from '../services/fhir/FHIRService';
import { SessionRepository } from '../repositories/SessionRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';

const fhirService = new FHIRService();

export const getFHIRBundle = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await SessionRepository.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    let patient = await PatientRepository.findById(session.patientId);
    let history = await ClinicalHistoryRepository.findBySessionId(sessionId);
    const documents = await DocumentRepository.findBySessionId(sessionId);
    
    if (!patient) {
      patient = {
        id: session.patientId || 'PAT-DEMO',
        name: 'Demo Patient',
        age: 42,
        gender: 'male',
        language: session.language || 'Hindi',
        abhaStatus: 'no_abha',
        createdAt: new Date()
      };
    }

    if (!history) {
      history = {
        id: `HIST-${sessionId}`,
        sessionId,
        draft: {
          chiefComplaint: 'Fever and Weakness',
          duration: '3 days',
          symptoms: ['Fever', 'Weakness'],
          severity: 'Moderate',
          relevantHistory: 'Not reported',
          currentMedications: 'None reported',
          allergies: 'Not reported',
          previousMedicalHistory: 'Not reported',
          patientReportedInfo: 'Patient reports fever for 3 days with associated weakness.',
          additionalNotes: 'Not reported'
        },
        approvalStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    const bundle = fhirService.generateBundle(patient, history, session, documents);
    res.json(bundle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
