import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { EDUCATION_LEVELS } from '../data/categories';
import {
  Compass,
  Mail,
  Lock,
  User,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { loginWithPassword, loginWithGoogle, signup, isFirebaseActive } = useAuth();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate (Bachelor)');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyDomain = async (domainToCopy: string) => {
    try {
      await navigator.clipboard.writeText(domainToCopy);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Please enter your email address and password.');
          setLoading(false);
          return;
        }
        await loginWithPassword(email.trim(), password);
      } else {
        if (!email.trim() || !password || !name.trim()) {
          setErrorMsg('Please complete all required fields.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await signup(
          {
            email: email.trim(),
            name: name.trim(),
            educationLevel,
            university: university.trim(),
            course: course.trim(),
            role: 'user'
          },
          password
        );
      }
      onNavigate('/');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication error. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email address or password. Please verify your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    try {
      await loginWithGoogle();
      onNavigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(currentHost || 'this-app-domain');
      } else {
        setErrorMsg(err.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 google-anno-skip" data-no-ads="true">
      {/* Brand icon */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-6 h-6 text-emerald-200" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-space">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        <p className="text-xs text-slate-500">
          Sign in to save opportunities, configure alerts, and track deadlines.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Unauthorized Domain Guide Card */}
        {unauthorizedDomain && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-amber-950">
                  Firebase Domain Authorization Required
                </h3>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Google OAuth requires the current application domain to be authorized in your Firebase Project (<strong>opportunity-ghana</strong>).
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-medium text-slate-700 truncate select-all">
                {unauthorizedDomain}
              </span>
              <button
                type="button"
                onClick={() => handleCopyDomain(unauthorizedDomain)}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-800" />
                    <span>Copy Domain</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-amber-800 space-y-1 bg-amber-100/50 p-2.5 rounded-xl">
              <p className="font-semibold text-amber-950">To authorize Google Sign-In:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-[10px] pl-1 text-amber-900">
                <li>Open Firebase Console &gt; Authentication &gt; Settings</li>
                <li>Under <strong>Authorized domains</strong>, click <strong>Add domain</strong></li>
                <li>Paste the copied domain above and save</li>
              </ol>
              <a
                href="https://console.firebase.google.com/project/opportunity-ghana/authentication/settings"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-800 hover:underline"
              >
                Open Firebase Console Settings <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-1 border-t border-amber-200/60 text-[11px] text-amber-900">
              <strong>Tip:</strong> Email &amp; Password sign-in below works immediately without domain authorization!
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
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
                placeholder="Enter your full name"
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
              placeholder="Enter your email"
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
              placeholder="Enter password"
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
                  placeholder="e.g. University of Ghana, KNUST, UCC, TVET"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Programme / Course of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Business Administration, Accounting"
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
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
              setUnauthorizedDomain(null);
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            {isLogin
              ? "Don't have an account? Sign up here"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
