import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, CheckCircle2, AlertCircle, ArrowLeft, Globe, Sparkles, Loader2, KeyRound } from 'lucide-react';
import { useFirebaseAuth } from '../firebase/AuthContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { sound } from '../utils/audio';

interface LoginPageProps {
  onBackToApp?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToApp, onLoginSuccess }) => {
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
    isSigningIn,
    authError,
    clearAuthError,
  } = useFirebaseAuth();

  // Mode: 'login' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [localError, setLocalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isResetSending, setIsResetSending] = useState(false);

  // Privacy Policy modal state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Reset errors when switching modes
  const switchMode = (mode: 'login' | 'signup' | 'forgot') => {
    sound.playClick();
    setAuthMode(mode);
    setLocalError(null);
    setSuccessNotice(null);
    clearAuthError();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      sound.playWrong();
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      sound.playWrong();
      return;
    }

    const res = await signInWithEmail(email, password);
    if (res.success) {
      setSuccessNotice('Successfully logged in! Welcome back to Lingoverse.');
      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 600);
      }
    } else {
      setLocalError(res.error || 'Failed to log in. Please check your credentials.');
      sound.playWrong();
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setLocalError('Please enter a valid email address.');
      sound.playWrong();
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      sound.playWrong();
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      sound.playWrong();
      return;
    }

    const res = await signUpWithEmail(email, password, fullName);
    if (res.success) {
      setSuccessNotice('Account created successfully! Welcome to Lingoverse.');
      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 600);
      }
    } else {
      setLocalError(res.error || 'Registration failed.');
      sound.playWrong();
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address to receive reset instructions.');
      sound.playWrong();
      return;
    }

    setIsResetSending(true);
    const res = await resetPassword(email);
    setIsResetSending(false);

    if (res.success) {
      setSuccessNotice(res.message || 'Password reset email sent! Check your inbox.');
      sound.playFanfare();
    } else {
      setLocalError(res.error || 'Failed to send reset link.');
      sound.playWrong();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      setSuccessNotice(null);
      await signInWithGoogle();
      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 600);
      }
    } catch {
      // Handled in AuthContext
    }
  };

  // Decorative floating language chips in background
  const floatingTags = [
    { text: 'Hola! 🇪🇸', top: '10%', left: '8%', delay: '0s' },
    { text: 'Bonjour! 🇫🇷', top: '22%', right: '10%', delay: '1s' },
    { text: 'こんにちは! 🇯🇵', bottom: '18%', left: '12%', delay: '2s' },
    { text: 'Ciao! 🇮🇹', bottom: '12%', right: '14%', delay: '1.5s' },
    { text: '你好! 🇨🇳', top: '70%', right: '8%', delay: '0.5s' },
    { text: '500+ Languages 🌍', top: '14%', left: '42%', delay: '2.5s' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#009688] flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden selection:bg-teal-900 selection:text-white">
      {/* Decorative gradient overlay & floating subtle language pills */}
      <div className="absolute inset-0 bg-radial from-[#00b4a0]/40 via-transparent to-[#00796b]/60 pointer-events-none" />

      {floatingTags.map((tag, idx) => (
        <div
          key={idx}
          style={{ top: tag.top, left: tag.left, right: tag.right, bottom: tag.bottom }}
          className="hidden md:flex absolute items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-sm pointer-events-none select-none animate-pulse"
        >
          {tag.text}
        </div>
      ))}

      {/* Top Bar / Back to App Link */}
      {onBackToApp && (
        <div className="w-full max-w-md flex items-center justify-between mb-4 z-10">
          <button
            onClick={() => {
              sound.playClick();
              onBackToApp();
            }}
            className="flex items-center gap-2 text-white/90 hover:text-white font-extrabold text-sm px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs transition-all cursor-pointer border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lingoverse</span>
          </button>

          <div className="flex items-center gap-1.5 text-teal-100 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            <Globe className="w-3.5 h-3.5 text-teal-200" />
            <span>924+ World Languages</span>
          </div>
        </div>
      )}

      {/* Main Centered White Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-10 border border-teal-50/50 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/30 mb-3 border-2 border-teal-200 p-0.5 bg-gradient-to-tr from-teal-400 via-cyan-300 to-teal-500">
            <img
              src="/src/assets/images/cyber_fox_logo_1794128107518.jpg"
              alt="Cyber Fox Mascot"
              className="w-full h-full rounded-[22px] object-cover bg-slate-900"
            />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {authMode === 'login' && 'Login'}
            {authMode === 'signup' && 'Create Account'}
            {authMode === 'forgot' && 'Reset Password'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            {authMode === 'login' && 'Welcome back to Lingoverse! Continue your journey.'}
            {authMode === 'signup' && 'Join millions of polyglots mastering any language in Lingoverse.'}
            {authMode === 'forgot' && 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {/* Success or Error Notice */}
        {successNotice && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {(localError || authError) && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{localError || authError}</span>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Show Password Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => {
                    sound.playClick();
                    setShowPassword(e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-teal-600 accent-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 hover:text-slate-800">
                  Show Password
                </span>
              </label>
            </div>

            {/* Prominent Teal/Cyan "LOG IN" Button */}
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-[#009688] hover:bg-[#00897b] active:translate-y-0.5 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 border-[#00796b] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <span>LOG IN</span>
              )}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Full Name (Optional)
              </label>
              <div className="relative">
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Pao the Polyglot"
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password (min. 6 chars)
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => {
                    sound.playClick();
                    setShowPassword(e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-teal-600 accent-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 hover:text-slate-800">
                  Show Password
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-[#009688] hover:bg-[#00897b] active:translate-y-0.5 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 border-[#00796b] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>CREATE ACCOUNT</span>
              )}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Registered Email
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#009688] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/15"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isResetSending}
              className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-[#009688] hover:bg-[#00897b] active:translate-y-0.5 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-b-4 border-[#00796b] disabled:opacity-60"
            >
              {isResetSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>SEND RESET LINK</span>
              )}
            </button>
          </form>
        )}

        {/* LINKS BELOW BUTTON: "Forgot Username / Password?" & "Don't have an account? Sign up" */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5 text-center">
          {authMode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline transition-colors cursor-pointer"
              >
                Forgot Username / Password?
              </button>

              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Don't have an account?{' '}
                <span className="font-extrabold text-teal-700 hover:underline">
                  Sign up
                </span>
              </button>
            </>
          )}

          {authMode === 'signup' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Already have an account?{' '}
              <span className="font-extrabold text-teal-700 hover:underline">
                Log in
              </span>
            </button>
          )}

          {authMode === 'forgot' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Remember your password?{' '}
              <span className="font-extrabold text-teal-700 hover:underline">
                Back to Login
              </span>
            </button>
          )}
        </div>

        {/* Alternative Google Sign-in & Guest Options */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="relative flex items-center justify-center mb-3">
            <span className="bg-white px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-60"
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
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Google Account</span>
          </button>

          {onBackToApp && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onBackToApp();
              }}
              className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
            >
              Continue as Guest (No sign-in required)
            </button>
          )}
        </div>

        {/* CRUCIAL REQUIREMENT: Fully working Privacy Policy link at the very bottom */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsPrivacyModalOpen(true);
            }}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Privacy Policy</span>
          </button>
        </div>
      </div>

      {/* Page Footer Note */}
      <div className="mt-6 text-center text-xs text-white/80 font-medium z-10 flex items-center gap-2">
        <span>© 2026 Lingoverse</span>
        <span>•</span>
        <button
          onClick={() => {
            sound.playClick();
            setIsPrivacyModalOpen(true);
          }}
          className="hover:text-white underline cursor-pointer"
        >
          Privacy Policy
        </button>
        <span>•</span>
        <span>Learn 500+ Languages</span>
      </div>

      {/* Interactive Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
