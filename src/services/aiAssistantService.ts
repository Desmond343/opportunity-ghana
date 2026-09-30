import { ExtractedAIResponse } from '../types/aiAssistant';
import { OpportunitiesService } from './opportunitiesService';
import { ResourcesService } from './resourcesService';
import { detectDuplicates } from './duplicateDetection';
import { DuplicateMatch, Opportunity } from '../types/database';

export const DEMO_SOURCE_TEMPLATES = [
  {
    title: 'Tullow Ghana 2026/2027 Tertiary STEM Scholarship Circular',
    url: 'https://tullowghana.com/careers-and-community/stem-scholars-2026',
    text: `TULLOW GHANA LIMITED
OFFICIAL PUBLIC ANNOUNCEMENT
2026/2027 TERTIARY STEM SCHOLARSHIPS FOR GHANAIAN STUDENTS

Tullow Ghana invites applications from high-performing Ghanaian undergraduate students enrolled in accredited public universities (UG, KNUST, UMaT, UCC) pursuing Science, Technology, Engineering, and Mathematics (STEM).

Scope of Award:
- 100% full academic tuition and examination fees paid directly to the university.
- Annual book and laptop allowance of GH₵ 8,500.
- On-campus accommodation stipend.
- Mentorship and guaranteed consideration for 3-month industrial vacation internships at the Jubilee Field operations.

Eligibility Criteria:
1. Must be a Ghanaian citizen by birth.
2. Currently enrolled in Year 2 or Year 3 of an eligible STEM degree programme.
3. Minimum cumulative grade point average (CGPA) of 3.50 or Second Class Upper equivalent.
4. Preference will be given to candidates from Western Region coastal communities.

Application Deadline: 30th November 2026 at 17:00 GMT.
Application Portal: https://scholarships.tullowghana.com/apply-stem-2026
Required Documents: Certified copy of WASSCE results, Current University Transcript signed by Registrar, Valid Ghana Card, Letter of Recommendation from Head of Department.`
  },
  {
    title: 'ALX Africa & Mastercard Foundation Software Engineering Cohort',
    url: 'https://alxafrica.com/programmes/software-engineering-2026',
    text: `ALX AFRICA IN PARTNERSHIP WITH MASTERCARD FOUNDATION
12-MONTH FULL-STACK SOFTWARE ENGINEERING PROGRAMME

Level up your digital career with a globally recognized, fully funded software engineering curriculum.

Programme Highlights:
- Duration: 12 Months (Full-Time commitment of 30-40 hours per week).
- Delivery: Hybrid / Online with access to ALX City Hub in Airport City, Accra.
- Tuition: Fully sponsored for eligible African youth aged 18 to 35. 0 GHS tuition.
- Certification: Industry-standard Professional Certificate upon successful capstone defense.
- Core Curriculum: C Programming, Python, Systems Engineering, Front-end (React/TypeScript), Backend (Node.js/SQL), and Agile teamwork.

Prerequisites:
- Access to a laptop (minimum 8GB RAM recommended) and reliable internet.
- English fluency (written and oral).
- Pass the cognitive assessment on the portal.

Cohort Start Date: 15th October 2026.
Application Deadline: 18th September 2026.
Portal URL: https://apply.alxafrica.com/se-ghana-2026`
  },
  {
    title: 'Ghana Forestry Commission Graduate Trainee Program (Incomplete Notice)',
    url: 'https://chat.whatsapp.com/invite/forestry-trainee-fake',
    text: `URGENT VACANCY: FORESTRY COMMISSION GHANA
We are hiring 500 young graduates across all 16 regions.
Salary: Big monthly pay plus allowance.
Send your details on WhatsApp to 0244000000 or click the chat link.
No qualifications needed, everyone will be selected. Hurry now before it fills up!`
  }
];

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
      const err = await response.json();
      throw new Error(err.error || 'Failed to extract content from source');
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
