import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Cog,
  GraduationCap,
  Landmark,
  Loader2,
  Mail,
  Rocket,
  School,
  Shuffle,
  Smartphone,
  Sparkles,
  Stethoscope,
  Sprout,
  Target,
  Trophy,
  UserRound,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import LogoMark from '../landing/Logo';
import {
  DEPARTMENTS,
  LEVELS,
  STUDY_GOALS,
  TARGETS,
  batchOptions,
  labelOf,
  type StudyLevel,
} from '../../data/profileOptions';
import { formatBdPhone, isValidBdPhone, normalizeBdPhone, toBanglaDigits } from '../../utils/phone';

/*
 * Profile setup wizard — the "তথ্য সংগ্রহ → প্রোফাইল তৈরি" half of
 * registration. Full-screen, in the same warm editorial language as the
 * landing + auth pages, so sign-up → setup feels like one continuous journey.
 *
 *   ০১ পরিচয়     avatar · name · mobile (required)
 *   ০২ পড়াশোনা   level · batch · department · college
 *   ০৩ লক্ষ্য     admission target · daily study goal
 *   ✓  প্রস্তুত   summary card + confetti + first-action CTAs
 *
 * Purely presentational: all persistence is injected through props so it can
 * be rendered (and tested) without Firebase. See ./ProfileSetup.tsx for the
 * container that wires it to AuthContext.
 */

export interface ProfileDraft {
  step: number;
  name: string;
  photoURL: string;
  phone: string;
  level: StudyLevel | '';
  batch: string;
  department: string;
  target: string;
  college: string;
  goal: string;
  /** DiceBear seeds backing the avatar grid (kept so a refresh shows the same faces) */
  seeds: string[];
}

export interface ProfileSetupResult {
  name: string;
  photoURL: string;
  phoneNumber: string;
  level: StudyLevel;
  hscBatch: string;
  department: string;
  target: string;
  college: string;
  dailyStudyGoal: string;
}

