import { Institution } from '../../types/institution';

export const TECHNICAL_UNIVERSITIES: Institution[] = [
  {
    id: 'inst-atu-accra',
    slug: 'accra-technical-university',
    name: 'Accra Technical University',
    shortName: 'ATU',
    institutionType: 'Public Technical University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Ghana’s premier technical university, converted under the Technical Universities Act, 2016 (Act 922), fully accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Greater Accra',
      city: 'Accra',
      townOrSubCity: 'Barnes Road / Central Business District',
      campus: 'Barnes Road Main Campus & Kinbu Campus',
      address: 'Barnes Road, P.O. Box GP 561, Accra, Ghana',
      postalAddress: 'P.O. Box GP 561, Accra, Ghana',
      gpsDigitalAddress: 'GA-106-2580',
    },
    contact: {
      mainPhone: ['+233 332 095 371', '+233 332 095 372'],
      admissionsPhone: ['+233 332 095 372', '+233 543 264 911'],
      mainEmail: ['info@atu.edu.gh'],
      admissionsEmail: ['admissions@atu.edu.gh'],
    },
    officialWebsiteUrl: 'https://atu.edu.gh',
    admissionsPageUrl: 'https://atu.edu.gh/admissions',
    applicationPortalUrl: 'https://application.atu.edu.gh',
    programmesCatalogueUrl: 'https://atu.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'ATU 2026/2027 admissions for BTech, HND, Diploma, and Professional programmes are open. Purchase vouchers at Fidelity Bank, Zenith Bank, GCB, CBG, or via USSD *887#.',
    admissionCycles: [
      {
        id: 'atu-btech-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: '4-Year Bachelor of Technology (BTech) & HND Programmes',
        description: 'Direct entry into 4-year BTech, 3-year HND, and Diploma programmes in Engineering, Applied Sciences, Built Environment, and Business.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-25',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-25',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'Fidelity Bank, Zenith Bank, GCB, CBG & USSD *887#',
          ussdCode: '*887#',
          bankPartners: ['Fidelity Bank', 'Zenith Bank', 'GCB Bank', 'CBG'],
          notes: 'GH¢200 for BTech/HND; GH¢250 for MTech postgraduate.',
          isPublished: true,
        },
        eligibility: [
          'WASSCE credits (A1-C6) in 3 core: English, Core Math, Integrated Science/Social Studies',
          'Credits in 3 relevant Elective subjects',
          'TVET Certificate II holders and intermediate certificate holders with required passes',
          'WASSCE 2026 awaiting results candidates are accepted'
        ],
        targetAudience: 'SHS graduates, TVET technical school candidates, and HND seekers',
        applicationPortalUrl: 'https://application.atu.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 45,
      diplomaCount: 20,
      faculties: [
        'Faculty of Engineering (Mechanical, Civil, Electrical, Automotive, Computer)',
        'Faculty of Applied Sciences (Computer Science, SLT, Hotel Catering & Institutional Management - HCIM)',
        'Faculty of Built Environment (Building Technology, Interior Design)',
        'Faculty of Business Studies (Accountancy, Marketing, Procurement & Supply)',
        'Faculty of Applied Arts (Fashion Design and Textiles)'
      ],
      featuredProgrammes: [
        { name: 'BTech. Computer Science', level: 'Undergraduate', faculty: 'Applied Sciences', durationYears: 4 },
        { name: 'BTech. Electrical and Electronic Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Civil Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Fashion Design and Textiles', level: 'Undergraduate', faculty: 'Applied Arts', durationYears: 4 },
        { name: 'BTech. Procurement and Supply Chain Management', level: 'Undergraduate', faculty: 'Business Studies', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits (A1-C6) in 3 core: English, Core Maths, Science/Social Studies',
        'Credits (A1-C6) in 3 electives relevant to programme',
        'Overall aggregate of 36 or better for BTech; aggregate 39 for HND'
      ],
      matureApplicants: ['25+ years old and pass ATU Mature Entrance Exams in English, Math & General Paper'],
      diplomaHndHolders: ['HND holders in relevant field enter Level 300 for 2-year BTech Top-Up'],
      internationalApplicants: ['Foreign certificate with GTEC certification'],
      specialNotes: ['Technical and vocational subjects (TVET) are recognized on equal footing with WASSCE.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BTech. Computer Science', degreeType: 'BTech', faculty: 'Applied Sciences', cutOffPoint: 16, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BTech. Electrical/Electronic Engineering', degreeType: 'BTech', faculty: 'Engineering', cutOffPoint: 18, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BTech. Civil Engineering', degreeType: 'BTech', faculty: 'Engineering', cutOffPoint: 18, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase ATU e-voucher at Fidelity Bank, Zenith Bank, GCB, CBG or dial *887#.',
      'Access application.atu.edu.gh with Serial Number and PIN.',
      'Complete online form, select programme choices, and upload passport photo.',
      'Submit online and print application confirmation slip.'
    ],
    requiredDocuments: [
      'WASSCE / SSSCE / TVET Results slips',
      'Ghana Card Number',
      'Passport photograph with white background'
    ],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-kstu-kumasi',
    slug: 'kumasi-technical-university',
    name: 'Kumasi Technical University',
    shortName: 'KsTU',
    institutionType: 'Public Technical University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Premier technical university in the Ashanti Region, established 1954, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Ashanti',
      city: 'Kumasi',
      townOrSubCity: 'Amakom',
      campus: 'Main Amakom Campus & Adako Jachie Campus',
      address: 'P.O. Box 854, Kumasi, Ghana',
      postalAddress: 'P.O. Box 854, Kumasi, Ghana',
      gpsDigitalAddress: 'AK-039-4412',
    },
    contact: {
      mainPhone: ['+233 322 022 387', '+233 322 022 388'],
      admissionsPhone: ['+233 322 022 388'],
      mainEmail: ['info@kstu.edu.gh'],
      admissionsEmail: ['admissions@kstu.edu.gh'],
    },
    officialWebsiteUrl: 'https://kstu.edu.gh',
    admissionsPageUrl: 'https://kstu.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.kstu.edu.gh',
    programmesCatalogueUrl: 'https://kstu.edu.gh/academics/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'KsTU BTech, HND, and Diploma admissions are open. e-Vouchers can be purchased at GCB Bank, CBG, Fidelity Bank, Zenith Bank, or via USSD *887#.',
    admissionCycles: [
      {
        id: 'kstu-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BTech, HND & Professional Admissions',
        description: 'Automotive Engineering, Civil, Electrical, Computer Science, Pharmaceutical Sciences, and Business.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'GCB Bank, CBG, Fidelity Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for Ghanaian undergraduate.',
          isPublished: true,
        },
        eligibility: ['WASSCE/SSSCE/TVET passes in 3 core and 3 elective subjects, aggregate 36 or better'],
        targetAudience: 'SHS, TVET, and technical school leavers',
        applicationPortalUrl: 'https://apply.kstu.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 40,
      diplomaCount: 22,
      faculties: [
        'Faculty of Engineering and Technology',
        'Faculty of Applied Sciences and Technology',
        'Faculty of Built and Natural Environment',
        'Faculty of Business and Management Studies',
        'Faculty of Creative Arts and Technology'
      ],
      featuredProgrammes: [
        { name: 'BTech. Automotive Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Computer Science', level: 'Undergraduate', faculty: 'Applied Sciences', durationYears: 4 },
        { name: 'BTech. Pharmaceutical Sciences', level: 'Undergraduate', faculty: 'Applied Sciences', durationYears: 4 },
        { name: 'BTech. Building Technology', level: 'Undergraduate', faculty: 'Built Environment', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits in English, Core Maths, Science/Social Studies',
        'Credits in 3 electives',
        'Aggregate 36 or better'
      ],
      matureApplicants: ['25+ years old and pass mature entrance examination'],
      diplomaHndHolders: ['HND in relevant area for Level 300 top-up'],
      internationalApplicants: ['GTEC verified equivalent credentials'],
      specialNotes: ['Hands-on engineering workshops and industry attachment.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BTech. Computer Science', degreeType: 'BTech', faculty: 'Applied Sciences', cutOffPoint: 17, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BTech. Automotive Engineering', degreeType: 'BTech', faculty: 'Engineering', cutOffPoint: 19, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Buy e-voucher at GCB, CBG, Fidelity Bank or dial *887#.',
      'Log into apply.kstu.edu.gh.',
      'Complete online biodata, academic choices, and upload passport photo.',
      'Submit and print application slip.'
    ],
    requiredDocuments: ['WASSCE/TVET results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-ttu-takoradi',
    slug: 'takoradi-technical-university',
    name: 'Takoradi Technical University',
    shortName: 'TTU',
    institutionType: 'Public Technical University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Western Region’s premier technical university, specialized in petroleum, maritime, engineering and applied arts, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Western',
      city: 'Takoradi',
      townOrSubCity: 'Effia-Kuma / Takoradi',
      campus: 'Effia Campus & Akatakyi Campus',
      address: 'P.O. Box 256, Takoradi, Western Region, Ghana',
      postalAddress: 'P.O. Box 256, Takoradi, Ghana',
      gpsDigitalAddress: 'WS-201-1240',
    },
    contact: {
      mainPhone: ['+233 312 022 555', '+233 312 022 556'],
      admissionsPhone: ['+233 312 022 556'],
      mainEmail: ['info@ttu.edu.gh'],
      admissionsEmail: ['admissions@ttu.edu.gh'],
    },
    officialWebsiteUrl: 'https://ttu.edu.gh',
    admissionsPageUrl: 'https://ttu.edu.gh/admissions',
    applicationPortalUrl: 'https://portal.ttu.edu.gh/apply',
    programmesCatalogueUrl: 'https://ttu.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'TTU admissions for Petroleum Refining, Welding & Fabrication, Marine Engineering, and Business are open. e-Vouchers at GCB, Zenith, CalBank, or *887#.',
    admissionCycles: [
      {
        id: 'ttu-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BTech & HND Engineering, Oil & Gas Programmes',
        description: 'Petroleum, Welding, Marine, Mechanical, Civil, ICT, and Applied Sciences.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'GCB Bank, Zenith Bank, CalBank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for undergraduate.',
          isPublished: true,
        },
        eligibility: ['WASSCE/SSSCE/TVET passes in 3 core and 3 electives, aggregate 36 or better'],
        targetAudience: 'SHS and TVET graduates',
        applicationPortalUrl: 'https://portal.ttu.edu.gh/apply',
      }
    ],
    programmesSummary: {
      undergraduateCount: 38,
      diplomaCount: 20,
      faculties: [
        'Faculty of Engineering (Petroleum, Marine, Mechanical, Electrical, Civil)',
        'Faculty of Applied Arts and Technology (Sculpture, Ceramics, Textiles)',
        'Faculty of Applied Science and Computing',
        'Faculty of Business Studies'
      ],
      featuredProgrammes: [
        { name: 'BTech. Petroleum Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Welding and Fabrication Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Marine Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: [
        'Credits in English, Core Maths, Integrated Science',
        'Credits in 3 relevant Elective subjects',
        'Aggregate 36 or better'
      ],
      matureApplicants: ['25+ years old and pass TTU entrance exams'],
      diplomaHndHolders: ['HND in relevant field for Level 300 top-up'],
      internationalApplicants: ['Evaluated by GTEC'],
      specialNotes: ['Hands-on industrial training in Takoradi oil and maritime hub.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BTech. Petroleum Engineering', degreeType: 'BTech', faculty: 'Engineering', cutOffPoint: 16, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BTech. Computer Science', degreeType: 'BTech', faculty: 'Computing', cutOffPoint: 18, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase TTU e-voucher at GCB, Zenith, CalBank or dial *887#.',
      'Log into portal.ttu.edu.gh/apply.',
      'Complete online form and submit.'
    ],
    requiredDocuments: ['WASSCE/TVET results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-cctu-capecoast',
    slug: 'cape-coast-technical-university',
    name: 'Cape Coast Technical University',
    shortName: 'CCTU',
    institutionType: 'Public Technical University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Public technical university in Central Region, specialized in mechanical, electrical, tourism and applied science, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Central',
      city: 'Cape Coast',
      townOrSubCity: 'Cape Coast',
      campus: 'CCTU Campus, Cape Coast',
      address: 'P.O. Box AD 50, Cape Coast, Ghana',
      postalAddress: 'P.O. Box AD 50, Cape Coast, Ghana',
      gpsDigitalAddress: 'CC-087-3210',
    },
    contact: {
      mainPhone: ['+233 332 133 050'],
      admissionsPhone: ['+233 332 133 050'],
      mainEmail: ['info@cctu.edu.gh'],
      admissionsEmail: ['admissions@cctu.edu.gh'],
    },
    officialWebsiteUrl: 'https://cctu.edu.gh',
    admissionsPageUrl: 'https://cctu.edu.gh/admissions',
    applicationPortalUrl: 'https://admissions.cctu.edu.gh',
    programmesCatalogueUrl: 'https://cctu.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'CCTU 2026/2027 admissions are open. e-Vouchers are available at GCB Bank, CBG, Zenith Bank, or via USSD *887#.',
    admissionCycles: [
      {
        id: 'cctu-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BTech & HND Engineering, Tourism & Business',
        description: 'Mechanical, Electrical, Civil Engineering, Tourism & Hospitality, Food Science, and Business.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'GCB Bank, CBG, Zenith Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for undergraduate.',
          isPublished: true,
        },
        eligibility: ['WASSCE/SSSCE/TVET passes in 3 core and 3 electives, aggregate 36 or better'],
        targetAudience: 'SHS and TVET candidates',
        applicationPortalUrl: 'https://admissions.cctu.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 30,
      diplomaCount: 18,
      faculties: [
        'School of Engineering',
        'School of Applied Sciences and Technology',
        'School of Built and Natural Environment',
        'School of Business and Management Studies'
      ],
      featuredProgrammes: [
        { name: 'BTech. Mechanical Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Tourism and Hospitality Management', level: 'Undergraduate', faculty: 'Applied Sciences', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: ['Credits in 3 core and 3 electives, aggregate 36 or better'],
      matureApplicants: ['25+ years old and pass entrance examination'],
      diplomaHndHolders: ['HND in relevant discipline for Level 300'],
      internationalApplicants: ['GTEC certified equivalency'],
      specialNotes: ['Hands-on technical modules.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BTech. Mechanical Engineering', degreeType: 'BTech', faculty: 'Engineering', cutOffPoint: 18, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase CCTU e-voucher at GCB, CBG, Zenith Bank or dial *887#.',
      'Log into admissions.cctu.edu.gh and submit online.'
    ],
    requiredDocuments: ['WASSCE/TVET results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-ktu-koforidua',
    slug: 'koforidua-technical-university',
    name: 'Koforidua Technical University',
    shortName: 'KTU',
    institutionType: 'Public Technical University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Eastern Region’s premier technical university, specialized in Mechatronics, Renewable Energy, Computing and Food Technology, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Eastern',
      city: 'Koforidua',
      townOrSubCity: 'Koforidua / Old Estate',
      campus: 'KTU Campus, Koforidua',
      address: 'P.O. Box KF 981, Koforidua, Eastern Region, Ghana',
      postalAddress: 'P.O. Box KF 981, Koforidua, Ghana',
      gpsDigitalAddress: 'EN-002-3914',
    },
    contact: {
      mainPhone: ['+233 342 020 930', '+233 342 020 931'],
      admissionsPhone: ['+233 342 020 931'],
      mainEmail: ['info@ktu.edu.gh'],
      admissionsEmail: ['admissions@ktu.edu.gh'],
    },
    officialWebsiteUrl: 'https://ktu.edu.gh',
    admissionsPageUrl: 'https://ktu.edu.gh/admissions',
    applicationPortalUrl: 'https://apply.ktu.edu.gh',
    programmesCatalogueUrl: 'https://ktu.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'KTU admissions open for Mechatronics, AI & Computing, Renewable Energy, and Food Tech. e-Vouchers at GCB, CBG, Fidelity Bank, Zenith Bank, or *887#.',
    admissionCycles: [
      {
        id: 'ktu-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BTech & HND Admissions in Engineering & Sciences',
        description: 'Mechatronics, Renewable Energy, Computer Science, Food Technology, and Biomedical Engineering.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'GCB Bank, CBG, Fidelity Bank & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for undergraduate.',
          isPublished: true,
        },
        eligibility: ['WASSCE/SSSCE/TVET passes in 3 core and 3 electives, aggregate 36 or better'],
        targetAudience: 'SHS and TVET candidates',
        applicationPortalUrl: 'https://apply.ktu.edu.gh',
      }
    ],
    programmesSummary: {
      undergraduateCount: 35,
      diplomaCount: 18,
      faculties: [
        'Faculty of Engineering (Mechatronics, Renewable Energy, Electrical, Mechanical)',
        'Faculty of Applied Science and Technology',
        'Faculty of Built and Natural Environment',
        'Faculty of Business and Management Studies'
      ],
      featuredProgrammes: [
        { name: 'BTech. Mechatronics Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Renewable Energy Systems Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 },
        { name: 'BTech. Computer Science', level: 'Undergraduate', faculty: 'Applied Science', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: ['Credits in 3 core and 3 electives, aggregate 36 or better'],
      matureApplicants: ['25+ years old and pass KTU mature exams'],
      diplomaHndHolders: ['HND in relevant field for Level 300'],
      internationalApplicants: ['Certified by GTEC'],
      specialNotes: ['State-of-the-art mechatronics laboratory training.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BTech. Mechatronics Engineering', degreeType: 'BTech', faculty: 'Engineering', cutOffPoint: 17, academicYear: '2025/2026', stream: 'Regular' },
      { programme: 'BTech. Computer Science', degreeType: 'BTech', faculty: 'Applied Science', cutOffPoint: 17, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase KTU e-voucher at GCB, CBG, Fidelity Bank or dial *887#.',
      'Log into apply.ktu.edu.gh and submit online form.'
    ],
    requiredDocuments: ['WASSCE/TVET results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  },
  {
    id: 'inst-htu-ho',
    slug: 'ho-technical-university',
    name: 'Ho Technical University',
    shortName: 'HTU',
    institutionType: 'Public Technical University',
    accreditationStatus: 'FULLY_ACCREDITED',
    accreditingBody: 'Ghana Tertiary Education Commission (GTEC)',
    accreditationDetails: 'Volta Region’s premier technical university, specialized in Hospitality, Agro-Enterprise, and Engineering, accredited by GTEC.',
    isChartered: true,
    location: {
      region: 'Volta',
      city: 'Ho',
      townOrSubCity: 'Ho',
      campus: 'HTU Campus, Ho',
      address: 'P.O. Box HP 217, Ho, Volta Region, Ghana',
      postalAddress: 'P.O. Box HP 217, Ho, Ghana',
      gpsDigitalAddress: 'VH-0010-9284',
    },
    contact: {
      mainPhone: ['+233 362 026 456'],
      admissionsPhone: ['+233 362 026 456'],
      mainEmail: ['info@htu.edu.gh'],
      admissionsEmail: ['admissions@htu.edu.gh'],
    },
    officialWebsiteUrl: 'https://htu.edu.gh',
    admissionsPageUrl: 'https://htu.edu.gh/admissions',
    applicationPortalUrl: 'https://apps.htu.edu.gh/admissions',
    programmesCatalogueUrl: 'https://htu.edu.gh/programmes',
    overallAdmissionStatus: 'OPEN',
    primaryAcademicYear: '2026/2027',
    highlightNotice: 'HTU admissions are open. e-Vouchers are available at GCB Bank, Zenith Bank, ADB, or via USSD *887#.',
    admissionCycles: [
      {
        id: 'htu-undergrad-2026',
        category: 'Undergraduate Regular',
        academicYear: '2026/2027',
        title: 'BTech & HND Admissions',
        description: 'Hospitality, Tourism, Agricultural Engineering, Computer Science, and Fashion Design.',
        applicationOpenDate: '2026-03-01',
        applicationCloseDate: '2026-11-20',
        originalDeadline: '2026-10-31',
        extendedDeadline: '2026-11-20',
        isExtended: true,
        status: 'OPEN',
        feeInfo: {
          amountGHS: 200,
          voucherVendor: 'GCB Bank, Zenith Bank, ADB & USSD *887#',
          ussdCode: '*887#',
          notes: 'GH¢200 for undergraduate.',
          isPublished: true,
        },
        eligibility: ['WASSCE/SSSCE/TVET passes in 3 core and 3 electives, aggregate 36 or better'],
        targetAudience: 'SHS and TVET candidates',
        applicationPortalUrl: 'https://apps.htu.edu.gh/admissions',
      }
    ],
    programmesSummary: {
      undergraduateCount: 28,
      diplomaCount: 16,
      faculties: [
        'Faculty of Engineering',
        'Faculty of Applied Sciences and Technology',
        'Faculty of Art and Design',
        'Faculty of Business'
      ],
      featuredProgrammes: [
        { name: 'BTech. Hospitality and Tourism Management', level: 'Undergraduate', faculty: 'Applied Sciences', durationYears: 4 },
        { name: 'BTech. Agricultural Engineering', level: 'Undergraduate', faculty: 'Engineering', durationYears: 4 }
      ]
    },
    entryRequirements: {
      generalWassce: ['Credits in 3 core and 3 electives, aggregate 36 or better'],
      matureApplicants: ['25+ years old and pass entrance exam'],
      diplomaHndHolders: ['HND in relevant field for Level 300 top-up'],
      internationalApplicants: ['GTEC certified'],
      specialNotes: ['Hands-on industrial attachments in hospitality and engineering.'],
      requirementsVaryByProgramme: true
    },
    publishedCutOffs: [
      { programme: 'BTech. Hospitality Management', degreeType: 'BTech', faculty: 'Applied Sciences', cutOffPoint: 18, academicYear: '2025/2026', stream: 'Regular' }
    ],
    applicationSteps: [
      'Purchase HTU e-voucher at GCB, Zenith Bank or dial *887#.',
      'Log into apps.htu.edu.gh/admissions and submit.'
    ],
    requiredDocuments: ['WASSCE/TVET results slip', 'Ghana Card Number', 'Passport photo'],
    verifiedBy: 'Opportunity Ghana Verification Desk via GTEC Master Directory',
    verifiedDate: '2026-10-01',
    lastUpdated: '2026-10-03',
    isFeatured: true
  }
];
