import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../services/authContext';
import { UserRole } from '../types/database';
import { EDUCATION_LEVELS } from '../data/categories';
import { Compass, ShieldCheck, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { loginWithPassword, loginWithGoogle, signup, switchRole, currentUser, isFirebaseActive } = useAuth();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate (Bachelor)');
  const [university, setUniversity] = useState('University of Ghana, Legon');
  const [course, setCourse] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isLogin) {
        await loginWithPassword(email || 'user@opportunityghana.com', password || 'Password123!');
      } else {
        await signup(
          {
            email,
            name,
            educationLevel,
            university,
            course,
            role: 'user'
          },
          password
        );
      }
      onNavigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onNavigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign-in error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchRole(role);
    if (role === 'admin' || role === 'editor') {
      onNavigate('/admin');
    } else {
      onNavigate('/opportunities');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand icon */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-6 h-6 text-emerald-200" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-space">
          {isLogin ? 'Welcome Back' : 'Create Your Seeker Account'}
        </h1>
        <p className="text-xs text-slate-500">
          Connected to Firebase Project: <strong className="text-emerald-800">opportunity-ghana</strong>
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kwame Mensah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. you@student.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  {EDUCATION_LEVELS.filter(l => l !== 'All Education Levels').map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. University of Ghana, KNUST, UCC, Ashesi"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Programme / Course of Study</label>
                <input
                  type="text"
                  placeholder="e.g. BSc Computer Science, Business Administration"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Opportunity Ghana' : 'Create Account'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            {isLogin
              ? "Don't have an account? Sign up here"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Quick Test Profiles for Reviewers */}
        <div className="pt-5 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Developer / Demo Roles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="p-2 text-left bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span>Admin CMS</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <span className="text-[10px] text-emerald-700 font-normal">Full editorial controls</span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('user')}
              className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span>Standard User</span>
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="text-[10px] text-slate-500 font-normal">Student seeker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
