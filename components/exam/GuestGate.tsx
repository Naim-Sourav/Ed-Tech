import React, { useState } from 'react';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ArrowRight, Clock, Lock, LogIn, Mail, ShieldCheck, Trophy, User, UserPlus } from 'lucide-react';
import { auth } from '../../services/firebase';
import { syncUserToMongoDB } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { Button, Chip, EASE, Surface } from './ui';
import { bn, displaySubject } from './model';

/* Landing shown to logged-out visitors of a public (live) exam link. Signing in re-runs the exam bootstrap. */

export interface GuestExamInfo {
  title?: string;
  description?: string;
  subject?: string;
  duration?: number;
  totalMarks?: number;
  negativeMarking?: number;
  questions?: unknown[];
}

const banglaError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'ইমেইল বা পাসওয়ার্ড ঠিক নেই — আবার চেক করো।';
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে — লগইন করে দেখো।';
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
};

function GoogleMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.29a12 12 0 0 0 0 10.77l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.59 1.8l3.44-3.45A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.28 6.6l4 3.11c.94-2.84 3.6-4.94 6.72-4.94Z" />
    </svg>
  );
}

const inputClass =
  'w-full rounded-2xl border border-ink/12 bg-paper/60 py-3.5 pl-11 pr-4 text-[15px] font-medium text-ink placeholder:text-ink/35 transition-all duration-300 focus:border-brand/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10';

const GuestGate: React.FC<{ exam: GuestExamInfo; onHome: () => void }> = ({ exam, onHome }) => {
  const { loginWithGoogle } = useAuth() as { loginWithGoogle?: () => Promise<unknown> };
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (mode === 'REGISTER' && name.trim().length < 2) {
      setError('তোমার নামটা লিখো।');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'LOGIN') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim(), photoURL: '' });
        await syncUserToMongoDB({ ...cred.user, displayName: name.trim(), photoURL: '' }, { phoneNumber: '' });
      }
      // The auth listener re-runs the exam bootstrap; nothing else to do here.
    } catch (err) {
      logger.error(err);
      setError(banglaError((err as { code?: string }).code || ''));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (!loginWithGoogle || busy) return;
    setError('');
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(banglaError((err as { code?: string }).code || ''));
    } finally {
      setBusy(false);
    }
  };

  const questionCount = Array.isArray(exam.questions) ? exam.questions.length : undefined;

  return (
    <div className="pk-landing relative flex h-[100dvh] flex-col overflow-y-auto overflow-x-hidden bg-paper font-body text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-[-160px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-3xl" />
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
          <Surface className="overflow-hidden">
            <div className="bg-ink p-6 text-white sm:p-7">
              <Chip tone="gold" icon={Trophy}>
                লাইভ পরীক্ষা
              </Chip>
              <h1 className="mt-3 font-bangla text-[24px] font-extrabold leading-tight sm:text-[27px]">{exam.title || 'পরীক্ষা'}</h1>
              {exam.subject && <p className="mt-1 text-[14px] font-semibold text-white/70">{displaySubject(exam.subject)}</p>}
              {exam.description && <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-white/70">{exam.description}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {typeof exam.duration === 'number' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-bold">
                    <Clock className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" /> {bn(exam.duration)} মিনিট
                  </span>
                )}
                {typeof questionCount === 'number' && (
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-bold">{bn(questionCount)} টি প্রশ্ন</span>
                )}
                {typeof exam.totalMarks === 'number' && (
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-bold">{bn(exam.totalMarks)} নম্বর</span>
                )}
                {typeof exam.negativeMarking === 'number' && exam.negativeMarking > 0 && (
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-bold">নেগেটিভ −{bn(exam.negativeMarking)}</span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex rounded-full bg-ink/5 p-1" role="tablist" aria-label="লগইন বা নতুন অ্যাকাউন্ট">
                {(['LOGIN', 'REGISTER'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => {
                      setMode(m);
                      setError('');
                    }}
                    className={`focus-ring flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13.5px] font-bold transition-all ${
                      mode === m ? 'bg-white text-ink shadow-[0_6px_16px_-8px_rgba(22,18,16,0.35)] ring-1 ring-ink/8' : 'text-mist hover:text-ink'
                    }`}
                  >
                    {m === 'LOGIN' ? <LogIn className="h-4 w-4" strokeWidth={2.4} /> : <UserPlus className="h-4 w-4" strokeWidth={2.4} />}
                    {m === 'LOGIN' ? 'লগইন' : 'নতুন অ্যাকাউন্ট'}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-mist">
                {mode === 'LOGIN' ? 'লগইন করলেই পরীক্ষা শুরু হবে আর তোমার ফলাফল মেধাতালিকায় উঠবে।' : '৩০ সেকেন্ডে অ্যাকাউন্ট খুলে সরাসরি পরীক্ষায় বসে যাও।'}
              </p>

              <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
                {mode === 'REGISTER' && (
                  <label className="relative block">
                    <span className="sr-only">নাম</span>
                    <User
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/35"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="তোমার নাম"
                      autoComplete="name"
                      required
                      className={inputClass}
                    />
                  </label>
                )}
                <label className="relative block">
                  <span className="sr-only">ইমেইল</span>
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/35"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ইমেইল"
                    autoComplete="email"
                    required
                    inputMode="email"
                    className={inputClass}
                  />
                </label>
                <label className="relative block">
                  <span className="sr-only">পাসওয়ার্ড</span>
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/35"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড"
                    autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </label>

                {error && (
                  <p role="alert" className="rounded-2xl bg-flag/10 px-4 py-2.5 text-[13.5px] font-semibold text-flag">
                    {error}
                  </p>
                )}

                <Button type="submit" variant="primary" disabled={busy} className="h-12 w-full" iconRight={ArrowRight}>
                  {busy ? 'একটু অপেক্ষা করো…' : mode === 'LOGIN' ? 'লগইন করে পরীক্ষা শুরু করো' : 'অ্যাকাউন্ট খুলে শুরু করো'}
                </Button>
              </form>

              {loginWithGoogle && (
                <>
                  <div className="my-4 flex items-center gap-3 text-[12px] font-bold uppercase tracking-wider text-ink/35">
                    <span className="h-px flex-1 bg-ink/8" /> অথবা <span className="h-px flex-1 bg-ink/8" />
                  </div>
                  <button
                    type="button"
                    onClick={google}
                    disabled={busy}
                    className="focus-ring flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-ink/12 bg-white text-[15px] font-bold text-ink transition-colors hover:border-ink/25 disabled:opacity-50"
                  >
                    <GoogleMark className="h-[19px] w-[19px]" /> Google দিয়ে চালিয়ে যাও
                  </button>
                </>
              )}

              <p className="mt-5 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-mist">
                <ShieldCheck className="h-4 w-4 text-emerald-700" strokeWidth={2.4} aria-hidden="true" /> তোমার তথ্য নিরাপদ — শুধু ফলাফলের জন্য ব্যবহার হবে
              </p>
            </div>
          </Surface>

          <button type="button" onClick={onHome} className="focus-ring mx-auto mt-5 block text-[13.5px] font-bold text-mist hover:text-ink">
            ← হোমে ফিরে যাও
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestGate;
