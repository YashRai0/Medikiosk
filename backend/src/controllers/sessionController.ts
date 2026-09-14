import { Request, Response } from 'express';
import { SessionRepository } from '../repositories/SessionRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      age, 
      gender, 
      language = 'Hindi', 
      abhaStatus = 'no_abha', 
      abhaId,
      inputMode = 'both',
      consent
    } = req.body;

    // Strict Backend Consent Enforcement (SIH P0 Requirement #13)
    if (!consent || consent.given !== true) {
      return res.status(400).json({
        code: 'CONSENT_REQUIRED',
        error: 'CONSENT_REQUIRED',
        message: 'Patient consent is mandatory before initiating clinical case-taking.'
      });
    }

    // Input Validation
    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : 'Demo Patient';
    const parsedAge = typeof age === 'number' ? age : parseInt(age, 10);
    const cleanAge = (!isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 120) ? parsedAge : 42;
    const cleanGender = ['male', 'female', 'other'].includes(gender) ? gender : 'male';
    const cleanLang = typeof language === 'string' && language.trim() ? language.trim() : 'Hindi';

    let patientId = req.body.patientId;
    let patient = null;

    if (!patientId) {
      patientId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
      patient = await PatientRepository.create({
        id: patientId,
        name: cleanName,
        age: cleanAge,
        gender: cleanGender as any,
        language: cleanLang,
        abhaStatus: (abhaStatus === 'has_abha' ? 'has_abha' : 'no_abha'),
        abhaId: abhaId ? String(abhaId).slice(0, 50) : undefined,
        createdAt: new Date()
      });
    } else {
      patient = await PatientRepository.findById(patientId);
    }

    const sessionId = req.body.sessionId || `MK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const session = await SessionRepository.create({
      id: sessionId,
      patientId,
      consent: {
        given: true,
        timestamp: consent.timestamp ? new Date(consent.timestamp) : new Date()
      },
      inputMode: (['voice', 'touch', 'both'].includes(inputMode) ? inputMode : 'both') as any,
      language: cleanLang,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create initial clinical history draft placeholder
    const existingHistory = await ClinicalHistoryRepository.findBySessionId(sessionId);
    if (!existingHistory) {
      await ClinicalHistoryRepository.create({
        id: uuidv4(),
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
          patientReportedInfo: 'Patient reports fever for 3 days with associated weakness. No prior medication reported.',
          additionalNotes: 'Not reported'
        },
        approvalStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.status(201).json({ session, patient });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await SessionRepository.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const patient = await PatientRepository.findById(session.patientId);
    const clinicalHistory = await ClinicalHistoryRepository.findBySessionId(session.id);
    const documents = await DocumentRepository.findBySessionId(session.id);

    res.json({ session, patient, clinicalHistory, documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const recordConsent = async (req: Request, res: Response) => {
  try {
    const { timestamp } = req.body;
    const session = await SessionRepository.update(req.params.id, {
      consent: { given: true, timestamp: timestamp ? new Date(timestamp) : new Date() },
      status: 'consent_given'
    });
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await SessionRepository.findAll();
    
    const enriched = await Promise.all(sessions.map(async (s) => {
      const patient = await PatientRepository.findById(s.patientId);
      const clinicalHistory = await ClinicalHistoryRepository.findBySessionId(s.id);
      return {
        ...s,
        patientName: patient ? patient.name : 'Demo Patient',
        patientAge: patient ? patient.age : 42,
        patientGender: patient ? patient.gender : 'male',
        language: patient ? patient.language : s.language,
        approvalStatus: clinicalHistory ? clinicalHistory.approvalStatus : 'pending'
      };
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const session = await SessionRepository.update(req.params.id, req.body);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
