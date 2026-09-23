import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  Loader2,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { syncUserToMongoDB } from '../services/api';
import { Logo } from './landing/Logo';
import { notifyAuthSuccess } from './AuthSuccessOverlay';

/*
 * Auth page — styled after premium-ed-tech-landing-page.zip
 * (src/components/auth/AuthPage.tsx): same layout, typography and motion,
 * wired to this app's Firebase auth (email+password, Google).
 *
 * Sign-up is deliberately tiny — name, email, password — so a new student is
 * inside the app in ~30 seconds. Everything else (avatar, phone, batch,
 * department, target, study goal) is collected by the full-screen
 * <ProfileSetup /> wizard that opens right after the first login.
 *
 * Deep links:  /auth?mode=signup  or  /auth#signup  open the sign-up tab;
 *              ?email=&name=      pre-fill it (used by the public exam flow).
 */

interface AuthPageProps {
  onBack: () => void;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

function GoogleMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.29a12 12 0 0 0 0 10.77l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.59 1.8l3.44-3.45A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.28 6.6l4 3.11c.94-2.84 3.6-4.94 6.72-4.94Z" />
    </svg>
  );
}

const inputBase =
  'w-full rounded-2xl border bg-paper/60 px-4 py-3.5 pl-11 text-[15px] font-medium text-ink placeholder:text-ink/35 transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4';

const inputTone = {
  idle: 'border-ink/12 focus:border-brand/60 focus:ring-brand/10',
  ok: 'border-brand/40 focus:border-brand/60 focus:ring-brand/10',
  error: 'border-flag/50 focus:border-flag/60 focus:ring-flag/10',
} as const;

type FieldStatus = keyof typeof inputTone;

/**
 * Labelled input shell with a leading icon, an optional trailing control
 * (password eye), a live status tick and an inline hint.
 */
