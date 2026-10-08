import { Skill, SkillStatus, Opportunity, Resource } from '../types/database';
import { VERIFIED_REAL_SKILLS } from '../data/verifiedSkills';
import { SKILL_CATEGORIES } from '../data/categories';
import { OpportunitiesService } from './opportunitiesService';
import { ResourcesService } from './resourcesService';
import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const SKILLS_STORAGE_KEY = 'opp_gh_skills_store';

function normalizeSkill(s: any): Skill {
  return {
    ...s,
    id: s.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
    name: s.name || 'Untitled Skill',
    slug: s.slug || (s.name ? s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'skill'),
    category: s.category || 'Technology & Digital',
    description: s.description || 'Essential workforce skill in Ghana.',
    level: s.level || 'Beginner',
    demandLevel: s.demandLevel || 'High',
    relatedSkills: Array.isArray(s.relatedSkills) ? s.relatedSkills : [],
    topCareers: Array.isArray(s.topCareers) ? s.topCareers : [],
    whatItIsUsedFor: Array.isArray(s.whatItIsUsedFor) ? s.whatItIsUsedFor : [],
    toolsAndSoftware: Array.isArray(s.toolsAndSoftware) ? s.toolsAndSoftware : [],
    certifications: Array.isArray(s.certifications) ? s.certifications : [],
    practicalProjects: Array.isArray(s.practicalProjects) ? s.practicalProjects : [],
    learningResources: Array.isArray(s.learningResources) ? s.learningResources : [],
    status: s.status || 'published',
    createdAt: s.createdAt || new Date().toISOString(),
    updatedAt: s.updatedAt || new Date().toISOString()
  };
}