export interface ProfileSetupWizardProps {
  email?: string | null;
  /** Google account photo — offered as the first avatar choice when present */
  googlePhotoURL?: string | null;
  initial: ProfileDraft;
  onDraftChange?: (draft: ProfileDraft) => void;
  onSave: (result: ProfileSetupResult) => Promise<void>;
  onSkip: () => void;
  onDone: (destination: 'dashboard' | 'exams') => void;
  /** Upload a picked photo and resolve with its https URL */
  uploadPhoto?: (file: File) => Promise<string>;
  /** Injected clock so batch years are deterministic in tests */
  now?: Date;
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** direction-aware slide for step panels (custom = +1 forward / -1 back) */
const SLIDE = {
  enter: (d: number) => ({ opacity: 0, x: d * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -28 }),
};

/* ---------- avatars (DiceBear "adventurer", served as https SVG) ---------- */

const AVATAR_BG = ['ffd5dc', 'ffdfbf', 'ffeade', 'fff1d6', 'c0aede', 'b6e3f4'];
export const AVATAR_COUNT = 6;

export const avatarUrl = (seed: string, i: number): string =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${
    AVATAR_BG[i % AVATAR_BG.length]
  }&radius=50`;

/** Stable first set (derived from the uid) — a refresh shows the same faces. */
export const seedsFor = (base: string): string[] =>
  Array.from({ length: AVATAR_COUNT }, (_, i) => `${base}-${i}`);

const randomSeeds = (): string[] =>
  Array.from({ length: AVATAR_COUNT }, () => Math.random().toString(36).slice(2, 9));

export const emptyDraft = (seedBase: string): ProfileDraft => ({
  step: 0,
  name: '',
  photoURL: '',
  phone: '',
  level: '',
  batch: '',
  department: '',
  target: '',
  college: '',
  goal: '',
  seeds: seedsFor(seedBase),
});

/* ---------- small building blocks ---------- */

const STEPS = [
  { id: 'identity', title: 'পরিচয়', hint: 'নাম, ছবি আর মোবাইল' },
  { id: 'study', title: 'পড়াশোনা', hint: 'লেভেল, ব্যাচ, বিভাগ' },
  { id: 'goal', title: 'লক্ষ্য', hint: 'টার্গেট আর দৈনিক সময়' },
] as const;

const LEVEL_ICON: Record<StudyLevel, React.ReactNode> = {
  SSC: <BookOpen className="h-5 w-5" />,
  HSC: <GraduationCap className="h-5 w-5" />,
  Admission: <Rocket className="h-5 w-5" />,
};

const TARGET_ICON: Record<string, React.ReactNode> = {
  Medical: <Stethoscope className="h-5 w-5" />,
  Engineering: <Cog className="h-5 w-5" />,
  Varsity: <Landmark className="h-5 w-5" />,
  Agriculture: <Sprout className="h-5 w-5" />,
};

const inputBase =
  'w-full rounded-2xl border bg-paper/60 px-4 py-3.5 pl-11 text-[15px] font-medium text-ink placeholder:text-ink/35 transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4';
const inputTone = {
  idle: 'border-ink/12 focus:border-brand/60 focus:ring-brand/10',
  ok: 'border-brand/40 focus:border-brand/60 focus:ring-brand/10',
  error: 'border-flag/50 focus:border-flag/60 focus:ring-flag/10',
} as const;
type Tone = keyof typeof inputTone;

function Field({
  label,
  optional,
  icon,
  tone = 'idle',
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  icon: React.ReactNode;
  tone?: Tone;
  hint?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-[13px] font-bold text-ink/70">
        {label}
        {optional && <span className="text-[11.5px] font-semibold text-mist">(ঐচ্ছিক)</span>}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>
        {children}
        <AnimatePresence>
          {tone === 'ok' && (
            <motion.span
              key="ok"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <AnimatePresence initial={false}>
        {hint && (
          <motion.span
            key={`${tone}-${hint}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="block overflow-hidden"
          >
            <span
              className={`mt-1.5 flex items-start gap-1.5 text-[12.5px] font-semibold leading-snug ${
                tone === 'error' ? 'text-flag' : 'text-mist'
              }`}
            >
              {tone === 'error' ? (
                <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" />
              ) : (
                <ShieldCheck className="mt-[1px] h-3.5 w-3.5 shrink-0 text-brand" />
              )}
              {hint}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function SectionLabel({ icon, children, error }: { icon?: React.ReactNode; children: React.ReactNode; error?: boolean }) {
  return (
    <span className={`mb-2 flex items-center gap-1.5 text-[13px] font-bold ${error ? 'text-flag' : 'text-ink/70'}`}>
      {icon && <span className={error ? 'text-flag' : 'text-brand'}>{icon}</span>}
      {children}
    </span>
  );
}

/** Pill-style single choice (batch, department, study goal). */
function Chip({
  selected,
  onClick,
  children,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={{ scale: 0.97 }}
      className={`focus-ring relative flex min-h-[46px] flex-col items-start justify-center rounded-2xl border px-4 py-2.5 text-left transition-all duration-300 ${
        selected
          ? 'border-brand bg-mint text-brand-deep shadow-[0_10px_24px_-14px_rgba(255,82,0,0.6)]'
          : 'border-ink/10 bg-paper/60 text-ink/80 hover:border-brand/30 hover:text-ink'
      }`}
    >
      <span className="text-[14px] font-bold leading-tight">{children}</span>
      {hint && <span className={`mt-0.5 text-[11.5px] font-medium ${selected ? 'text-brand-deep/70' : 'text-mist'}`}>{hint}</span>}
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow"
        >
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </motion.span>
      )}
    </motion.button>
  );
}

