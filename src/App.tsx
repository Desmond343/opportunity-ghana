import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { ThemeProvider } from './services/themeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { SubmitOpportunityPage } from './pages/SubmitOpportunityPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { SubmitResourcePage } from './pages/SubmitResourcePage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
import { getInstitutionBySlug } from './data/institutions';
import { CareersPage } from './pages/CareersPage';
import { SkillDetailPage } from './pages/SkillDetailPage';
import { ToolsPage } from './pages/ToolsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SavedPage } from './pages/SavedPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SuccessStoriesPage } from './pages/SuccessStoriesPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminScholarshipResearch } from './pages/admin/AdminScholarshipResearch';
import { AdminAIAssistant } from './pages/admin/AdminAIAssistant';
import { AdminOpportunities } from './pages/admin/AdminOpportunities';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminSuccessStories } from './pages/admin/AdminSuccessStories';
import { AdminAlertSubscribers } from './pages/admin/AdminAlertSubscribers';
import { AdminOrganizations } from './pages/admin/AdminOrganizations';
import { AdminSkills } from './pages/admin/AdminSkills';
import { AdminSubmissions } from './pages/admin/AdminSubmissions';
import { AdminResourceSubmissions } from './pages/admin/AdminResourceSubmissions';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { usePublishedStoriesCount } from './services/successStoriesService';
import { InstallAppPrompt } from './components/pwa/InstallAppPrompt';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SavedNotificationBanner } from './components/common/SavedNotificationBanner';

