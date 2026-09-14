import { config } from '../../config/env';

export interface OCRResult {
  extractedText: string;
  fields: Record<string, any>;
  confidence: number;
  provider: string;
}

export interface IOCRProvider {
  processDocument(filePath: string): Promise<OCRResult>;
}

export class DemoOCR implements IOCRProvider {
  async processDocument(filePath: string): Promise<OCRResult> {
    // Simulated realistic OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 700));

    return {
      extractedText: "Dr. Sharma Medical Clinic\nDate: 10/09/2026\nPatient: Demo Patient\n\nRx\n1. Tab Paracetamol 500mg - TDS x 3 days\n2. Tab Cetirizine 10mg - OD x 5 days\n\nDiagnosis: Viral Fever\nFollow-up: After 3 days",
      fields: {
        "Document Type": "Prescription",
        "Doctor Name": "Dr. Sharma",
        "Clinic Name": "Dr. Sharma Medical Clinic",
        "Date": "10/09/2026",
        "Medications": [
          "Tab Paracetamol 500mg - TDS x 3 days",
          "Tab Cetirizine 10mg - OD x 5 days"
        ],
        "Diagnosis mentioned in source document": "Viral Fever",
        "Follow-up": "After 3 days"
      },
      confidence: 0.78,
      provider: "DemoOCR (Simulation)"
    };
  }
}

export class RealOCR implements IOCRProvider {
  async processDocument(filePath: string): Promise<OCRResult> {
    console.warn('RealOCR: Tesseract / Cloud OCR engine not configured in local environment. Gracefully falling back to DemoOCR.');
    const demo = new DemoOCR();
    const res = await demo.processDocument(filePath);
    res.provider = "DemoOCR (Fallback)";
    return res;
  }
}

export function getOCRProvider(): IOCRProvider {
  if (config.demoMode || !config.ocrApiKey) {
    return new DemoOCR();
  }
  return new RealOCR();
}
