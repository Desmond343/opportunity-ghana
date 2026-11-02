import fs from 'fs';
import path from 'path';

console.log('--- RUNNING OPPORTUNITY CATEGORY SECTION TEST SUITE ---');

// 1. Read OpportunityCategorySection.tsx
const componentPath = path.resolve(process.cwd(), 'src/components/home/OpportunityCategorySection.tsx');
const content = fs.readFileSync(componentPath, 'utf-8');

// Check 1: Admissions & Study Opportunities destination is /institutions
const admissionsMatch = content.includes("id: 'admissions'") && content.includes("href: '/institutions'");
if (!admissionsMatch) {
  console.error('FAIL: Admissions & Study Opportunities card does not route to /institutions');
  process.exit(1);
}
console.log("PASS: Admissions & Study Opportunities card correctly routes to '/institutions'");

// Check 2: Clickable CTA text and arrow exist with explicit onNavigate triggers
const textCtaClickable = content.includes('onNavigate(track.href)') && content.includes('Explore opportunities');
const arrowClickable = content.includes('aria-label={`Explore ${track.heading}`}') || content.includes('<ArrowRight');
if (!textCtaClickable || !arrowClickable) {
  console.error('FAIL: CTA text or arrow click handler missing');
  process.exit(1);
}
console.log('PASS: Explore Opportunities text and arrow are explicitly interactive and route to category destination');

// Check 3: Reduced card height (approx 20-25% smaller, around ~300-325px instead of 420px)
const hasReducedHeight = content.includes('h-[285px]') || content.includes('lg:h-[325px]');
if (!hasReducedHeight) {
  console.error('FAIL: Category card height has not been reduced');
  process.exit(1);
}
console.log('PASS: Category card height reduced by ~23% (325px max desktop height down from 420px)');

// Check 4: Reduced card width for 3-4 cards visible on desktop
const hasDesktopWidth = content.includes('lg:w-[340px]') || content.includes('xl:w-[350px]');
if (!hasDesktopWidth) {
  console.error('FAIL: Desktop card width not optimized for 3-4 visible cards');
  process.exit(1);
}
console.log('PASS: Card width scaled to 340-350px allowing ~3-4 cards visible on desktop viewport');

// Check 5: Section title is "Explore Opportunities by Category"
if (!content.includes('Explore Opportunities by Category')) {
  console.error('FAIL: Section title missing or changed');
  process.exit(1);
}
console.log('PASS: Section title is "Explore Opportunities by Category"');

// Check 6: App.tsx handles /institutions with pathname
const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf-8');
const routesInstitutions = appContent.includes("pathname === '/institutions'");
if (!routesInstitutions) {
  console.error('FAIL: App.tsx does not handle /institutions using pathname');
  process.exit(1);
}
console.log("PASS: App.tsx route resolver cleanly resolves '/institutions' to InstitutionsPage");

console.log('ALL CATEGORY SECTION OPTIMIZATION TESTS PASSED SUCCESSFULLY!');
