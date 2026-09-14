import { PatientRepository } from '../repositories/PatientRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ClinicalHistoryRepository } from '../repositories/ClinicalHistoryRepository';
import { v4 as uuidv4 } from 'uuid';

export const seedDemoData = async () => {
  try {
    const patientId = 'PAT-DEMO-1';
    
    const existing = await PatientRepository.findById(patientId);
    if (existing) return; // already seeded

    await PatientRepository.create({
      id: patientId,
      name: 'Demo Patient',
      age: 42,
      gender: 'male',
      language: 'Hindi',
      abhaStatus: 'no_abha',
      createdAt: new Date()
    });

    const sessionId = 'MK-DEMO-001';
    await SessionRepository.create({
      id: sessionId,
      patientId,
      consent: { given: true, timestamp: new Date() },
      inputMode: 'voice',
      language: 'Hindi',
      status: 'history_complete',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const messages = [
      { role: 'ai', message: 'Hello! How can I help you today?' },
      { role: 'patient', message: 'I have had a fever and weakness for 3 days.' },
      { role: 'ai', message: 'Are you taking any medications for the fever?' },
      { role: 'patient', message: 'No, I have not taken any medication.' }
    ];

    for (const msg of messages) {
      await ConversationRepository.create({
        id: uuidv4(),
        sessionId,
        role: msg.role as any,
        message: msg.message,
        timestamp: new Date()
      });
    }

    await ClinicalHistoryRepository.create({
      id: uuidv4(),
      sessionId,
      draft: {
        chiefComplaint: 'Fever',
        duration: '3 days',
        symptoms: ['Fever', 'Weakness'],
        severity: 'Not reported',
        relevantHistory: 'Not reported',
        currentMedications: 'None reported',
        allergies: 'Not reported',
        previousMedicalHistory: 'Not reported',
        patientReportedInfo: 'Patient reports fever for 3 days with associated weakness. No current medications.',
        additionalNotes: 'Not reported'
      },
      approvalStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Demo data seeded successfully!');
  } catch (err) {
    console.error('Error seeding demo data', err);
  }
};
