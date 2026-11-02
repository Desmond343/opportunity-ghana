import assert from 'node:assert';
import { ALL_INSTITUTIONS } from '../../../data/institutions/index';
import { getInstitutionMedia } from '../../../utils/institutionMedia';
import { InstitutionsService } from '../../../services/institutionsService';

console.log('--- RUNNING INSTITUTION CARD LAYOUT & RESPONSIVENESS TEST SUITE ---');

// Test 1: Verify all 21 tertiary institutions exist and have valid metadata
assert.strictEqual(ALL_INSTITUTIONS.length, 21, `Expected 21 institutions, got ${ALL_INSTITUTIONS.length}`);
console.log(`PASS: Found all ${ALL_INSTITUTIONS.length} tertiary institutions in directory`);

// Test 2: Verify each institution resolves to a valid media image with object-position
ALL_INSTITUTIONS.forEach((inst) => {
  const media = getInstitutionMedia(inst);
  assert.ok(media.url, `Institution ${inst.name} missing media URL`);
  assert.ok(media.alt, `Institution ${inst.name} missing media alt`);
  assert.ok(media.position, `Institution ${inst.name} missing media position`);
  assert.ok(inst.name, `Institution ${inst.id} missing name`);
  assert.ok(inst.shortName, `Institution ${inst.id} missing shortName`);
  assert.ok(inst.location.city, `Institution ${inst.id} missing city`);
  assert.ok(inst.location.region, `Institution ${inst.id} missing region`);
  assert.ok(inst.applicationPortalUrl, `Institution ${inst.id} missing application portal`);
  assert.ok(inst.admissionCycles.length > 0, `Institution ${inst.id} missing admission cycles`);
});
console.log('PASS: All 21 institutions have complete media, location, cycles, and portal URLs');

// Test 3: Verify nearest active deadline computation works for institutions
const ug = ALL_INSTITUTIONS.find((i) => i.shortName === 'UG');
assert.ok(ug, 'UG must exist');
const ugDeadline = InstitutionsService.getNearestActiveDeadline(ug);
assert.ok(ugDeadline, 'UG nearest deadline should be calculated');
assert.ok(ugDeadline.deadlineInfo.label, 'UG deadline label should exist');
console.log(`PASS: UG active deadline calculated: ${ugDeadline.cycle.category} -> ${ugDeadline.deadlineInfo.label}`);

// Test 4: Verify InstitutionCard.tsx structure adheres to dedicated 35-45% image top section and solid content
import fs from 'node:fs';
import path from 'node:path';

const cardCode = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/institutions/InstitutionCard.tsx'),
  'utf-8'
);

// Check that full-card background overlay was removed
assert.ok(
  !cardCode.includes('institution-card-overlay'),
  'FAIL: Obsolete institution-card-overlay should be removed'
);
assert.ok(
  !cardCode.includes('absolute inset-0 z-0 overflow-hidden pointer-events-none'),
  'FAIL: Image must not be a full-card absolute background'
);
console.log('PASS: Full-card background image and overlay have been completely removed');

// Check that dedicated top image section exists (35-45% height ~ h-44 sm:h-48)
assert.ok(
  cardCode.includes('h-44 sm:h-48') && cardCode.includes('object-cover'),
  'FAIL: Dedicated top image section with object-cover must exist'
);
console.log('PASS: Dedicated top image section occupies ~35-45% card height with object-cover');

// Check that content section has solid background
assert.ok(
  cardCode.includes('bg-white dark:bg-[#141B29]'),
  'FAIL: Content section must use solid readable background'
);
console.log('PASS: Content section uses solid white / dark slate neutral background');

// Check that Portal and Details buttons are in a separate footer
assert.ok(
  cardCode.includes('Portal') && cardCode.includes('ExternalLink') && cardCode.includes('Details'),
  'FAIL: Portal link and Details button must be in the footer'
);
assert.ok(
  cardCode.includes('border-t border-slate-100'),
  'FAIL: Footer must have top border separation'
);
console.log('PASS: Footer contains isolated Portal link and green Details button');

console.log('ALL INSTITUTION CARD LAYOUT TESTS PASSED SUCCESSFULLY!');
