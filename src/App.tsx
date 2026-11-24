import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { ThemeProvider } from './services/themeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
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
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SavedNotificationBanner } from './components/common/SavedNotificationBanner';
import { OpportunityFilters } from './services/opportunitiesService';

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

  const renderRoute = () => {
    const [pathname, queryString] = currentPath.split('?');

    if (pathname === '/categories') {
      return <CategoriesPage onNavigate={navigate} />;
    }

    if (pathname === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (pathname === '/jobs') {
      return (
        <OpportunitiesPage
          key="Jobs"
          onNavigate={navigate}
          initialCategory="Jobs"
        />
      );
    }

    if (pathname === '/internships') {
      return (
        <OpportunitiesPage
          key="Internships"
          onNavigate={navigate}
          initialCategory="Internships"
        />
      );
    }

    if (pathname === '/scholarships') {
      return (
        <OpportunitiesPage
          key="Scholarships"
          onNavigate={navigate}
          initialCategory="Scholarships"
        />
      );
    }

    if (pathname === '/opportunities/submit') {
      if (isEditorOrAdmin) {
        return (
          <AdminLayout currentPath="/admin/opportunities" onNavigate={navigate}>
            <AdminOpportunities onNavigate={navigate} />
          </AdminLayout>
        );
      }
      return <OpportunitiesPage onNavigate={navigate} />;
    }

    if (pathname.startsWith('/opportunities/') && pathname !== '/opportunities') {
      const slug = pathname.replace('/opportunities/', '').replace(/\/$/, '');
      return <OpportunityDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (pathname === '/opportunities') {
      const searchParams = new URLSearchParams(queryString || window.location.search);
      const category = searchParams.get('category') || 'All';
      const search = searchParams.get('search') || '';
      const statusParam = searchParams.get('status') as OpportunityFilters['availabilityStatus'] | null;
      return (
        <OpportunitiesPage
          key={`${category}-${search}-${statusParam || 'all'}`}
          onNavigate={navigate}
          initialCategory={category}
          initialQuery={search}
          initialStatus={statusParam || undefined}
        />
      );
    }

    if (pathname === '/resources/submit') {
      if (isEditorOrAdmin) {
        return (
          <AdminLayout currentPath="/admin/resources" onNavigate={navigate}>
            <AdminResources onNavigate={navigate} />
          </AdminLayout>
        );
      }
      return <ResourcesPage onNavigate={navigate} />;
    }

    const isResourceDetail =
      (pathname.startsWith('/resources/') && pathname !== '/resources') ||
      (pathname.startsWith('/courses/') && pathname !== '/courses') ||
      (pathname.startsWith('/course/') && pathname !== '/course');

    if (isResourceDetail) {
      const slug = pathname.replace(/^(\/resources|\/courses|\/course)\//, '').replace(/\/$/, '');
      return <ResourceDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (pathname === '/resources' || pathname === '/courses' || pathname === '/free-courses') {
      const searchParams = new URLSearchParams(queryString || window.location.search);
      const isFree = pathname === '/free-courses' || searchParams.get('free') === 'true';
      const isPaid = searchParams.get('paid') === 'true';
      const type = searchParams.get('type') || 'All';
      return (
        <ResourcesPage
          onNavigate={navigate}
          initialFree={isFree}
          initialPaid={isPaid}
          initialType={type}
        />
      );
    }

    if (pathname.startsWith('/institutions/') && pathname !== '/institutions') {
      const slug = pathname.replace('/institutions/', '').replace(/\/$/, '');
      return <InstitutionDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (pathname === '/institutions' || pathname === '/admissions') {
      const searchParams = new URLSearchParams(queryString || window.location.search);
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

    if (pathname === '/tools') {
      return <ToolsPage onNavigate={navigate} />;
    }

    if (pathname === '/alerts') {
      return <AlertsPage onNavigate={navigate} />;
    }

    if (pathname === '/saved') {
      return <SavedPage onNavigate={navigate} />;
    }

    if (pathname === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

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

    if (pathname === '/success-stories' || pathname.startsWith('/success-stories/')) {
      const slug = pathname.replace('/success-stories/', '').replace(/\/$/, '');
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

    if (pathname.startsWith('/admin')) {
      const normalizedAdminPath = pathname.replace(/\/+$/, '') || '/admin';
      return (
        <AdminLayout currentPath={currentPath} onNavigate={navigate}>
          {normalizedAdminPath === '/admin' && <AdminDashboard onNavigate={navigate} />}
          {(normalizedAdminPath === '/admin/scholarship-research' || normalizedAdminPath === '/admin/opportunity-research') && <AdminScholarshipResearch onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/ai-assistant' && <AdminAIAssistant onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/opportunities' && <AdminOpportunities onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/resources' && <AdminResources onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/success-stories' && <AdminSuccessStories onNavigate={navigate} />}
          {(normalizedAdminPath === '/admin/subscribers' || normalizedAdminPath === '/admin/alerts') && <AdminAlertSubscribers onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/organizations' && <AdminOrganizations onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/skills' && <AdminSkills onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/submissions' && <AdminSubmissions onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/resource-submissions' && <AdminResourceSubmissions onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/reports' && <AdminReports onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/users' && <AdminUsers onNavigate={navigate} />}
          {normalizedAdminPath === '/admin/settings' && <AdminSettings onNavigate={navigate} />}
        </AdminLayout>
      );
    }

    return <HomePage onNavigate={navigate} />;
  };

  const [currentPathname] = currentPath.split('?');
  const isAdminRoute = currentPathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col stage-ambient-surface text-slate-900 dark:text-slate-100 selection:bg-emerald-600 selection:text-white font-sans">
      <OfflineIndicator />

      {!isAdminRoute && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
        />
      )}

      <main className="flex-1 pb-16 md:pb-0">{renderRoute()}</main>

      {!isAdminRoute && <SavedNotificationBanner onNavigate={navigate} />}

      {!isAdminRoute && (
        <MobileBottomNav
          currentPath={currentPath}
          onNavigate={navigate}
        />
      )}

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
