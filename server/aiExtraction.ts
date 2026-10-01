import { GoogleGenAI } from '@google/genai';
import type { ExtractedAIResponse, QualityControlFlag } from '../src/types/aiAssistant';

const SYSTEM_INSTRUCTION = `
You are the AI Content Assistant for "Opportunity Ghana", an official platform connecting Ghanaian youth to verified jobs, scholarships, internships, fellowships, and training.

CRITICAL TRUTH & SAFETY RULES:
1. NEVER fabricate or invent missing information.
2. NEVER guess or invent deadlines, application URLs, organizations, prices, stipend amounts, or certificates.
3. If an attribute is NOT clearly stated in the source text, you MUST output "Not found" or "Needs verification".
4. Opportunity Ghana's credibility and user trust are more important than completion speed.
5. Identify quality flags:
   - "missing_deadline": No clear deadline date specified in text.
   - "missing_application_url": No official application form or portal URL found.
   - "suspicious_url": Link points to unofficial shorteners (bit.ly), WhatsApp/Telegram chat, or free forms when an institutional portal is expected.
   - "unclear_organization": Organization or host body is vague or unverified.
   - "missing_eligibility": No clear degree, field of study, or nationality requirement mentioned.
   - "possible_outdated": Mentions years before 2026 or appears to be an expired announcement.
6. Determine whether the source is primarily an "opportunity" (job, scholarship, fellowship, grant, internship) or a "resource" (course, training bootcamp, certificate, curriculum).
7. Suggest the best Opportunity Category (Jobs, Scholarships, Internships, Grants, Fellowships, Admissions, Training, Competitions, Government Programmes, Graduate Programmes, Study Abroad, Entrepreneurship) or Resource Category (Technology, Business, Finance, Healthcare, Engineering, Agriculture, Marketing, Design, Data, Cybersecurity, AI, Education, Entrepreneurship, Professional Development).

Return your analysis in valid, parseable JSON conforming to the requested schema.
`;

export async function extractSourceContent(sourceUrl: string, textContent: string): Promise<ExtractedAIResponse> {
  const analyzedAt = new Date().toISOString();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `
Analyze the following source text and URL from a Ghanaian opportunity or learning provider:
Source URL: ${sourceUrl || 'None provided'}
Source Text Content:
"""
${textContent.slice(0, 15000)}
"""

Extract all fields into a JSON object with this exact structure:
{
  "detectedType": "opportunity" | "resource",
  "confidenceScore": number (0-100),
  "rawSummary": string,
  "qualityFlags": [
    {
      "id": string,
      "type": "missing_deadline" | "suspicious_url" | "missing_application_url" | "contradictory_dates" | "missing_eligibility" | "potential_duplicate" | "unclear_organization" | "possible_outdated",
      "label": string,
      "severity": "critical" | "warning" | "info",
      "description": string
    }
  ],
  "needsAttentionFields": string[],
  "opportunityData": {
    "title": string,
    "organizationName": string,
    "opportunityType": string,
    "category": string,
    "subcategory": string,
    "description": string,
    "location": string,
    "country": "Ghana",
    "region": string,
    "educationLevel": string,
    "fieldOfStudy": string,
    "experienceLevel": string,
    "eligibilitySummary": string,
    "ageRequirement": string,
    "nationality": string,
    "fundingType": string,
    "tuition": string,
    "accommodation": string,
    "stipend": string,
    "travel": string,
    "otherBenefits": string,
    "benefits": string[],
    "requirements": string[],
    "documentsRequired": string[],
    "deadline": string,
    "applicationUrl": string,
    "sourceUrl": string,
    "verificationNotes": string
  },
  "resourceData": {
    "title": string,
    "providerName": string,
    "resourceType": "course" | "certification" | "training" | "bootcamp" | "workshop" | "learning_resource",
    "category": string,
    "subcategory": string,
    "description": string,
    "level": "Beginner" | "Intermediate" | "Advanced" | "All Levels",
    "format": "Self-paced Online" | "Live Online" | "In-person" | "Hybrid",
    "location": string,
    "duration": string,
    "cost": number,
    "currency": "GHS",
    "isFree": boolean,
    "hasCertificate": boolean,
    "financialAid": boolean,
    "skills": string[],
    "prerequisites": string[],
    "enrollmentUrl": string,
    "sourceUrl": string,
    "verificationNotes": string
  }
}
Remember: If a field is not found in the text, assign "Not found" or "Needs verification" — DO NOT FABRICATE.
`;

      let responseText = '';
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI extraction timed out, using instant parser')), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json'
          }
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        responseText = response?.text || '';
      } catch (liteErr: any) {
        console.warn('Gemini extraction notice (switching to deterministic parser):', liteErr.message);
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          ...parsed,
          sourceUrl: sourceUrl || parsed.sourceUrl || '',
          analyzedAt
        };
      }
    } catch (err) {
      console.warn('Gemini extraction error, falling back to heuristic parsing:', err);
    }
  }

  // Fallback Rule-Based Parser (Works seamlessly offline or if no API key is set)
  return fallbackHeuristicExtraction(sourceUrl, textContent, analyzedAt);
}

