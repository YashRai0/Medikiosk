import { IASRProvider } from './ASRProvider';

export class PrimaryASR implements IASRProvider {
  async transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }> {
    return { text: "Real API transcription", confidence: 0.9 };
  }
}
