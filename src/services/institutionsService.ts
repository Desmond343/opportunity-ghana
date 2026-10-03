import { Institution, AdmissionCycle, AdmissionStatus } from '../types/institution';
import { ALL_INSTITUTIONS, getInstitutionBySlug } from '../data/institutions';
import { calculateDeadlineInfo as getDeadlineInfo, DeadlineInfo } from './deadlineService';

const STORAGE_KEY = 'opportunity_ghana_institutions_override';
const SAVED_INSTITUTIONS_KEY = 'opportunity_ghana_saved_institutions';

export class InstitutionsService {
  /**
   * Retrieves all institutions with real-time calculated admission deadlines
   */
  static getAll(): Institution[] {
    let list = ALL_INSTITUTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Institution[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge or supplement
          const map = new Map<string, Institution>();
          list.forEach((i) => map.set(i.id, i));
          parsed.forEach((p) => map.set(p.id, p));
          list = Array.from(map.values());
        }
      }
    } catch {
      // Fallback to static verified registry
    }

    return list.map((inst) => this.computeRealTimeStatus(inst));
  }

  /**
   * Retrieves featured institutions with real-time calculated admission deadlines
   */
  static getFeatured(limit?: number): Institution[] {
    const featured = this.getAll().filter((inst) => inst.isFeatured);
    return typeof limit === 'number' ? featured.slice(0, limit) : featured;
  }

  /**
   * Look up a single institution by slug or id
   */
  static getBySlug(slug: string): Institution | null {
    const all = this.getAll();
    const normalized = slug.trim().toLowerCase();
    const found = all.find(
      (inst) => inst.slug.toLowerCase() === normalized || inst.id.toLowerCase() === normalized
    );
    return found || null;
  }

  /**
   * Computes dynamic deadline statuses for each admission cycle
   */
  static computeRealTimeStatus(institution: Institution): Institution {
    const updatedCycles = institution.admissionCycles.map((cycle) => {
      const deadline = cycle.extendedDeadline || cycle.applicationCloseDate;
      if (!deadline) return cycle;

      const deadlineInfo = getDeadlineInfo(deadline);
      let calculatedStatus: AdmissionStatus = cycle.status;

      if (deadlineInfo.isClosed) {
        calculatedStatus = 'CLOSED';
      } else if (deadlineInfo.isClosingSoon) {
        calculatedStatus = 'CLOSING_SOON';
      } else if (deadlineInfo.status === 'open' || deadlineInfo.status === 'approaching') {
        calculatedStatus = 'OPEN';
      }

      return {
        ...cycle,
        status: calculatedStatus,
      };
    });

    // Compute overall institution status
    let overall: AdmissionStatus = institution.overallAdmissionStatus;
    const hasClosingSoon = updatedCycles.some((c) => c.status === 'CLOSING_SOON');
    const hasOpen = updatedCycles.some((c) => c.status === 'OPEN');
    const allClosed = updatedCycles.length > 0 && updatedCycles.every((c) => c.status === 'CLOSED');

    if (hasClosingSoon) {
      overall = 'CLOSING_SOON';
    } else if (hasOpen) {
      overall = 'OPEN';
    } else if (allClosed) {
      overall = 'CLOSED';
    }

    return {
      ...institution,
      overallAdmissionStatus: overall,
      admissionCycles: updatedCycles,
    };
  }

  /**
   * Calculates detailed countdown info for a cycle's deadline
   */
  static getCycleDeadlineInfo(cycle: AdmissionCycle): DeadlineInfo | null {
    const deadline = cycle.extendedDeadline || cycle.applicationCloseDate;
    if (!deadline) return null;
    return getDeadlineInfo(deadline);
  }

  /**
   * Get nearest active deadline for an institution
   */
  static getNearestActiveDeadline(institution: Institution): {
    cycle: AdmissionCycle;
    deadlineInfo: DeadlineInfo;
  } | null {
    let nearest: { cycle: AdmissionCycle; deadlineInfo: DeadlineInfo } | null = null;
    for (const cycle of institution.admissionCycles) {
      const deadline = cycle.extendedDeadline || cycle.applicationCloseDate;
      if (!deadline) continue;
      const info = getDeadlineInfo(deadline);
      if (!info.isClosed) {
        if (!nearest || info.diffMs < nearest.deadlineInfo.diffMs) {
          nearest = { cycle, deadlineInfo: info };
        }
      }
    }
    return nearest;
  }

  /**
   * Saved / Bookmarked institutions
   */
  static getSavedIds(): string[] {
    try {
      const raw = localStorage.getItem(SAVED_INSTITUTIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static toggleSave(id: string): boolean {
    try {
      const saved = this.getSavedIds();
      const idx = saved.indexOf(id);
      let isSaved = false;
      if (idx >= 0) {
        saved.splice(idx, 1);
        isSaved = false;
      } else {
        saved.push(id);
        isSaved = true;
      }
      localStorage.setItem(SAVED_INSTITUTIONS_KEY, JSON.stringify(saved));
      return isSaved;
    } catch {
      return false;
    }
  }

  static isSaved(id: string): boolean {
    return this.getSavedIds().includes(id);
  }
}