export function AppContent() {
  const { isEditorOrAdmin } = useAuth();
  const { count: publishedStoriesCount } = usePublishedStoriesCount();
  const [currentPath, setCurrentPath] = useState<string>(
    () => (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/') || '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname + window.location.search) || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Resolver
  const renderRoute = () => {
    const [pathname, queryString] = currentPath.split('?');

    // 1. Direct Jobs Route: /jobs
    if (pathname === '/jobs') {
      return (
        <OpportunitiesPage
          key="Jobs"
          onNavigate={navigate}
          initialCategory="Jobs"
        />
      );
    }

    // 2. Direct Internships Route: /internships
    if (pathname === '/internships') {
      return (
        <OpportunitiesPage
          key="Internships"
          onNavigate={navigate}
          initialCategory="Internships"
        />
      );
    }

    // 3. Direct Scholarships Route: /scholarships
    if (pathname === '/scholarships') {
      return (
        <OpportunitiesPage
          key="Scholarships"
          onNavigate={navigate}
          initialCategory="Scholarships"
        />
      );
    }

    // 4. User Opportunity Submission: /opportunities/submit
    if (pathname === '/opportunities/submit') {
      return <SubmitOpportunityPage onNavigate={navigate} />;
    }

    // 5. Opportunities Detail: /opportunities/:slug
    if (pathname.startsWith('/opportunities/') && pathname !== '/opportunities') {
      const slug = pathname.replace('/opportunities/', '').replace(/\/$/, '');
      const inst = getInstitutionBySlug(slug);
      if (inst) {
        return <InstitutionDetailPage slug={inst.slug} onNavigate={navigate} />;
      }
      return <OpportunityDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 6. Opportunities Directory: /opportunities
    if (pathname === '/opportunities') {
      const searchParams = new URLSearchParams(queryString || window.location.search);
      const category = searchParams.get('category') || 'All';
      const search = searchParams.get('search') || '';
      return (
        <OpportunitiesPage
          key={`${category}-${search}`}
          onNavigate={navigate}
          initialCategory={category}
          initialQuery={search}
        />
      );
    }

    // 7. User Resource Submission: /resources/submit
    if (pathname === '/resources/submit') {
      return <SubmitResourcePage onNavigate={navigate} />;
    }

    // 8. Resources & Courses Detail: /resources/:slug, /courses/:slug, /course/:slug
    const isResourceDetail =
      (pathname.startsWith('/resources/') && pathname !== '/resources') ||
      (pathname.startsWith('/courses/') && pathname !== '/courses') ||
      (pathname.startsWith('/course/') && pathname !== '/course');

    if (isResourceDetail) {
      const slug = pathname.replace(/^(\/resources|\/courses|\/course)\//, '').replace(/\/$/, '');
      return <ResourceDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 9. Resources & Courses Directory: /resources, /courses, /free-courses
    if (pathname === '/resources' || pathname === '/courses' || pathname === '/free-courses') {
      const searchParams = new URLSearchParams(queryString || window.location.search);
      const isFree = pathname === '/free-courses' || searchParams.get('free') === 'true';
      const isPaid = searchParams.get('paid') === 'true';
      const type = searchParams.get('type') || 'All';
      const openSubmit = searchParams.get('action') === 'submit';
      return (
        <ResourcesPage
          onNavigate={navigate}
          initialFree={isFree}
          initialPaid={isPaid}
          initialType={type}
          initialOpenSubmit={openSubmit}
        />
      );
    }

    // 5. Tertiary Institutions & Admissions Directory
    if (currentPath.startsWith('/institutions/') && currentPath !== '/institutions') {
      const slug = currentPath.replace('/institutions/', '').replace(/\/$/, '');
      return <InstitutionDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (currentPath === '/institutions' || currentPath === '/admissions') {
      const searchParams = new URLSearchParams(window.location.search);
      const type = searchParams.get('type') || 'All Types';
      const region = searchParams.get('region') || 'All Regions';
      const search = searchParams.get('search') || '';
      return (
        <InstitutionsPage
          onNavigate={navigate}
          initialType={type}
          initialRegion={region}
          initialSearch={search}
        />
      );
    }

    // 6. Skills & Careers Directory & Detail
    const isSkillDetail =
      (pathname.startsWith('/skills/') && pathname !== '/skills') ||
      (pathname.startsWith('/careers/') && pathname !== '/careers');

    if (isSkillDetail) {
      const slug = pathname.replace(/^(\/skills|\/careers)\//, '').replace(/\/$/, '');
      return <SkillDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (pathname === '/careers' || pathname === '/skills') {
      return <CareersPage onNavigate={navigate} />;
    }

    // 6. Tools: /tools
    if (currentPath === '/tools') {
      return <ToolsPage onNavigate={navigate} />;
    }

    // 7. Alerts: /alerts
    if (currentPath === '/alerts') {
      return <AlertsPage onNavigate={navigate} />;
    }

    // 8. Saved: /saved
    if (currentPath === '/saved') {
      return <SavedPage onNavigate={navigate} />;
    }

    // 9. Profile: /profile
    if (currentPath === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    // 10. Auth: /login, /signup, /forgot-password, /reset-password
    if (pathname === '/login') {
      return <AuthPage mode="login" onNavigate={navigate} />;
    }
    if (pathname === '/signup') {
      return <AuthPage mode="signup" onNavigate={navigate} />;
    }
    if (pathname === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }
    if (
      pathname === '/reset-password' ||
      pathname === '/auth/action' ||
      pathname === '/__/auth/action' ||
      (queryString && queryString.includes('mode=resetPassword')) ||
      (queryString && queryString.includes('oobCode=') && !pathname.startsWith('/admin'))
    ) {
      return <ResetPasswordPage onNavigate={navigate} queryString={queryString} />;
    }

    // 11. Success Stories: /success-stories and /success-stories/:slug
    if (pathname === '/success-stories' || pathname.startsWith('/success-stories/')) {
      const slug = pathname.replace('/success-stories/', '').replace(/\/$/, '');
      // When zero published stories exist and visitor is not an admin, do not expose empty page or coming soon
      if (publishedStoriesCount === 0 && !isEditorOrAdmin) {
        return <HomePage onNavigate={navigate} />;
      }
      return (
        <SuccessStoriesPage
          onNavigate={navigate}
          initialStorySlug={slug !== '/success-stories' && slug !== '' ? slug : undefined}
        />
      );
    }

    // 12. Admin routes: /admin/*
    if (currentPath.startsWith('/admin')) {
      return (
        <AdminLayout currentPath={currentPath} onNavigate={navigate}>
          {currentPath === '/admin' && <AdminDashboard onNavigate={navigate} />}
          {(currentPath === '/admin/scholarship-research' || currentPath === '/admin/opportunity-research') && <AdminScholarshipResearch onNavigate={navigate} />}
          {currentPath === '/admin/ai-assistant' && <AdminAIAssistant onNavigate={navigate} />}
          {currentPath === '/admin/opportunities' && <AdminOpportunities onNavigate={navigate} />}
          {currentPath === '/admin/resources' && <AdminResources onNavigate={navigate} />}
          {currentPath === '/admin/success-stories' && <AdminSuccessStories onNavigate={navigate} />}
          {(currentPath === '/admin/subscribers' || currentPath === '/admin/alerts') && <AdminAlertSubscribers onNavigate={navigate} />}
          {currentPath === '/admin/organizations' && <AdminOrganizations onNavigate={navigate} />}
          {currentPath === '/admin/skills' && <AdminSkills onNavigate={navigate} />}
          {currentPath === '/admin/submissions' && <AdminSubmissions onNavigate={navigate} />}
          {currentPath === '/admin/resource-submissions' && <AdminResourceSubmissions onNavigate={navigate} />}
          {currentPath === '/admin/reports' && <AdminReports onNavigate={navigate} />}
          {currentPath === '/admin/users' && <AdminUsers onNavigate={navigate} />}
          {currentPath === '/admin/settings' && <AdminSettings onNavigate={navigate} />}
        </AdminLayout>
      );
    }

    // Default /: HomePage
    return <HomePage onNavigate={navigate} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col stage-ambient-surface text-slate-900 dark:text-slate-100 selection:bg-emerald-600 selection:text-white font-sans">
      {/* Offline Status Warning */}
      <OfflineIndicator />

      {/* Global Navbar */}
      {!isAdminRoute && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
        />
      )}

      {/* Main View with mobile safe bottom spacing */}
      <main className="flex-1 pb-20 md:pb-0">{renderRoute()}</main>

      {/* Global Saved Opportunity Toast Feedback */}
      {!isAdminRoute && <SavedNotificationBanner onNavigate={navigate} />}

      {/* PWA Floating Install Prompt (suppresses automatically if installed or dismissed) */}
      {!isAdminRoute && <InstallAppPrompt variant="banner" />}

      {/* Mobile Friendly Bottom Navigation Bar */}
      {!isAdminRoute && (
        <MobileBottomNav
          currentPath={currentPath}
          onNavigate={navigate}
        />
      )}

      {/* Global Footer */}
      {!isAdminRoute && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
