import { IASRProvider } from './ASRProvider';

export class DemoASR implements IASRProvider {
  async transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      text: "Mujhe 3 din se bukhar aur kamzori lag rahi hai.",
      confidence: 0.95
    };
  }
}
