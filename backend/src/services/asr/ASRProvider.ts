export interface IASRProvider {
  transcribe(audioBuffer: Buffer, language: string): Promise<{ text: string; confidence: number; }>;
}