function fallbackHeuristicExtraction(sourceUrl: string, text: string, analyzedAt: string): ExtractedAIResponse {
  const isResource = /course|bootcamp|curriculum|syllabus|certification|learn to code|workshop|duration:/i.test(text);
  const detectedType = isResource ? 'resource' : 'opportunity';
  const qualityFlags: QualityControlFlag[] = [];
  const needsAttention: string[] = [];

  // Extract URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];
  const firstUrl = urls[0] || sourceUrl || '';

  // Extract lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const titleLine = lines[0] || 'Extracted Announcement';

  // Check deadline
  const deadlineMatch = text.match(/deadline[:\s]+([A-Za-z0-9, ]+)/i) || text.match(/closing date[:\s]+([A-Za-z0-9, ]+)/i);
  let deadline = 'Not found';
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  } else {
    qualityFlags.push({
      id: 'flag-no-deadline',
      type: 'missing_deadline',
      label: 'Missing Deadline',
      severity: 'critical',
      description: 'No explicit deadline date found in the source text. Administrator must verify before publishing.'
    });
    needsAttention.push('deadline');
  }

  // Check application URL
  if (!firstUrl || firstUrl === 'https://') {
    qualityFlags.push({
      id: 'flag-no-app-url',
      type: 'missing_application_url',
      label: 'Missing Application Link',
      severity: 'critical',
      description: 'No direct application or enrollment URL could be extracted from the source.'
    });
    needsAttention.push('applicationUrl');
  } else if (/bit\.ly|tinyurl|wa\.me/i.test(firstUrl)) {
    qualityFlags.push({
      id: 'flag-suspicious-url',
      type: 'suspicious_url',
      label: 'Suspicious / Shortened Link',
      severity: 'warning',
      description: `Extracted link (${firstUrl}) uses a URL shortener or chat redirect. Confirm institutional host.`
    });
    needsAttention.push('applicationUrl');
  }

  // Check organization
  let org = 'Not found';
  const orgMatch = text.match(/organization[:\s]+([^\n]+)/i) || text.match(/company[:\s]+([^\n]+)/i) || text.match(/institution[:\s]+([^\n]+)/i);
  if (orgMatch) {
    org = orgMatch[1].trim();
  } else {
    qualityFlags.push({
      id: 'flag-unclear-org',
      type: 'unclear_organization',
      label: 'Unclear Host Organization',
      severity: 'warning',
      description: 'Host body or employer could not be reliably determined from the text.'
    });
    needsAttention.push('organizationName');
  }

  // Check eligibility
  // Check eligibility & field of study
  let fieldOfStudy = 'Open to All Fields';
  const fieldMatch = text.match(/(?:field of study|disciplines?|departments?|majors?|courses?)[:\s]+([^\n\.]+)/i);
  if (fieldMatch) {
    fieldOfStudy = fieldMatch[1].trim();
  } else if (/stem/i.test(text)) {
    fieldOfStudy = 'Science, Technology, Engineering, Mathematics (STEM)';
  }

  // Check age requirement
  let ageRequirement = 'Needs verification';
  const ageMatch = text.match(/(?:age|aged)[:\s]+([^\n\.]+)/i) || text.match(/between\s+(\d+\s*(?:to|-)\s*\d+\s*years)/i);
  if (ageMatch) {
    ageRequirement = ageMatch[1].trim();
  }

  // Check nationality
  let nationality = 'Ghanaian citizens only';
  if (/all nationalities|international applicants|west africa|ecowas/i.test(text)) {
    nationality = 'All nationalities / ECOWAS eligible';
  }

  // Check funding & benefits
  let tuition = 'Not found';
  if (/tuition/i.test(text)) {
    tuition = /100%|full tuition/i.test(text) ? '100% Full Tuition Waiver' : 'Partial Tuition Support';
  }

  let accommodation = 'Not found';
  if (/accommodation|hostel|housing/i.test(text)) {
    accommodation = 'On-campus residence / hostel stipend provided';
  }

  let stipend = 'Not found';
  const stipendMatch = text.match(/(?:stipend|allowance|salary)[:\s]+([^\n\.]+)/i);
  if (stipendMatch) {
    stipend = stipendMatch[1].trim();
  } else if (/stipend|allowance|salary/i.test(text)) {
    stipend = 'Monthly living stipend provided';
  }

  let travel = 'Not found';
  if (/travel|flight|transport/i.test(text)) {
    travel = 'Travel / flight allowance included';
  }

  let otherBenefits = 'Not found';
  if (/laptop|health insurance|mentorship|internship/i.test(text)) {
    otherBenefits = 'Mentorship, equipment allowance, networking';
  }

  // Benefits list
  const extractedBenefits: string[] = [];
  if (tuition !== 'Not found') extractedBenefits.push(tuition);
  if (stipend !== 'Not found') extractedBenefits.push(stipend);
  if (accommodation !== 'Not found') extractedBenefits.push(accommodation);
  if (otherBenefits !== 'Not found') extractedBenefits.push(otherBenefits);
  if (extractedBenefits.length === 0) extractedBenefits.push('Needs verification');

  // Documents required
  const extractedDocs: string[] = [];
  if (/cv|resume/i.test(text)) extractedDocs.push('Curriculum Vitae (CV)');
  if (/transcript/i.test(text)) extractedDocs.push('Official Academic Transcript');
  if (/wassce/i.test(text)) extractedDocs.push('WASSCE Certificate');
  if (/recommendation|reference/i.test(text)) extractedDocs.push('Recommendation Letter');
  if (/ghana card|national id/i.test(text)) extractedDocs.push('Valid Ghana Card');
  if (extractedDocs.length === 0) extractedDocs.push('Needs verification');

  if (!/degree|bachelor|shs|qualification|eligibility|requirements|cgpa/i.test(text)) {
    qualityFlags.push({
      id: 'flag-no-eligibility',
      type: 'missing_eligibility',
      label: 'Incomplete Eligibility Details',
      severity: 'info',
      description: 'Educational qualifications and requirements need manual administrator review.'
    });
    needsAttention.push('educationLevel');
  }

  // Check for outdated references
  if (/2023|2024/i.test(text) && !/2026/i.test(text)) {
    qualityFlags.push({
      id: 'flag-possible-outdated',
      type: 'possible_outdated',
      label: 'Possible Outdated Cohort',
      severity: 'warning',
      description: 'Announcement text references past years (2023/2024). Verify application window status.'
    });
  }

  const confidenceScore = Math.max(30, 85 - qualityFlags.length * 15);

  if (detectedType === 'opportunity') {
    return {
      detectedType: 'opportunity',
      confidenceScore,
      rawSummary: text.slice(0, 300) + '...',
      sourceUrl: sourceUrl || firstUrl,
      analyzedAt,
      qualityFlags,
      needsAttentionFields: needsAttention,
      opportunityData: {
        title: titleLine.replace(/^#+\s*/, ''),
        organizationName: org,
        opportunityType: /internship/i.test(text) ? 'Internship' : /scholarship/i.test(text) ? 'Scholarship' : /grant/i.test(text) ? 'Grant' : /fellowship/i.test(text) ? 'Fellowship' : 'Full-time',
        category: /scholarship/i.test(text) ? 'Scholarships' : /internship/i.test(text) ? 'Internships' : /grant/i.test(text) ? 'Grants' : /fellowship/i.test(text) ? 'Fellowships' : 'Jobs',
        subcategory: 'General Development',
        description: text.slice(0, 800),
        location: /accra/i.test(text) ? 'Accra, Ghana' : /kumasi/i.test(text) ? 'Kumasi, Ghana' : 'Ghana',
        country: 'Ghana',
        region: /ashanti/i.test(text) ? 'Ashanti' : /western/i.test(text) ? 'Western' : 'Greater Accra',
        educationLevel: /undergraduate|bachelor/i.test(text) ? 'Undergraduate (Bachelor)' : /shs|high school/i.test(text) ? 'Senior High School (SHS)' : /master|postgraduate/i.test(text) ? 'Postgraduate (Master / PhD)' : 'Needs verification',
        fieldOfStudy: fieldOfStudy,
        experienceLevel: /entry/i.test(text) ? 'Entry Level' : 'Needs verification',
        eligibilitySummary: 'Review official institutional call guidelines.',
        ageRequirement: ageRequirement,
        nationality: nationality,
        fundingType: /fully funded/i.test(text) ? 'Fully Funded' : 'Monthly Stipend / Salary',
        tuition: tuition,
        accommodation: accommodation,
        stipend: stipend,
        travel: travel,
        otherBenefits: otherBenefits,
        benefits: extractedBenefits,
        requirements: ['Valid identity documentation', 'Meet stated minimum criteria threshold'],
        documentsRequired: extractedDocs,
        deadline: deadline,
        applicationUrl: firstUrl || 'https://',
        sourceUrl: sourceUrl || firstUrl,
        verificationNotes: 'Extracted by Opportunity Ghana AI Assistant. Awaiting editorial verification.'
      }
    };
  } else {
    return {
      detectedType: 'resource',
      confidenceScore,
      rawSummary: text.slice(0, 300) + '...',
      sourceUrl: sourceUrl || firstUrl,
      analyzedAt,
      qualityFlags,
      needsAttentionFields: needsAttention,
      resourceData: {
        title: titleLine.replace(/^#+\s*/, ''),
        providerName: org,
        resourceType: /bootcamp/i.test(text) ? 'bootcamp' : /certification/i.test(text) ? 'certification' : 'course',
        category: 'Technology',
        subcategory: 'Digital Skills',
        description: text.slice(0, 800),
        level: 'Beginner',
        format: /in-person|campus/i.test(text) ? 'In-person' : 'Self-paced Online',
        location: 'Online',
        duration: /week/i.test(text) ? '4-8 Weeks' : 'Self-paced',
        cost: /free|zero cost/i.test(text) ? 0 : 0,
        currency: 'GHS',
        isFree: /free|no tuition|100% free/i.test(text),
        hasCertificate: /certificate|credential/i.test(text),
        financialAid: /financial aid|scholarship/i.test(text),
        skills: ['Software Literacy', 'Problem Solving', 'Data & Tech'],
        prerequisites: ['Basic computer and internet knowledge'],
        enrollmentUrl: firstUrl || 'https://',
        sourceUrl: sourceUrl || firstUrl,
        verificationNotes: 'Course curriculum extracted by AI Content Assistant. Verify certificate legitimacy.'
      }
    };
  }
}
