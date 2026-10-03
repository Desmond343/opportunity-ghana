import { Institution } from '../../types/institution';

export const PUBLIC_UNIVERSITIES: Institution[] = [
  {
    id: 'inst-ug-legon',
    slug: 'university-of-ghana',
    name: 'University of Ghana',
    shortName: 'UG',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/institutions/ug_students_workshop.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Ghana’s premier public university, chartered and fully accredited by GTEC under Act 1023.',
    isChartered: true,
    location: {
      region: 'Greater Accra',
      city: 'Accra',
      townOrSubCity: 'Legon',
      campus: 'Legon Main Campus, Korle-Bu (Health Sciences), Accra City Campus',
      address: 'University of Ghana, Legon, Accra',
      postalAddress: 'P.O. Box LG 25, Legon, Accra, Ghana',
      gpsDigitalAddress: 'GA-489-7629',
    },
    contact: {
      mainPhone: ['+233 302 213 820', '+233 303 930 200'],
      admissionsPhone: ['+233 302 213 850', '+233 200 452 018'],
      mainEmail: ['pad@ug.edu.gh'],
      admissionsEmail: ['admissions@ug.edu.gh'],
      helpdesk: 'https://helpdesk.ug.edu.gh',
    },
    officialWebsiteUrl: 'https://www.ug.edu.gh',
    admissionsPageUrl: 'https://www.ug.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.ug.edu.gh',
    programmesCatalogueUrl: 'https://www.ug.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'Beware of fraudsters: UG does not work with admission agents. Purchase e-vouchers only via USSD *887# or authorized partner banks (GCB, Ecobank, CBG, Fidelity).',
    admissionCycles: [
      {
        id: 'ug-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Regular (WASSCE / SSSCE / Awaiting Results)',
        description: 'For direct entry into 4-year degree programmes. Both candidates with results and awaiting WASSCE candidates are eligible.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-30',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-30',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 220,
          amountUSD: 110,
          voucherVendor: 'GCB Bank, Ecobank, CBG, Fidelity Bank & USSD *887#',
          ussdCode: '*887#',
          bankPartners: ['GCB Bank', 'Ecobank', 'Consolidated Bank Ghana', 'Fidelity Bank'],
          notes: 'GH¢220 for Ghanaian applicants; US$110 for international applicants.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE holders with Credit Passes (A1-C6) in 3 core subjects and 3 relevant elective subjects',
          'SSSCE holders with Credit Passes (A-D) in 3 core subjects and 3 elective subjects',
          'Current year WASSCE awaiting results candidates can apply using their index numbers',
          'Overall aggregate must meet college cut-off (typically Aggregate 6-24 depending on programme)'
        ],
        targetAudience: 'Senior High School graduates and awaiting results candidates',
        applicationPortalUrl: 'https://apply.ug.edu.gh/undergraduate',
      },
      {
        id: 'ug-mature-2026',
        category: 'Mature Applicants',
        academicYear: '2026/2027',
        title: 'Mature Students Entry Scheme',
        description: 'For applicants aged 25 years and above who do not possess standard WASSCE requirements.',
        applicationOpenDate: '2026-02-15',
        applicationCloseDate: '2026-07-31',
        status: 'CLOSED',
        feeInfo: {
          amountGHS: 250,
          voucherVendor: 'GCB Bank, CBG, USSD *887#',
          notes: 'Includes entrance examination processing fee.',
          isPublished: true,
        },
        eligibility: [
          'Must be at least 25 years old by application deadline (verified with birth certificate)',
          'Must pass UG Mature Students Entrance Examination (English, Mathematics, General Aptitude)',
          'Must pass selection interview where required'
        ],
        targetAudience: 'Working adults aged 25+',
        entranceExamDate: '2026-08-15',
        applicationPortalUrl: 'https://apply.ug.edu.gh/mature',
      },
      {
        id: 'ug-postgrad-2026',
        category: 'Postgraduate',
        academicYear: '2026/2027',
        title: 'Postgraduate Admissions (MA, MSc, MBA, MPhil, PhD)',
        description: 'Postgraduate degree programmes under the School of Graduate Studies.',
        applicationOpenDate: '2026-03-15',
        applicationCloseDate: '2026-12-15',
        status: 'OPEN',
        feeInfo: {
          amountGHS: 280,
          amountUSD: 130,
          voucherVendor: 'GCB Bank, CBG, Ecobank, Zenith Bank',
          notes: 'GH¢280 for Ghanaian postgrad; US$130 for international applicants.',
          isPublished: true,
        },
        eligibility: [
          'Good first degree (at least Second Class Lower or equivalent CGPA 2.0+)',
          'For MPhil/PhD: Relevant Master degree and approved research proposal',
          'Two academic referee recommendations and official degree transcripts'
        ],
        targetAudience: 'Graduate degree holders and professionals',
        applicationPortalUrl: 'https://apply.ug.edu.gh/postgraduate',
      }
    ],
    programmesSummary: {
      undergraduateCount: 120,
      postgraduateCount: 150,
      faculties: [
        'College of Health Sciences (Medical School, Dental, Pharmacy, Nursing, Allied Health)',
        'College of Basic and Applied Sciences (Computing, Engineering, Agriculture, Physical Sciences)',
        'College of Humanities (UGBS Business School, Law, Arts, Social Sciences)',
        'College of Education'
      ],
      featuredProgrammes: [
        { name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', level: 'Undergraduate', faculty: 'Medical School', durationYears: 6 },
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Mathematical & Computer Sciences', durationYears: 4 },
        { name: 'BSc. Administration (Accounting / Finance / Marketing / HRM)', level: 'Undergraduate', faculty: 'UGBS', durationYears: 4 },
        { name: 'Bachelor of Laws (LLB)', level: 'Undergraduate', faculty: 'School of Law', durationYears: 4 },
        { name: 'BSc. Nursing', level: 'Undergraduate', faculty: 'School of Nursing and Midwifery', durationYears: 4 },
        { name: 'BSc. Biomedical Engineering', level: 'Undergraduate', faculty: 'School of Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core subjects: English Language, Core Mathematics, Integrated Science (or Social Studies for Humanities)',
        'Credits (A1-C6) in 3 elective subjects relevant to chosen programme',
        'Cumulative aggregate 24 or better (calculated from best 3 cores + best 3 electives)'
      ],
      matureApplicants: [
        'Minimum 25 years of age on date of application',
        'Official birth certificate with at least 5 years registration history',
        'Pass Entrance Examination in General Paper, English Language, and Mathematics'
      ],
      diplomaHndHolders: [
        'Accredited HND/Diploma with Second Class Upper or better for Level 200/300 top-up entry',
        'Transcript of academic records from accredited institution'
      ],
      internationalApplicants: [
        'International Baccalaureate (IB), Cambridge A-Levels, or equivalent foreign credential with GTEC evaluation where required',
        'English proficiency certificate (TOEFL/IELTS) for non-Anglophone countries'
      ],
      specialNotes: [
        'Health Sciences and Engineering require Integrated Science and Elective Mathematics with grade C6 or better.',
        'MBChB and Pharmacy are strictly first-choice programmes.'
      ],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Bachelor of Medicine & Surgery (MBChB)', degreeType: 'MBChB', faculty: 'College of Health Sciences', cutOffPoint: 7, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Doctor of Pharmacy (PharmD)', degreeType: 'PharmD', faculty: 'School of Pharmacy', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Science', degreeType: 'BSc', faculty: 'Physical & Mathematical Sciences', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Bachelor of Laws (LLB)', degreeType: 'LLB', faculty: 'School of Law', cutOffPoint: 7, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Nursing', degreeType: 'BSc', faculty: 'School of Nursing & Midwifery', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Administration', degreeType: 'BSc', faculty: 'UG Business School', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Information Technology', degreeType: 'BSc', faculty: 'Physical Sciences', cutOffPoint: 12, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase UG e-voucher code and serial number at GCB, Ecobank, CBG, Fidelity Bank or via USSD *887#.',
      'Navigate to the official portal: apply.ug.edu.gh and choose your admission level.',
      'Log in with the Serial Number and PIN generated.',
      'Complete biographical information and verify your Ghana Card identification number.',
      'Enter your WASSCE/SSSCE index number(s) or indicate awaiting results.',
      'Select your first, second, and third programme choices.',
      'Upload a clear passport photograph with plain white background.',
      'Review entered data carefully, submit the online form, and print your Application Summary Sheet.'
    ],
    requiredDocuments: [
      'WASSCE / SSSCE Statement of Results or Certificates',
      'Ghana Card (National ID) Number',
      'Recent passport-size photograph with white background (JPEG format)',
      'Birth Certificate (compulsory for mature applicants)',
      'Academic transcripts and certificate (for diploma, top-up and postgraduate applicants)'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-knust-kumasi',
    slug: 'kwame-nkrumah-university-of-science-and-technology',
    name: 'Kwame Nkrumah University of Science and Technology',
    shortName: 'KNUST',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/ghana_student_workspace.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Ghana’s leading science and technology university, established 1951, chartered public university accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Ashanti',
      city: 'Kumasi',
      townOrSubCity: 'KNUST Campus / Oduom',
      campus: 'Main Kumasi Campus, Obuasi Campus, Accra IDL Centre',
      address: 'Private Mail Bag, University Post Office, KNUST, Kumasi',
      postalAddress: 'PMB, KNUST, Kumasi, Ghana',
      gpsDigitalAddress: 'AK-384-5921',
    },
    contact: {
      mainPhone: ['+233 322 060 021', '+233 322 060 331'],
      admissionsPhone: ['+233 322 061 831', '+233 240 133 010'],
      mainEmail: ['uro@knust.edu.gh'],
      admissionsEmail: ['admissions@knust.edu.gh'],
      helpdesk: 'https://helpdesk.knust.edu.gh',
    },
    officialWebsiteUrl: 'https://www.knust.edu.gh',
    admissionsPageUrl: 'https://www.knust.edu.gh/admissions',
    applicationPortalUrl: 'https://apps.knust.edu.gh/admissions',
    programmesCatalogueUrl: 'https://www.knust.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'Beware of scammers posing as KNUST admission officers. e-Vouchers are available at GCB Bank, Ecobank, CBG, Ghana Post, CalBank, and official USSD *887#.',
    admissionCycles: [
      {
        id: 'knust-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Regular & Obuasi Campus (WASSCE / Awaiting)',
        description: 'Direct undergraduate admissions for Main Kumasi Campus and Obuasi Campus.',
        applicationOpenDate: '2026-04-01',
        applicationCloseDate: '2026-11-25',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-25',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 250,
          amountUSD: 100,
          voucherVendor: 'GCB Bank, Ecobank, CBG, Ghana Post, CalBank & USSD *887#',
          ussdCode: '*887#',
          bankPartners: ['GCB Bank', 'Ecobank', 'Consolidated Bank Ghana', 'CalBank', 'Ghana Post'],
          notes: 'GH¢250 for Ghanaian applicants; US$100 for international applicants.',
          isPublished: true,
        },
        eligibility: [
          'Credit passes (A1-C6) in 3 core subjects: English, Core Mathematics, and Integrated Science',
          'Credit passes (A1-C6) in 3 elective subjects relevant to chosen programme',
          'Overall aggregate not exceeding 24 (or cut-off for specific programme)',
          'WASSCE 2026 awaiting candidates are fully eligible'
        ],
        targetAudience: 'SHS graduates and awaiting WASSCE candidates',
        applicationPortalUrl: 'https://apps.knust.edu.gh/admissions',
      },
      {
        id: 'knust-distance-2026',
        category: 'Distance / Sandwich',
        academicYear: '2026/2027',
        title: 'Institute of Distance Learning (IDL) Admissions',
        description: 'Degree and diploma programmes delivered through hybrid online and weekend study across regional centres.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-12-10',
        status: 'OPEN',
        feeInfo: {
          amountGHS: 260,
          voucherVendor: 'GCB Bank, CBG, Ecobank',
          notes: 'Distance learning voucher covers application fee and IDL processing.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE/SSSCE holders, Diploma/HND holders, and mature applicants aged 25+',
          'Applicants can study from regional IDL centres in Accra, Kumasi, Takoradi, Sunyani, Tamale, Koforidua'
        ],
        targetAudience: 'Working professionals and flexible learners',
        applicationPortalUrl: 'https://apps.knust.edu.gh/admissions',
      }
    ],
    programmesSummary: {
      undergraduateCount: 110,
      postgraduateCount: 140,
      faculties: [
        'College of Engineering (Civil, Electrical, Mechanical, Chemical, Aerospace, Computer Engineering)',
        'College of Health Sciences (School of Medicine & Dentistry, Pharmacy, Nursing, Allied Health)',
        'College of Science (Computer Science, Actuarial Science, Biochemistry, Optometry)',
        'College of Art and Built Environment (Architecture, Construction, Planning)',
        'College of Agriculture and Natural Resources',
        'College of Humanities and Social Sciences (KNUST School of Business, Law)'
      ],
      featuredProgrammes: [
        { name: 'BSc. Computer Engineering', level: 'Undergraduate', faculty: 'College of Engineering', durationYears: 4 },
        { name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', level: 'Undergraduate', faculty: 'School of Medicine & Dentistry', durationYears: 6 },
        { name: 'Doctor of Pharmacy (PharmD)', level: 'Undergraduate', faculty: 'Faculty of Pharmacy', durationYears: 6 },
        { name: 'BSc. Architecture', level: 'Undergraduate', faculty: 'Art and Built Environment', durationYears: 4 },
        { name: 'BSc. Electrical/Electronic Engineering', level: 'Undergraduate', faculty: 'College of Engineering', durationYears: 4 },
        { name: 'BSc. Business Information Technology', level: 'Undergraduate', faculty: 'KNUST School of Business', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in English Language, Mathematics, and Integrated Science',
        'Credits (A1-C6) in 3 relevant Elective subjects',
        'Aggregate 24 or better (best 3 core + best 3 electives)',
        'Grades D7, E8, and F9 are strictly not accepted for degree admissions'
      ],
      matureApplicants: [
        'At least 25 years old at time of application',
        'Pass mature entrance examination and interview organized by KNUST'
      ],
      diplomaHndHolders: [
        'Higher National Diploma (HND) with minimum Second Class Lower from accredited institution',
        'Admitted to Level 200 or Level 300 depending on syllabus match'
      ],
      internationalApplicants: [
        'A-Levels, International Baccalaureate, or high school diploma evaluated by GTEC',
        'English proficiency for candidates from non-English speaking jurisdictions'
      ],
      specialNotes: [
        'Engineering programmes require Elective Mathematics and Physics with minimum grade C6.',
        'MBChB requires Chemistry, Biology, and Physics/Elective Mathematics.'
      ],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Human Biology / Medicine (MBChB)', degreeType: 'MBChB', faculty: 'Health Sciences', cutOffPoint: 6, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Doctor of Pharmacy (PharmD)', degreeType: 'PharmD', faculty: 'Pharmacy', cutOffPoint: 7, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Engineering', degreeType: 'BSc', faculty: 'Engineering', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Electrical & Electronic Engineering', degreeType: 'BSc', faculty: 'Engineering', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Science', degreeType: 'BSc', faculty: 'Science', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Nursing', degreeType: 'BSc', faculty: 'Health Sciences', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Architecture', degreeType: 'BSc', faculty: 'Built Environment', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Civil Engineering', degreeType: 'BSc', faculty: 'Engineering', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase an e-Voucher from GCB, Ecobank, CBG, Ghana Post or dial *887#.',
      'Visit the KNUST admission portal: apps.knust.edu.gh/admissions.',
      'Log in with your Login ID and PIN provided on the voucher.',
      'Fill in personal bio-data, parental details, and Ghana Card number.',
      'Input WASSCE index numbers and examination year or indicate awaiting.',
      'Select chosen campus (Kumasi or Obuasi) and select programme options.',
      'Upload a verified passport photograph.',
      'Submit the application online and print out two copies of the completed form.',
      'Ghanaian applicants must post two copies of the confirmation slip along with results slips via EMS to the Deputy Registrar (Academic Affairs).'
    ],
    requiredDocuments: [
      'WASSCE result slip(s) or certificates',
      'Ghana Card Number',
      'Passport size photograph with light background',
      'Endorsed declaration slip printed from portal',
      'Postage via EMS envelope to KNUST Academic Affairs'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-ucc-capecoast',
    slug: 'university-of-cape-coast',
    name: 'University of Cape Coast',
    shortName: 'UCC',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/institutions/ucc_tertiary_conference.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Globally ranked public research university, leading teacher education and research hub in West Africa, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Central',
      city: 'Cape Coast',
      townOrSubCity: 'UCC Campus',
      campus: 'North and South Campuses, Cape Coast',
      address: 'University of Cape Coast, Cape Coast, Ghana',
      postalAddress: 'UCC, Cape Coast, Ghana',
      gpsDigitalAddress: 'CC-094-1425',
    },
    contact: {
      mainPhone: ['+233 332 132 440', '+233 332 132 480'],
      admissionsPhone: ['+233 332 132 482', '+233 544 566 501'],
      mainEmail: ['cird@ucc.edu.gh'],
      admissionsEmail: ['admissions@ucc.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.ucc.edu.gh',
    admissionsPageUrl: 'https://www.ucc.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.ucc.edu.gh',
    programmesCatalogueUrl: 'https://www.ucc.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'UCC e-Vouchers are available at GCB Bank, Prudential Bank, Zenith Bank, CBG, GT Bank, Ghana Post, and via USSD code *966*3#.',
    admissionCycles: [
      {
        id: 'ucc-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Regular Admissions (2026/2027)',
        description: 'Regular full-time degree and diploma programmes on Cape Coast campus.',
        applicationOpenDate: '2026-03-26',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-09-25',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 220,
          voucherVendor: 'GCB Bank, Prudential Bank, Zenith Bank, CBG, GT Bank & Ghana Post',
          bankPartners: ['GCB Bank', 'Prudential Bank', 'Zenith Bank', 'CBG', 'GT Bank', 'Ghana Post'],
          notes: 'GH¢220 for Ghanaian undergraduate; GH¢320 for postgraduate.',
          isPublished: true,
        },
        eligibility: [
          'Credit passes (A1-C6) in 3 core subjects: English, Core Mathematics, and Integrated Science or Social Studies',
          'Credit passes in 3 relevant Elective subjects',
          'Overall aggregate of 36 or better for WASSCE (competitive programmes require aggregate 7-15)'
        ],
        targetAudience: 'SHS graduates and awaiting candidates',
        applicationPortalUrl: 'https://apply.ucc.edu.gh',
      },
      {
        id: 'ucc-distance-2026',
        category: 'Distance / Sandwich',
        academicYear: '2026/2027',
        title: 'College of Distance Education (CoDE) Admissions',
        description: 'Degree, diploma and post-diploma sandwich and distance programmes across all 16 regions.',
        applicationOpenDate: '2026-06-19',
        applicationCloseDate: '2026-12-15',
        status: 'OPEN',
        feeInfo: {
          amountGHS: 230,
          voucherVendor: 'GCB, CBG, Zenith Bank',
          notes: 'CoDE vouchers available across designated branches.',
          isPublished: true,
        },
        eligibility: [
          'Diploma holders for 2-year post-diploma degree',
          'WASSCE graduates and mature applicants aged 25+'
        ],
        targetAudience: 'Teachers, education officers, and flexible learners',
        applicationPortalUrl: 'https://apply.ucc.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 95,
      postgraduateCount: 110,
      faculties: [
        'College of Education Studies (Faculty of Educational Foundations, Humanities & Social Sciences Education)',
        'College of Health and Allied Sciences (School of Medical Sciences, Nursing, Allied Health)',
        'College of Humanities and Legal Studies (Faculty of Arts, Social Sciences, Faculty of Law, School of Business)',
        'College of Agriculture and Natural Sciences'
      ],
      featuredProgrammes: [
        { name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', level: 'Undergraduate', faculty: 'School of Medical Sciences', durationYears: 6 },
        { name: 'Bachelor of Laws (LLB)', level: 'Undergraduate', faculty: 'Faculty of Law', durationYears: 4 },
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Natural Sciences', durationYears: 4 },
        { name: 'BEd. Basic Education / Early Childhood Education', level: 'Undergraduate', faculty: 'College of Education Studies', durationYears: 4 },
        { name: 'BSc. Nursing', level: 'Undergraduate', faculty: 'School of Nursing and Midwifery', durationYears: 4 },
        { name: 'BCom. (Accounting / Finance / Human Resource)', level: 'Undergraduate', faculty: 'School of Business', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core subjects: English Language, Mathematics, and Integrated Science/Social Studies',
        'Credits (A1-C6) in 3 relevant Elective subjects',
        'Overall aggregate 36 or better in WASSCE, but competitive programmes require aggregate 7 to 15'
      ],
      matureApplicants: [
        'Must be at least 25 years old at the time of submitting application',
        'Pass competitive entrance examinations in General Paper, English Language, and Mathematics'
      ],
      diplomaHndHolders: [
        'HND or Diploma with at least Second Class Lower from accredited institution',
        'Direct admission into Level 200 or Level 300'
      ],
      internationalApplicants: [
        'GCE O/A-Levels, IB, or national high school certificate with GTEC equivalency'
      ],
      specialNotes: [
        'Candidates applying for BEd Physical Education must pass a practical physical fitness examination.'
      ],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Medicine and Surgery (MBChB)', degreeType: 'MBChB', faculty: 'School of Medical Sciences', cutOffPoint: 7, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Bachelor of Laws (LLB)', degreeType: 'LLB', faculty: 'Faculty of Law', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Nursing', degreeType: 'BSc', faculty: 'Health Sciences', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Science', degreeType: 'BSc', faculty: 'Natural Sciences', cutOffPoint: 11, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BCom. Accounting', degreeType: 'BCom', faculty: 'School of Business', cutOffPoint: 12, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Doctor of Optometry (OD)', degreeType: 'OD', faculty: 'Health Sciences', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase UCC e-voucher from GCB, Zenith, Prudential, CBG, GT Bank or Ghana Post.',
      'Go to apply.ucc.edu.gh and select appropriate category.',
      'Enter voucher Serial Number and PIN.',
      'Fill in applicant personal bio-data and contact details.',
      'Supply WASSCE index numbers and grades (or indicate awaiting).',
      'Select programme choices and upload passport photograph.',
      'Submit the application online and print the summary sheet.',
      'Enclose copies of certificates and post via EMS to the Senior Assistant Registrar (Directorate of Academic Affairs), UCC, Cape Coast.'
    ],
    requiredDocuments: [
      'WASSCE / SSSCE Result slips',
      'Ghana Card Number',
      'Passport-size photograph',
      'Two copies of printed application confirmation page'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-uew-winneba',
    slug: 'university-of-education-winneba',
    name: 'University of Education, Winneba',
    shortName: 'UEW',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/institutions/ug_students_seminar.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'National teacher education university, chartered public institution accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Central',
      city: 'Winneba',
      townOrSubCity: 'Winneba / Ajumako',
      campus: 'Winneba Main Campus (North, South, Central) & Ajumako Campus (Ghanaian Languages)',
      address: 'P.O. Box 25, Winneba, Central Region, Ghana',
      postalAddress: 'P.O. Box 25, Winneba, Ghana',
      gpsDigitalAddress: 'C0-0012-4521',
    },
    contact: {
      mainPhone: ['+233 332 322 036', '+233 332 322 042'],
      admissionsPhone: ['+233 332 322 038', '+233 202 041 141'],
      mainEmail: ['registrar@uew.edu.gh'],
      admissionsEmail: ['admissions@uew.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.uew.edu.gh',
    admissionsPageUrl: 'https://www.uew.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.uew.edu.gh',
    programmesCatalogueUrl: 'https://www.uew.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'UEW applications for 2026/2027 are currently open. Purchase vouchers at GCB, CBG, Zenith Bank, Ecobank, Republic Bank, or via USSD *887#.',
    admissionCycles: [
      {
        id: 'uew-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Direct Admissions (2026/2027)',
        description: '4-year degree and 2-year diploma programmes across educational, business, and science faculties.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-30',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-30',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 250,
          voucherVendor: 'GCB Bank, CBG, Ecobank, Zenith Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢250 for Ghanaian undergraduate.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE passes (A1-C6) in 3 core subjects including English and Mathematics, plus 3 elective subjects',
          'Overall aggregate 36 or better for degree programmes'
        ],
        targetAudience: 'WASSCE and diploma holders',
        applicationPortalUrl: 'https://apply.uew.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 75,
      postgraduateCount: 85,
      faculties: [
        'Faculty of Educational Studies',
        'Faculty of Science Education',
        'Faculty of Social Sciences Education',
        'School of Business',
        'School of Creative Arts',
        'Faculty of Ghanaian Languages Education (Ajumako Campus)'
      ],
      featuredProgrammes: [
        { name: 'BEd. Early Childhood Care and Education', level: 'Undergraduate', faculty: 'Educational Studies', durationYears: 4 },
        { name: 'BSc. Information Technology Education', level: 'Undergraduate', faculty: 'Science Education', durationYears: 4 },
        { name: 'BEd. Mathematics Education', level: 'Undergraduate', faculty: 'Science Education', durationYears: 4 },
        { name: 'BBA. Accounting / Human Resource Management', level: 'Undergraduate', faculty: 'School of Business', durationYears: 4 },
        { name: 'BA. Graphic Design / Music Education', level: 'Undergraduate', faculty: 'School of Creative Arts', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core subjects: English Language, Mathematics, and Science/Social Studies',
        'Credits (A1-C6) in 3 relevant Elective subjects',
        'Overall aggregate of 36 or better'
      ],
      matureApplicants: [
        'Age 25 or above',
        'Pass UEW Mature Entrance Examination in General Aptitude and Subject Area'
      ],
      diplomaHndHolders: [
        'Recognized Diploma in Education or HND with at least Second Class Lower'
      ],
      internationalApplicants: ['High school diploma or A-Levels with GTEC equivalency'],
      specialNotes: ['Physical Education applicants must pass medical examination and practical fitness test.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BSc. Information Technology Education', degreeType: 'BSc', faculty: 'Science Education', cutOffPoint: 16, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BEd. Mathematics Education', degreeType: 'BEd', faculty: 'Science Education', cutOffPoint: 18, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BBA. Accounting', degreeType: 'BBA', faculty: 'School of Business', cutOffPoint: 15, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase UEW e-voucher from GCB, CBG, Ecobank or via USSD *887#.',
      'Go to apply.uew.edu.gh and log in with voucher serial and PIN.',
      'Fill in applicant details, upload passport photo, enter results.',
      'Select campus (Winneba or Ajumako) and programme choices.',
      'Review and submit form online, print application voucher slip.'
    ],
    requiredDocuments: [
      'WASSCE / SSSCE Results slips',
      'Ghana Card Number',
      'Passport photo with white background',
      'Printed confirmation page'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-uds-tamale',
    slug: 'university-for-development-studies',
    name: 'University for Development Studies',
    shortName: 'UDS',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/categories/scholarships.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Pioneering practical multi-campus developmental university in Northern Ghana, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Northern',
      city: 'Tamale',
      townOrSubCity: 'Dungu / Nyankpala',
      campus: 'Dungu Main Campus (Tamale) & Nyankpala Campus (Agriculture & Natural Resources)',
      address: 'P.O. Box TL 1350, Tamale, Northern Region, Ghana',
      postalAddress: 'P.O. Box TL 1350, Tamale, Ghana',
      gpsDigitalAddress: 'NT-0272-1923',
    },
    contact: {
      mainPhone: ['+233 372 093 382', '+233 372 026 633'],
      admissionsPhone: ['+233 372 093 382'],
      mainEmail: ['info@uds.edu.gh'],
      admissionsEmail: ['admissions@uds.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.uds.edu.gh',
    admissionsPageUrl: 'https://www.uds.edu.gh/admissions',
    applicationPortalUrl: 'https://admissions.uds.edu.gh',
    programmesCatalogueUrl: 'https://www.uds.edu.gh/academics',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'UDS undergraduate and postgraduate admissions are open. e-Vouchers are obtainable at Stanbic Bank, GCB, NIB, CBG, Ecobank, Zenith Bank, and via USSD *887#.',
    admissionCycles: [
      {
        id: 'uds-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Regular Admissions (2026/2027)',
        description: 'Degree and diploma programmes including School of Medicine, Nursing, Pharmacy, and Agriculture.',
        applicationOpenDate: '2026-03-15',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'Stanbic Bank, GCB Bank, CBG, Ecobank, Zenith Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for undergraduate; GH¢250 for postgraduate.',
          isPublished: true,
        },
        eligibility: [
          'Credit passes (A1-C6) in 3 core subjects: English, Core Mathematics, and Integrated Science',
          'Credit passes in 3 relevant Elective subjects',
          'Aggregate 24 or better for medicine/pharmacy; up to 36 for other programmes'
        ],
        targetAudience: 'SHS graduates and awaiting candidates',
        applicationPortalUrl: 'https://admissions.uds.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 65,
      postgraduateCount: 50,
      faculties: [
        'School of Medicine (SoM)',
        'School of Pharmacy and Pharmaceutical Sciences',
        'School of Nursing and Midwifery',
        'Faculty of Agriculture, Food and Consumer Sciences (Nyankpala Campus)',
        'Faculty of Natural Resources and Environment',
        'Faculty of Communication and Cultural Studies'
      ],
      featuredProgrammes: [
        { name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', level: 'Undergraduate', faculty: 'School of Medicine', durationYears: 6 },
        { name: 'Doctor of Pharmacy (PharmD)', level: 'Undergraduate', faculty: 'School of Pharmacy', durationYears: 6 },
        { name: 'BSc. Nursing', level: 'Undergraduate', faculty: 'Nursing and Midwifery', durationYears: 4 },
        { name: 'BSc. Agriculture', level: 'Undergraduate', faculty: 'Agriculture', durationYears: 4 },
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Applied Sciences', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core subjects and 3 elective subjects',
        'Overall aggregate 36 or better for general degrees; aggregate 8 or better for MBChB'
      ],
      matureApplicants: ['Minimum 25 years old and pass mature entrance examination'],
      diplomaHndHolders: ['Accredited HND/Diploma for top-up to Level 200/300'],
      internationalApplicants: ['Recognized secondary certificate with GTEC certification'],
      specialNotes: ['All UDS students participate in the mandatory Third Trimester Field Practical Programme (TTFPP).'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Medicine and Surgery (MBChB)', degreeType: 'MBChB', faculty: 'School of Medicine', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Doctor of Pharmacy (PharmD)', degreeType: 'PharmD', faculty: 'School of Pharmacy', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Nursing', degreeType: 'BSc', faculty: 'Nursing', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase UDS e-voucher from partner banks or dial *887#.',
      'Visit admissions.uds.edu.gh and enter Login credentials.',
      'Complete personal details, educational history, programme choices.',
      'Upload passport photograph and submit online.',
      'Print Application Summary.'
    ],
    requiredDocuments: [
      'WASSCE result slip',
      'Ghana Card Number',
      'Passport photo',
      'Printed application summary sheet'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-uhas-ho',
    slug: 'university-of-health-and-allied-sciences',
    name: 'University of Health and Allied Sciences',
    shortName: 'UHAS',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/institutions/african_medical_nursing_students.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Dedicated public health sciences university in Ghana, chartered by Act of Parliament (Act 828) and accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Volta',
      city: 'Ho',
      townOrSubCity: 'Sokode-Lokoe / Ho',
      campus: 'Ho Main Campus (Sokode-Lokoe) & Hohoe Campus (School of Public Health)',
      address: 'PMB 31, Ho, Volta Region, Ghana',
      postalAddress: 'PMB 31, Ho, Ghana',
      gpsDigitalAddress: 'VH-0024-5110',
    },
    contact: {
      mainPhone: ['+233 362 196 122', '+233 362 196 197'],
      admissionsPhone: ['+233 362 196 122'],
      mainEmail: ['info@uhas.edu.gh'],
      admissionsEmail: ['admissions@uhas.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.uhas.edu.gh',
    admissionsPageUrl: 'https://www.uhas.edu.gh/admissions',
    applicationPortalUrl: 'https://apps.uhas.edu.gh/admissions',
    programmesCatalogueUrl: 'https://www.uhas.edu.gh/en/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'Specialized health sciences admissions are open. Purchase e-vouchers at GCB, Zenith, or Ghana Post offices nationwide.',
    admissionCycles: [
      {
        id: 'uhas-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Health Sciences Admissions',
        description: 'Medicine, Pharmacy, Nursing, Public Health, Physiotherapy, Dietetics, and Medical Laboratory Sciences.',
        applicationOpenDate: '2026-04-01',
        applicationCloseDate: '2026-11-25',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-25',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 220,
          voucherVendor: 'GCB Bank, Zenith Bank, Ghana Post',
          bankPartners: ['GCB Bank', 'Zenith Bank', 'Ghana Post'],
          notes: 'GH¢220 for Ghanaian applicants.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE credits (A1-C6) in 3 core: English, Core Math, Integrated Science',
          'Credits in 3 elective subjects: Chemistry, Biology, Physics/Elective Mathematics for Medicine/Pharmacy/Lab Science'
        ],
        targetAudience: 'Science students seeking medical & healthcare careers',
        applicationPortalUrl: 'https://apps.uhas.edu.gh/admissions',
      }
    ],
    programmesSummary: {
      undergraduateCount: 30,
      postgraduateCount: 20,
      faculties: [
        'School of Medicine (SoM)',
        'School of Pharmacy (SoP)',
        'School of Nursing and Midwifery (SoNM)',
        'School of Allied Health Sciences (SAHS)',
        'School of Public Health (Hohoe Campus)',
        'School of Basic and Biomedical Sciences'
      ],
      featuredProgrammes: [
        { name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', level: 'Undergraduate', faculty: 'School of Medicine', durationYears: 6 },
        { name: 'Doctor of Pharmacy (PharmD)', level: 'Undergraduate', faculty: 'School of Pharmacy', durationYears: 6 },
        { name: 'BSc. Medical Laboratory Science', level: 'Undergraduate', faculty: 'Allied Health Sciences', durationYears: 4 },
        { name: 'BSc. Nursing / Midwifery', level: 'Undergraduate', faculty: 'Nursing and Midwifery', durationYears: 4 },
        { name: 'BSc. Public Health', level: 'Undergraduate', faculty: 'School of Public Health', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in English, Core Maths, Integrated Science',
        'Credits (A1-C6) in relevant science electives: Chemistry, Physics, Biology, Elective Maths',
        'Medicine cutoff typically Aggregate 6-8; Nursing cutoff 8-12'
      ],
      matureApplicants: ['25+ years old with health background or pass mature exams'],
      diplomaHndHolders: ['Diploma in Nursing/Health sciences for degree top-up'],
      internationalApplicants: ['Equivalent secondary school science credentials verified by GTEC'],
      specialNotes: ['Health verification and interview required for clinical programmes.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Medicine (MBChB)', degreeType: 'MBChB', faculty: 'School of Medicine', cutOffPoint: 7, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'Doctor of Pharmacy (PharmD)', degreeType: 'PharmD', faculty: 'School of Pharmacy', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Medical Laboratory Science', degreeType: 'BSc', faculty: 'Allied Health', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Nursing', degreeType: 'BSc', faculty: 'Nursing & Midwifery', cutOffPoint: 9, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase e-voucher at GCB Bank, Zenith Bank, or Ghana Post.',
      'Log into apps.uhas.edu.gh/admissions.',
      'Complete online form with personal, educational, and programme choices.',
      'Upload passport picture and submit online.'
    ],
    requiredDocuments: [
      'WASSCE results slip',
      'Ghana Card Number',
      'Passport photo',
      'Printed application summary'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-umat-tarkwa',
    slug: 'university-of-mines-and-technology',
    name: 'University of Mines and Technology',
    shortName: 'UMaT',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/categories/internships.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Premier mining, engineering, and technology university in West Africa, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Western',
      city: 'Tarkwa',
      townOrSubCity: 'Tarkwa / Essikado',
      campus: 'Tarkwa Main Campus & Essikado Railway Campus',
      address: 'P.O. Box 237, Tarkwa, Western Region, Ghana',
      postalAddress: 'P.O. Box 237, Tarkwa, Ghana',
      gpsDigitalAddress: 'WS-0034-7820',
    },
    contact: {
      mainPhone: ['+233 312 320 324', '+233 312 320 280'],
      admissionsPhone: ['+233 312 320 324'],
      mainEmail: ['registrar@umat.edu.gh'],
      admissionsEmail: ['admissions@umat.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.umat.edu.gh',
    admissionsPageUrl: 'https://www.umat.edu.gh/admissions',
    applicationPortalUrl: 'https://portal.umat.edu.gh/apply',
    programmesCatalogueUrl: 'https://www.umat.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'UMaT admissions open for engineering and technology. e-Vouchers are available at GCB, Ecobank, Zenith Bank, CalBank, and via USSD *887#.',
    admissionCycles: [
      {
        id: 'umat-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BSc Engineering & Applied Science Programmes',
        description: 'Mining, Petroleum, Geomatic, Electrical, Mechanical, Renewable Energy, and Computer Science & Engineering.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 220,
          voucherVendor: 'GCB Bank, Ecobank, Zenith Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢220 for Ghanaian applicants.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE credits in English, Core Maths, Integrated Science',
          'Credits in Elective Maths, Physics, and Chemistry (for engineering)'
        ],
        targetAudience: 'Science students passionate about engineering and natural resources',
        applicationPortalUrl: 'https://portal.umat.edu.gh/apply',
      }
    ],
    programmesSummary: {
      undergraduateCount: 40,
      postgraduateCount: 30,
      faculties: [
        'Faculty of Mining and Minerals Technology',
        'Faculty of Engineering (Electrical, Mechanical, Computer)',
        'Faculty of Integrated Management Science',
        'School of Petroleum Studies'
      ],
      featuredProgrammes: [
        { name: 'BSc. Mining Engineering', level: 'Undergraduate', faculty: 'Mining Technology', durationYears: 4 },
        { name: 'BSc. Petroleum Engineering', level: 'Undergraduate', faculty: 'Petroleum Studies', durationYears: 4 },
        { name: 'BSc. Computer Science and Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BSc. Electrical and Electronic Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in Core Maths, English, Integrated Science',
        'Credits (A1-C6) in Elective Maths, Physics, Chemistry',
        'Cutoff aggregate 24 or better for engineering'
      ],
      matureApplicants: ['25+ years old with technical experience, entrance exam required'],
      diplomaHndHolders: ['HND in engineering for Level 200/300 top-up'],
      internationalApplicants: ['A-Levels or equivalent with high grades in Mathematics and Physics'],
      specialNotes: ['Elective Mathematics and Physics are mandatory for all engineering programmes.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BSc. Petroleum Engineering', degreeType: 'BSc', faculty: 'Petroleum Studies', cutOffPoint: 10, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Mining Engineering', degreeType: 'BSc', faculty: 'Mining Technology', cutOffPoint: 11, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Science and Engineering', degreeType: 'BSc', faculty: 'Engineering', cutOffPoint: 11, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase UMaT e-voucher at GCB, Ecobank, Zenith Bank or via *887#.',
      'Log into portal.umat.edu.gh/apply.',
      'Complete online biodata and academic choices, then submit.'
    ],
    requiredDocuments: [
      'WASSCE results slip',
      'Ghana Card Number',
      'Passport photograph'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-upsa-accra',
    slug: 'university-of-professional-studies-accra',
    name: 'University of Professional Studies, Accra',
    shortName: 'UPSA',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/ghana_hero_professionals.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Public university combining academic excellence with professional business and law qualifications, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Greater Accra',
      city: 'Accra',
      townOrSubCity: 'Madina / Legon',
      campus: 'UPSA Campus, Madina, Accra',
      address: 'P.O. Box LG 149, Accra, Ghana',
      postalAddress: 'P.O. Box LG 149, Accra, Ghana',
      gpsDigitalAddress: 'GM-038-5182',
    },
    contact: {
      mainPhone: ['+233 302 500 721', '+233 302 500 722'],
      admissionsPhone: ['+233 302 500 722'],
      mainEmail: ['pro@upsamail.edu.gh'],
      admissionsEmail: ['admissions@upsamail.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.upsa.edu.gh',
    admissionsPageUrl: 'https://www.upsa.edu.gh/admissions',
    applicationPortalUrl: 'https://admissions.upsa.edu.gh',
    programmesCatalogueUrl: 'https://www.upsa.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'UPSA admissions for degree, diploma, professional courses (ICAG, ACCA, CIM), and law (LLB) are open. e-Vouchers available at Access Bank, Ecobank, CBG, or *887#.',
    admissionCycles: [
      {
        id: 'upsa-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Degree & Diploma Admissions',
        description: 'Accounting, Banking & Finance, Marketing, IT Management, Law, and Public Relations.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-28',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-28',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 220,
          voucherVendor: 'Access Bank, Ecobank, CBG & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢220 for Ghanaian undergraduate; GH¢250 for postgraduate.',
          isPublished: true,
        },
        eligibility: [
          'Credits in 3 core (English, Core Math, Science or Social Studies) and 3 electives',
          'Overall aggregate 24 or better for degrees; aggregate 30 for diplomas'
        ],
        targetAudience: 'SHS graduates and professional candidates',
        applicationPortalUrl: 'https://admissions.upsa.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 35,
      postgraduateCount: 25,
      faculties: [
        'Faculty of Accounting and Finance',
        'Faculty of Management Studies',
        'Faculty of Information Technology and Communication Studies',
        'UPSA Law School'
      ],
      featuredProgrammes: [
        { name: 'Bachelor of Laws (LLB)', level: 'Undergraduate', faculty: 'UPSA Law School', durationYears: 4 },
        { name: 'BSc. Accounting and Finance', level: 'Undergraduate', faculty: 'Accounting & Finance', durationYears: 4 },
        { name: 'BSc. Information Technology Management', level: 'Undergraduate', faculty: 'IT & Communication', durationYears: 4 },
        { name: 'BSc. Marketing', level: 'Undergraduate', faculty: 'Management Studies', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core subjects: English, Core Math, Science/Social Studies',
        'Credits (A1-C6) in 3 business, general arts, or science electives',
        'Aggregate 24 or better for degree programmes'
      ],
      matureApplicants: ['25+ years old and pass mature entrance examination'],
      diplomaHndHolders: ['HND/Diploma with Second Class Lower for Level 200/300'],
      internationalApplicants: ['High school diploma or A-Levels with GTEC evaluation'],
      specialNotes: ['Dual qualification: students can write professional exams (ICAG/ACCA/CIM) alongside their degree.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'Bachelor of Laws (LLB)', degreeType: 'LLB', faculty: 'UPSA Law School', cutOffPoint: 8, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Accounting and Finance', degreeType: 'BSc', faculty: 'Accounting & Finance', cutOffPoint: 12, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. IT Management', degreeType: 'BSc', faculty: 'IT & Communication', cutOffPoint: 14, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Buy e-voucher at Access Bank, Ecobank, CBG or dial *887#.',
      'Log into admissions.upsa.edu.gh with Serial Number and PIN.',
      'Complete online application form and upload passport picture.',
      'Submit and print application slip.'
    ],
    requiredDocuments: [
      'WASSCE results slip',
      'Ghana Card Number',
      'Passport photo',
      'Printed confirmation page'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-uenr-sunyani',
    slug: 'university-of-energy-and-natural-resources',
    name: 'University of Energy and Natural Resources',
    shortName: 'UENR',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/categories/grants.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Public university focusing on energy, engineering, environmental management, and natural resources, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Bono',
      city: 'Sunyani',
      townOrSubCity: 'Sunyani / Nsoatre',
      campus: 'Sunyani Main Campus & Nsoatre Campus',
      address: 'P.O. Box 214, Sunyani, Bono Region, Ghana',
      postalAddress: 'P.O. Box 214, Sunyani, Ghana',
      gpsDigitalAddress: 'BS-0015-8912',
    },
    contact: {
      mainPhone: ['+233 352 027 520', '+233 352 027 522'],
      admissionsPhone: ['+233 352 027 522'],
      mainEmail: ['info@uenr.edu.gh'],
      admissionsEmail: ['admissions@uenr.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.uenr.edu.gh',
    admissionsPageUrl: 'https://www.uenr.edu.gh/admissions',
    applicationPortalUrl: 'https://admissions.uenr.edu.gh',
    programmesCatalogueUrl: 'https://www.uenr.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'UENR admissions are open. e-Vouchers are available at GCB Bank, CBG, Fidelity Bank, and via USSD *887#.',
    admissionCycles: [
      {
        id: 'uenr-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BSc Engineering, Energy & Sciences',
        description: 'Renewable Energy, Petroleum, Electrical, Computer Science, Environmental, and Natural Resources.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 220,
          voucherVendor: 'GCB Bank, CBG, Fidelity Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢220 for Ghanaian undergraduate.',
          isPublished: true,
        },
        eligibility: [
          'Credits (A1-C6) in 3 core: English, Core Math, Integrated Science',
          'Credits in 3 electives: Elective Math, Physics, Chemistry for engineering'
        ],
        targetAudience: 'Science students seeking careers in energy and sustainable technologies',
        applicationPortalUrl: 'https://admissions.uenr.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 45,
      postgraduateCount: 25,
      faculties: [
        'School of Engineering',
        'School of Sciences',
        'School of Natural Resources',
        'School of Agriculture and Technology'
      ],
      featuredProgrammes: [
        { name: 'BSc. Renewable Energy Engineering', level: 'Undergraduate', faculty: 'School of Engineering', durationYears: 4 },
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'School of Sciences', durationYears: 4 },
        { name: 'BSc. Petroleum Engineering', level: 'Undergraduate', faculty: 'School of Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits in English, Core Maths, Integrated Science',
        'Credits in relevant Elective subjects (Maths, Physics, Chemistry for engineering)',
        'Aggregate 24 or better for engineering; aggregate 30 for sciences'
      ],
      matureApplicants: ['25+ years old and pass entrance exam'],
      diplomaHndHolders: ['HND in related fields for Level 200/300'],
      internationalApplicants: ['Secondary school certificate evaluated by GTEC'],
      specialNotes: ['Strong background in mathematics and physics required for all engineering fields.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BSc. Renewable Energy Engineering', degreeType: 'BSc', faculty: 'Engineering', cutOffPoint: 13, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Science', degreeType: 'BSc', faculty: 'Sciences', cutOffPoint: 14, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase UENR e-voucher at GCB, CBG, Fidelity Bank or dial *887#.',
      'Log into admissions.uenr.edu.gh.',
      'Complete online form, upload passport photo, and submit.'
    ],
    requiredDocuments: ['WASSCE results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-gctu-accra',
    slug: 'ghana-communication-technology-university',
    name: 'Ghana Communication Technology University',
    shortName: 'GCTU',
    institutionType: 'Public Traditional University',
    coverImageUrl: '/images/institutions/ug_students_laptops.jpg',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'National ICT and engineering public university (formerly GTUC), established by Act 1022, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Greater Accra',
      city: 'Accra',
      townOrSubCity: 'Tesano',
      campus: 'Tesano Main Campus, Accra',
      address: 'PMB 100, Tesano, Accra, Ghana',
      postalAddress: 'PMB 100, Tesano, Accra, Ghana',
      gpsDigitalAddress: 'GA-167-2979',
    },
    contact: {
      mainPhone: ['+233 302 221 446', '+233 302 214 120'],
      admissionsPhone: ['+233 302 221 446'],
      mainEmail: ['info@gctu.edu.gh'],
      admissionsEmail: ['admissions@gctu.edu.gh'],
    },
    officialWebsiteUrl: 'https://www.gctu.edu.gh',
    admissionsPageUrl: 'https://www.gctu.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.gctu.edu.gh',
    programmesCatalogueUrl: 'https://www.gctu.edu.gh/academics',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'GCTU admissions for Computing, Telecom Engineering, Cyber Security, and Business are open. Vouchers at CBG, GCB Bank, Ecobank, or *887#.',
    admissionCycles: [
      {
        id: 'gctu-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'Undergraduate Degree & Diploma in ICT & Engineering',
        description: 'Computer Science, Software Engineering, Cybersecurity, Information Systems, Telecom Engineering.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-30',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-30',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'CBG, GCB Bank, Ecobank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for undergraduate.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE credits in English, Core Math, Integrated Science or Social Studies',
          'Credits in 3 electives: Elective Math/Physics/Elective ICT required for engineering and computing'
        ],
        targetAudience: 'Tech innovators, programmers, and engineering enthusiasts',
        applicationPortalUrl: 'https://apply.gctu.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 30,
      postgraduateCount: 20,
      faculties: [
        'Faculty of Computing and Information Systems',
        'Faculty of Engineering',
        'GCTU Business School'
      ],
      featuredProgrammes: [
        { name: 'BSc. Computer Science', level: 'Undergraduate', faculty: 'Computing', durationYears: 4 },
        { name: 'BSc. Cybersecurity', level: 'Undergraduate', faculty: 'Computing', durationYears: 4 },
        { name: 'BSc. Software Engineering', level: 'Undergraduate', faculty: 'Computing', durationYears: 4 },
        { name: 'BSc. Telecommunications Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core subjects: English, Core Math, Science/Social Studies',
        'Credits in 3 electives (Elective Math required for Computing & Engineering)',
        'Aggregate 24 or better for engineering; aggregate 30 for computing'
      ],
      matureApplicants: ['25+ years old with ICT background, entrance examination'],
      diplomaHndHolders: ['HND in IT/Computer Science/Electrical for top-up to Level 200/300'],
      internationalApplicants: ['Secondary school certificate evaluated by GTEC'],
      specialNotes: ['Hands-on laboratory practicals with telecom equipment.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BSc. Cybersecurity', degreeType: 'BSc', faculty: 'Computing', cutOffPoint: 14, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BSc. Computer Science', degreeType: 'BSc', faculty: 'Computing', cutOffPoint: 15, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase GCTU e-voucher at CBG, GCB Bank or via USSD *887#.',
      'Log into apply.gctu.edu.gh.',
      'Fill in applicant details, upload passport picture, and submit online.'
    ],
    requiredDocuments: ['WASSCE results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  }
];
