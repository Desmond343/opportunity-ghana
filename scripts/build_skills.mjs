import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_REAL_SKILLS } from '../src/data/verifiedSkills.js';
import { newAgricultureSkills } from './data_agriculture.mjs';
import { newVocationalSkills } from './data_vocational.mjs';
import { newHospitalitySkills } from './data_hospitality.mjs';
import { newBeautySkills } from './data_beauty.mjs';
import { newHealthSkills } from './data_health.mjs';
import { newEducationSkills } from './data_education.mjs';
import { newBusinessSkills } from './data_business.mjs';
import { newProfessionalSkills } from './data_professional.mjs';
import { newCreativeSkills } from './data_creative.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillsDir = path.resolve(__dirname, '../src/data/skills');

if (!fs.existsSync(skillsDir)) {
  fs.mkdirSync(skillsDir, { recursive: true });
}

// 1. Separate existing skills into updated categories
const techSkills = VERIFIED_REAL_SKILLS.filter(s => s.category === 'Technology & Digital');

const businessSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s =>
    s.category === 'Business & Entrepreneurship' || s.id === 'skill-practical-logistics'
  ).map(s => ({
    ...s,
    category: 'Business & Entrepreneurship'
  })),
  ...newBusinessSkills
];

const professionalSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s => s.category === 'Career & Professional'),
  ...newProfessionalSkills
];

const creativeSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s => s.category === 'Creative Arts & Media'),
  ...newCreativeSkills
];

const vocationalSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s =>
    s.category === 'Practical & Technical (TVET)' &&
    s.id !== 'skill-agri-biz' &&
    s.id !== 'skill-practical-logistics' &&
    s.id !== 'skill-practical-catering' &&
    s.id !== 'skill-practical-food-safety' &&
    s.id !== 'skill-practical-tourism' &&
    s.id !== 'skill-practical-cosmetology'
  ).map(s => ({
    ...s,
    category: 'Vocational & Technical Trades'
  })),
  ...newVocationalSkills
];

const agricultureSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s => s.id === 'skill-agri-biz').map(s => ({
    ...s,
    category: 'Agriculture & Agribusiness'
  })),
  ...newAgricultureSkills
];

const hospitalitySkills = [
  ...VERIFIED_REAL_SKILLS.filter(s =>
    s.id === 'skill-practical-catering' ||
    s.id === 'skill-practical-food-safety' ||
    s.id === 'skill-practical-tourism'
  ).map(s => ({
    ...s,
    category: 'Hospitality, Food & Tourism'
  })),
  ...newHospitalitySkills
];

const beautySkills = [
  ...VERIFIED_REAL_SKILLS.filter(s => s.id === 'skill-practical-cosmetology').map(s => ({
    ...s,
    category: 'Beauty & Personal Care'
  })),
  ...newBeautySkills
];

const healthSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s =>
    s.category === 'Education, Health & Social' &&
    s.id !== 'skill-edu-teaching' &&
    s.id !== 'skill-edu-edtech' &&
    s.id !== 'skill-edu-tutoring'
  ).map(s => ({
    ...s,
    category: 'Healthcare & Community'
  })),
  ...newHealthSkills
];

const educationSkills = [
  ...VERIFIED_REAL_SKILLS.filter(s =>
    s.id === 'skill-edu-teaching' ||
    s.id === 'skill-edu-edtech' ||
    s.id === 'skill-edu-tutoring'
  ).map(s => ({
    ...s,
    category: 'Education & Teaching'
  })),
  ...newEducationSkills
];

function writeCategoryFile(filename, varName, data) {
  const filePath = path.join(skillsDir, filename);
  const content = `import { Skill } from '../../types/database';\n\nexport const ${varName}: Skill[] = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote ${filename} with ${data.length} skills`);
}

writeCategoryFile('techSkills.ts', 'techSkills', techSkills);
writeCategoryFile('businessSkills.ts', 'businessSkills', businessSkills);
writeCategoryFile('professionalSkills.ts', 'professionalSkills', professionalSkills);
writeCategoryFile('creativeSkills.ts', 'creativeSkills', creativeSkills);
writeCategoryFile('vocationalSkills.ts', 'vocationalSkills', vocationalSkills);
writeCategoryFile('agricultureSkills.ts', 'agricultureSkills', agricultureSkills);
writeCategoryFile('hospitalitySkills.ts', 'hospitalitySkills', hospitalitySkills);
writeCategoryFile('beautySkills.ts', 'beautySkills', beautySkills);
writeCategoryFile('healthSkills.ts', 'healthSkills', healthSkills);
writeCategoryFile('educationSkills.ts', 'educationSkills', educationSkills);

const verifiedSkillsFile = path.resolve(__dirname, '../src/data/verifiedSkills.ts');
const verifiedSkillsContent = `import { Skill } from '../types/database';
import { techSkills } from './skills/techSkills';
import { businessSkills } from './skills/businessSkills';
import { professionalSkills } from './skills/professionalSkills';
import { creativeSkills } from './skills/creativeSkills';
import { vocationalSkills } from './skills/vocationalSkills';
import { agricultureSkills } from './skills/agricultureSkills';
import { hospitalitySkills } from './skills/hospitalitySkills';
import { beautySkills } from './skills/beautySkills';
import { healthSkills } from './skills/healthSkills';
import { educationSkills } from './skills/educationSkills';

export const VERIFIED_REAL_SKILLS: Skill[] = [
  ...techSkills,
  ...businessSkills,
  ...professionalSkills,
  ...creativeSkills,
  ...vocationalSkills,
  ...agricultureSkills,
  ...hospitalitySkills,
  ...beautySkills,
  ...healthSkills,
  ...educationSkills
];
`;

fs.writeFileSync(verifiedSkillsFile, verifiedSkillsContent, 'utf8');
console.log('Successfully updated src/data/verifiedSkills.ts!');
const total = techSkills.length + businessSkills.length + professionalSkills.length + creativeSkills.length + vocationalSkills.length + agricultureSkills.length + hospitalitySkills.length + beautySkills.length + healthSkills.length + educationSkills.length;
console.log(`TOTAL VERIFIED SKILLS IN LIBRARY: ${total}`);
