import { IOCRProvider, OCRResult } from './OCRProvider';

export class MockOCR implements IOCRProvider {
  async processDocument(filePath: string): Promise<OCRResult> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      extractedText: "Dr. Sharma Medical Clinic\nDate: 10/09/2026\nRx\n1. Tab Paracetamol 500mg - TDS x 3 days\n2. Tab Cetirizine 10mg - OD x 5 days\nDiagnosis: Viral Fever\nFollow-up: After 3 days",
      fields: {
        doctorName: "Dr. Sharma",
        date: "10/09/2026",
        medications: ["Tab Paracetamol 500mg - TDS x 3 days", "Tab Cetirizine 10mg - OD x 5 days"],
        diagnosis: "Viral Fever",
        followUp: "After 3 days"
      },
      confidence: 0.78,
      provider: "MockOCR"
    };
  }
}