/** Icon card single choice (level, target). */
function OptionCard({
  selected,
  onClick,
  icon,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={{ scale: 0.97 }}
      className={`focus-ring relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
        selected
          ? 'border-brand bg-mint shadow-[0_14px_30px_-16px_rgba(255,82,0,0.6)]'
          : 'border-ink/10 bg-paper/60 hover:border-brand/30'
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
          selected ? 'bg-brand text-white shadow-[0_10px_20px_-8px_rgba(255,82,0,0.7)]' : 'bg-ink/5 text-ink/60'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className={`block text-[14.5px] font-bold leading-tight ${selected ? 'text-brand-deep' : 'text-ink'}`}>{label}</span>
        {hint && <span className="mt-0.5 block truncate text-[12px] font-medium text-mist">{hint}</span>}
      </span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow"
        >
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </motion.span>
      )}
    </motion.button>
  );
}

function Avatar({ src, name, className = 'h-14 w-14', textClass = 'text-[20px]' }: { src?: string; name?: string; className?: string; textClass?: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  const initial = (name || 'প').trim().charAt(0) || 'প';
  if (src && !broken) {
    return <img src={src} alt="" onError={() => setBroken(true)} className={`${className} rounded-full object-cover`} draggable={false} />;
  }
  return (
    <span className={`ring-conic grid ${className} place-items-center rounded-full font-bangla ${textClass} font-bold text-white`}>
      {initial}
    </span>
  );
}

/* ---------- the wizard ---------- */

const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({
  email,
  googlePhotoURL,
  initial,
  onDraftChange,
  onSave,
  onSkip,
  onDone,
  uploadPhoto,
  now,
}) => {
  const [step, setStep] = useState(Math.min(Math.max(initial.step, 0), 2));
  const [dir, setDir] = useState<1 | -1>(1);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [level, setLevel] = useState<StudyLevel | ''>(initial.level);
  const [batch, setBatch] = useState(initial.batch);
  const [department, setDepartment] = useState(initial.department);
  const [target, setTarget] = useState(initial.target);
  const [college, setCollege] = useState(initial.college);
  const [goal, setGoal] = useState(initial.goal);
  const [seeds, setSeeds] = useState(initial.seeds.length ? initial.seeds : randomSeeds());
  // a stored https photo that is neither a generated avatar nor the Google
  // picture must be something the student uploaded — keep it in the grid
  const [uploaded, setUploaded] = useState<string>(() => {
    const p = initial.photoURL;
    const isOwnUpload = !!p && /^https?:/.test(p) && !p.includes('api.dicebear.com') && p !== googlePhotoURL;
    return isOwnUpload ? p : '';
  });
  const [photoURL, setPhotoURL] = useState(initial.photoURL || googlePhotoURL || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /* move focus into the dialog on open (no keyboard pop-up), top of page per step */
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    rootRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [step, done]);

  /* default avatar: whatever is stored → Google photo → first generated face */
  useEffect(() => {
    if (!photoURL && seeds.length) setPhotoURL(avatarUrl(seeds[0], 0));
  }, [photoURL, seeds]);

  /* derived validation */
  const cleanName = name.trim();
  const nameOk = cleanName.length >= 2;
  const normPhone = normalizeBdPhone(phone);
  const phoneOk = isValidBdPhone(normPhone);
  const batches = useMemo(() => (level ? batchOptions(level, now) : []), [level, now]);
  const studyOk = !!level && !!batch && !!department;
  const goalOk = !!target && !!goal;

  // flag a field once the student tried to continue, or left it half-filled
  const nameTone: Tone = nameOk ? 'ok' : attempted[0] || (touched.name && name) ? 'error' : 'idle';
  const phoneTone: Tone = phoneOk ? 'ok' : attempted[0] || (touched.phone && phone) ? 'error' : 'idle';

  /* completeness for the preview meter */
  const filled = [nameOk, phoneOk, !!level, !!batch, !!department, !!target, !!goal].filter(Boolean).length;
  const percent = Math.round((filled / 7) * 100);

  /* persist draft */
  useEffect(() => {
    onDraftChange?.({ step, name, photoURL, phone, level, batch, department, target, college, goal, seeds });
  }, [step, name, photoURL, phone, level, batch, department, target, college, goal, seeds]);

  /* keep batch valid when the level changes */
  const pickLevel = (l: StudyLevel) => {
    setLevel(l);
    if (!batchOptions(l, now).includes(batch)) setBatch('');
  };

  const shuffle = () => {
    const next = randomSeeds();
    setSeeds(next);
    if (photoURL.includes('api.dicebear.com')) setPhotoURL(avatarUrl(next[0], 0));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadPhoto) return;
    setUploadError(null);
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('ছবিটা ৫ MB-এর ছোট হতে হবে।');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      setUploaded(url);
      setPhotoURL(url);
    } catch {
      setUploadError('ছবি আপলোড হয়নি — নেট চেক করে আবার চেষ্টা করো।');
    } finally {
      setUploading(false);
    }
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setSaveError(null);
  };

  const next = () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (step === 0) {
      if (!nameOk) return nameRef.current?.focus();
      if (!phoneOk) return phoneRef.current?.focus();
      return go(1);
    }
    if (step === 1) {
      if (!studyOk) return;
      return go(2);
    }
  };

  const finish = async () => {
    setAttempted((a) => ({ ...a, 2: true }));
    // a resumed draft may have been edited elsewhere — re-check earlier steps
    if (!nameOk || !phoneOk) {
      setAttempted((a) => ({ ...a, 0: true }));
      return go(0);
    }
    if (!studyOk || !level) {
      setAttempted((a) => ({ ...a, 1: true }));
      return go(1);
    }
    if (!goalOk) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        name: cleanName,
        photoURL,
        phoneNumber: normPhone,
        level,
        hscBatch: batch,
        department,
        target,
        college: college.trim(),
        dailyStudyGoal: goal,
      });
      setDone(true);
    } catch {
      setSaveError('সেভ করা যায়নি — ইন্টারনেট চেক করে আবার চেষ্টা করো।');
    } finally {
      setSaving(false);
    }
  };

  /* confetti on the finished screen (skipped for reduced-motion users) */
  useEffect(() => {
    if (!done) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        const colors = ['#ff5200', '#ffb92e', '#ff7a35', '#161210'];
        confetti({ particleCount: 90, spread: 70, origin: { x: 0.2, y: 0.6 }, colors, zIndex: 200 });
        confetti({ particleCount: 90, spread: 70, origin: { x: 0.8, y: 0.6 }, colors, zIndex: 200 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [done]);

  const onKeyNext = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      next();
    }
  };

  const firstName = (cleanName || 'বন্ধু').split(' ')[0];
  const stepNo = toBanglaDigits(step + 1);
  const avatarOptions: { key: string; src: string; label: string; badge?: 'google' | 'upload' }[] = [
    ...(googlePhotoURL ? [{ key: 'google', src: googlePhotoURL, label: 'Google ছবি', badge: 'google' as const }] : []),
    ...(uploaded ? [{ key: 'upload', src: uploaded, label: 'আপলোড করা ছবি', badge: 'upload' as const }] : []),
    ...seeds.map((s, i) => ({ key: s, src: avatarUrl(s, i), label: `অবতার ${toBanglaDigits(i + 1)}` })),
  ];

  const summaryChips = [
    batch && { icon: <GraduationCap className="h-3.5 w-3.5" />, text: batch },
    department && { icon: <BookOpen className="h-3.5 w-3.5" />, text: labelOf(DEPARTMENTS, department) },
    target && { icon: <Target className="h-3.5 w-3.5" />, text: labelOf(TARGETS, target) },
    goal && { icon: <Clock className="h-3.5 w-3.5" />, text: `দৈনিক ${labelOf(STUDY_GOALS, goal)}` },
    college.trim() && { icon: <School className="h-3.5 w-3.5" />, text: college.trim() },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  /* ---------- step bodies ---------- */

  const identityStep = (
    <div className="space-y-6">
      {/* avatar */}
      <div>
        <SectionLabel icon={<Sparkles className="h-3.5 w-3.5" />}>তোমার অবতার</SectionLabel>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <span className="ring-conic grid h-[92px] w-[92px] place-items-center rounded-full p-[3px] shadow-[0_18px_40px_-16px_rgba(255,82,0,0.55)]">
              <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-white">
                <Avatar src={photoURL} name={cleanName} className="h-full w-full" textClass="text-[32px]" />
              </span>
            </span>
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-brand text-white ring-[3px] ring-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-label="অবতার বেছে নাও">
              {avatarOptions.map((o) => {
                const selected = photoURL === o.src;
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={o.label}
                    onClick={() => setPhotoURL(o.src)}
                    className={`focus-ring relative aspect-square rounded-full ring-2 transition-all duration-300 hover:scale-105 ${
                      selected ? 'ring-brand shadow-[0_8px_20px_-8px_rgba(255,82,0,0.7)]' : 'ring-transparent hover:ring-brand/40'
                    }`}
                  >
                    <Avatar src={o.src} name={cleanName} className="h-full w-full" textClass="text-[16px]" />
                    {o.badge === 'google' && (
                      <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full bg-white text-[9px] font-black text-[#4285F4] ring-1 ring-ink/10">
                        G
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={shuffle}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3.5 py-2 text-[12.5px] font-bold text-ink/80 transition-colors hover:bg-ink/10"
              >
                <Shuffle className="h-3.5 w-3.5" /> আরও অবতার
              </button>
              {uploadPhoto && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3.5 py-2 text-[12.5px] font-bold text-ink/80 transition-colors hover:bg-ink/10 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    {uploading ? 'আপলোড হচ্ছে…' : 'নিজের ছবি দাও'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} aria-label="ছবি আপলোড" />
                </>
              )}
            </div>
            {uploadError && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-flag">
                <AlertCircle className="h-3.5 w-3.5" /> {uploadError}
              </p>
            )}
          </div>
        </div>
      </div>

      <Field
        label="তোমার নাম"
        icon={<UserRound className="h-[18px] w-[18px]" />}
        tone={nameTone}
        hint={nameTone === 'error' ? 'পুরো নামটা লিখো — লিডারবোর্ড, ব্যাটল আর সার্টিফিকেটে এটাই দেখাবে।' : null}
      >
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          onKeyDown={onKeyNext}
          placeholder="যেমন: নুসরাত জাহান"
          autoComplete="name"
          aria-invalid={nameTone === 'error'}
          className={`${inputBase} ${inputTone[nameTone]} pr-11`}
        />
      </Field>

      <Field
        label="মোবাইল নম্বর"
        icon={<Smartphone className="h-[18px] w-[18px]" />}
        tone={phoneTone}
        hint={
          phoneTone === 'error'
            ? 'সঠিক নম্বর দাও — ১১ ডিজিট, 01 দিয়ে শুরু (যেমন: 01712345678)।'
            : phoneOk
              ? `${formatBdPhone(normPhone)} — পেইড ব্যাচের রোল ও জরুরি নোটিশ এই নম্বরেই যাবে।`
              : 'পেইড ব্যাচের রোল, রেজাল্ট আর জরুরি নোটিশের জন্য। কাউকে দেখানো হয় না।'
        }
      >
        <input
          ref={phoneRef}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          onKeyDown={onKeyNext}
          placeholder="017XXXXXXXX"
          autoComplete="tel-national"
          inputMode="tel"
          aria-invalid={phoneTone === 'error'}
          className={`${inputBase} ${inputTone[phoneTone]} pr-11`}
        />
      </Field>
    </div>
  );

  const studyStep = (
    <div className="space-y-6">
      <div>
        <SectionLabel icon={<GraduationCap className="h-3.5 w-3.5" />} error={attempted[1] && !level}>
          তুমি এখন কোন পর্যায়ে?
        </SectionLabel>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <OptionCard key={l.id} selected={level === l.id} onClick={() => pickLevel(l.id)} icon={LEVEL_ICON[l.id]} label={l.label} hint={l.hint} />
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {level && (
          <motion.div
            key={level}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <SectionLabel icon={<Trophy className="h-3.5 w-3.5" />} error={attempted[1] && !batch}>
              {level === 'Admission' ? 'তোমার HSC ব্যাচ' : 'ব্যাচ'}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {batches.map((b, i) => (
                <Chip key={b} selected={batch === b} onClick={() => setBatch(b)} hint={level === 'Admission' ? (i === 0 ? 'এবারের ব্যাচ' : 'সেকেন্ড টাইমার') : undefined}>
                  {b}
                </Chip>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <SectionLabel icon={<BookOpen className="h-3.5 w-3.5" />} error={attempted[1] && !department}>
          বিভাগ
        </SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {DEPARTMENTS.map((d) => (
            <Chip key={d.id} selected={department === d.id} onClick={() => setDepartment(d.id)}>
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <Field label={level === 'SSC' ? 'স্কুল' : 'কলেজ'} optional icon={<School className="h-[18px] w-[18px]" />}>
        <input
          type="text"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          onKeyDown={onKeyNext}
          placeholder={level === 'SSC' ? 'যেমন: মতিঝিল আইডিয়াল স্কুল' : 'যেমন: নটর ডেম কলেজ'}
          autoComplete="organization"
          className={`${inputBase} ${inputTone.idle}`}
        />
      </Field>

      {attempted[1] && !studyOk && (
        <p role="alert" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-flag">
          <AlertCircle className="h-3.5 w-3.5" /> পর্যায়, ব্যাচ আর বিভাগ — তিনটাই বেছে নাও।
        </p>
      )}
    </div>
  );

  const goalStep = (
    <div className="space-y-6">
      <div>
        <SectionLabel icon={<Target className="h-3.5 w-3.5" />} error={attempted[2] && !target}>
          কোন ভর্তি পরীক্ষাটা তোমার টার্গেট?
        </SectionLabel>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TARGETS.map((t) => (
            <OptionCard key={t.id} selected={target === t.id} onClick={() => setTarget(t.id)} icon={TARGET_ICON[t.id]} label={t.label} hint={t.hint} />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel icon={<Clock className="h-3.5 w-3.5" />} error={attempted[2] && !goal}>
          প্রতিদিন কতক্ষণ পড়তে চাও?
        </SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {STUDY_GOALS.map((g) => (
            <Chip key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)} hint={g.hint}>
              {g.label}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-[12.5px] font-medium text-mist">এই লক্ষ্য ধরে স্টাডি প্ল্যানার আর ডেইলি চ্যালেঞ্জ সাজানো হবে — পরে বদলানো যাবে।</p>
      </div>

      {attempted[2] && !goalOk && (
        <p role="alert" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-flag">
          <AlertCircle className="h-3.5 w-3.5" /> একটা টার্গেট আর দৈনিক সময় বেছে নাও।
        </p>
      )}
      {saveError && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-flag/8 px-4 py-3 text-[13px] font-semibold text-flag ring-1 ring-flag/15">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {saveError}
        </p>
      )}
    </div>
  );

  const doneStep = (
    <div className="text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="ring-conic mx-auto grid h-[104px] w-[104px] place-items-center rounded-full p-[3px] shadow-[0_24px_50px_-18px_rgba(255,82,0,0.6)]"
      >
        <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-white">
          <Avatar src={photoURL} name={cleanName} className="h-full w-full" textClass="text-[36px]" />
        </span>
      </motion.span>
      <h2 className="mt-5 font-bangla text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">{cleanName}</h2>
      {email && (
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] font-medium text-mist">
          <Mail className="h-3.5 w-3.5" /> {email}
        </p>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {summaryChips.map((c) => (
          <span key={c.text} className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[12.5px] font-bold text-brand-deep">
            {c.icon} {c.text}
          </span>
        ))}
      </div>

      <ul className="mx-auto mt-7 max-w-sm space-y-2.5 text-left">
        {[
          `${labelOf(TARGETS, target)} সিলেবাসের মক টেস্ট আর প্রশ্নব্যাংক`,
          `${batch} ব্যাচের লিডারবোর্ডে তোমার জায়গা`,
          `দৈনিক ${labelOf(STUDY_GOALS, goal)} লক্ষ্যের স্টাডি প্ল্যানার`,
        ].map((t, i) => (
          <motion.li
            key={t}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.5, ease: EASE }}
            className="flex items-start gap-3 rounded-2xl bg-paper/60 px-4 py-3 ring-1 ring-ink/6"
          >
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white">
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </span>
            <span className="text-[13.5px] font-semibold text-ink/80">{t}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-7 grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onDone('exams')}
          className="focus-ring group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-[15.5px] font-bold text-white shadow-[0_16px_36px_-14px_rgba(255,82,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep"
        >
          প্রথম মক দাও
          <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
        <button
          type="button"
          onClick={() => onDone('dashboard')}
          className="focus-ring inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-[15px] font-bold text-ink ring-1 ring-ink/12 transition-all duration-300 hover:-translate-y-0.5 hover:ring-ink/25"
        >
          ড্যাশবোর্ডে যাও
        </button>
      </div>
    </div>
  );

  const heading = done
    ? { title: `প্রোফাইল রেডি, ${firstName}!`, sub: 'এবার আসল কাজ — প্রথম মকটা দিয়ে দেখো তুমি কোথায় দাঁড়িয়ে।' }
    : step === 0
      ? { title: 'প্রথমে, তোমাকে চিনে নিই', sub: 'এই নাম আর ছবিটাই লিডারবোর্ড, ব্যাটল আর সার্টিফিকেটে দেখাবে।' }
      : step === 1
        ? { title: 'এখন কোথায় পড়ছো?', sub: 'এই তথ্য দিয়েই প্রশ্নব্যাংক, মক আর লিডারবোর্ড তোমার মতো করে সাজানো হবে।' }
        : { title: 'লক্ষ্যটা ঠিক করে ফেলি', sub: 'লক্ষ্য অনুযায়ী মক টেস্টের সিলেবাস আর স্টাডি প্ল্যানার সাজবে।' };

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        tabIndex={-1}
        className="pk-landing fixed inset-0 z-[100] overflow-y-auto bg-paper font-body text-ink outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-setup-title"
      >
        {/* Ambient */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-44 right-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-140px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <span className="hidden text-[12px] font-bold uppercase tracking-[0.22em] text-mist sm:block">প্রোফাইল সেটআপ</span>
          </div>
          <div className="flex items-center gap-3">
            {!done && (
              <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-ink/70 ring-1 ring-ink/10 lg:hidden">
                ধাপ {stepNo}/৩
              </span>
            )}
            {!done && (
              <button
                type="button"
                onClick={onSkip}
                className="focus-ring rounded-full px-3 py-1.5 text-[13px] font-semibold text-mist transition-colors hover:text-ink"
              >
                পরে করব
              </button>
            )}
          </div>
        </header>

        <main className="relative z-10 mx-auto grid max-w-6xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pb-16">
          {/* ── Left rail (desktop) ── */}
          <motion.aside
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="noise relative hidden min-h-[600px] flex-col justify-between overflow-hidden rounded-[32px] bg-ink p-9 text-white shadow-[0_48px_90px_-40px_rgba(22,18,16,0.7)] lg:flex"
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
                <Sparkles className="h-3.5 w-3.5" /> {done ? 'সব সেট' : `ধাপ ${stepNo} / ৩`}
              </p>
              <h2 className="mt-4 font-bangla text-[32px] font-extrabold leading-[1.18] tracking-tight xl:text-[36px]">
                তোমার অঙ্গন,
                <br />
                <span className="bg-gradient-to-r from-brand-bright to-lime bg-clip-text text-transparent">তোমার মতো করে সাজাই।</span>
              </h2>

              <ol className="mt-8 space-y-4">
                {STEPS.map((s, i) => {
                  const state = done || i < step ? 'done' : i === step ? 'active' : 'todo';
                  return (
                    <li key={s.id} className="flex items-center gap-4">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-display text-[14px] font-bold transition-all duration-500 ${
                          state === 'done'
                            ? 'bg-brand text-white'
                            : state === 'active'
                              ? 'bg-white text-ink shadow-[0_10px_24px_-8px_rgba(255,255,255,0.5)]'
                              : 'bg-white/10 text-white/50 ring-1 ring-white/10'
                        }`}
                      >
                        {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3.5} /> : toBanglaDigits(i + 1)}
                      </span>
                      <div>
                        <p className={`font-bangla text-[16px] font-bold ${state === 'todo' ? 'text-white/55' : 'text-white'}`}>{s.title}</p>
                        <p className="text-[13px] text-white/45">{s.hint}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* live preview card */}
            <div className="glass-dark relative mt-8 rounded-3xl p-5">
              <div className="flex items-center gap-3.5">
                <span className="ring-conic grid h-14 w-14 shrink-0 place-items-center rounded-full p-[2px]">
                  <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-ink">
                    <Avatar src={photoURL} name={cleanName} className="h-full w-full" textClass="text-[20px]" />
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bangla text-[17px] font-bold">{cleanName || <span className="text-white/40">তোমার নাম</span>}</p>
                  <p className="truncate text-[12.5px] text-white/50">{email || ' '}</p>
                </div>
              </div>
              <div className="mt-3.5 flex min-h-[28px] flex-wrap gap-1.5">
                <AnimatePresence initial={false}>
                  {summaryChips.length === 0 && (
                    <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12px] text-white/40">
                      তথ্য দিতে থাকো — কার্ডটা এখানে সাজতে থাকবে
                    </motion.span>
                  )}
                  {summaryChips.map((c) => (
                    <motion.span
                      key={c.text}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold text-white/90 ring-1 ring-white/10"
                    >
                      {c.icon} {c.text}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11.5px] font-bold">
                  <span className="text-white/55">প্রোফাইল সম্পূর্ণ</span>
                  <span className="text-lime">{toBanglaDigits(percent)}%</span>
                </div>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-to-r from-brand to-lime"
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </span>
              </div>
            </div>
          </motion.aside>

          {/* ── Form column ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="mx-auto w-full max-w-xl"
          >
            {/* mobile progress */}
            {!done && (
              <div className="mb-5 lg:hidden">
                <div className="flex gap-1.5" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span key={s.id} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-brand' : 'bg-ink/10'}`} />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[11.5px] font-bold">
                  {STEPS.map((s, i) => (
                    <span key={s.id} className={i === step ? 'text-brand-deep' : i < step ? 'text-ink/60' : 'text-mist'}>
                      {s.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <h1 id="profile-setup-title" className="font-bangla text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
              {heading.title}
            </h1>
            <p className="mt-1.5 text-[14px] text-mist">{heading.sub}</p>

            <div className="mt-5 rounded-[26px] bg-white p-5 shadow-[0_24px_60px_-28px_rgba(22,18,16,0.3)] ring-1 ring-ink/10 sm:p-7">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={done ? 'done' : step}
                  custom={dir}
                  variants={SLIDE}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease: EASE }}
                >
                  {done ? doneStep : step === 0 ? identityStep : step === 1 ? studyStep : goalStep}
                </motion.div>
              </AnimatePresence>

              {!done && (
                <div className="mt-7 flex items-center gap-3 border-t border-ink/8 pt-5">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => go(step - 1)}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-[14px] font-bold text-mist transition-colors hover:text-ink"
                    >
                      <ArrowLeft className="h-4 w-4" /> পেছনে
                    </button>
                  ) : (
                    <span className="hidden items-center gap-1.5 text-[12px] font-semibold text-mist sm:inline-flex">
                      <ShieldCheck className="h-3.5 w-3.5 text-brand" /> ১ মিনিটও লাগবে না
                    </span>
                  )}
                  <div className="flex-1" />
                  {step < 2 ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={next}
                      className="focus-ring group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep"
                    >
                      পরের ধাপ
                      <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={finish}
                      disabled={saving}
                      className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_16px_36px_-14px_rgba(255,82,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-[18px] w-[18px] animate-spin" /> সেভ হচ্ছে…
                        </>
                      ) : (
                        <>
                          প্রোফাইল সেভ করো <Check className="h-[18px] w-[18px]" strokeWidth={3} />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {!done && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] font-medium text-mist">
                <Building2 className="h-3.5 w-3.5" /> সব তথ্যই পরে প্রোফাইল পেজ থেকে বদলানো যাবে।
              </p>
            )}
          </motion.section>
        </main>
      </div>
    </MotionConfig>
  );
};

export default ProfileSetupWizard;
