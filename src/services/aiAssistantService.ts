import { ExtractedAIResponse } from '../types/aiAssistant';
import { OpportunitiesService } from './opportunitiesService';
import { detectDuplicates } from './duplicateDetection';
import { DuplicateMatch, Opportunity } from '../types/database';

export const AIAssistantService = {
  async extractSource(sourceUrl: string, textContent: string): Promise<ExtractedAIResponse> {
    const response = await fetch('/api/ai/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sourceUrl, textContent })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to extract content from source announcement');
    }

    return await response.json();
  },

  async checkForDuplicates(extracted: ExtractedAIResponse): Promise<DuplicateMatch[]> {
    if (extracted.detectedType === 'opportunity' && extracted.opportunityData) {
      const allOpps = await OpportunitiesService.getAll({ includeUnpublished: true });
      const candidate: Partial<Opportunity> = {
        title: extracted.opportunityData.title,
        organizationName: extracted.opportunityData.organizationName,
        applicationUrl: extracted.opportunityData.applicationUrl,
        deadline: extracted.opportunityData.deadline
      };
      return detectDuplicates(candidate, allOpps);
    }
    return [];
  }
};