export const SkillsService = {
  /**
   * Retrieves all skills from local store and verified defaults with deduplication
   */
  getAll(filters?: {
    category?: string;
    demandLevel?: string;
    level?: string;
    status?: string;
    search?: string;
  }): Skill[] {
    let list: Skill[] = [];

    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SKILLS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map(normalizeSkill);
          }
        }
      }
    } catch (e) {
      console.warn('[SkillsService] Error reading local skills cache:', e);
    }

    // Always merge in the comprehensive verified defaults if not already present
    const idMap = new Map<string, Skill>();
    const nameMap = new Map<string, Skill>();
    const slugMap = new Map<string, Skill>();

    // Seed with VERIFIED_REAL_SKILLS first
    for (const s of VERIFIED_REAL_SKILLS) {
      const norm = normalizeSkill(s);
      idMap.set(norm.id, norm);
      nameMap.set(norm.name.toLowerCase().trim(), norm);
      slugMap.set(norm.slug.toLowerCase().trim(), norm);
    }

    // Merge in custom or edited local skills
    for (const item of list) {
      const keyName = item.name.toLowerCase().trim();
      const keySlug = item.slug.toLowerCase().trim();

      if (idMap.has(item.id)) {
        // Overlay local edits onto verified skill if explicitly marked as custom edit
        const base = idMap.get(item.id)!;
        const isCustomEdit = (item as any).isCustom || (item as any).isUserEdited;
        const merged = isCustomEdit ? { ...base, ...item } : { ...item, ...base };
        idMap.set(item.id, merged);
        nameMap.set(keyName, merged);
        slugMap.set(keySlug, merged);
      } else if (!nameMap.has(keyName) && !slugMap.has(keySlug)) {
        // Genuinely new custom skill added by admin
        idMap.set(item.id, item);
        nameMap.set(keyName, item);
        slugMap.set(keySlug, item);
      }
    }

    let allSkills = Array.from(idMap.values());

    // Apply filters
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        allSkills = allSkills.filter(s => (s.status || 'published') === filters.status);
      } else if (!filters.status) {
        // By default, for public users, only return published skills
        allSkills = allSkills.filter(s => !s.status || s.status === 'published');
      }

      if (filters.category && filters.category !== 'All' && filters.category !== 'All Categories') {
        allSkills = allSkills.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
      }

      if (filters.demandLevel && filters.demandLevel !== 'All') {
        allSkills = allSkills.filter(s => s.demandLevel === filters.demandLevel);
      }

      if (filters.level && filters.level !== 'All') {
        allSkills = allSkills.filter(s => s.level === filters.level);
      }

      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        allSkills = allSkills.filter(s => {
          return (
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            (s.detailedDescription && s.detailedDescription.toLowerCase().includes(q)) ||
            (s.category && s.category.toLowerCase().includes(q)) ||
            (s.whyUsefulInGhana && s.whyUsefulInGhana.toLowerCase().includes(q)) ||
            s.relatedSkills.some(r => r.toLowerCase().includes(q)) ||
            (s.topCareers && s.topCareers.some(c => c.toLowerCase().includes(q))) ||
            (s.toolsAndSoftware && s.toolsAndSoftware.some(t => t.toLowerCase().includes(q))) ||
            (s.certifications && s.certifications.some(c => c.toLowerCase().includes(q)))
          );
        });
      }
    }

    return allSkills;
  },

  /**
   * Retrieves single skill by URL slug
   */
  getBySlug(slug: string): Skill | null {
    if (!slug) return null;
    const clean = slug.toLowerCase().trim();
    const all = this.getAll({ status: 'all' });
    return (
      all.find(s => s.slug.toLowerCase().trim() === clean || s.id.toLowerCase().trim() === clean) ||
      null
    );
  },

  /**
   * Retrieves single skill by ID
   */
  getById(id: string): Skill | null {
    if (!id) return null;
    const all = this.getAll({ status: 'all' });
    return all.find(s => s.id === id) || null;
  },

  /**
   * Saves or updates a skill in local storage and Firestore if configured
   */
  saveSkill(skill: Skill): void {
    const norm = normalizeSkill(skill);
    const all = this.getAll({ status: 'all' });
    const idx = all.findIndex(s => s.id === norm.id || s.slug === norm.slug);

    if (idx >= 0) {
      all[idx] = { ...norm, isCustom: true, updatedAt: new Date().toISOString() };
    } else {
      all.unshift({ ...norm, isCustom: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(all));
      } catch (e) {
        console.warn('[SkillsService] Error persisting skill to local storage:', e);
      }
    }

    // Sync to Firestore if configured
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'skills', norm.id), norm, { merge: true }).catch(err =>
        console.warn('[SkillsService] Firestore saveSkill error:', err)
      );
    }
  },

  /**
   * Update status of a skill (e.g. approve, publish, reject, archive)
   */
  updateSkillStatus(id: string, status: SkillStatus): void {
    const skill = this.getById(id);
    if (skill) {
      this.saveSkill({ ...skill, status });
    }
  },

  /**
   * Deletes a skill record
   */
  deleteSkill(id: string): void {
    const all = this.getAll({ status: 'all' }).filter(s => s.id !== id);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(all));
      } catch (e) {
        console.warn('[SkillsService] Error deleting skill from storage:', e);
      }
    }

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'skills', id)).catch(err =>
        console.warn('[SkillsService] Firestore deleteSkill error:', err)
      );
    }
  },

  /**
   * Gets list of available categories
   */
  getCategories(): string[] {
    return Array.from(SKILL_CATEGORIES);
  },

  /**
   * Dynamically matches real opportunities (jobs, internships, scholarships, competitions) to a skill
   */
  async getRelatedOpportunities(skill: Skill, limit = 4): Promise<Opportunity[]> {
    const all = await OpportunitiesService.getAll();
    const keywords = [
      skill.name.toLowerCase(),
      ...skill.relatedSkills.map(r => r.toLowerCase()),
      ...(skill.toolsAndSoftware || []).map(t => t.toLowerCase()),
      ...(skill.topCareers || []).map(c => c.toLowerCase())
    ];

    const matched = all.filter((opp: Opportunity) => {
      // Check title, description, skills, category
      const oppTitle = opp.title.toLowerCase();
      const oppDesc = (opp.description || '').toLowerCase();
      const oppSkills = (opp.skills || []).map((s: string) => s.toLowerCase());

      return keywords.some(k => {
        if (k.length <= 2) return false;
        return (
          oppSkills.includes(k) ||
          oppTitle.includes(k) ||
          oppDesc.includes(k)
        );
      });
    });

    return matched.slice(0, limit);
  },

  /**
   * Dynamically matches real verified courses and learning resources to a skill
   */
  async getRelatedCourses(skill: Skill, limit = 4): Promise<Resource[]> {
    const all = await ResourcesService.getAll();
    const keywords = [
      skill.name.toLowerCase(),
      ...skill.relatedSkills.map(r => r.toLowerCase()),
      ...(skill.toolsAndSoftware || []).map(t => t.toLowerCase())
    ];

    const matched = all.filter((res: Resource) => {
      const resTitle = res.title.toLowerCase();
      const resDesc = (res.description || '').toLowerCase();
      const resSkills = (res.skills || []).map((s: string) => s.toLowerCase());

      return keywords.some(k => {
        if (k.length <= 2) return false;
        return (
          resSkills.includes(k) ||
          resTitle.includes(k) ||
          resDesc.includes(k)
        );
      });
    });

    return matched.slice(0, limit);
  }
};
