export class FHIRService {
  generateBundle(patient: any, clinicalHistory: any, session: any, documents: any[] = []) {
    const patientBirthYear = new Date().getFullYear() - (patient.age || 42);
    const isApproved = clinicalHistory.approvalStatus === 'approved';

    const chiefComplaint = clinicalHistory.draft?.chiefComplaint || 'Fever';
    const duration = clinicalHistory.draft?.duration || '3 days';
    const severity = clinicalHistory.draft?.severity || 'Moderate';
    const medications = clinicalHistory.draft?.currentMedications || 'None reported';
    const allergies = clinicalHistory.draft?.allergies || 'Not reported';
    const symptoms = clinicalHistory.draft?.symptoms || ['Fever', 'Weakness'];

    const entries: any[] = [
      // 1. Composition Resource (Document Header)
      {
        fullUrl: `urn:uuid:${session.id}-comp`,
        resource: {
          resourceType: "Composition",
          id: `${session.id}-comp`,
          status: isApproved ? "final" : "preliminary",
          type: {
            coding: [{
              system: "http://loinc.org",
              code: "34117-2",
              display: "History and physical note"
            }],
            text: "Pre-Consultation Clinical Case-Taking Record"
          },
          subject: {
            reference: `urn:uuid:${patient.id}`,
            display: patient.name
          },
          date: new Date().toISOString(),
          author: [{
            display: isApproved ? (clinicalHistory.approvedBy || "Consultant Physician") : "MediKiosk Assistive Intake System"
          }],
          title: "MediKiosk OPD Case-Taking Record (SIH26047)"
        }
      },
      // 2. Patient Resource
      {
        fullUrl: `urn:uuid:${patient.id}`,
        resource: {
          resourceType: "Patient",
          id: patient.id,
          identifier: [
            {
              system: "https://healthid.ndhm.gov.in",
              value: patient.abhaId || `MK-TEMP-${patient.id}`,
              type: {
                coding: [{
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: patient.abhaId ? "MR" : "TEMP",
                  display: patient.abhaId ? "ABHA ID" : "Temporary Kiosk Identifier"
                }]
              }
            }
          ],
          name: [{
            use: "official",
            text: patient.name
          }],
          gender: patient.gender,
          birthDate: `${patientBirthYear}-01-01`,
          communication: [{
            language: {
              coding: [{
                system: "urn:ietf:bcp:47",
                code: patient.language === 'Hindi' ? 'hi' : 'en',
                display: patient.language
              }]
            }
          }]
        }
      },
      // 3. Encounter Resource
      {
        fullUrl: `urn:uuid:${session.id}`,
        resource: {
          resourceType: "Encounter",
          id: session.id,
          status: isApproved ? "finished" : "in-progress",
          class: {
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: "AMB",
            display: "Ambulatory OPD"
          },
          subject: {
            reference: `urn:uuid:${patient.id}`,
            display: patient.name
          },
          period: {
            start: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString()
          }
        }
      },
      // 4. Condition Resource (Semantically preserved as Patient-Reported Complaint vs Physician-Confirmed Finding)
      {
        fullUrl: `urn:uuid:${clinicalHistory.id || session.id}-cond`,
        resource: {
          resourceType: "Condition",
          id: `${clinicalHistory.id || session.id}-cond`,
          clinicalStatus: {
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active"
            }]
          },
          verificationStatus: {
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
              code: isApproved ? "confirmed" : "provisional",
              display: isApproved ? "Physician-Confirmed Finding" : "Patient-Reported Complaint (AI Assistive Draft)"
            }]
          },
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/condition-category",
              code: "problem-list-item",
              display: "Patient-Reported Chief Complaint"
            }]
          }],
          severity: {
            text: severity
          },
          code: {
            text: chiefComplaint
          },
          subject: {
            reference: `urn:uuid:${patient.id}`
          },
          note: [{
            text: `Reported Duration: ${duration}. ${clinicalHistory.draft?.patientReportedInfo || ''}`
          }]
        }
      },
      // 5. Observations for Symptoms
      ...symptoms.map((symptom: string, idx: number) => ({
        fullUrl: `urn:uuid:${session.id}-sym-${idx}`,
        resource: {
          resourceType: "Observation",
          id: `${session.id}-sym-${idx}`,
          status: isApproved ? "final" : "preliminary",
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "exam",
              display: "Patient Reported Symptom"
            }]
          }],
          code: {
            text: symptom
          },
          subject: {
            reference: `urn:uuid:${patient.id}`
          },
          valueString: "Present"
        }
      })),
      // 6. Medication Statement
      {
        fullUrl: `urn:uuid:${session.id}-med`,
        resource: {
          resourceType: "MedicationStatement",
          id: `${session.id}-med`,
          status: "active",
          subject: {
            reference: `urn:uuid:${patient.id}`
          },
          note: [{
            text: `Current Medications Reported: ${medications}`
          }]
        }
      },
      // 7. Allergy Intolerance
      {
        fullUrl: `urn:uuid:${session.id}-all`,
        resource: {
          resourceType: "AllergyIntolerance",
          id: `${session.id}-all`,
          clinicalStatus: {
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              code: "active"
            }]
          },
          patient: {
            reference: `urn:uuid:${patient.id}`
          },
          note: [{
            text: `Allergies: ${allergies}`
          }]
        }
      }
    ];

    // Add Document References if attached
    if (documents && documents.length > 0) {
      documents.forEach((doc, idx) => {
        entries.push({
          fullUrl: `urn:uuid:${doc.id || session.id + '-doc-' + idx}`,
          resource: {
            resourceType: "DocumentReference",
            id: doc.id || `${session.id}-doc-${idx}`,
            status: "current",
            type: {
              text: doc.documentType || "Medical Prescription"
            },
            subject: {
              reference: `urn:uuid:${patient.id}`
            },
            description: `Digitized OCR Document (${doc.fileName || 'Prescription'})`,
            content: [{
              attachment: {
                contentType: "text/plain",
                data: Buffer.from(doc.extractedText || '').toString('base64'),
                title: doc.fileName || 'Extracted Prescription OCR'
              }
            }]
          }
        });
      });
    }

    return {
      resourceType: "Bundle",
      id: `bundle-${session.id}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
      },
      identifier: {
        system: "https://medikiosk.gov.in/bundles",
        value: `MK-BUNDLE-${session.id}`
      },
      type: "document",
      timestamp: new Date().toISOString(),
      total: entries.length,
      entry: entries
    };
  }
}
