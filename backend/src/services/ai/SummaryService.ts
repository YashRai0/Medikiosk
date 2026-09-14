import { ClinicalDraft } from './LLMProvider';
import { getSummaryProvider } from './SummaryProvider';

export class SummaryService {
  async generateSummary(data: any): Promise<ClinicalDraft> {
    const provider = getSummaryProvider();
    return provider.generateSummary(data);
  }
}
