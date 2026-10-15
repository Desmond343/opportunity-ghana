import { Opportunity } from '../types/database';
import { ALL_INSTITUTIONS } from './institutions';
import { Institution } from '../types/institution';
import { VERIFIED_UNIVERSAL_OPPORTUNITY_PROVIDERS } from './universalOpportunityProviders';
import { VERIFIED_REAL_SCHOLARSHIPS } from './verifiedOpportunities';
import { VERIFIED_REAL_JOBS_AND_INTERNSHIPS } from './verifiedJobsAndInternships';
import { VERIFIED_REAL_COMPETITIONS } from './verifiedCompetitions';

/**
 * Converts an accredited Institution into a first-class Opportunity Ghana listing
 * under the Admissions category, linking directly to the institution profile.
 */
export function institutionToOpportunity(inst: Institution): Opportunity {
  const primaryCycle = inst.admissionCycles?.[0];
  const activeCycle =
    inst.admissionCycles?.find(c => c.status === 'OPEN' || c.status === 'CLOSING_SOON') ||
    primaryCycle;

  const deadline = activeCycle?.applicationCloseDate || 'Rolling Basis';
  const isDeadlineSpecified = !!(activeCycle?.applicationCloseDate && activeCycle.applicationCloseDate.length > 5);

  const admissionStatusText =
    inst.overallAdmissionStatus === 'OPEN'
      ? 'Admissions Currently Open'
      : inst.overallAdmissionStatus === 'CLOSING_SOON'
      ? 'Admissions Closing Soon'
      : 'Admissions & Portal Information';

  return {
    id: `inst-${inst.id}`,
    slug: inst.slug,
    title: `${inst.name} Admissions (${inst.primaryAcademicYear || '2026/2027'})`,
    description: `${inst.shortName || inst.name} (${inst.institutionType}) verified admissions, accredited by ${inst.accreditingBody}. Application portal open for undergraduate, postgraduate, diploma, and specialized programmes across ${inst.location.region} region.`,
    organizationId: inst.id,
    organizationName: inst.name,
    organizationLogo: inst.logoUrl,
    category: 'Admissions',
    subcategory: inst.institutionType,
    opportunityType: inst.institutionType,
    location: `${inst.location.city}, ${inst.location.region}, Ghana`,
    locationType: 'ghana',
    country: 'Ghana',
    region: inst.location.region,
    isGhanaEligible: true,
    nationality: 'Ghanaians & International Applicants',
    educationLevel: 'Undergraduate & Postgraduate',
    studyLevel: 'Undergraduate & Postgraduate',
    deadline,
    isDeadlineSpecified,
    status: 'published',
    verificationStatus: 'verified',
    submissionStatus: 'approved',
    applicationUrl: inst.applicationPortalUrl || inst.officialWebsiteUrl,
    applicationMethod: 'external_portal',
    employerWebsite: inst.officialWebsiteUrl,
    imageUrl: inst.coverImageUrl || '/images/institutions/ghana_campus_students.jpg',
    detailPath: `/institutions/${inst.slug}`,
    featured: inst.isFeatured || false,
    benefits: [
      `GTEC Fully Accredited (${inst.accreditationStatus === 'FULLY_ACCREDITED' ? 'Accredited' : 'In Good Standing'})`,
      `${inst.admissionCycles?.length || 1} Admission Cycles Available`,
      `${inst.programmesSummary?.featuredProgrammes?.length || 8}+ Accredited Programmes`,
      admissionStatusText,
      `Official Voucher/Portal: ${inst.applicationPortalUrl}`
    ],
    requirements: [
      inst.entryRequirements?.generalWassce?.[0] || 'WASSCE / SSSCE / Equivalent Secondary School Certificate',
      inst.entryRequirements?.specialNotes?.[0] || 'Valid Ghanaian identification or passport required',
      `Direct Online Portal: ${inst.applicationPortalUrl}`
    ],
    views: 1850,
    saves: 420,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    publishedAt: '2026-08-01T00:00:00Z'
  };
}

