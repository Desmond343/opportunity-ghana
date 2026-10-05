import { Resource } from '../../types/database';
import { TECH_COURSES } from './techCourses';
import { BUSINESS_COURSES } from './businessCourses';
import { SPECIALTY_COURSES } from './specialtyCourses';
import { NEW_VERIFIED_FREE_COURSES } from './newVerifiedCourses';

/**
 * Complete collection of verified free online courses and professional training programs.
 * All courses are verified against official providers, checking availability, fee transparency,
 * certificates, and accessibility from Ghana and worldwide.
 */
export const ALL_COURSES: Resource[] = [
  ...TECH_COURSES,
  ...BUSINESS_COURSES,
  ...SPECIALTY_COURSES,
  ...NEW_VERIFIED_FREE_COURSES,
];

/**
 * Filtered list of genuine, verified FREE courses.
 * Includes:
 * 1. 100% Free courses (tuition and completion certificate included free)
 * 2. Free-to-audit courses (full curriculum accessible free of charge; optional paid certificate)
 * 3. Free with optional paid certificate
 */
export const ALL_FREE_COURSES: Resource[] = ALL_COURSES.filter((c) => c.isFree);

/**
 * Lookup course by id
 */
export function getCourseById(id: string): Resource | undefined {
  if (!id) return undefined;
  return ALL_COURSES.find((c) => c.id === id);
}

/**
 * Lookup course by slug
 */
export function getCourseBySlug(slug: string): Resource | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return ALL_COURSES.find(
    (c) => c.slug.toLowerCase() === normalized || c.id.toLowerCase() === normalized
  );
}

/**
 * Returns top free courses for homepage or highlights
 */
export function getTopFreeCourses(limit: number = 6): Resource[] {
  return ALL_FREE_COURSES.slice(0, limit);
}
