import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Check,
  Flame,
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
import { Logo } from './landing/ui';

/*
 * Auth page restyled to match premium-ed-tech-landing-page.zip
 * (src/components/auth/AuthPage.tsx) — same layout, typography and motion,
 * wired to this app's Firebase auth (email+password, phone on signup, Google).
 */

interface AuthPageProps {
  onBack: () => void;
}

const TRACKS = ['SSC', 'HSC', 'Admission'];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

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

const inputCls =
  'w-full rounded-2xl border border-ink/12 bg-paper/60 px-4 py-3.5 pl-11 text-[15px] font-medium text-ink placeholder:text-ink/35 transition-all duration-300 focus:border-brand/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10';

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink/70">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>
        {children}
      </span>
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
      return 'Google পপ-আপ বন্ধ হয়ে গেছে — আবার চেষ্টা করো।';
    default:
      return 'একটু সমস্যা হয়েছে — আবার চেষ্টা করো।';
  }
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { currentUser, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [track, setTrack] = useState('HSC');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [justAuthed, setJustAuthed] = useState(false);

  const isSignup = mode === 'signup';
  const score = passwordScore(password);

  // Pre-fill from URL params (e.g. arriving from a public exam)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pEmail = params.get('email');
    const pName = params.get('name');
    if (pEmail || pName) {
      setMode('signup');
      if (pEmail) setEmail(pEmail);
      if (pName) setName(pName);
    }
  }, []);

  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [mode]);

  const validatePhone = (n: string) => /^01[3-9]\d{8}$/.test(n);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (isSignup && !name.trim()) {
      setError('তোমার নামটা লিখো — অঙ্গনে সবাই নামেই চিনবে।');
      return;
    }
    if (isSignup && !validatePhone(phone)) {
      setError('সঠিক মোবাইল নাম্বার দাও (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (isSignup && password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টারের হতে হবে।');
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim(), photoURL: '' });
        await syncUserToMongoDB({ ...cred.user, displayName: name.trim(), photoURL: '' }, {
          phoneNumber: phone,
          track,
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
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
      await loginWithGoogle();
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

            <ul className="mt-10 space-y-6">
              {[
                { n: '০', t: 'ফ্রিতে অ্যাকাউন্ট খোলো', d: '৩০ সেকেন্ডেই — কার্ড লাগবে না' },
                { n: '০২', t: 'প্রথম লাইভ মক টা দাও', d: 'রিয়েল এক্সাম ইন্টারফেসে, instant রেজাল্ট' },
                { n: '০৩', t: 'দুর্বলতা জেনে এগিয়ে যাও', d: 'AI রিপোর্ট বলে দেবে কোথায় ফোকাস' },
              ].map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
                  className="flex items-start gap-4"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand font-display text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(255,82,0,0.6)]">
                    {s.n.charAt(1)}
                  </span>
                  <div>
                    <p className="font-bangla text-[17px] font-bold">{s.t}</p>
                    <p className="mt-0.5 text-[14px] text-white/55">{s.d}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
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
              <span className="font-bold text-white">২,৪০,০০+ শিক্ষার্থী</span> ইতিমধ্যে
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
                {isSignup ? '৩০ সেকেন্ডে অ্যাকাউন্ট খোলো — ফ্রিতেই শুরু' : 'যেখানে ছেড়েছিলে, ঠিক সেখান থেকেই আবার'}
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
                      <Field label="তোমার নাম" icon={<UserRound className="h-[18px] w-[18px]" />}>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="যেমন: নুসরাত জাহান"
                          autoComplete="name"
                          className={inputCls}
                        />
                      </Field>
                    )}

                    {isSignup && (
                      <Field label="মোবাইল নাম্বার" icon={<Smartphone className="h-[18px] w-[18px]" />}>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          autoComplete="tel"
                          className={inputCls}
                        />
                      </Field>
                    )}

                    <Field label="ইমেইল" icon={<Mail className="h-[18px] w-[18px]" />}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tumi@example.com"
                        autoComplete="email"
                        required
                        className={inputCls}
                      />
                    </Field>

                    <Field label="পাসওয়ার্ড" icon={<Lock className="h-[18px] w-[18px]" />}>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignup ? 'কমপক্ষে ৬ ক্যারেক্টার' : 'তোমার পাসওয়ার্ড'}
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        required
                        className={`${inputCls} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        aria-label={showPass ? 'পাসওয়ার্ড লুকোও' : 'পাসওয়ার্ড দেখো'}
                        className="focus-ring absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink/35 transition-colors hover:text-ink"
                      >
                        {showPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </Field>

                    {isSignup && (
                      <div className="!mt-2 flex items-center gap-2.5">
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
                    )}

                    {isSignup && (
                      <div>
                        <span className="mb-1.5 block text-[13px] font-bold text-ink/70">কোন লড়াইয়ে আছো?</span>
                        <div className="grid grid-cols-3 gap-2">
                          {TRACKS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTrack(t)}
                              aria-pressed={track === t}
                              className={`focus-ring relative rounded-2xl border py-2.5 text-[13.5px] font-bold transition-all duration-300 ${
                                track === t
                                  ? 'border-brand bg-mint text-brand-deep shadow-[0_8px_20px_-10px_rgba(255,82,0,0.5)]'
                                  : 'border-ink/10 bg-paper/60 text-mist hover:border-brand/30 hover:text-ink'
                              }`}
                            >
                              {t}
                              {track === t && (
                                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                                  <Check className="h-3 w-3" strokeWidth={3.5} />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
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
                        'অ্যাকাউন্ট খোলো — ফ্রি'
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

                    {isSignup && (
                      <p className="pt-1 text-center text-[11.5px] leading-relaxed text-mist">
                        অ্যাকাউন্ট খুললে তুমি পরীক্ষাঙ্গনের <span className="font-bold text-ink/70">টার্মস</span> ও{' '}
                        <span className="font-bold text-ink/70">প্রাইভেসি নীতি</span> মেনে নিচ্ছো।
                      </p>
                    )}
                  </motion.form>
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* ── Success overlay ── */}
      <AnimatePresence>
        {justAuthed && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-paper/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: EASE_SPRING }}
              className="text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: EASE_SPRING }}
                className="ring-conic mx-auto grid h-20 w-20 place-items-center rounded-full text-white shadow-[0_20px_50px_-14px_rgba(255,82,0,0.6)]"
              >
                <Check className="h-9 w-9" strokeWidth={3.5} />
              </motion.span>
              <h2 className="mt-6 font-bangla text-[30px] font-extrabold tracking-tight text-ink">
                স্বাগতম, {welcomeName}!
              </h2>
              <p className="mt-1.5 text-[14.5px] font-medium text-mist">অঙ্গনে নিয়ে যাওয়া হচ্ছে…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
