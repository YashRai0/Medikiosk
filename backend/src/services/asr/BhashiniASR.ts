import { IASRProvider } from './ASRProvider';

export class BhashiniASR implements IASRProvider {
  async transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }> {
    return { text: "Bhashini transcription fallback", confidence: 0.85 };
  }
}