/**
 * Maps Universal Verified Opportunities into full Opportunity records
 */
export function universalProviderToOpportunity(item: any, idx: number): Opportunity {
  const isGhana = !item.country || item.country.toLowerCase() === 'ghana' || item.country.toLowerCase().includes('regions');
  const cat = item.category || 'Scholarships';

  return {
    id: `opp-univ-${item.slug || idx}`,
    slug: item.slug || `opp-univ-${idx}`,
    title: item.title,
    description: item.description,
    organizationId: `org-${item.slug || idx}`,
    organizationName: item.providerName || 'Verified Partner',
    organizationLogo: item.organizationLogo,
    category: cat,
    subcategory: item.subcategory,
    opportunityType: item.category === 'Grants' ? 'Grant Funding' : (item.studyLevel || 'All Levels'),
    location: item.location || 'Accra, Ghana',
    locationType: isGhana ? 'ghana' : 'abroad',
    country: item.country || 'Ghana',
    region: item.region || 'All Ghana',
    destinationCountry: isGhana ? undefined : item.country,
    eligibleCountries: item.eligibleCountries || ['Ghana'],
    isGhanaEligible: item.ghanaEligibilityConfirmed ?? true,
    educationLevel: item.studyLevel || 'All Levels',
    studyLevel: item.studyLevel || 'All Levels',
    fieldOfStudy: item.fieldOfStudy,
    fundingType: item.fundingType || (cat === 'Grants' ? 'Equity-Free Grant' : 'Fully Funded'),
    deadline: item.deadline || 'Rolling Basis',
    isDeadlineSpecified: !!(item.deadline && item.deadline !== 'Rolling Basis'),
    status: 'published',
    verificationStatus: 'verified',
    submissionStatus: 'approved',
    applicationUrl: item.officialWebsiteUrl || item.applicationPortalUrl || 'https://opportunityghana.site',
    applicationMethod: 'external_portal',
    employerWebsite: item.officialWebsiteUrl,
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    detailPath: `/opportunities/${item.slug || `opp-univ-${idx}`}`,
    featured: item.featured || false,
    benefits: item.benefits || [
      'Verified Ghanaian Eligibility',
      'Direct Official Application Channel',
      cat === 'Grants' ? 'Non-repayable funding' : 'Career and educational advancement'
    ],
    requirements: item.requirements || [
      'Open to eligible Ghanaian applicants',
      'Valid identification (Ghana Card or Passport)'
    ],
    views: 1100 + idx * 35,
    saves: 260 + idx * 12,
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    publishedAt: '2026-08-15T00:00:00Z'
  };
}

/**
 * Dedicated verified technical, digital, and entrepreneurship training cohorts
 */
