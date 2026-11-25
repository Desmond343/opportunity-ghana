/**
 * institutionProfiles.ts
 *
 * Verified institutional overview, history, mission/vision, academic philosophy,
 * postgraduate entry routes, and financial/fee guidance for every accredited
 * institution in the Opportunity Ghana GTEC Master Directory.
 */

import { Institution } from '../../types/institution';

export interface InstitutionProfileSupplement {
  establishedYear?: string;
  ownership: 'Public' | 'Private';
  tagline: string;
  history: string;
  mission: string;
  vision: string;
  academicFocus: string;
  educationalPhilosophy: string;
  specialisations: string[];
  strengths: string[];
  postgraduateRequirements?: string[];
  feesGuidance: {
    undergraduate: string;
    postgraduate?: string;
    international?: string;
    financialAid?: string;
  };
}

export const INSTITUTION_PROFILE_SUPPLEMENTS: Record<string, InstitutionProfileSupplement> = {
  'inst-ug-legon': {
    establishedYear: '1948',
    ownership: 'Public',
    tagline: 'Ghana’s premier collegiate research university at Legon, Accra.',
    history:
      'Founded in 1948 as the University College of the Gold Coast by Ordinance and granted full university status by an Act of Parliament in 1961, the University of Ghana is the country’s oldest and largest public university.',
    mission:
      'To create an enabling environment that makes the University of Ghana increasingly relevant to national and global development through cutting-edge research as well as high quality teaching and learning.',
    vision:
      'To become a world-class research-intensive university.',
    academicFocus:
      'Comprehensive research-led undergraduate, professional, and doctoral education across Health Sciences, Basic and Applied Sciences, Humanities, and Education.',
    educationalPhilosophy:
      'Collegiate governance combining rigorous disciplinary scholarship with multidisciplinary inquiry and public service.',
    specialisations: [
      'Medicine, Dentistry & Allied Health Sciences (Korle-Bu)',
      'Business, Finance & Economics (UGBS)',
      'Law & International Affairs',
      'Computer Science, Engineering & Agricultural Research'
    ],
    strengths: [
      'Houses four colleges including the College of Health Sciences at Korle-Bu Teaching Hospital',
      'Extensive global research centres including Noguchi Memorial Institute for Medical Research and WACCBIP',
      'Flexible academic pathways across Legon Main Campus, Accra City Campus, and Distance Education centres'
    ],
    postgraduateRequirements: [
      'Good first degree (typically at least Second Class Lower Division or equivalent CGPA) from a recognised university',
      'Official academic transcripts, degree certificate, and two academic or professional referee reports',
      'For MPhil and PhD programmes: a relevant Master’s or Honours degree and an approved research proposal plus selection interview'
    ],
    feesGuidance: {
      undergraduate:
        'Regular Ghanaian students pay government-subsidised Academic Facility User Fees (AFUF) and residential/departmental dues published annually per college; fee-paying and parallel streams carry higher tuition.',
      postgraduate:
        'Postgraduate tuition varies by faculty, taught Master’s vs research MPhil/PhD, and regular vs executive/weekend mode.',
      international:
        'International applicants pay international student tuition schedules quoted in US dollars per academic year.',
      financialAid:
        'UG Students Financial Aid Office administers merit and need-based awards alongside Ghana Scholarships Authority, GETFund, and Mastercard Foundation support.'
    }
  },
  'inst-knust-kumasi': {
    establishedYear: '1951',
    ownership: 'Public',
    tagline: 'Ghana’s flagship science, engineering, and technology university in Kumasi.',
    history:
      'Established in 1951 as the Kumasi College of Technology and inaugurated in January 1952, KNUST gained full university status in 1961 and leads technological, engineering, and scientific innovation in West Africa.',
    mission:
      'To advance knowledge in science and technology through creating an environment for undertaking relevant research, quality teaching, entrepreneurship training, and community engagement to improve quality of life.',
    vision:
      'Building on KNUST’s leadership as the premier science and technology university in Ghana and to be among the top ranked globally.',
    academicFocus:
      'Six specialised colleges spanning Engineering, Science, Health Sciences, Art & Built Environment, Agriculture & Natural Resources, and Humanities & Social Sciences.',
    educationalPhilosophy:
      'Practical problem-solving, laboratory experimentation, industrial attachment, and entrepreneurial technology transfer.',
    specialisations: [
      'Civil, Mechanical, Electrical, Chemical & Computer Engineering',
      'Architecture, Planning & Built Environment',
      'Medicine, Pharmacy (PharmD) & Biomedical Sciences',
      'Agriculture, Renewable Natural Resources & Agribusiness'
    ],
    strengths: [
      'Six collegiate campuses plus Obuasi Campus and Institute of Distance Learning (IDL) centres nationwide',
      'Strong engineering design studios, teaching hospital partnerships (KATH), and science parks',
      'Wide portfolio of professionally accredited engineering, pharmacy, and architecture programmes'
    ],
    postgraduateRequirements: [
      'Recognised Bachelor’s degree (minimum Second Class Lower; First or Second Class Upper preferred for MPhil)',
      'Academic transcripts, two referee letters, and statement of purpose or research concept',
      'Entrance interview or department assessment for MPhil, MSc, MBA, and PhD tracks'
    ],
    feesGuidance: {
      undergraduate:
        'Regular Ghanaian students pay statutory Academic Facility User Fees published per college; fee-paying options are available for qualified candidates outside regular cut-offs.',
      postgraduate:
        'Postgraduate fees vary by college and study mode (regular research vs IDL distance/weekend).',
      international:
        'International applicants follow published foreign fee schedules in USD.',
      financialAid:
        'Support is accessible via KNUST Student Financial Services, SONA/GNPC/GETFund scholarships, and college merit awards.'
    }
  },
  'inst-ucc-capecoast': {
    establishedYear: '1962',
    ownership: 'Public',
    tagline: 'Renowned coastal research and teacher-education university in Cape Coast.',
    history:
      'Established in October 1962 as a University College in special relationship with the University of Ghana to train graduate teachers, UCC attained independent university status in 1971 and has grown into a leading multidisciplinary research institution.',
    mission:
      'An equal opportunity university uniquely placed to provide quality education through comprehensive, liberal and professional programmes that challenge learners to be creative, innovative and morally responsible.',
    vision:
      'To have a university that is strongly positioned, with worldwide acclaim.',
    academicFocus:
      'Education studies, humanities, legal studies, business, health and allied sciences, agriculture, and coastal/marine sciences.',
    educationalPhilosophy:
      'Combining pedagogical mastery, ethical leadership, and high-impact empirical research.',
    specialisations: [
      'Education, Curriculum Studies & Teacher Training',
      'Medicine (MBChB), Optometry (OD), Nursing & Allied Health',
      'Law (LLB), Commerce & Hospitality Management',
      'Marine & Coastal Sciences and Nationwide Distance Education (CoDE)'
    ],
    strengths: [
      'One of Ghana’s largest College of Distance Education (CoDE) networks serving learners across all 16 regions',
      'Direct affiliation and mentorship role for multiple Colleges of Education across Ghana',
      'Coastal Cape Coast campus housing specialised medical, optometry, and business schools'
    ],
    postgraduateRequirements: [
      'Recognised Bachelor’s degree with at least Second Class Lower Division (or equivalent)',
      'Official transcripts, certificates, and research proposal for MPhil/PhD applicants',
      'Two academic or professional referee reports'
    ],
    feesGuidance: {
      undergraduate:
        'Regular Ghanaian undergraduate fees are published per college ahead of each academic year; CoDE distance fees follow separate published schedules.',
      postgraduate:
        'School of Graduate Studies publishes tuition rates per programme and regular/sandwich track.',
      international:
        'International student tuition schedules apply for non-Ghanaian entrants.',
      financialAid:
        'Eligible students may apply for UCC financial aid, GETFund, and Students Loan Trust Fund (SLTF) support.'
    }
  },
  'inst-uew-winneba': {
    establishedYear: '1992',
    ownership: 'Public',
    tagline: 'Ghana’s dedicated national university for professional teacher education.',
    history:
      'Established in 1992 through the merger of seven diploma-awarding specialist colleges under PNDC Law 322 and granted full university charter status under Act 672 in 2004, UEW is Ghana’s foremost institution for training educators and education leaders.',
    mission:
      'To train competent professional teachers for all levels of education as well as conduct research, disseminate knowledge and contribute to educational policy and development.',
    vision:
      'To be an internationally reputable institution for teacher education and research.',
    academicFocus:
      'Professional teacher education, STEM education, Ghanaian languages, special education, creative arts, and educational leadership.',
    educationalPhilosophy:
      'Practitioner-focused pedagogy blending subject mastery with supervised teaching practicum and community engagement.',
    specialisations: [
      'Early Childhood, Basic & Secondary Science/Maths Education',
      'Ghanaian Languages & Applied Linguistics (Ajumako Campus)',
      'Special Education & Inclusive Pedagogy',
      'Creative Arts, Music, Theatre & Business Education'
    ],
    strengths: [
      'Multi-campus structure spanning Winneba and Ajumako (Languages)',
      'Extensive Institute for Distance and e-Learning (IDeL) study centres nationwide',
      'Direct mentorship and affiliation with public Colleges of Education'
    ],
    postgraduateRequirements: [
      'Recognised first degree (Second Class Lower or better) in Education or relevant discipline',
      'PGDE/M.Ed/MPhil candidates submit transcripts, certificates, and teaching/professional references'
    ],
    feesGuidance: {
      undergraduate:
        'Publicly subsidised fees for regular Ghanaian undergraduate students; separate published schedules apply for sandwich and distance modes.',
      postgraduate:
        'Postgraduate fees are published by the School of Graduate Studies per programme.',
      financialAid:
        'Students may access SLTF student loans, GETFund, and institutional hardship support.'
    }
  },
  'inst-uds-tamale': {
    establishedYear: '1992',
    ownership: 'Public',
    tagline: 'Community-engaged multi-campus university serving Northern Ghana and beyond.',
    history:
      'Founded in May 1992 under PNDC Law 279 to blend academic work with community development across northern Ghana, UDS pioneered the signature Third Trimester Field Practical Programme (TTFPP).',
    mission:
      'To promote equitable and sustainable socio-economic transformation of communities through practically oriented, community-based, problem-solving, gender-sensitive and interactive research, teaching, learning and outreach.',
    vision:
      'To be a home of world-class pro-poor scholarship.',
    academicFocus:
      'Medicine, pharmacy, nursing, agriculture, food security, natural resources, and development-oriented social sciences.',
    educationalPhilosophy:
      'Problem-based learning and mandatory Third Trimester Field Practical Programme (TTFPP) placing students directly in rural communities.',
    specialisations: [
      'Medicine (MBChB), Pharmacy & Allied Health (Dungu Campus)',
      'Agriculture, Agribusiness & Food Security (Nyankpala Campus)',
      'Natural Resources, Climate & Environmental Management',
      'Development Communication & Interdisciplinary Studies'
    ],
    strengths: [
      'Signature community-based field training model recognised across West Africa',
      'Dedicated teaching hospital linkage with Tamale Teaching Hospital',
      'Strong agricultural research stations at Nyankpala'
    ],
    postgraduateRequirements: [
      'Recognised Bachelor’s degree with at least Second Class Lower Division',
      'Academic transcripts, referee reports, and research proposal for MPhil/PhD tracks'
    ],
    feesGuidance: {
      undergraduate:
        'Published annually per faculty for regular, fee-paying, and distance entrants.',
      postgraduate:
        'Graduate School publishes MSc, MPH, MPhil, and PhD schedules per academic year.',
      financialAid:
        'Students can access SLTF, GETFund, and development partner scholarships for agriculture and health.'
    }
  },
  'inst-uhas-ho': {
    establishedYear: '2011',
    ownership: 'Public',
    tagline: 'Ghana’s first and only public university dedicated solely to health sciences.',
    history:
      'Established by Act of Parliament (Act 828) in December 2011 with campuses in Ho and Hohoe, UHAS is uniquely focused on training doctors, pharmacists, nurses, midwives, and allied health specialists.',
    mission:
      'To provide quality educational opportunities to students and healthcare professionals, advance knowledge through scholarship and research, and provide patient care and services that improve health and quality of life.',
    vision:
      'A pre-eminent research and practically oriented health educational institution dedicated to community service.',
    academicFocus:
      'Exclusively health, clinical, biomedical, and public health disciplines.',
    educationalPhilosophy:
      'Vocational Training Programme (VTP) immersing every student in rural and regional hospital practice alongside classroom instruction.',
    specialisations: [
      'Medicine & Surgery (MBChB) and Physician Assistantship',
      'Doctor of Pharmacy (PharmD) & Pharmaceutical Sciences',
      'Nursing, Midwifery & Mental Health Nursing',
      'Public Health (Hohoe Campus), Nutrition, Dietetics & Medical Lab Science'
    ],
    strengths: [
      'Clinical affiliation with Ho Teaching Hospital and regional health facilities across Volta and Oti',
      'Mandatory Vocational Training Programme giving students early hands-on community health exposure',
      'Dedicated School of Public Health campus in Hohoe'
    ],
    postgraduateRequirements: [
      'Relevant Bachelor’s degree in Health Sciences, Medicine, Nursing, Pharmacy, or Biomedical Sciences',
      'Valid professional registration/licensing (where applicable for clinical postgraduate tracks)'
    ],
    feesGuidance: {
      undergraduate:
        'Government-subsidised regular Ghanaian fees plus published clinical practical/laboratory charges.',
      postgraduate:
        'Published annually by UHAS School of Graduate Studies.',
      financialAid:
        'Eligible students may apply for SLTF, GETFund, and Ghana Scholarships Authority health bursaries.'
    }
  },
  'inst-umat-tarkwa': {
    establishedYear: '1952',
    ownership: 'Public',
    tagline: 'West Africa’s specialised university for mining, petroleum, and engineering.',
    history:
      'Tracing its roots to 1952 as the Tarkwa Technical Institute and elevated to a full autonomous university by Act 677 in 2004, UMaT is West Africa’s premier centre of excellence for mining, minerals, petroleum, and applied engineering.',
    mission:
      'To provide higher education in mining, technology and related disciplines through effective teaching and learning; to promote knowledge through active research and to provide professional services to the mining and allied industries.',
    vision:
      'To be a Centre of Excellence in Ghana and Africa for producing world-class professionals in the fields of mining, technology and related disciplines.',
    academicFocus:
      'Mining, minerals, petroleum, geomatic, renewable energy, mechanical, electrical, and computer engineering.',
    educationalPhilosophy:
      'Rigorous quantitative engineering paired with compulsory industrial vacation attachments in Ghana’s mining and energy corridor.',
    specialisations: [
      'Mining Engineering, Minerals Engineering & Geological Engineering',
      'Petroleum Engineering & Refining (Essikado & Tarkwa)',
      'Geomatic Engineering & Environmental Safety',
      'Computer Science, Cyber Security & Renewable Energy Engineering'
    ],
    strengths: [
      'Located in Ghana’s historic Tarkwa mining hub with strong industry partnerships',
      'Second campus at Essikado (Sekondi-Takoradi) expanding railway and petroleum engineering',
      'High graduate absorption across mining, oil & gas, and engineering firms'
    ],
    postgraduateRequirements: [
      'Good first degree in Engineering, Geosciences, or Applied Sciences (minimum Second Class Lower)',
      'Official transcripts, two referees, and research proposal for MPhil/PhD tracks'
    ],
    feesGuidance: {
      undergraduate:
        'Published annually per engineering faculty for regular and fee-paying Ghanaian applicants.',
      postgraduate:
        'School of Postgraduate Studies publishes MSc, MPhil, and PhD fees each cycle.',
      financialAid:
        'GNPC Foundation, Ghana Chamber of Mines, Gold Fields, and Newmont scholarships frequently support UMaT engineering scholars.'
    }
  },
  'inst-upsa-accra': {
    establishedYear: '1965',
    ownership: 'Public',
    tagline: 'Merging university degrees with globally recognised professional qualifications.',
    history:
      'Founded in 1965 as the Institute of Professional Studies (IPS) and chartered by Act 850 in 2012 as UPSA, the university pioneered dual academic-and-professional education in Accra.',
    mission:
      'To provide and promote quality higher professional education and training in management and other related disciplines by leveraging a structured mix of scholarship with professionalism.',
    vision:
      'To be a world-class university, globally recognised for academic and professional excellence.',
    academicFocus:
      'Accounting, banking & finance, marketing, management, IT management, corporate communication, and law.',
    educationalPhilosophy:
      'Scholarship blended with professionalism — preparing students simultaneously for university degrees and bodies such as ICAG, ACCA, CIMA, CIM, and ICSA.',
    specialisations: [
      'Accounting, Finance, Auditing & Actuarial Science',
      'Bachelor of Laws (LLB)',
      'Marketing, Logistics & Public Relations',
      'Information Technology Management'
    ],
    strengths: [
      'Curriculum structured for exemptions and dual preparation alongside ICAG, ACCA, CIM, and CIMA',
      'Strong corporate linkages in Accra’s central business ecosystem',
      'Dedicated Law School and modern graduate business complex'
    ],
    postgraduateRequirements: [
      'Recognised Bachelor’s degree (Second Class Lower or better) or equivalent chartered professional qualification',
      'Relevant work experience for Executive MBA / MSc leadership programmes'
    ],
    feesGuidance: {
      undergraduate:
        'Published per faculty for regular, evening, and weekend streams; professional exam fees are separate.',
      postgraduate:
        'Graduate School publishes MBA, MSc, MPhil, and PhD tuition schedules annually.',
      financialAid:
        'Scholarships and bursaries are coordinated through UPSA Endowment Fund, GETFund, and SLTF.'
    }
  },
  'inst-uenr-sunyani': {
    establishedYear: '2011',
    ownership: 'Public',
    tagline: 'Advancing energy, climate science, and sustainable engineering in Ghana.',
    history:
      'Established by Act of Parliament (Act 830) in December 2011 in Sunyani, Bono Region, UENR trains scientists and engineers to address energy, natural resources, climate, and agricultural sustainability challenges.',
    mission:
      'To promote the development of human resources and skills required to solve critical energy and natural resources challenges of society and undertake interdisciplinary academic, research, and outreach programmes.',
    vision:
      'To become a world-class institution for generating, advancing and applying knowledge in energy and natural resource sciences.',
    academicFocus:
      'Renewable energy engineering, environmental sciences, computer science, forestry, wildlife, and sustainable agriculture.',
    educationalPhilosophy:
      'Interdisciplinary STEM education connecting laboratory science with environmental stewardship and renewable energy innovation.',
    specialisations: [
      'Renewable Energy, Electrical & Mechanical Engineering',
      'Petroleum, Fire & Safety Engineering',
      'Forestry, Climate Change & Natural Resources Management',
      'Computer Science, Data Science & Agribusiness'
    ],
    strengths: [
      'Hosts the Earth Observation Research and Innovation Centre (EORIC)',
      'Dedicated focus on clean energy, forestry, and environmental resilience',
      'Campuses in Sunyani, Nsoatre, and Dormaa Ahenkro'
    ],
    postgraduateRequirements: [
      'Recognised first degree in Science, Engineering, Agriculture, or Natural Resources',
      'Transcripts, academic references, and research proposal for MPhil/PhD programmes'
    ],
    feesGuidance: {
      undergraduate:
        'Published per school ahead of each academic year for regular and fee-paying Ghanaian applicants.',
      postgraduate:
        'School of Graduate Studies publishes MSc, MPhil, and PhD tuition details annually.',
      financialAid:
        'GETFund, SLTF, and energy-sector scholarships (e.g., GNPC) support eligible students.'
    }
  },
  'inst-gctu-accra': {
    establishedYear: '2005',
    ownership: 'Public',
    tagline: 'Ghana’s specialised public university for ICT, telecoms, and digital innovation.',
    history:
      'Originated as the Ghana Telecom Training Centre, launched as Ghana Technology University College in 2005/2006, and converted into a full public university by the GCTU Act, 2020 (Act 1022).',
    mission:
      'To deliver quality transnational education in technology and allied disciplines through cutting-edge research, practical skills training, and strategic industry partnerships.',
    vision:
      'To be a premier centre of excellence for information, communication, technology and allied disciplines in Africa.',
    academicFocus:
      'Software engineering, cybersecurity, telecommunications engineering, data science, IT business, and mobile systems.',
    educationalPhilosophy:
      'Hands-on technology labs, telecom industry certifications, and practical digital engineering.',
    specialisations: [
      'Cybersecurity & Digital Forensics',
      'Software Engineering & Mobile Computing',
      'Telecommunications & Computer Engineering',
      'Logistics, E-Commerce & IT Management'
    ],
    strengths: [
      'Purpose-built telecom and networking labs at Tesano Main Campus, Accra',
      'Strong focus on applied computing and cybersecurity careers',
      'Morning, evening, and weekend study flexibility'
    ],
    postgraduateRequirements: [
      'Recognised Bachelor’s degree in Computing, Engineering, or Management (Second Class Lower or better)',
      'Transcripts and supporting professional/academic references'
    ],
    feesGuidance: {
      undergraduate:
        'GCTU publishes annual fee schedules for regular and parallel/evening undergraduate tracks.',
      postgraduate:
        'Graduate School publishes MSc, MBA, MPhil, and PhD fee schedules annually.',
      financialAid:
        'Eligible students access SLTF loans, GETFund, and ICT merit scholarships.'
    }
  },
  'inst-atu-accra': {
    establishedYear: '1949',
    ownership: 'Public',
    tagline: 'Ghana’s pioneering technical university driving industry-ready engineering & business.',
    history:
      'Established in 1949 as a Technical School, later Accra Polytechnic, and converted to Accra Technical University under the Technical Universities Act, 2016 (Act 922), ATU is Ghana’s first technical university.',
    mission:
      'To provide progressive technological education, training, applied research and consultancy services for sustainable socio-economic development.',
    vision:
      'To be a technical university of global excellence in hands-on teaching and applied research.',
    academicFocus:
      'Applied engineering, computer science, built environment, hospitality/HCIM, fashion design, and business studies.',
    educationalPhilosophy:
      'Competency-based technical education (CBT) emphasising laboratory practicals and compulsory industrial attachment.',
    specialisations: [
      'Electrical, Mechanical, Civil & Automotive Engineering (BTech / HND)',
      'Computer Science, Networking & Science Laboratory Technology',
      'Hotel, Catering & Institutional Management (HCIM)',
      'Fashion Design, Textiles & Procurement/Accountancy'
    ],
    strengths: [
      'Located centrally in Accra with direct access to industrial attachment partners',
      'Offers structured 4-year BTech, 3-year HND, 2-year BTech Top-Up, and Diploma pathways',
      'Accepts both WASSCE and TVET Certificate II qualifications'
    ],
    postgraduateRequirements: [
      'Relevant BTech or BSc degree (Second Class Lower or better) for Master of Technology (MTech) programmes'
    ],
    feesGuidance: {
      undergraduate:
        'ATU publishes annual fee schedules covering BTech, HND, and Diploma programmes (morning, evening, and weekend).',
      postgraduate:
        'MTech tuition schedules are published annually by the School of Research and Graduate Studies.',
      financialAid:
        'Accessible through SLTF, GETFund, and TVET/industry sponsorships.'
    }
  },
  'inst-kstu-kumasi': {
    establishedYear: '1954',
    ownership: 'Public',
    tagline: 'Ashanti’s flagship technical university for engineering, pharmaceutical & applied tech.',
    history:
      'Founded in 1954 as Kumasi Technical Institute, upgraded to Kumasi Polytechnic in 1992, and elevated to Kumasi Technical University under Act 922 in 2016.',
    mission:
      'To provide higher education and hands-on training in engineering, science, technology, entrepreneurship, and commerce through applied research and innovation.',
    vision:
      'To be a world-class technical university dedicated to excellence in teaching, applied research and entrepreneurship training.',
    academicFocus:
      'Automotive and mechanical engineering, pharmaceutical sciences, built environment, computing, and business.',
    educationalPhilosophy:
      'Industry-aligned technical mastery fostering entrepreneurship and job creation.',
    specialisations: [
      'Automotive, Mechanical, Civil & Chemical Engineering',
      'Dispensing Technology & Pharmaceutical Sciences',
      'Computer Science & Information Technology',
      'Building Technology, Fashion & Accountancy'
    ],
    strengths: [
      'Main Amakom campus in Kumasi and expanding Adako Jachie engineering campus',
      'Strong incubation and entrepreneurship support alongside engineering workshops',
      'Clear progression pathways from TVET/Certificate to HND, BTech, and MTech'
    ],
    postgraduateRequirements: [
      'Relevant BTech/BSc degree (minimum Second Class Lower) for Master of Technology (MTech) admissions'
    ],
    feesGuidance: {
      undergraduate:
        'Annual tuition schedules published on kstu.edu.gh for BTech, HND, and Non-Tertiary/Access programmes.',
      financialAid:
        'SLTF student loans and GETFund scholarships are available to eligible Ghanaian students.'
    }
  },
  'inst-ttu-takoradi': {
    establishedYear: '1954',
    ownership: 'Public',
    tagline: 'Western Region’s hub for petroleum, marine, welding, and applied engineering.',
    history:
      'Established in 1954 as Government Technical Institute, upgraded to Takoradi Polytechnic in 1992, and converted to Takoradi Technical University in 2016 under Act 922.',
    mission:
      'To provide career-focused education and skills training to meet industry demand in engineering, energy, applied arts, and commerce.',
    vision:
      'To be a premier centre of technical excellence in Africa.',
    academicFocus:
      'Oil & gas engineering, welding & fabrication, marine engineering, civil/mechanical engineering, applied arts, and business.',
    educationalPhilosophy:
      'Hands-on technical proficiency directly aligned with Ghana’s maritime, railway, and oil & gas industries.',
    specialisations: [
      'Petroleum, Marine & Welding/Fabrication Engineering',
      'Electrical, Mechanical & Civil Engineering',
      'Graphic Design, Textiles, Sculpture & Ceramics',
      'ICT, Accounting & Logistics'
    ],
    strengths: [
      'Strategic location in Takoradi supporting oil, gas, port, and marine industry placements',
      'Specialized welding and fabrication workshops meeting international industry standards',
      'Multi-campus facilities across Effia and Akatakyi'
    ],
    feesGuidance: {
      undergraduate:
        'TTU publishes annual fee structures for BTech, HND, and Diploma programmes on ttu.edu.gh.',
      financialAid:
        'Students may apply to SLTF, GETFund, and Western Region energy/corporate bursaries.'
    }
  },
  'inst-cctu-capecoast': {
    establishedYear: '1984',
    ownership: 'Public',
    tagline: 'Central Region’s technical university for engineering, hospitality, and applied science.',
    history:
      'Established in 1984 as Cape Coast Polytechnic, elevated to tertiary status in 1992, and converted to Cape Coast Technical University under the Technical Universities Act, 2016 (Act 922).',
    mission:
      'To provide quality career-focused technological education, training, and research for national development.',
    vision:
      'To become a world-class technical university known for applied research, entrepreneurship, and innovation.',
    academicFocus:
      'Mechanical/electrical/civil engineering, renewable energy, tourism & hospitality, food technology, and management.',
    educationalPhilosophy:
      'Practical, competency-driven instruction connecting classroom theory with regional industry and hospitality enterprises.',
    specialisations: [
      'Mechanical, Electrical & Civil Engineering',
      'Tourism, Food Science & Hospitality Management',
      'Building Technology & Statistics',
      'Accountancy & Procurement Management'
    ],
    strengths: [
      'Close linkage with Central Region’s heritage, tourism, and hospitality sector',
      'BTech, HND, and BTech Top-Up progression tracks for WASSCE and TVET graduates'
    ],
    feesGuidance: {
      undergraduate:
        'Published annually per school on cctu.edu.gh for regular and weekend streams.',
      financialAid:
        'Eligible students can access SLTF and GETFund educational funding.'
    }
  },
  'inst-ktu-koforidua': {
    establishedYear: '1997',
    ownership: 'Public',
    tagline: 'Driving mechatronics, renewable energy, and computing innovation in Eastern Region.',
    history:
      'Founded in 1997 as Koforidua Polytechnic and converted into Koforidua Technical University in 2016 under Act 922.',
    mission:
      'To provide high-level career-focused education and applied research in engineering, science, technology, and business.',
    vision:
      'To be a reference technical university of distinction in teaching, applied research, and innovation.',
    academicFocus:
      'Mechatronics, renewable energy systems, automotive/electrical engineering, computer science, and food technology.',
    educationalPhilosophy:
      'Hands-on engineering labs and applied technology training empowering graduates for industry and enterprise.',
    specialisations: [
      'Mechatronics & Biomedical Engineering',
      'Renewable Energy Systems Engineering',
      'Computer Science & Network Management',
      'Food & Post-Harvest Technology and Accountancy'
    ],
    strengths: [
      'Pioneering BTech programmes in Mechatronics and Renewable Energy Systems Engineering',
      'Modern engineering workshops and applied science laboratories in Koforidua'
    ],
    feesGuidance: {
      undergraduate:
        'KTU publishes BTech, HND, and Diploma fee schedules annually on ktu.edu.gh.',
      financialAid:
        'SLTF student loans and GETFund bursaries are available to qualifying Ghanaian students.'
    }
  },
  'inst-htu-ho': {
    establishedYear: '1968',
    ownership: 'Public',
    tagline: 'Volta Region’s technical university advancing agro-engineering, hospitality & design.',
    history:
      'Established in 1968 as a Technical Institute, upgraded to Ho Polytechnic in 1993, and converted to Ho Technical University in 2016 under Act 922.',
    mission:
      'To train competent, innovative, and entrepreneurial middle and high-level manpower through practical skills and applied research.',
    vision:
      'To be a premier technical university in the sub-region noted for practical education and sustainable community impact.',
    academicFocus:
      'Agricultural & mechanical engineering, hospitality & tourism management, industrial art, and business studies.',
    educationalPhilosophy:
      'Applied technical training rooted in experiential workshops, agro-enterprise, and sustainable regional development.',
    specialisations: [
      'Agricultural, Mechanical, Civil & Electrical Engineering',
      'Hospitality & Tourism Management',
      'Fashion Design, Industrial Art & Textiles',
      'Computer Science, Accounting & Marketing'
    ],
    strengths: [
      'Recognised hospitality training facilities and agro-engineering initiatives in the Volta Region',
      'Flexible BTech, HND, and Top-Up programmes accepting WASSCE and TVET routes'
    ],
    feesGuidance: {
      undergraduate:
        'Annual tuition and facility fee schedules are published on htu.edu.gh.',
      financialAid:
        'Eligible applicants may access SLTF and GETFund financing.'
    }
  },
  'inst-ashesi-berekuso': {
    establishedYear: '2002',
    ownership: 'Private',
    tagline: 'Selective private chartered university educating ethical, entrepreneurial leaders.',
    history:
      'Founded in 2002 by Patrick Awuah Jr. and awarded a Presidential Charter in 2018, Ashesi University at Berekuso blends a liberal arts core with rigorous engineering, computing, and business programmes.',
    mission:
      'To propel an African renaissance by educating ethical, entrepreneurial leaders in Africa.',
    vision:
      'An African renaissance driven by a new generation of ethical, entrepreneurial leaders.',
    academicFocus:
      'Computer Science, Management Information Systems, Business Administration, and Computer, Electrical, Mechanical & Mechatronics Engineering.',
    educationalPhilosophy:
      'Small seminar classes, student-governed Honor Code, multidisciplinary liberal arts core, and project-based engineering.',
    specialisations: [
      'Computer Science & Management Information Systems',
      'Electrical, Computer, Mechanical & Mechatronics Engineering',
      'Business Administration & Entrepreneurship'
    ],
    strengths: [
      'Presidential Charter granted in 2018 with selective holistic admissions review',
      'Significant financial aid and Mastercard Foundation Scholars support for high-need applicants',
      'High graduate career placement and startup venture creation across Africa'
    ],
    postgraduateRequirements: [
      'Relevant Bachelor’s degree and strong quantitative/leadership readiness for Executive/Master’s programmes (e.g., Mechatronics/MBA collaborations)'
    ],
    feesGuidance: {
      undergraduate:
        'Published annually in USD/GHS equivalent on ashesi.edu.gh/admissions/tuition-and-fees, covering tuition and optional residential/meal plans.',
      financialAid:
        'Over 45% of students receive need-based financial aid or full Mastercard Foundation Scholarships covering tuition, housing, and stipends.'
    }
  },
  'inst-central-accra': {
    establishedYear: '1998',
    ownership: 'Private',
    tagline: 'Ghana’s largest chartered private university with flagship Pharmacy, Law & Business schools.',
    history:
      'Originated in 1988 as a ministerial training institute, incorporated as Central University College in 1998, and granted a Presidential Charter in 2016 as Central University.',
    mission:
      'To provide transformative, faith-informed higher education that equips graduates with integrity, professional excellence, and service leadership.',
    vision:
      'To be a vibrant Christian university that raises leaders of integrity and excellence.',
    academicFocus:
      'Pharmacy, nursing & physician assistantship, law, architecture, civil engineering, computing, and business.',
    educationalPhilosophy:
      'Faith, integrity, and academic excellence across professional health, legal, engineering, and management disciplines.',
    specialisations: [
      'Doctor of Pharmacy (PharmD) & Pharmaceutical Sciences',
      'Nursing & Physician Assistantship Studies',
      'Bachelor of Laws (LLB) & Business Administration',
      'Architecture & Civil Engineering'
    ],
    strengths: [
      'Presidential Charter (2016) with campuses in Miotso (main), Mataheko, and Kumasi',
      'Nationally accredited PharmD, Nursing, and Law programmes',
      'Flexible morning, evening, and weekend study sessions'
    ],
    postgraduateRequirements: [
      'Recognised first degree (minimum Second Class Lower) for MBA, MSc, MA, and MPhil programmes'
    ],
    feesGuidance: {
      undergraduate:
        'Published per faculty and session (regular vs evening/weekend) on central.edu.gh.',
      postgraduate:
        'Central Graduate School publishes semester fee schedules per programme.',
      financialAid:
        'Merit bursaries and flexible instalment payment plans are available through Finance Office.'
    }
  },
  'inst-gimpa-accra': {
    establishedYear: '1961',
    ownership: 'Public',
    tagline: 'Specialised public university for law, governance, business, and executive leadership.',
    history:
      'Established in 1961 as the Institute of Public Administration by Ghana and the United Nations, and transformed by the GIMPA Act, 2004 (Act 676) into an autonomous self-financing public tertiary institution.',
    mission:
      'To maintain a centre of excellence for training in public and business administration, leadership, management, technology, and law.',
    vision:
      'To be a world-class centre of excellence for training, consultancy and research in leadership, management and administration.',
    academicFocus:
      'Law (3-year Post-First Degree & 4-year LLB), public administration, executive governance, business, and applied technology.',
    educationalPhilosophy:
      'Executive-calibre pedagogy blending rigorous legal/management theory with public policy and corporate practice.',
    specialisations: [
      'GIMPA Law School (LLB Post-First Degree & Regular)',
      'Public Service, Governance & Public Policy (MPA / MPP)',
      'Business Administration, Finance & Project Management',
      'Computer Science & Information Technology'
    ],
    strengths: [
      'Renowned Post-First Degree 3-Year LLB and executive graduate programmes',
      'Greenhill Main Campus in Achimota, Accra plus Kumasi, Takoradi, and Tema campuses',
      'Self-financing public university model known for timely, uninterrupted academic calendars'
    ],
    postgraduateRequirements: [
      'Good first degree (Second Class Lower or better) from an accredited university',
      'For Executive MBA / MPA: relevant work/management experience plus academic transcripts and referee letters'
    ],
    feesGuidance: {
      undergraduate:
        'As a self-financing public institution under Act 676, GIMPA publishes full programme fees per semester on gimpa.edu.gh.',
      postgraduate:
        'Master’s, Executive MBA, and PhD schedules are published per school ahead of each intake.',
      financialAid:
        'Instalment payment plans and partner corporate/public-sector sponsorships are widely used.'
    }
  },
  'inst-princof-coe-ghana': {
    establishedYear: '1909–2018',
    ownership: 'Public',
    tagline: 'National central admissions for all 46 GTEC-accredited Public Colleges of Education.',
    history:
      'Ghana’s 46 Public Colleges of Education—rooted in historic teacher seminaries—were upgraded to degree-awarding tertiary institutions under the Colleges of Education Act, 2012 (Act 847) and transition into 4-year BEd. programmes affiliated to UG, KNUST, UCC, UEW, and AAMUSTED.',
    mission:
      'To prepare competent, values-driven professional teachers equipped to transform early grade, primary, and junior high school learning across all 16 regions of Ghana.',
    vision:
      'A unified system of high-performing teacher education colleges producing world-class basic school educators.',
    academicFocus:
      '4-year Bachelor of Education (BEd) degrees in Early Grade, Upper Primary, and Junior High School subject specialisations.',
    educationalPhilosophy:
      'Supported Teaching in Schools (STS) combining college coursework with intensive classroom mentoring in partner basic schools.',
    specialisations: [
      'BEd. Early Childhood Education (KG–P3)',
      'BEd. Primary Education (P4–P6)',
      'BEd. JHS Science, Mathematics, ICT & Technical Skills',
      'BEd. JHS Ghanaian Languages, Social Studies & Vocational Skills'
    ],
    strengths: [
      'Degrees awarded directly by affiliated public mentoring universities (UCC, UEW, UG, KNUST, AAMUSTED)',
      'Centralised online admissions across all 46 public colleges with 3 college choices per voucher',
      'Government teacher trainee allowance support during academic semesters'
    ],
    feesGuidance: {
      undergraduate:
        'Approved government-regulated public college tuition, feeding, and academic fees; eligible trainees receive government trainee allowances.',
      financialAid:
        'Teacher trainees receive monthly government trainee allowance support and may access SLTF.'
    }
  },
  'inst-moh-nursing-ghana': {
    establishedYear: 'National MOH Secretariat',
    ownership: 'Public',
    tagline: 'Ministry of Health central portal for over 90 public Nursing & Health Training Colleges.',
    history:
      'Coordinated centrally by the Ministry of Health Health Training Institutions Secretariat in partnership with GTEC, the Nursing and Midwifery Council (NMC), and Allied Health Professions Council (AHPC) across all 16 regions.',
    mission:
      'To train skilled, compassionate nurses, midwives, psychiatric practitioners, and allied health professionals for Ghana’s national healthcare system.',
    vision:
      'A resilient, professionally licensed health workforce delivering safe, equitable healthcare across Ghana.',
    academicFocus:
      'Clinical Nursing (RGN), Midwifery (RM), Mental Health Nursing (RMN), Community Health Nursing, and Allied Health Diplomas.',
    educationalPhilosophy:
      'Structured classroom health sciences integrated with supervised clinical rotations at teaching, regional, and district hospitals.',
    specialisations: [
      'Registered General Nursing (RGN)',
      'Registered Midwifery (RM)',
      'Registered Mental Nursing (RMN) & Community Health Nursing',
      'Medical Laboratory, Disease Control, Nutrition & Allied Health Diplomas'
    ],
    strengths: [
      'Single centralised MOH admissions portal covering Korle-Bu, 37 Military, Pantang, Kumasi, Cape Coast, and 90+ accredited colleges',
      'Direct professional licensing pathway through NMC and AHPC',
      'Clinical placements across accredited public hospitals nationwide'
    ],
    feesGuidance: {
      undergraduate:
        'Ministry of Health approved public training college fee schedules published upon admission offer; trainees on eligible public tracks receive government trainee allowances.',
      financialAid:
        'Government nursing/health trainee allowances and SLTF support apply to eligible enrolled students.'
    }
  }
};
