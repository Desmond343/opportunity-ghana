import React, { useState, useEffect } from 'react';
import { AuthProvider } from './services/authContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoNoticeBanner } from './components/layout/DemoNoticeBanner';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { CareersPage } from './pages/CareersPage';
import { ToolsPage } from './pages/ToolsPage';
import { AlertsPage } from './pages/AlertsPage';
import { AuthPage } from './pages/AuthPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAIAssistant } from './pages/admin/AdminAIAssistant';
import { AdminOpportunities } from './pages/admin/AdminOpportunities';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminOrganizations } from './pages/admin/AdminOrganizations';
import { AdminSkills } from './pages/admin/AdminSkills';
import { AdminSubmissions } from './pages/admin/AdminSubmissions';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { Search, X, Compass, ExternalLink } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES } from './data/categories';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path.split('?')[0]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalSearchTerm.trim()) {
      setSearchModalOpen(false);
      navigate(`/opportunities?search=${encodeURIComponent(modalSearchTerm.trim())}`);
      setModalSearchTerm('');
    }
  };

  // Route Resolver
  const renderRoute = () => {
    // 1. Opportunities Detail: /opportunities/:slug
    if (currentPath.startsWith('/opportunities/') && currentPath !== '/opportunities') {
      const slug = currentPath.replace('/opportunities/', '').replace(/\/$/, '');
      return <OpportunityDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 2. Opportunities Directory: /opportunities
    if (currentPath === '/opportunities') {
      const searchParams = new URLSearchParams(window.location.search);
      const category = searchParams.get('category') || 'All';
      const search = searchParams.get('search') || '';
      return (
        <OpportunitiesPage
          onNavigate={navigate}
          initialCategory={category}
          initialQuery={search}
        />
      );
    }

    // 3. Resources Detail: /resources/:slug
    if (currentPath.startsWith('/resources/') && currentPath !== '/resources') {
      const slug = currentPath.replace('/resources/', '').replace(/\/$/, '');
      return <ResourceDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 4. Resources Directory: /resources
    if (currentPath === '/resources') {
      const searchParams = new URLSearchParams(window.location.search);
      const isFree = searchParams.get('free') === 'true';
      const type = searchParams.get('type') || 'All';
      return (
        <ResourcesPage
          onNavigate={navigate}
          initialFree={isFree}
          initialType={type}
        />
      );
    }

    // 5. Careers & Skills: /careers
    if (currentPath === '/careers') {
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

    // 8. Auth: /login and /signup
    if (currentPath === '/login') {
      return <AuthPage mode="login" onNavigate={navigate} />;
    }
    if (currentPath === '/signup') {
      return <AuthPage mode="signup" onNavigate={navigate} />;
    }

    // 9. Admin routes: /admin/*
    if (currentPath.startsWith('/admin')) {
      return (
        <AdminLayout currentPath={currentPath} onNavigate={navigate}>
          {currentPath === '/admin' && <AdminDashboard onNavigate={navigate} />}
          {currentPath === '/admin/ai-assistant' && <AdminAIAssistant onNavigate={navigate} />}
          {currentPath === '/admin/opportunities' && <AdminOpportunities onNavigate={navigate} />}
          {currentPath === '/admin/resources' && <AdminResources onNavigate={navigate} />}
          {currentPath === '/admin/organizations' && <AdminOrganizations onNavigate={navigate} />}
          {currentPath === '/admin/skills' && <AdminSkills onNavigate={navigate} />}
          {currentPath === '/admin/submissions' && <AdminSubmissions onNavigate={navigate} />}
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white font-sans">
      {/* Notice Banner */}
      {!isAdminRoute && <DemoNoticeBanner onNavigate={navigate} />}

      {/* Global Navbar */}
      {!isAdminRoute && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* Main View */}
      <main className="flex-1">{renderRoute()}</main>

      {/* Global Footer */}
      {!isAdminRoute && <Footer onNavigate={navigate} />}

      {/* Fast Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-700" />
                Quick Opportunity Search
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGlobalSearch} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Type keywords (e.g. Ashesi, MEST, Scholarship, React, Intern)..."
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 px-4 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800"
              >
                Search
              </button>
            </form>

            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Category Shortcuts
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OPPORTUNITY_CATEGORIES.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate(`/opportunities?category=${c.id}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-600 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
