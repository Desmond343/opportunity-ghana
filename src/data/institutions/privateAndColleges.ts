import { Institution } from '../../types/institution';

export const PRIVATE_AND_COLLEGES: Institution[] = [
  {
    id: 'inst-ashesi-berekuso',
    slug: 'ashesi-university',
    name: 'Ashesi University',
    shortName: 'Ashesi',
    institutionType: 'Chartered Private University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Presidential Charter granted in 2018; fully accredited by GTEC. Highly selective liberal arts and technology university.',
    isChartered: true,
    presidentialCharterYear: 2018,
    location: {
      region: 'Eastern',
      city: 'Berekuso',
      townOrSubCity: 'Berekuso (near Accra)',
      campus: 'Ashesi University Campus, 1 University Avenue, Berekuso',
      address: '1 University Avenue, Berekuso, Eastern Region, Ghana',
      postalAddress: 'PMB CT 3, Cantonments, Accra, Ghana',
      gpsDigitalAddress: 'GE-029-4821',
    },
    contact: {
      mainPhone: ['+233 302 610 330', '+233 302 610 334'],
      admissionsPhone: ['+233 302 610 330', '+233 501 318 961'],
      mainEmail: ['info@ashesi.edu.gh'],
      admissionsEmail: ['admissions@ashesi.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.ashesi.edu.gh',
    admissionsPageUrl: 'https://www.ashesi.edu.gh/admissions',
    applicationPortalUrl: 'https://ashesi.elluciancrmrecruit.com/Apply',
    programmesCatalogueUrl: 'https://www.ashesi.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'Generous need-based and Mastercard Foundation scholarships available (over 45% of students receive scholarship support). Applications submitted directly online.',
    admissionCycles: [
      {
        id: 'ashesi-regular-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Admissions (Early & Regular Decision)',
        description: 'Computer Science, MIS, Business Administration, Computer Engineering, Electrical Engineering, Mechatronics, Mechanical Engineering.',
        applicationOpenDate: '2026-01-15',
        applicationCloseDate: '2026-11-15',
        originalDeadline: '2026-08-30',
        extendedDeadline: '2026-11-15',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 150,
          amountUSD: 50,
          voucherVendor: 'Online Portal via Mobile Money / Visa / Mastercard',
          bankPartners: ['MTN MoMo', 'Telecel Cash', 'Visa/Mastercard'],
          notes: 'GH¢150 for Ghanaian applicants; US$50 for international.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE credits (A1-C6) in 3 core (English, Core Math, Science/Social) and 3 electives',
          'Holistic admissions review: Academic grades, essays, leadership & extracurriculars, and interview',
          'WASSCE 2026 awaiting results accepted'
        ],
        targetAudience: 'Top-tier high school graduates seeking leadership-driven education',
        interviewDate: '2026-09-01 to 2026-11-30',
        applicationPortalUrl: 'https://ashesi.elluciancrmrecruit.com/Apply',
      }
    ],
    programmesSummary: {
      undergraduateCount: 7,
      postgraduateCount: 2,
      faculties: [
        'Department of Computer Science and Information Systems',
        'Department of Engineering (Computer, Electrical, Mechanical, Mechatronics)',
        'Department of Business Administration',
        'Department of Humanities and Social Sciences'
      ],
      featuredProgrammes: [
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Computer Science', durationYears: 4 },
        { name: 'BSc. Computer Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BSc. Management Information Systems (MIS)', level: 'Undergraduate', faculty: 'Computer Science', durationYears: 4 },
        { name: 'BSc. Business Administration', level: 'Undergraduate', faculty: 'Business', durationYears: 4 },
        { name: 'BSc. Mechatronics Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits in English, Core Maths, Integrated Science',
        'Credits in 3 Elective subjects',
        'Typical competitive WASSCE aggregate: 6 to 14',
        'Strong leadership background and written personal statements'
      ],
      matureApplicants: ['Holistic review, demonstrated leadership experience'],
      diplomaHndHolders: ['Transfer admissions considered with transcripts and evaluation'],
      internationalApplicants: ['IB Diploma (min 28 points), Cambridge A-Levels (min 3 C grades) or American High School Diploma'],
      specialNotes: ['All short-listed candidates undergo an in-person or virtual admissions interview.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BSc. Computer Science', degreeType: 'BSc', faculty: 'Computer Science', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Engineering', degreeType: 'BSc', faculty: 'Engineering', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Business Administration', degreeType: 'BSc', faculty: 'Business', cutOffPoint: 12, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Create an account on the Ashesi Admissions Portal (ashesi.elluciancrmrecruit.com/Apply).',
      'Pay application fee of GH¢150 online via Mobile Money or Card.',
      'Complete biographical and academic details.',
      'Submit required admissions essays responding to provided prompts.',
      'Upload WASSCE/high school results slip and passport photo.',
      'Provide contact details for an academic recommender.',
      'Submit application and schedule interview if invited.'
    ],
    requiredDocuments: [
      'WASSCE result slip / predicted grades',
      'Ghana Card Number or Passport',
      'Two written essays / personal statement',
      'One letter of recommendation from high school teacher/counselor',
      'Financial aid application documents (if applying for scholarship)'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-central-accra',
    slug: 'central-university',
    name: 'Central University',
    shortName: 'Central',
    institutionType: 'Chartered Private University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Presidential Charter granted in 2016 by Government of Ghana; largest private university in Ghana, accredited by GTEC.',
    isChartered: true,
    presidentialCharterYear: 2016,
    location: {
      region: 'Greater Accra',
      city: 'Miotso',
      townOrSubCity: 'Miotso-Prampram / Accra',
      campus: 'Miotso Main Campus, Mataheko Campus, Kumasi Campus',
      address: 'P.O. Box 2305, Tema / Miotso, Greater Accra, Ghana',
      postalAddress: 'P.O. Box 2305, Tema, Ghana',
      gpsDigitalAddress: 'GK-0492-3810',
    },
    contact: {
      mainPhone: ['+233 303 961 878', '+233 303 961 880'],
      admissionsPhone: ['+233 303 961 878', '+233 244 321 000'],
      mainEmail: ['info@central.edu.gh'],
      admissionsEmail: ['admissions@central.edu.gh'],
    },
    officialWebsiteUrl: 'https://central.edu.gh',
    admissionsPageUrl: 'https://central.edu.gh/admissions',
    applicationPortalUrl: 'https://central.edu.gh/apply',
    programmesCatalogueUrl: 'https://central.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'Central University admissions for Pharmacy (PharmD), Nursing, Law (LLB), Business, and Engineering are open. Apply online or at campus admissions offices.',
    admissionCycles: [
      {
        id: 'central-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Direct Admissions',
        description: 'Doctor of Pharmacy, BSc Nursing, LLB Law, Architecture, Civil Engineering, Computer Science, and Business Administration.',
        applicationOpenDate: '2026-02-01',
        applicationCloseDate: '2026-11-30',
        status: 'OPEN',
        feeInfo: {
          amountGHS: 150,
          voucherVendor: 'Online Portal via Mobile Money / Ecobank / Zenith Bank',
          notes: 'GH¢150 for Ghanaian applicants.',
          isPublished: true,
        },
        eligibility: ['WASSCE/SSSCE credits in 3 core and 3 electives, aggregate 24 to 36 depending on programme'],
        targetAudience: 'SHS graduates and diploma holders',
        applicationPortalUrl: 'https://central.edu.gh/apply',
      }
    ],
    programmesSummary: {
      undergraduateCount: 35,
      postgraduateCount: 20,
      faculties: [
        'School of Pharmacy (PharmD)',
        'School of Medicine and Health Sciences (Nursing, Physician Assistantship)',
        'Faculty of Law (LLB)',
        'Central Business School',
        'School of Engineering and Technology',
        'School of Architecture and Design'
      ],
      featuredProgrammes: [
        { name: 'Doctor of Pharmacy (PharmD)', level: 'Undergraduate', faculty: 'School of Pharmacy', durationYears: 6 },
        { name: 'BSc. Nursing', level: 'Undergraduate', faculty: 'Health Sciences', durationYears: 4 },
        { name: 'Bachelor of Laws (LLB)', level: 'Undergraduate', faculty: 'Faculty of Law', durationYears: 4 },
        { name: 'BSc. Physician Assistantship', level: 'Undergraduate', faculty: 'Health Sciences', durationYears: 4 },
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Engineering & Technology', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits in English, Core Maths, Integrated Science',
        'Credits in 3 relevant electives (Chemistry, Biology, Physics/Elective Maths for Pharmacy/Nursing)',
        'Aggregate 24 or better for professional health degrees'
      ],
      matureApplicants: ['25+ years old and pass mature entrance examination'],
      diplomaHndHolders: ['Diploma in Nursing/Health or HND for top-up'],
      internationalApplicants: ['A-Levels, IB, or high school diploma verified by GTEC'],
      specialNotes: ['Clinical science programmes accredited by Pharmacy Council and NMC.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Doctor of Pharmacy (PharmD)', degreeType: 'PharmD', faculty: 'School of Pharmacy', cutOffPoint: 12, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Nursing', degreeType: 'BSc', faculty: 'Health Sciences', cutOffPoint: 14, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Bachelor of Laws (LLB)', degreeType: 'LLB', faculty: 'Faculty of Law', cutOffPoint: 14, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Apply online at central.edu.gh/apply.',
      'Pay GH¢150 voucher fee via Mobile Money or bank transfer.',
      'Upload credentials and submit.'
    ],
    requiredDocuments: ['WASSCE results slip', 'Ghana Card Number', 'Passport photograph'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-gimpa-accra',
    slug: 'ghana-institute-of-management-and-public-administration',
    name: 'Ghana Institute of Management and Public Administration',
    shortName: 'GIMPA',
    institutionType: 'Public Professional & Specialised Institution',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Public specialized leadership, management, and law degree-awarding tertiary institution established by Act of Parliament (Act 676), accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Greater Accra',
      city: 'Accra',
      townOrSubCity: 'Greenhill / Achimota',
      campus: 'Greenhill Main Campus, Accra & Kumasi, Takoradi Satellite Campuses',
      address: 'P.O. Box AH 50, Achimota, Accra, Ghana',
      postalAddress: 'P.O. Box AH 50, Achimota, Accra, Ghana',
      gpsDigitalAddress: 'GA-112-8924',
    },
    contact: {
      mainPhone: ['+233 302 401 681', '+233 302 401 682'],
      admissionsPhone: ['+233 302 401 683', '+233 501 620 138'],
      mainEmail: ['info@gimpa.edu.gh'],
      admissionsEmail: ['admissions@gimpa.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.gimpa.edu.gh',
    admissionsPageUrl: 'https://www.gimpa.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.gimpa.edu.gh',
    programmesCatalogueUrl: 'https://www.gimpa.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'GIMPA admissions for prestigious Faculty of Law (LLB 3-year post-first degree & 4-year regular), Business School, Public Service, and Technology are open.',
    admissionCycles: [
      {
        id: 'gimpa-llb-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Bachelor of Laws (LLB) & Undergraduate Admissions',
        description: '3-Year Post-First Degree LLB, 4-Year Regular LLB, BSc Business Administration, BSc Computer Science, and BSc Public Administration.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 250,
          voucherVendor: 'CBG, Ecobank, Zenith Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢250 for undergraduate / post-first degree LLB; GH¢300 for postgraduate.',
          isPublished: true,
        },
        eligibility: [
          'For 3-Year LLB: Good first degree (minimum Second Class Lower or recognized professional qualification)',
          'For 4-Year LLB & BSc: WASSCE credits in 3 core and 3 electives, aggregate 24 or better',
          'Candidates must pass GIMPA Law Entrance Examination and Interview'
        ],
        targetAudience: 'Degree holders seeking law careers, executives, and SHS graduates',
        entranceExamDate: '2026-08-20',
        interviewDate: '2026-09-10',
        applicationPortalUrl: 'https://apply.gimpa.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 20,
      postgraduateCount: 30,
      faculties: [
        'GIMPA Law School (Faculty of Law)',
        'GIMPA Business School',
        'School of Public Service and Governance',
        'School of Technology and Social Sciences'
      ],
      featuredProgrammes: [
        { name: 'Bachelor of Laws (LLB - 3 Year Post-First Degree)', level: 'Undergraduate', faculty: 'Law School', durationYears: 3 },
        { name: 'Bachelor of Laws (LLB - 4 Year Direct Entry)', level: 'Undergraduate', faculty: 'Law School', durationYears: 4 },
        { name: 'BSc. Public Administration', level: 'Undergraduate', faculty: 'Public Service', durationYears: 4 },
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Technology', durationYears: 4 },
        { name: 'Master of Public Administration (MPA)', level: 'Postgraduate', faculty: 'Public Service', durationYears: 2 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits in English, Core Maths, Science/Social Studies',
        'Credits in 3 electives',
        'Aggregate 24 or better'
      ],
      matureApplicants: ['Demonstrated management experience and entrance examination'],
      diplomaHndHolders: ['Level 200/300 entry with verified transcripts'],
      internationalApplicants: ['Verified by GTEC'],
      specialNotes: ['Law School admission is strictly competitive via entrance exam and selection interview.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Bachelor of Laws (LLB 4-Year)', degreeType: 'LLB', faculty: 'Law School', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Business Administration', degreeType: 'BSc', faculty: 'Business School', cutOffPoint: 14, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Buy GIMPA e-voucher at CBG, Ecobank, Zenith Bank or dial *887#.',
      'Log into apply.gimpa.edu.gh.',
      'Complete online form, upload required degrees/results and passport photo.',
      'Submit application and print confirmation slip.'
    ],
    requiredDocuments: [
      'First degree certificate & official transcript (for post-first degree LLB/postgraduate)',
      'WASSCE results slip (for direct undergraduate)',
      'Ghana Card Number',
      'Passport photo'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-princof-coe-ghana',
    slug: 'public-colleges-of-education-ghana',
    name: 'Public Colleges of Education, Ghana (PRINCOF National Central Admissions)',
    shortName: 'PRINCOF / COE',
    institutionType: 'Public College of Education',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'All 46 Public Colleges of Education in Ghana are fully accredited by GTEC and affiliated to UCC, UEW, UG, KNUST, and AAMUSTED.',
    isChartered: false,
    affiliatedTo: 'University of Cape Coast (UCC), University of Education Winneba (UEW), University of Ghana (UG), KNUST, AAMUSTED',
    location: {
      region: 'All 16 Regions of Ghana',
      city: 'Nationwide (46 Public Colleges)',
      townOrSubCity: 'Accra, Kumasi, Akropong, Tamale, Berekum, Ho, Cape Coast, etc.',
      campus: '46 Campuses (e.g. Accra College of Education, Wesley College, Presby College Akropong, Bagabaga COE, St. Louis COE, Enchi COE)',
      address: 'National Secretariat of PRINCOF, Accra, Ghana',
      postalAddress: 'P.O. Box MB 393, Ministries, Accra, Ghana',
      gpsDigitalAddress: 'GA-110-3841',
    },
    contact: {
      mainPhone: ['+233 302 961 800', '+233 500 005 842'],
      admissionsPhone: ['+233 302 961 800', '+233 244 567 890'],
      mainEmail: ['info@coeportal.edu.gh'],
      admissionsEmail: ['admissions@coeportal.edu.gh'],
    },
    officialWebsiteUrl: 'https://coeportal.edu.gh',
    admissionsPageUrl: 'https://admission.coeportal.edu.gh',
    applicationPortalUrl: 'https://admission.coeportal.edu.gh',
    programmesCatalogueUrl: 'https://coeportal.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'PRINCOF Central Admissions for all 46 Public Colleges of Education for 4-Year BEd. degrees. Purchase voucher at Consolidated Bank Ghana (CBG) or dial *924*8#.',
    admissionCycles: [
      {
        id: 'princof-bed-2026',
        category: 'Teacher Education (PRINCOF)',
        academicYear: '2026/2027',
        title: '4-Year Bachelor of Education (BEd) Central Admissions',
        description: 'BEd Early Childhood, BEd Primary Education, and BEd Junior High School (JHS) Education across all 46 public colleges.',
        applicationOpenDate: '2026-04-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-09-30',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 350,
          voucherVendor: 'Consolidated Bank Ghana (CBG) & Mobile Money USSD *924*8#',
          ussdCode: '*924*8#',
          bankPartners: ['Consolidated Bank Ghana (CBG)', 'MTN MoMo', 'Telecel Cash', 'AirtelTigo Money'],
          notes: 'GH¢350 voucher fee covers 1st, 2nd, and 3rd choice Colleges of Education.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE credit passes (A1-C6) in 6 subjects: 3 core (English, Core Math, Integrated Science or Social Studies) + 3 electives',
          'SSSCE credit passes (A-D) in 6 subjects',
          'TVET Certificate II holders with relevant passes',
          'Awaiting WASSCE candidates are eligible to apply'
        ],
        targetAudience: 'Aspiring professional teachers in Ghana',
        applicationPortalUrl: 'https://admission.coeportal.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 46,
      faculties: [
        'Early Grade Education (Kindergarten to Primary 3)',
        'Upper Primary Education (Primary 4 to 6)',
        'Junior High School Education (Specializations: Science, Mathematics, ICT, Social Studies, Ghanaian Languages, Vocational Skills, Technical Skills)'
      ],
      featuredProgrammes: [
        { name: '4-Year BEd. Early Childhood Education', level: 'Undergraduate', faculty: 'Teacher Education', durationYears: 4 },
        { name: '4-Year BEd. Primary Education', level: 'Undergraduate', faculty: 'Teacher Education', durationYears: 4 },
        { name: '4-Year BEd. Junior High School (JHS) - Science & Mathematics', level: 'Undergraduate', faculty: 'Teacher Education', durationYears: 4 },
        { name: '4-Year BEd. Junior High School (JHS) - ICT & Technical', level: 'Undergraduate', faculty: 'Teacher Education', durationYears: 4 },
        { name: '4-Year BEd. Junior High School (JHS) - Ghanaian Languages', level: 'Undergraduate', faculty: 'Teacher Education', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core: English Language, Core Mathematics, and Integrated Science or Social Studies',
        'Credits (A1-C6) in 3 Elective subjects matching the chosen specialization',
        'Overall aggregate of 36 or better for WASSCE (aggregate 24 for SSSCE)'
      ],
      matureApplicants: ['25+ years old and pass mature entrance examination administered by affiliated university'],
      diplomaHndHolders: ['Diploma in Basic Education (DBE) holders qualify for 1-year/2-year BEd top-up'],
      internationalApplicants: ['Verified by GTEC'],
      specialNotes: [
        'Applicants must choose an accompanying Ghanaian Language during application.',
        'Teacher trainees receive government teacher trainee allowance during academic semesters.'
      ],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BEd. JHS Science and Mathematics', degreeType: 'BEd', faculty: 'Teacher Education', cutOffPoint: 20, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BEd. Early Childhood Education', degreeType: 'BEd', faculty: 'Teacher Education', cutOffPoint: 24, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BEd. Primary Education', degreeType: 'BEd', faculty: 'Teacher Education', cutOffPoint: 24, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase application voucher for GH¢350 at any Consolidated Bank Ghana (CBG) branch or via USSD *924*8#.',
      'You will receive an SMS containing your PIN and Serial Number.',
      'Log into the official portal: admission.coeportal.edu.gh.',
      'Select three (3) Colleges of Education in order of preference.',
      'Select your preferred BEd programme and required Ghanaian language.',
      'Enter your WASSCE index numbers and upload your passport photo.',
      'Submit the form online and print out a copy.',
      'IMPORTANT: Enclose the printed confirmation form, one passport photo, and copies of results slip in an EMS Priority Envelope and post to the Principal of your First-Choice College.'
    ],
    requiredDocuments: [
      'WASSCE / SSSCE Statement of Results',
      'Ghana Card Number',
      'Passport size photograph',
      'Ghana Post EMS priority envelope addressed to Principal of 1st Choice College'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory & PRINCOF Secretariat',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-moh-nursing-ghana',
    slug: 'public-nursing-and-health-training-colleges',
    name: 'Public Nursing and Health Training Colleges (Ministry of Health National Central Portal)',
    shortName: 'MOH Health Training',
    institutionType: 'Public Nursing & Health Training College',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC) & Nursing and Midwifery Council (NMC)',
    accreditationDetails: 'Regulated under the Ministry of Health Health Training Institutions Secretariat, accredited by GTEC and professionally licensed by the Nursing and Midwifery Council (NMC) & Allied Health Professions Council (AHPC).',
    isChartered: false,
    affiliatedTo: 'University of Ghana (UG), Kwame Nkrumah University of Science and Technology (KNUST), UCC',
    location: {
      region: 'All 16 Regions of Ghana',
      city: 'Nationwide (Over 90 Public Health Training Institutions)',
      townOrSubCity: 'Korle Bu, Pantang, Kumasi, Cape Coast, Koforidua, Tamale, Sunyani, Ho, etc.',
      campus: 'Korle Bu NMTC, 37 Military Hospital NMTC, Pantang Psychiatric Nursing, Kumasi NMTC, Cape Coast NMTC, etc.',
      address: 'Ministry of Health, Health Training Institutions Secretariat, Accra, Ghana',
      postalAddress: 'P.O. Box M44, Ministries, Accra, Ghana',
      gpsDigitalAddress: 'GA-110-2041',
    },
    contact: {
      mainPhone: ['+233 302 674 380', '+233 500 005 843'],
      admissionsPhone: ['+233 302 674 380', '+233 244 112 233'],
      mainEmail: ['info@healthtraining.gov.gh'],
      admissionsEmail: ['admissions@healthtraining.gov.gh'],
    },
    officialWebsiteUrl: 'https://healthtraining.gov.gh',
    admissionsPageUrl: 'https://healthtraining.gov.gh',
    applicationPortalUrl: 'https://register.healthtraining.gov.gh',
    programmesCatalogueUrl: 'https://healthtraining.gov.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'Central Ministry of Health admissions portal for Registered General Nursing (RGN), Midwifery, Community Health, and Allied Health. Purchase application codes at GCB Bank, ADB Bank, or online at register.healthtraining.gov.gh.',
    admissionCycles: [
      {
        id: 'moh-nursing-2026',
        category: 'Health Training / Nursing',
        academicYear: '2026/2027',
        title: 'Diploma in Registered General Nursing (RGN) & Midwifery',
        description: 'Diploma in Registered General Nursing (RGN), Registered Midwifery (RM), Registered Mental Nursing (RMN), and Registered Community Nursing (RCN).',
        applicationOpenDate: '2026-03-15',
        applicationCloseDate: '2026-11-15',
        originalDeadline: '2026-08-31',
        extendedDeadline: '2026-11-15',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'Agricultural Development Bank (ADB), GCB Bank, or Online Portal',
          bankPartners: ['Agricultural Development Bank (ADB)', 'GCB Bank Plc.'],
          notes: 'GH¢200 application voucher from ADB or GCB Bank, or pay online at register.healthtraining.gov.gh.',
          isPublished: true,
        },
        eligibility: [
          'Age: Minimum 16 years and maximum 35 years at date of application',
          'WASSCE credits (A1-C6) in 3 core: English, Core Math, Integrated Science',
          'Credits (A1-C6) in 3 elective subjects (Science, General Arts, Home Economics, or Agriculture)',
          'Overall aggregate score of 36 or better in WASSCE (aggregate 24 for SSSCE)',
          'Must be medically and physically fit'
        ],
        targetAudience: 'Aspiring nurses, midwives, and healthcare practitioners',
        interviewDate: '2026-09-01 to 2026-11-30',
        applicationPortalUrl: 'https://register.healthtraining.gov.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 25,
      diplomaCount: 15,
      faculties: [
        'Registered General Nursing (RGN)',
        'Registered Midwifery (RM - strictly female candidates)',
        'Registered Mental Nursing (RMN)',
        'Registered Community Nursing (RCN)',
        'Allied Health Programmes (Medical Laboratory Technology, Disease Control, Environmental Health, Nutrition, Physiotherapy Assistantship)'
      ],
      featuredProgrammes: [
        { name: 'Diploma in Registered General Nursing (RGN)', level: 'Diploma', faculty: 'Nursing', durationYears: 3 },
        { name: 'Diploma in Registered Midwifery (RM)', level: 'Diploma', faculty: 'Midwifery', durationYears: 3 },
        { name: 'Diploma in Registered Mental Nursing (RMN)', level: 'Diploma', faculty: 'Psychiatric Nursing', durationYears: 3 },
        { name: 'Diploma in Community Health Nursing', level: 'Diploma', faculty: 'Public Health', durationYears: 3 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credit passes (A1-C6) in English Language, Core Mathematics, and Integrated Science',
        'Credit passes in 3 relevant Elective subjects (Science, Arts, Home Economics, Agriculture)',
        'Overall aggregate of 36 or better for Diploma programmes',
        'Minimum age 16 years, maximum age 35 years'
      ],
      matureApplicants: ['Candidates with Nurse Assistant Clinical (NAC) or NAP certificates apply for Post-Basic / Top-Up'],
      diplomaHndHolders: ['Post-Basic Nursing entry for practicing state registered nurses'],
      internationalApplicants: ['Verified by GTEC and Nursing & Midwifery Council of Ghana'],
      specialNotes: [
        'Qualified candidates are invited to an in-person competitive oral and written interview.',
        'Admission is subject to medical fitness certificate.'
      ],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Diploma in Registered General Nursing (RGN)', degreeType: 'Diploma', faculty: 'Nursing', cutOffPoint: 24, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Diploma in Registered Midwifery (RM)', degreeType: 'Diploma', faculty: 'Midwifery', cutOffPoint: 24, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Diploma in Mental Nursing', degreeType: 'Diploma', faculty: 'Nursing', cutOffPoint: 30, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase an application voucher code for GH¢200 at any Agricultural Development Bank (ADB) or GCB Bank branch, or pay online at register.healthtraining.gov.gh.',
      'You will receive a unique PIN and Serial Number.',
      'Log into healthtraining.gov.gh or register.healthtraining.gov.gh.',
      'Complete personal biodata, WASSCE results, and Ghana Card details.',
      'Select your first, second, and third choice Health Training Institutions and programmes.',
      'Upload a passport-sized photograph with white background.',
      'Verify all details, submit the application, and print your summary slip.',
      'Keep your summary slip safe and check SMS notifications for your interview invitation date and venue.'
    ],
    requiredDocuments: [
      'WASSCE / SSSCE Statement of Results',
      'Ghana Card Number (National ID)',
      'Birth Certificate',
      'Passport size photograph with white background',
      'Printed application summary slip to present at interview'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via Ministry of Health & GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  }
];