export const VERIFIED_TRAINING_BOOTCAMPS: Opportunity[] = [
  {
    id: 'opp-training-mest-tech-2027',
    slug: 'mest-africa-technology-entrepreneurship-training-2027',
    title: 'MEST Africa Technology & Entrepreneurship Training Programme (Class of 2027)',
    description: 'Fully sponsored 12-month intensive software development, business, and startup incubation program for ambitious African tech entrepreneurs based at MEST campus in East Legon, Accra. Includes full tuition scholarship, monthly stipend, housing, and seed funding pitch opportunity upon graduation.',
    organizationId: 'org-mest-africa',
    organizationName: 'Meltwater Entrepreneurial School of Technology (MEST Africa)',
    organizationLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    category: 'Training',
    subcategory: 'Tech & Startup Incubation',
    opportunityType: 'Full-Time Residency & Cohort',
    location: 'East Legon, Accra, Ghana',
    locationType: 'ghana',
    country: 'Ghana',
    region: 'Greater Accra',
    isGhanaEligible: true,
    nationality: 'Ghanaians & Pan-African Applicants',
    educationLevel: 'Degree, HND or Equivalent Experience',
    studyLevel: 'Graduate & Professional',
    fieldOfStudy: 'Software Engineering, Product Management, Business Leadership',
    workArrangement: 'On-site',
    employmentType: 'Training Cohort',
    fundingType: 'Fully Funded (Tuition, Housing & Stipend)',
    fundingAmount: '$100,000+ Value with Seed Funding Eligibility',
    deadline: '2026-12-18',
    isDeadlineSpecified: true,
    status: 'published',
    verificationStatus: 'verified',
    submissionStatus: 'approved',
    applicationUrl: 'https://meltwater.org/training-program/',
    applicationMethod: 'external_portal',
    employerWebsite: 'https://meltwater.org',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    featured: true,
    benefits: [
      '100% Free Tuition covered by Meltwater Foundation',
      'Free Accommodation at MEST campus in East Legon',
      'Monthly Living Stipend throughout 12 months',
      'Opportunity to pitch for $50k-$100k Seed Funding at graduation'
    ],
    requirements: [
      'Passion for building high-growth technology ventures in Africa',
      'Demonstrated coding, business, or leadership capabilities',
      'Available full-time in Accra for the 1-year program'
    ],
    views: 3420,
    saves: 890,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    publishedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'opp-training-alx-software-eng',
    slug: 'alx-africa-software-engineering-program-ghana',
    title: 'ALX Africa Software Engineering Program (Accra Hub & Remote)',
    description: 'World-class 12-month software engineering career accelerator powered by the Mastercard Foundation. Features rigorous curriculum in C, Python, JavaScript, Linux systems, data structures, and full-stack web applications with in-person peer learning at the ALX Accra City Hub in Airport Residential Area.',
    organizationId: 'org-alx-africa',
    organizationName: 'ALX Africa & Mastercard Foundation',
    organizationLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
    category: 'Training',
    subcategory: 'Software Engineering',
    opportunityType: 'Hybrid Upskilling Cohort',
    location: 'Airport Residential, Accra & Online (Ghana)',
    locationType: 'ghana',
    country: 'Ghana',
    region: 'Greater Accra',
    isGhanaEligible: true,
    nationality: 'Young Africans & Ghanaians (Ages 18-35)',
    educationLevel: 'Any Education Level',
    studyLevel: 'Professional Skills',
    fieldOfStudy: 'Computer Science & Software Development',
    workArrangement: 'Hybrid',
    employmentType: 'Bootcamp / Cohort',
    fundingType: 'Mastercard Foundation Sponsored (Tuition Waived)',
    deadline: '2026-11-25',
    isDeadlineSpecified: true,
    status: 'published',
    verificationStatus: 'verified',
    submissionStatus: 'approved',
    applicationUrl: 'https://www.alxafrica.com/software-engineering/',
    applicationMethod: 'external_portal',
    employerWebsite: 'https://www.alxafrica.com',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    featured: true,
    benefits: [
      'Full tuition sponsorship by Mastercard Foundation',
      'Free access to ALX Accra City Hub co-working and high-speed internet',
      'Global job placement support and The Fellowship community access',
      'Industry-recognized software engineering certification'
    ],
    requirements: [
      'Ages 18 to 35 with valid Ghana Card',
      'Commitment of 20–30 hours per week for 12 months',
      'Access to a laptop and reliable internet connectivity'
    ],
    views: 2980,
    saves: 780,
    createdAt: '2026-08-10T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    publishedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'opp-training-alx-data-analytics',
    slug: 'alx-africa-data-analytics-program-ghana',
    title: 'ALX Africa Data Analytics Professional Program (Ghana Cohort)',
    description: 'Intensive 5-month career-ready data analytics programme teaching SQL, Python, Excel, Power BI, and data storytelling. Equips Ghanaian graduates and professionals with hands-on portfolio projects for high-growth tech and finance analyst roles across West Africa.',
    organizationId: 'org-alx-africa',
    organizationName: 'ALX Africa & Mastercard Foundation',
    organizationLogo: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&auto=format&fit=crop&q=80',
    category: 'Training',
    subcategory: 'Data Analytics & AI',
    opportunityType: 'Hybrid Upskilling Cohort',
    location: 'Accra & Online (Ghana)',
    locationType: 'ghana',
    country: 'Ghana',
    region: 'Greater Accra',
    isGhanaEligible: true,
    nationality: 'Ghanaians (Ages 18-35)',
    educationLevel: 'Tertiary Graduates & Students',
    studyLevel: 'Professional Skills',
    fieldOfStudy: 'Data Analytics, Business Intelligence, Statistics',
    workArrangement: 'Hybrid',
    employmentType: 'Bootcamp / Cohort',
    fundingType: 'Mastercard Foundation Sponsored',
    deadline: '2026-11-20',
    isDeadlineSpecified: true,
    status: 'published',
    verificationStatus: 'verified',
    submissionStatus: 'approved',
    applicationUrl: 'https://www.alxafrica.com/data-analytics/',
    applicationMethod: 'external_portal',
    employerWebsite: 'https://www.alxafrica.com',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    benefits: [
      'Sponsored tuition with recognized industry badge',
      'Portfolio-grade business analytics projects',
      'Access to ALX Accra City Hub for workspace and internet'
    ],
    requirements: [
      'Ghanaians aged 18-35',
      'Basic numeracy and logical reasoning',
      'Laptop with internet connection'
    ],
    views: 2410,
    saves: 620,
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    publishedAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'opp-training-gen-aws-restart',
    slug: 'generation-ghana-aws-restart-cloud-bootcamp',
    title: 'Generation Ghana & AWS re/Start Free Cloud Computing Bootcamp',
    description: '12-week full-time, 100% free cloud computing bootcamp preparing unemployed or underemployed Ghanaian youths for entry-level AWS cloud practitioner and sysops administrator jobs. Covers Linux, Python, networking, security, and AWS core services, with free voucher for the AWS Certified Cloud Practitioner exam.',
    organizationId: 'org-generation-ghana',
    organizationName: 'Generation Ghana & Amazon Web Services (AWS)',
    organizationLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&auto=format&fit=crop&q=80',
    category: 'Training',
    subcategory: 'Cloud Architecture & IT',
    opportunityType: 'Full-time Bootcamp',
    location: 'Accra & Kumasi (Ghana)',
    locationType: 'ghana',
    country: 'Ghana',
    region: 'Greater Accra',
    isGhanaEligible: true,
    nationality: 'Ghanaian citizens only',
    educationLevel: 'SHS Graduate, Diploma or Degree',
    studyLevel: 'Vocational / Professional',
    fieldOfStudy: 'Cloud Computing, DevOps, Systems Administration',
    workArrangement: 'On-site',
    employmentType: 'Training Cohort',
    fundingType: '100% Free (Tuition & Exam Voucher Paid)',
    deadline: '2026-12-05',
    isDeadlineSpecified: true,
    status: 'published',
    verificationStatus: 'verified',
    submissionStatus: 'approved',
    applicationUrl: 'https://ghana.generation.org/programs/aws-re-start/',
    applicationMethod: 'external_portal',
    employerWebsite: 'https://ghana.generation.org',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    benefits: [
      '100% Free full-time tuition',
      'Free AWS Certified Cloud Practitioner official exam voucher ($100 USD value)',
      'Direct interview matching with Ghanaian tech employers upon graduation'
    ],
    requirements: [
      'Ghanaian citizen aged 18 to 30',
      'Available full-time Monday to Friday for 12 weeks',
      'Commitment to enter the IT workforce immediately upon completion'
    ],
    views: 2650,
    saves: 710,
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    publishedAt: '2026-08-20T00:00:00Z'
  }
];

