import fs from 'fs';
import path from 'path';

console.log('--- RUNNING OPPORTUNITY CATEGORY SECTION TEST SUITE ---');

const componentPath = path.resolve(process.cwd(), 'src/components/home/OpportunityCategorySection.tsx');
const content = fs.readFileSync(componentPath, 'utf-8');

// Check 1: Admissions & Study destination is /institutions
const admissionsMatch = content.includes("id: 'admissions'") && content.includes("href: '/institutions'");
if (!admissionsMatch) {
  console.error('FAIL: Admissions & Study item does not route to /institutions');
  process.exit(1);
}
console.log("PASS: Admissions & Study item correctly routes to '/institutions'");

// Check 2: Interactive button navigation with explicit onNavigate triggers
const hasButtonNav = content.includes('onNavigate(cat.href)') && content.includes('min-h-[44px]');
if (!hasButtonNav) {
  console.error('FAIL: Compact accessible category button trigger missing');
  process.exit(1);
}
console.log('PASS: Category tiles use accessible 44px+ button targets and route cleanly');

// Check 3: Compact grid without oversized image cards
const hasCompactGrid = content.includes('grid-cols-2') && !content.includes('h-[285px]') && !content.includes('lg:h-[325px]');
if (!hasCompactGrid) {
  console.error('FAIL: Category section is not using compact responsive grid layout');
  process.exit(1);
}
console.log('PASS: Category section uses compact icon+label grid layout');

// Check 4: Section title is "Explore Opportunities by Category"
if (!content.includes('Explore Opportunities by Category')) {
  console.error('FAIL: Section title missing or changed');
  process.exit(1);
}
console.log('PASS: Section title is "Explore Opportunities by Category"');

// Check 5: App.tsx handles /institutions and /categories
const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf-8');
const routesInstitutions = appContent.includes("pathname === '/institutions'");
const routesCategories = appContent.includes("pathname === '/categories'");
if (!routesInstitutions || !routesCategories) {
  console.error('FAIL: App.tsx missing /institutions or /categories route');
  process.exit(1);
}
console.log("PASS: App.tsx routes '/institutions' and '/categories' cleanly");

console.log('ALL CATEGORY SECTION OPTIMIZATION TESTS PASSED SUCCESSFULLY!');
