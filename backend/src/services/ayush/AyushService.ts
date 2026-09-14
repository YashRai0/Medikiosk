import { config } from '../../config/env';

export class AyushService {
  async processAssessment(data: any) {
    if (config.demoMode) {
      return {
        prakriti: "Vata-Pitta",
        vikriti: "Kapha",
        sara: "Madhyama",
        samhanana: "Madhyama",
        pramana: "Sama",
        satmya: "Vyami",
        satva: "Avara",
        aharaShakti: "Pravara",
        vyayamaShakti: "Madhyama",
        vaya: "Madhyama"
      };
    }
    return data;
  }
}
