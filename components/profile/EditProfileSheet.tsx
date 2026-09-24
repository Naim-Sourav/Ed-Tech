import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, Pencil, Trash2 } from 'lucide-react';
import { DEPARTMENTS, LEVELS, STUDY_GOALS, TARGETS, batchOptions, parseBatch, type StudyLevel } from '../../data/profileOptions';
import { formatBdPhone, isValidBdPhone, normalizeBdPhone } from '../../utils/phone';
import { cx } from '../dashboard/ui';
import { Btn, Pill, Sheet, SheetHeader } from '../qbank/ui';
import { ProfileAvatar } from './sections';
import type { ProfileIdentity } from './model';

/*
 * "প্রোফাইল এডিট" bottom sheet. Same vocabulary as the sign-up wizard
 * (name · mobile · level/batch · department · target · college · daily goal)
 * but on one screen, for quick corrections. Persistence is injected.
 */

export interface ProfileEditResult {
  name: string;
  photoURL: string;
  phoneNumber: string;
  hscBatch: string;
  department: string;
  target: string;
  college: string;
  dailyStudyGoal: string;
}

const FIELD =
  'h-11 w-full rounded-2xl bg-ink/[0.04] px-4 text-[14.5px] font-semibold text-ink outline-none ring-1 ring-ink/[0.06] transition-shadow placeholder:font-medium placeholder:text-ink/35 focus:ring-2 focus:ring-brand/60 dark:bg-white/[0.06] dark:text-paper dark:ring-white/10 dark:placeholder:text-white/30';

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-extrabold text-ink/80 dark:text-white/75">{label}</span>
        {hint && !error && <span className="text-[11.5px] font-semibold text-mist dark:text-white/45">{hint}</span>}
        {error && (
          <span className="text-[11.5px] font-bold text-flag dark:text-red-300" role="alert">
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Choices<T extends string>({
  options,
  value,
  onChange,
  legacy,
}: {
  options: Array<{ id: T; label: string }>;
  value: string;
  onChange: (id: T) => void;
  legacy?: string;
}) {
  const list = legacy && !options.some((o) => o.id === legacy) ? [{ id: legacy as T, label: legacy }, ...options] : options;
  return (
    <div className="flex flex-wrap gap-1.5" role="group">
      {list.map((o) => (
        <Pill key={o.id} active={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </Pill>
      ))}
    </div>
  );
}

export default function EditProfileSheet({
  open,
  onClose,
  initial,
  uid,
  onSave,
  uploadPhoto,
  now = new Date(),
}: {
  open: boolean;
  onClose: () => void;
  initial: ProfileIdentity;
  uid: string;
  onSave: (result: ProfileEditResult) => Promise<void>;
  uploadPhoto?: (file: File) => Promise<string>;
  now?: Date;
}) {
  const parsed = parseBatch(initial.hscBatch);
  const [name, setName] = useState(initial.name);
  const [photoURL, setPhotoURL] = useState(initial.photoURL);
  const [phone, setPhone] = useState(initial.phoneNumber);
  const [level, setLevel] = useState<StudyLevel | ''>(parsed.level);
  const [batch, setBatch] = useState(parsed.batch);
  const [department, setDepartment] = useState(initial.department);
  const [target, setTarget] = useState(initial.target);
  const [college, setCollege] = useState(initial.college);
  const [goal, setGoal] = useState(initial.dailyStudyGoal);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Re-seed whenever the sheet opens so a cancelled edit never leaks into the next one.
  useEffect(() => {
    if (!open) return;
    const p = parseBatch(initial.hscBatch);
    setName(initial.name);
    setPhotoURL(initial.photoURL);
    setPhone(initial.phoneNumber);
    setLevel(p.level);
    setBatch(p.batch);
    setDepartment(initial.department);
    setTarget(initial.target);
    setCollege(initial.college);
    setGoal(initial.dailyStudyGoal);
    setAttempted(false);
    setError(null);
  }, [open, initial]);

  const batches = useMemo(() => (level ? batchOptions(level, now) : []), [level, now]);
  const nameOk = name.trim().length >= 2;
  const normPhone = normalizeBdPhone(phone);
  const phoneOk = isValidBdPhone(normPhone);

  const pickLevel = (l: StudyLevel) => {
    setLevel(l);
    if (!batchOptions(l, now).includes(batch)) setBatch('');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadPhoto) return;
    setUploading(true);
    setError(null);
    try {
      setPhotoURL(await uploadPhoto(file));
    } catch {
      setError('ছবি আপলোড হয়নি — আবার চেষ্টা করো');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!nameOk || !phoneOk) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        photoURL,
        phoneNumber: normPhone,
        hscBatch: batch || initial.hscBatch,
        department,
        target,
        college: college.trim(),
        dailyStudyGoal: goal,
      });
      onClose();
    } catch {
      setError('সেভ করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করো');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} label="প্রোফাইল এডিট" size="md">
      <SheetHeader icon={Pencil} title="প্রোফাইল এডিট" description="নাম, মোবাইল আর পড়াশোনার তথ্য ঠিক করে নাও।" onClose={onClose} />
      <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
        {/* photo */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <ProfileAvatar src={photoURL} name={name} seed={uid} className="h-16 w-16 ring-2 ring-ink/10 dark:ring-white/10" textClassName="text-[22px]" />
            {uploading && (
              <span className="absolute inset-0 grid place-items-center rounded-full bg-ink/50 text-white">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {uploadPhoto && (
              <Btn size="sm" variant="soft" icon={Camera} onClick={() => fileRef.current?.click()} disabled={uploading}>
                ছবি বদলাও
              </Btn>
            )}
            {photoURL && (
              <Btn size="sm" variant="ghost" icon={Trash2} onClick={() => setPhotoURL('')} disabled={uploading}>
                ছবি সরাও
              </Btn>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} aria-label="ছবি বেছে নাও" />
          </div>
        </div>

        <Field label="নাম" error={attempted && !nameOk ? 'অন্তত ২ অক্ষরের নাম দাও' : null}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="তোমার পুরো নাম" autoComplete="name" />
        </Field>

        <Field
          label="মোবাইল নম্বর"
          hint={phoneOk ? formatBdPhone(normPhone) : '০১XXXXXXXXX'}
          error={attempted && !phoneOk ? 'সঠিক ১১ ডিজিটের নম্বর দাও' : null}
        >
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={cx(FIELD, 'font-body tabular-nums')}
            placeholder="017XXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>

        <Field label="লেভেল">
          <Choices options={LEVELS} value={level} onChange={pickLevel} />
        </Field>

        {level && (
          <Field label="ব্যাচ">
            <Choices options={batches.map((b) => ({ id: b, label: b }))} value={batch} onChange={setBatch} legacy={batch} />
          </Field>
        )}

        <Field label="বিভাগ">
          <Choices options={DEPARTMENTS} value={department} onChange={setDepartment} legacy={department} />
        </Field>

        <Field label="লক্ষ্য">
          <Choices options={TARGETS} value={target} onChange={setTarget} legacy={target} />
        </Field>

        <Field label="কলেজ" hint="ঐচ্ছিক">
          <input value={college} onChange={(e) => setCollege(e.target.value)} className={FIELD} placeholder="যেমন: ঢাকা কলেজ" autoComplete="organization" />
        </Field>

        <Field label="দৈনিক পড়ার লক্ষ্য">
          <Choices options={STUDY_GOALS} value={goal} onChange={setGoal} legacy={goal} />
        </Field>

        {error && (
          <p className="rounded-2xl bg-flag/10 px-4 py-2.5 text-[13px] font-bold text-flag dark:bg-flag/20 dark:text-red-200" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Btn variant="soft" onClick={onClose} className="flex-1" disabled={saving}>
            বাতিল
          </Btn>
          <Btn type="submit" icon={Check} className="flex-[2]" disabled={saving || uploading}>
            {saving ? 'সেভ হচ্ছে…' : 'সেভ করো'}
          </Btn>
        </div>
      </form>
    </Sheet>
  );
}
