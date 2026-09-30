import { Opportunity, DuplicateMatch } from '../types/database';

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function getTokens(text: string): Set<string> {
  const words = normalizeText(text).split(/\s+/).filter(w => w.length > 2);
  return new Set(words);
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  setA.forEach(token => {
    if (setB.has(token)) intersectionCount++;
  });
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

function normalizeUrl(url?: string): string {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
}

/**
 * Checks if target opportunity is a likely duplicate of any existing opportunities
 */
export function detectDuplicates(
  candidate: Partial<Opportunity>,
  existingOpportunities: Opportunity[],
  currentIdToExclude?: string
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  const candidateTitleTokens = getTokens(candidate.title || '');
  const candidateUrl = normalizeUrl(candidate.applicationUrl);
  const candidateOrg = normalizeText(candidate.organizationName || '');
  const candidateDeadline = candidate.deadline ? new Date(candidate.deadline).getTime() : null;

  for (const existing of existingOpportunities) {
    if (currentIdToExclude && existing.id === currentIdToExclude) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Same Application URL (Highest confidence signal)
    const existingUrl = normalizeUrl(existing.applicationUrl);
    if (candidateUrl && existingUrl && candidateUrl === existingUrl) {
      score += 55;
      reasons.push('Identical application URL link');
    } else if (candidateUrl && existingUrl && (candidateUrl.includes(existingUrl) || existingUrl.includes(candidateUrl))) {
      score += 25;
      reasons.push('Matching domain / application URL path');
    }

    // 2. Similar Title Token Overlap
    const existingTitleTokens = getTokens(existing.title || '');
    const titleSim = calculateJaccardSimilarity(candidateTitleTokens, existingTitleTokens);
    if (titleSim >= 0.7) {
      score += 45;
      reasons.push(`Very similar title (${Math.round(titleSim * 100)}% match)`);
    } else if (titleSim >= 0.45) {
      score += 25;
      reasons.push(`Moderately similar title (${Math.round(titleSim * 100)}% match)`);
    }

    // 3. Same Organization
    const existingOrg = normalizeText(existing.organizationName || '');
    if (candidateOrg && existingOrg && (candidateOrg === existingOrg || candidateOrg.includes(existingOrg) || existingOrg.includes(candidateOrg))) {
      score += 20;
      reasons.push(`Same organization: "${existing.organizationName}"`);
    }

    // 4. Similar Deadline (within 14 days)
    if (candidateDeadline && existing.deadline) {
      const existingDeadline = new Date(existing.deadline).getTime();
      if (!isNaN(existingDeadline)) {
        const diffDays = Math.abs(candidateDeadline - existingDeadline) / (1000 * 60 * 60 * 24);
        if (diffDays <= 1) {
          score += 10;
          reasons.push('Same deadline date');
        } else if (diffDays <= 14) {
          score += 5;
          reasons.push(`Similar deadline (within ${Math.round(diffDays)} days)`);
        }
      }
    }

    // Cap at 100%
    const confidence = Math.min(100, Math.round(score));

    // Threshold for duplicate warning
    if (confidence >= 45) {
      matches.push({
        existingItem: existing,
        confidence,
        reasons
      });
    }
  }

  // Return highest confidence matches first
  return matches.sort((a, b) => b.confidence - a.confidence);
}