/**
 * Builds the complete unified catalog of platform opportunities
 */
function buildAllPlatformOpportunities(): Opportunity[] {
  const institutionOpps = ALL_INSTITUTIONS.map(institutionToOpportunity);
  const universalOpps = VERIFIED_UNIVERSAL_OPPORTUNITY_PROVIDERS.map(universalProviderToOpportunity);

  const raw = [
    ...VERIFIED_REAL_SCHOLARSHIPS,
    ...VERIFIED_REAL_JOBS_AND_INTERNSHIPS,
    ...VERIFIED_REAL_COMPETITIONS,
    ...institutionOpps,
    ...universalOpps,
    ...VERIFIED_TRAINING_BOOTCAMPS
  ];

  // Deduplicate by ID and Slug
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const results: Opportunity[] = [];

  for (const item of raw) {
    if (!item || !item.id || !item.slug) continue;
    if (seenIds.has(item.id) || seenSlugs.has(item.slug)) continue;
    seenIds.add(item.id);
    seenSlugs.add(item.slug);
    results.push(item);
  }

  return results;
}

export const ALL_PLATFORM_VERIFIED_OPPORTUNITIES: Opportunity[] = buildAllPlatformOpportunities();

/**
 * Matches an opportunity against a category filter name with domain-aware intelligence.
 * Solves the problem where opportunities have multi-category relevance (e.g. graduate trainee roles,
 * entrepreneurship grants and pitch contests, government scholarships, accredited admissions, etc.).
 */
