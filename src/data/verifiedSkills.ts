import { Skill } from '../types/database';
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