function Field({
  label,
  icon,
  status = 'idle',
  hint,
  trailing,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  status?: FieldStatus;
  hint?: string | null;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink/70">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>
        {children}
        <AnimatePresence>
          {status === 'ok' && (
            <motion.span
              key="ok"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-brand ${trailing ? 'right-12' : 'right-4'}`}
              aria-hidden="true"
            >
              <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
        {trailing}
      </span>
      <AnimatePresence initial={false}>
        {hint && (
          <motion.span
            key="hint"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="block overflow-hidden"
          >
            <span
              className={`mt-1.5 flex items-start gap-1.5 text-[12.5px] font-semibold leading-snug ${
                status === 'error' ? 'text-flag' : 'text-mist'
              }`}
            >
              {status === 'error' && <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" />}
              {hint}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function passwordScore(p: string) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || /[A-Z]/.test(p)) s++;
  return s;
}
const scoreLabels = ['— লিখো —', 'দুর্বল', 'মোটামুটি', 'শক্তিশালী', 'দারুণ শক্তিশালী'];
const scoreColors = ['bg-ink/10', 'bg-flag', 'bg-gold', 'bg-brand', 'bg-brand-deep'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function banglaError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে — লগইন করে দেখো।';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'ইমেইল বা পাসওয়ার্ড ঠিক নেই — আবার চেক করো।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টারের হতে হবে।';
    case 'auth/invalid-email':
      return 'ইমেইল ঠিকানাটা ঠিক নেই।';
    case 'auth/too-many-requests':
      return 'অনেকবার চেষ্টা হয়ে গেছে — কিছুক্ষণ পরে আবার করো।';
    case 'auth/network-request-failed':
      return 'ইন্টারনেট সংযোগটা চেক করো।';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google পপ-আপ বন্ধ হয়ে গেছে — আবার চেষ্টা করো।';
    case 'auth/popup-blocked':
      return 'ব্রাউজার পপ-আপ আটকে দিয়েছে — পপ-আপ অনুমতি দিয়ে আবার চেষ্টা করো।';
    default:
      return 'একটু সমস্যা হয়েছে — আবার চেষ্টা করো।';
  }
}

const JOURNEY = {
  signup: [
    { n: '১', t: 'অ্যাকাউন্ট খোলো', d: '৩০ সেকেন্ড — নাম, ইমেইল, পাসওয়ার্ড। কার্ড লাগবে না' },
    { n: '২', t: 'প্রোফাইল সাজাও', d: 'ব্যাচ, বিভাগ আর লক্ষ্য বলো — বাকিটা আমরা সাজিয়ে দেবো' },
    { n: '৩', t: 'প্রথম মক দাও', d: 'রিয়েল এক্সাম ইন্টারফেস, instant রেজাল্ট আর AI রিপোর্ট' },
  ],
  login: [
    { n: '১', t: 'যেখানে ছেড়েছিলে', d: 'স্ট্রিক, সেভ করা প্রশ্ন, ভুলের খাতা — সব ঠিক আছে' },
    { n: '২', t: 'আজকের চ্যালেঞ্জ', d: 'ডেইলি কুইজ আর লাইভ মক অপেক্ষা করছে' },
    { n: '৩', t: 'দুর্বলতা জেনে এগিয়ে যাও', d: 'AI রিপোর্ট বলে দেবে কোথায় ফোকাস' },
  ],
} as const;

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { currentUser, loginWithGoogle } = useAuth();
  const location = useLocation();

  // Read deep-link params synchronously so /auth?mode=signup renders the
  // sign-up form on the very first paint (no login→sign-up tab flicker).
  const [entry] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      signup:
        params.get('mode') === 'signup' || location.hash === '#signup' || params.has('email') || params.has('name'),
      email: params.get('email') || '',
      name: params.get('name') || '',
    };
  });

  const [mode, setMode] = useState<'login' | 'signup'>(entry.signup ? 'signup' : 'login');
  const [name, setName] = useState(entry.name);
  const [email, setEmail] = useState(entry.email);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [justAuthed, setJustAuthed] = useState(false);

  // inline validation only speaks up after a field was visited (or a submit)
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const isSignup = mode === 'signup';
  const score = passwordScore(password);

  const nameOk = name.trim().length >= 2;
  const emailOk = EMAIL_RE.test(email.trim());
  const passOk = password.length >= 6;

  const passChecks = useMemo(
    () => [
      { ok: password.length >= 6, label: '৬+ ক্যারেক্টার' },
      { ok: /\d/.test(password), label: 'একটা সংখ্যা' },
      { ok: /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password), label: 'বড় হাতের অক্ষর বা চিহ্ন' },
    ],
    [password]
  );

  const fieldStatus = (key: keyof typeof touched, ok: boolean, value: string): FieldStatus => {
    if (!isSignup) return 'idle';
    if (ok && value) return 'ok';
    if ((touched[key] || submitted) && !ok) return 'error';
    return 'idle';
  };
  const nameStatus = fieldStatus('name', nameOk, name);
  const emailStatus = fieldStatus('email', emailOk, email);
  const passStatus = fieldStatus('password', passOk, password);

  // Deep links while already mounted (e.g. a "ফ্রিতে অ্যাকাউন্ট খোলো" link
  // hit from /auth itself): ?mode=signup / #signup switch to the sign-up tab,
  // ?email=&name= pre-fill it (used by the public exam flow).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const wantsSignup =
      params.get('mode') === 'signup' || location.hash === '#signup' || params.has('email') || params.has('name');
    if (wantsSignup) setMode('signup');
    const pEmail = params.get('email');
    const pName = params.get('name');
    if (pEmail) setEmail(pEmail);
    if (pName) setName(pName);
  }, [location.search, location.hash]);

  useEffect(() => {
    setError(null);
    setNotice(null);
    setSubmitted(false);
    setTouched({ name: false, email: false, password: false });
  }, [mode]);

  const touch = (key: keyof typeof touched) => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (isSignup) {
      setSubmitted(true);
      // focus the first field that still needs attention instead of shouting
      if (!nameOk) return nameRef.current?.focus();
      if (!emailOk) return emailRef.current?.focus();
      if (!passOk) return passRef.current?.focus();
    }

    setBusy(true);
    try {
      if (isSignup) {
        const cleanName = name.trim();
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: cleanName, photoURL: '' });
        // Phone, batch, department, target… are collected by <ProfileSetup />
        // right after this — keep the account record minimal here.
        await syncUserToMongoDB({ ...cred.user, displayName: cleanName, photoURL: '' });
        notifyAuthSuccess(cleanName.split(' ')[0] || 'বন্ধু', 'এবার প্রোফাইলটা সাজিয়ে নিই…');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        notifyAuthSuccess(
          (currentUser?.displayName || email.trim().split('@')[0]).split(' ')[0] || 'বন্ধু'
        );
      }
      setJustAuthed(true);
    } catch (err) {
      setError(banglaError((err as { code?: string }).code || ''));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const gUser = await loginWithGoogle();
      notifyAuthSuccess((gUser?.displayName || currentUser?.displayName || 'বন্ধু').split(' ')[0]);
      setJustAuthed(true);
    } catch (err) {
      setError(banglaError((err as { code?: string }).code || ''));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('আগে ওপরে তোমার ইমেইলটা লিখো, তারপর রিসেট চাপো।');
      emailRef.current?.focus();
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice('রিসেট লিংক পাঠিয়ে দিয়েছি — ইনবক্স (প্রয়োজনে স্প্যাম) চেক করো।');
    } catch (err) {
      setError(banglaError((err as { code?: string }).code || ''));
    }
  };

  const welcomeName = (name || currentUser?.displayName || 'বন্ধু').split(' ')[0];
  const journey = JOURNEY[mode];

  return (
    <div className="pk-landing relative min-h-screen overflow-hidden bg-paper font-body text-ink">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-44 right-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-140px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl" />
      </div>

      {/* Minimal header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <button
          type="button"
          onClick={onBack}
          className="focus-ring group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold text-mist transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          হোমে ফিরো
        </button>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-6 sm:px-6 lg:min-h-[calc(100vh-104px)] lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:pt-0">
        {/* ── Brand panel ── */}
        <motion.aside
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          className="noise relative hidden min-h-[560px] flex-col justify-between overflow-hidden rounded-[32px] bg-ink p-10 text-white shadow-[0_48px_90px_-40px_rgba(22,18,16,0.7)] lg:flex"
        >
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-[440px] w-[440px] rounded-full blur-3xl"
            style={{
              background:
                'conic-gradient(from 120deg, rgba(255,82,0,0.0), rgba(255,82,0,0.45), rgba(255,185,46,0.3), rgba(255,82,0,0.0))',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.26em] text-lime">
              <Flame className="h-3.5 w-3.5" /> তোমার অঙ্গন অপেক্ষা করছে
            </p>
            <h2 className="mt-5 font-bangla text-[38px] font-extrabold leading-[1.15] tracking-tight xl:text-[44px]">
              একটা অ্যাকাউন্ট,
              <br />
              <span className="bg-gradient-to-r from-brand-bright to-lime bg-clip-text text-transparent">
                তিনটা লড়াইয়ের অস্ত্র।
              </span>
            </h2>

            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                className="mt-10 space-y-6"
              >
                {journey.map((s, i) => (
                  <motion.li
                    key={s.t}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: EASE_OUT_EXPO }}
                    className="flex items-start gap-4"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand font-display text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(255,82,0,0.6)]">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-bangla text-[17px] font-bold">{s.t}</p>
                      <p className="mt-0.5 text-[14px] text-white/55">{s.d}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          <div className="relative mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
            <div className="flex -space-x-2.5" aria-hidden="true">
              {['AR', 'NS', 'TH'].map((t, i) => (
                <span
                  key={t}
                  className={`grid h-9 w-9 place-items-center rounded-full text-[10.5px] font-bold text-white ring-2 ring-ink ${
                    ['bg-brand', 'bg-gold', 'bg-flag'][i]
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-[13.5px] leading-snug text-white/60">
              <span className="font-bold text-white">২,৩৪,০০০+ শিক্ষার্থী</span> ইতিমধ্যে
              <br />
              প্রতিদিন চর্চা করছে
            </p>
          </div>
        </motion.aside>

        {/* ── Form column ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT_EXPO }}
          className="mx-auto w-full max-w-md"
        >
          {currentUser && !justAuthed ? (
            <div className="rounded-[26px] bg-white p-8 text-center shadow-[0_24px_60px_-28px_rgba(22,18,16,0.3)] ring-1 ring-ink/10">
              <span className="ring-conic mx-auto grid h-16 w-16 place-items-center rounded-[26%] font-bangla text-[24px] font-bold text-white shadow-lg">
                {(currentUser.displayName || 'প').charAt(0)}
              </span>
              <h2 className="mt-5 font-bangla text-[22px] font-bold text-ink">
                তুমি তো লগইন করাই আছো, {welcomeName}!
              </h2>
              <p className="mt-2 text-[14px] text-mist">{currentUser.email}</p>
              <button
                type="button"
                onClick={onBack}
                className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[15px] font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-brand-deep"
              >
                এগিয়ে যাও
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-center font-bangla text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
                {isSignup ? 'অঙ্গনে তোমাকে স্বাগতম' : 'আবার দেখা, ভালো লাগলো'}
              </h1>
              <p className="mt-2 text-center text-[14.5px] text-mist">
                {isSignup
                  ? '৩০ সেকেন্ডে অ্যাকাউন্ট — তারপর ১ মিনিটে প্রোফাইল, ব্যস।'
                  : 'যেখানে ছেড়েছিলে, ঠিক সেখান থেকেই আবার'}
              </p>

              {/* Tabs */}
              <div className="mt-6 grid grid-cols-2 rounded-full bg-white p-1.5 ring-1 ring-ink/10" role="tablist" aria-label="Auth mode">
                {(
                  [
                    { id: 'login', label: 'লগইন' },
                    { id: 'signup', label: 'অ্যাকাউন্ট খোলো' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === t.id}
                    onClick={() => setMode(t.id)}
                    className="focus-ring relative rounded-full py-2.5"
                  >
                    {mode === t.id && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span
                      className={`relative z-10 text-[14px] font-bold transition-colors ${
                        mode === t.id ? 'text-paper' : 'text-mist hover:text-ink'
                      }`}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Card */}
              <div className="mt-5 rounded-[26px] bg-white p-6 shadow-[0_24px_60px_-28px_rgba(22,18,16,0.3)] ring-1 ring-ink/10 sm:p-7">
                <AnimatePresence mode="wait">
                  <motion.form
                    key={mode}
                    onSubmit={submit}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    className="space-y-4"
                    noValidate
                  >
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          role="alert"
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginBottom: 4 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2.5 overflow-hidden rounded-2xl bg-flag/8 px-4 py-3 text-[13.5px] font-semibold leading-snug text-flag ring-1 ring-flag/15"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          {error}
                        </motion.p>
                      )}
                      {notice && (
                        <motion.p
                          role="status"
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginBottom: 4 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2.5 overflow-hidden rounded-2xl bg-mint px-4 py-3 text-[13.5px] font-semibold leading-snug text-ink ring-1 ring-brand/20"
                        >
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          {notice}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {isSignup && (
                      <Field
                        label="তোমার নাম"
                        icon={<UserRound className="h-[18px] w-[18px]" />}
                        status={nameStatus}
                        hint={nameStatus === 'error' ? 'পুরো নামটা লিখো — লিডারবোর্ড আর ব্যাটলে এটাই দেখাবে।' : null}
                      >
                        <input
                          ref={nameRef}
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => touch('name')}
                          placeholder="যেমন: নুসরাত জাহান"
                          autoComplete="name"
                          aria-invalid={nameStatus === 'error'}
                          className={`${inputBase} ${inputTone[nameStatus]} pr-11`}
                        />
                      </Field>
                    )}

                    <Field
                      label="ইমেইল"
                      icon={<Mail className="h-[18px] w-[18px]" />}
                      status={emailStatus}
                      hint={emailStatus === 'error' ? 'ইমেইলটা ঠিক করে লিখো — যেমন: tumi@gmail.com' : null}
                    >
                      <input
                        ref={emailRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => touch('email')}
                        placeholder="tumi@example.com"
                        autoComplete="email"
                        inputMode="email"
                        required
                        aria-invalid={emailStatus === 'error'}
                        className={`${inputBase} ${inputTone[emailStatus]} pr-11`}
                      />
                    </Field>

                    <Field
                      label="পাসওয়ার্ড"
                      icon={<Lock className="h-[18px] w-[18px]" />}
                      status={passStatus}
                      hint={passStatus === 'error' ? 'কমপক্ষে ৬ ক্যারেক্টার দাও — সংখ্যা মেশালে আরও ভালো।' : null}
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          aria-label={showPass ? 'পাসওয়ার্ড লুকোও' : 'পাসওয়ার্ড দেখো'}
                          className="focus-ring absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink/35 transition-colors hover:text-ink"
                        >
                          {showPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                        </button>
                      }
                    >
                      <input
                        ref={passRef}
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => touch('password')}
                        placeholder={isSignup ? 'কমপক্ষে ৬ ক্যারেক্টার' : 'তোমার পাসওয়ার্ড'}
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        required
                        aria-invalid={passStatus === 'error'}
                        className={`${inputBase} ${inputTone[passStatus]} ${isSignup ? 'pr-20' : 'pr-12'}`}
                      />
                    </Field>

                    {isSignup && (
                      <div className="!mt-2.5 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-1 gap-1.5" aria-hidden="true">
                            {[1, 2, 3, 4].map((seg) => (
                              <span
                                key={seg}
                                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                                  score >= seg ? scoreColors[score] : 'bg-ink/10'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11.5px] font-bold text-mist">{scoreLabels[score]}</span>
                        </div>
                        <ul className="flex flex-wrap gap-1.5" aria-label="পাসওয়ার্ড চেকলিস্ট">
                          {passChecks.map((c) => (
                            <li
                              key={c.label}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold transition-colors duration-300 ${
                                c.ok ? 'bg-mint text-brand-deep' : 'bg-ink/5 text-mist'
                              }`}
                            >
                              <Check className={`h-3 w-3 ${c.ok ? 'opacity-100' : 'opacity-30'}`} strokeWidth={3.5} />
                              {c.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!isSignup && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={forgot}
                          className="focus-ring text-[13px] font-bold text-brand-deep transition-colors hover:text-brand"
                        >
                          পাসওয়ার্ড ভুলে গেছো?
                        </button>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={busy}
                      whileTap={{ scale: 0.98 }}
                      className="focus-ring group flex w-full items-center justify-center gap-2.5 rounded-full bg-brand py-4 text-[15.5px] font-bold text-white shadow-[0_16px_36px_-14px_rgba(255,82,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {busy ? (
                        <>
                          <Loader2 className="h-[18px] w-[18px] animate-spin" />
                          একটু ধরো…
                        </>
                      ) : isSignup ? (
                        <>
                          অ্যাকাউন্ট খোলো — ফ্রি
                          <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      ) : (
                        'অঙ্গনে ঢুকে পড়ো'
                      )}
                    </motion.button>

                    <div className="flex items-center gap-3 pt-1" aria-hidden="true">
                      <span className="h-px flex-1 bg-ink/10" />
                      <span className="text-[12px] font-semibold text-mist">অথবা</span>
                      <span className="h-px flex-1 bg-ink/10" />
                    </div>

                    <button
                      type="button"
                      onClick={google}
                      disabled={busy}
                      className="focus-ring flex w-full items-center justify-center gap-3 rounded-full bg-white py-3.5 text-[15px] font-bold text-ink ring-1 ring-ink/12 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgba(22,18,16,0.35)] hover:ring-ink/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <GoogleMark className="h-[19px] w-[19px]" />
                      Google দিয়ে চালিয়ে যাও
                    </button>

                    {isSignup ? (
                      <p className="pt-1 text-center text-[11.5px] leading-relaxed text-mist">
                        অ্যাকাউন্ট খুললে তুমি পরীক্ষাঙ্গনের{' '}
                        <Link to="/terms" className="focus-ring font-bold text-ink/70 underline-offset-2 hover:text-brand hover:underline">
                          টার্মস
                        </Link>{' '}
                        ও{' '}
                        <Link to="/privacy" className="focus-ring font-bold text-ink/70 underline-offset-2 hover:text-brand hover:underline">
                          প্রাইভেসি নীতি
                        </Link>{' '}
                        মেনে নিচ্ছো।
                      </p>
                    ) : (
                      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11.5px] leading-relaxed text-mist">
                        <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                        তোমার তথ্য এনক্রিপ্টেড থাকে — আমরা কাউকে দিই না।
                      </p>
                    )}
                  </motion.form>
                </AnimatePresence>
              </div>

              {/* Mode switch helper */}
              <p className="mt-5 text-center text-[13.5px] text-mist">
                {isSignup ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : 'নতুন এখানে?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(isSignup ? 'login' : 'signup')}
                  className="focus-ring font-bold text-brand-deep transition-colors hover:text-brand"
                >
                  {isSignup ? 'লগইন করো' : 'ফ্রিতে অ্যাকাউন্ট খোলো →'}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </main>

      {/* Success checkmark is rendered globally by <AuthSuccessOverlay />
          (mounted in App), so it survives the /auth -> /dashboard redirect. */}
    </div>
  );
};

export default AuthPage;