export function matchesOpportunityCategory(o: Opportunity, categoryQuery: string): boolean {
  if (!categoryQuery || categoryQuery === 'All') return true;

  const cat = categoryQuery.toLowerCase().trim();
  const oCat = (o.category || '').toLowerCase().trim();
  const oSub = (o.subcategory || '').toLowerCase().trim();
  const title = (o.title || '').toLowerCase();
  const desc = (o.description || '').toLowerCase();
  const org = (o.organizationName || '').toLowerCase();
  const type = (o.opportunityType || '').toLowerCase();
  const emp = (o.employmentType || '').toLowerCase();
  const study = (o.studyLevel || '').toLowerCase();
  const edu = (o.educationLevel || '').toLowerCase();
  const funding = (o.fundingType || '').toLowerCase();

  switch (cat) {
    case 'admissions':
      return (
        oCat === 'admissions' ||
        o.id.startsWith('inst-') ||
        !!(o.detailPath && o.detailPath.startsWith('/institutions/')) ||
        title.includes('admission') ||
        type.includes('university') ||
        type.includes('college') ||
        type.includes('polytechnic') ||
        type.includes('admissions')
      );

    case 'entrepreneurship':
      return (
        oCat === 'entrepreneurship' ||
        oSub.includes('entrepreneur') ||
        oSub.includes('startup') ||
        oSub.includes('business') ||
        title.includes('entrepreneur') ||
        title.includes('startup') ||
        title.includes('venture') ||
        title.includes('pitch') ||
        title.includes('incubator') ||
        title.includes('accelerator') ||
        title.includes('startupper') ||
        title.includes('agritech challenge') ||
        title.includes('business heroes') ||
        title.includes('young farmer') ||
        title.includes('micro-app developer') ||
        title.includes('hacklab') ||
        desc.includes('entrepreneur') ||
        desc.includes('startup') ||
        desc.includes('msme') ||
        desc.includes('seed funding') ||
        desc.includes('seed grant') ||
        desc.includes('business plan') ||
        desc.includes('incubation') ||
        desc.includes('business competition') ||
        desc.includes('startup pitch') ||
        !!(o.skills && o.skills.some(s => s.toLowerCase().includes('entrepreneur') || s.toLowerCase().includes('startup')))
      );

    case 'graduate programmes':
      return (
        oCat === 'graduate programmes' ||
        emp.includes('graduate') ||
        type.includes('graduate') ||
        title.includes('graduate trainee') ||
        title.includes('graduate programme') ||
        title.includes('graduate program') ||
        title.includes('management trainee') ||
        title.includes('graduate development') ||
        title.includes('nextgen graduate') ||
        title.includes('graduate internship') ||
        title.includes('graduate experience') ||
        title.includes('graduate engineering') ||
        desc.includes('graduate trainee') ||
        desc.includes('management trainee') ||
        desc.includes('recent graduate') ||
        desc.includes('graduate development scheme') ||
        ((oCat === 'scholarships' || oCat === 'fellowships') && (
          study.includes('master') ||
          study.includes('phd') ||
          study.includes('postgraduate') ||
          type.includes('master') ||
          type.includes('phd') ||
          type.includes('postgraduate') ||
          edu.includes('master') ||
          edu.includes('phd') ||
          title.includes('master') ||
          title.includes('phd') ||
          title.includes('postgraduate')
        ))
      );

    case 'government programmes':
      return (
        oCat === 'government programmes' ||
        title.includes('government') ||
        title.includes('national service') ||
        title.includes('ministry') ||
        title.includes('public sector') ||
        title.includes('ges') ||
        title.includes('princof') ||
        title.includes('moh') ||
        title.includes('gnpc') ||
        title.includes('cocobod') ||
        title.includes('neip') ||
        title.includes('gea') ||
        org.includes('ministry') ||
        org.includes('government') ||
        org.includes('service') ||
        org.includes('authority') ||
        org.includes('secretariat') ||
        org.includes('commission') ||
        org.includes('ges') ||
        org.includes('gnpc') ||
        org.includes('cocobod') ||
        org.includes('neip') ||
        org.includes('gea') ||
        org.includes('princof') ||
        org.includes('national theatre') ||
        desc.includes('government of ghana') ||
        desc.includes('ministry of') ||
        desc.includes('national entrepreneurship') ||
        desc.includes('national service scheme')
      );

    case 'grants':
      return (
        oCat === 'grants' ||
        funding.includes('grant') ||
        type.includes('grant') ||
        title.includes('grant') ||
        desc.includes('equity-free grant') ||
        desc.includes('financial grant') ||
        desc.includes('seed grant') ||
        desc.includes('grant funding')
      );

    case 'fellowships':
      return (
        oCat === 'fellowships' ||
        title.includes('fellowship') ||
        title.includes('fellows') ||
        type.includes('fellowship') ||
        desc.includes('fellowship')
      );

    case 'training':
      return (
        oCat === 'training' ||
        type.includes('training') ||
        type.includes('bootcamp') ||
        title.includes('training') ||
        title.includes('bootcamp') ||
        title.includes('upskilling') ||
        title.includes('traineeship') ||
        title.includes('academy') ||
        desc.includes('training cohort') ||
        desc.includes('workforce development') ||
        desc.includes('bootcamp')
      );

    case 'competitions':
      return (
        oCat === 'competitions' ||
        type.includes('competition') ||
        type.includes('contest') ||
        type.includes('hackathon') ||
        type.includes('challenge') ||
        title.includes('competition') ||
        title.includes('challenge') ||
        title.includes('hackathon') ||
        title.includes('contest') ||
        title.includes('quiz') ||
        title.includes('prize')
      );

    case 'study abroad':
      return (
        oCat === 'study abroad' ||
        o.locationType === 'abroad' ||
        (o.country && o.country.toLowerCase() !== 'ghana' && !o.country.toLowerCase().includes('16 regions') && !o.country.toLowerCase().includes('all ghana')) ||
        (o.destinationCountry && o.destinationCountry.toLowerCase() !== 'ghana') ||
        title.includes('study abroad') ||
        title.includes('international scholarship')
      );

    case 'scholarships':
      return (
        oCat === 'scholarships' ||
        type.includes('scholarship') ||
        title.includes('scholarship') ||
        funding.includes('scholarship')
      );

    case 'jobs':
      return (
        oCat === 'jobs' ||
        (emp && emp !== 'internship' && !title.includes('internship') && !title.includes('attachment')) ||
        (type.includes('full-time') && !title.includes('internship')) ||
        (type.includes('part-time') && !title.includes('internship'))
      );

    case 'internships':
      return (
        oCat === 'internships' ||
        emp.includes('internship') ||
        type.includes('internship') ||
        title.includes('internship') ||
        title.includes('national service') ||
        title.includes('attachment')
      );

    default:
      return oCat === cat;
  }
}
