import React, { useState } from 'react';
import { ChevronRight, FileText, KeyRound, Laptop, LogOut, Mail, Moon, Pencil, Phone, RefreshCw, Shield, Sun, Type } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { formatBdPhone } from '../../utils/phone';
import { Card, SectionHeader, cx } from '../dashboard/ui';
import { Btn } from '../qbank/ui';
import { ProfileTopBar } from './sections';
import type { ProfileIdentity } from './model';

/*
 * Settings — appearance, question typography (with a live sample), account,
 * policies, sign-out. Rendered by ProfilePage at /settings (and ?tab=SETTINGS).
 */

export type ThemeMode = 'light' | 'dark' | 'system';
type FontChoice = 'font-noto' | 'font-tiro' | 'font-sans';
type SizeChoice = 'text-sm' | 'text-base' | 'text-lg' | 'text-xl';

const THEMES: Array<{ id: ThemeMode; label: string; hint: string; icon: LucideIcon }> = [
  { id: 'light', label: 'লাইট', hint: 'উজ্জ্বল, দিনের জন্য', icon: Sun },
  { id: 'dark', label: 'ডার্ক', hint: 'চোখে আরাম, রাতে', icon: Moon },
  { id: 'system', label: 'সিস্টেম', hint: 'ডিভাইস অনুযায়ী', icon: Laptop },
];

const FONTS: Array<{ id: FontChoice; label: string; hint: string }> = [
  { id: 'font-noto', label: 'নোটো সান্স', hint: 'আধুনিক, পরিষ্কার' },
  { id: 'font-tiro', label: 'ক্লাসিক', hint: 'ডিভাইসের ফন্ট' },
  { id: 'font-sans', label: 'হিন্দ শিলিগুড়ি', hint: 'অ্যাপের ফন্ট' },
];

const SIZES: Array<{ id: SizeChoice; label: string; sample: string }> = [
  { id: 'text-sm', label: 'ছোট', sample: 'text-[15px]' },
  { id: 'text-base', label: 'স্বাভাবিক', sample: 'text-[17px]' },
  { id: 'text-lg', label: 'বড়', sample: 'text-[19px]' },
  { id: 'text-xl', label: 'আরও বড়', sample: 'text-[21px]' },
];

// Mirrors TYPE_SCALE in exam/QuestionCard so the sample matches the real paper.
const PREVIEW: Record<SizeChoice, { q: string; o: string }> = {
  'text-sm': { q: 'text-[17px]', o: 'text-[14px]' },
  'text-base': { q: 'text-[19px]', o: 'text-[15px]' },
  'text-lg': { q: 'text-[21px]', o: 'text-[16px]' },
  'text-xl': { q: 'text-[23px]', o: 'text-[17px]' },
};

function Tile({
  active,
  onClick,
  children,
  className = '',
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cx(
        'focus-ring rounded-2xl px-3 py-3 text-left transition-colors',
        active
          ? 'bg-ink text-white ring-2 ring-ink dark:bg-paper dark:text-ink dark:ring-paper'
          : 'bg-ink/[0.035] text-ink ring-1 ring-ink/[0.06] hover:bg-ink/[0.06] dark:bg-white/[0.05] dark:text-paper dark:ring-white/10 dark:hover:bg-white/[0.09]',
        className,
      )}
    >
      {children}
    </button>
  );
}

function SettingRow({
  icon: Icon,
  tone = 'neutral',
  title,
  meta,
  onClick,
  disabled = false,
}: {
  icon: LucideIcon;
  tone?: 'neutral' | 'brand' | 'gold';
  title: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const tile = {
    neutral: 'bg-ink/[0.05] text-ink/70 dark:bg-white/[0.08] dark:text-white/70',
    brand: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-bright',
    gold: 'bg-gold/20 text-amber-800 dark:bg-gold/20 dark:text-amber-200',
  }[tone];
  const inner = (
    <>
      <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-2xl', tile)}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-bold leading-snug text-ink dark:text-paper">{title}</span>
        {meta && <span className="mt-0.5 block truncate text-[12px] font-semibold text-mist dark:text-white/50">{meta}</span>}
      </span>
      {onClick && (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5 dark:text-white/30"
          strokeWidth={2.6}
          aria-hidden="true"
        />
      )}
    </>
  );
  const base = 'flex w-full items-center gap-3 px-5 py-3 text-left md:px-6';
  if (!onClick) return <div className={base}>{inner}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        base,
        'focus-ring group transition-colors hover:bg-ink/[0.035] active:bg-ink/[0.06] disabled:opacity-60 dark:hover:bg-white/[0.05] dark:active:bg-white/[0.08]',
      )}
    >
      {inner}
    </button>
  );
}

export default function SettingsView({
  themeMode,
  setThemeMode,
  identity,
  canResetPassword,
  onResetPassword,
  onEditProfile,
  onBack,
  onNavigate,
  onLogout,
}: {
  themeMode: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
  identity: ProfileIdentity;
  canResetPassword: boolean;
  onResetPassword: () => Promise<void>;
  onEditProfile: () => void;
  onBack: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const { questionFont, setQuestionFont, questionFontSize, setQuestionFontSize } = usePreferences();
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const font = (questionFont as FontChoice) || 'font-noto';
  const size = (questionFontSize as SizeChoice) || 'text-base';
  const preview = PREVIEW[size] ?? PREVIEW['text-base'];

  const reset = async () => {
    if (resetState !== 'idle') return;
    setResetState('sending');
    try {
      await onResetPassword();
      setResetState('sent');
    } catch {
      setResetState('idle');
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <ProfileTopBar title="সেটিংস" eyebrow="অ্যাপ ও অ্যাকাউন্ট" onBack={onBack} />

      <div className="grid gap-4 md:gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 md:space-y-5">
          {/* appearance */}
          <Card className="p-5 md:p-6" aria-label="থিম">
            <SectionHeader icon={Sun} title="থিম" subtitle="অ্যাপ কেমন দেখাবে" />
            <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="থিম বেছে নাও">
              {THEMES.map((t) => {
                const active = themeMode === t.id;
                return (
                  <Tile key={t.id} active={active} onClick={() => setThemeMode?.(t.id)} label={t.label}>
                    <t.icon size={20} className={active ? 'text-gold' : 'text-ink/60 dark:text-white/60'} />
                    <div className="mt-3 text-[14px] font-extrabold leading-tight">{t.label}</div>
                    <div
                      className={cx(
                        'mt-0.5 text-[11.5px] font-semibold leading-snug',
                        active ? 'text-white/65 dark:text-ink/60' : 'text-mist dark:text-white/45',
                      )}
                    >
                      {t.hint}
                    </div>
                  </Tile>
                );
              })}
            </div>
          </Card>
          {/* typography */}
          <Card className="p-5 md:p-6" aria-label="প্রশ্নের লেখা">
            <SectionHeader icon={Type} title="প্রশ্নের লেখা" subtitle="পরীক্ষা ও প্রশ্নব্যাংকে যেভাবে দেখবে" />

            <div className="mt-4 text-[12px] font-extrabold text-ink/60 dark:text-white/55">ফন্ট</div>
            <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="ফন্ট বেছে নাও">
              {FONTS.map((f) => {
                const active = font === f.id;
                return (
                  <Tile key={f.id} active={active} onClick={() => setQuestionFont(f.id)} label={f.label}>
                    <div className={cx('text-[22px] leading-none', f.id)}>অআ</div>
                    <div className="mt-2.5 text-[13px] font-extrabold leading-tight">{f.label}</div>
                    <div
                      className={cx(
                        'mt-0.5 text-[11px] font-semibold leading-snug',
                        active ? 'text-white/65 dark:text-ink/60' : 'text-mist dark:text-white/45',
                      )}
                    >
                      {f.hint}
                    </div>
                  </Tile>
                );
              })}
            </div>

            <div className="mt-5 text-[12px] font-extrabold text-ink/60 dark:text-white/55">আকার</div>
            <div className="mt-2 grid grid-cols-4 gap-1 rounded-2xl bg-ink/[0.04] p-1 dark:bg-white/[0.06]" role="group" aria-label="আকার বেছে নাও">
              {SIZES.map((s) => {
                const active = size === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setQuestionFontSize(s.id)}
                    className={cx(
                      'focus-ring flex h-11 flex-col items-center justify-center rounded-xl leading-none transition-colors',
                      active
                        ? 'bg-white text-ink shadow-sm ring-1 ring-ink/[0.06] dark:bg-ink dark:text-paper dark:ring-white/10'
                        : 'text-ink/60 hover:text-ink dark:text-white/55 dark:hover:text-white',
                    )}
                  >
                    <span className={cx('font-bold', s.sample)}>অ</span>
                    <span className="mt-1 text-[10px] font-bold">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* live sample */}
            <div className="mt-4 rounded-2xl bg-paper p-4 ring-1 ring-ink/[0.06] dark:bg-ink dark:ring-white/10" aria-label="নমুনা">
              <div className="text-[11px] font-extrabold text-mist dark:text-white/45">নমুনা · প্রশ্ন ১</div>
              <p className={cx('mt-1.5 font-bold leading-[1.55] text-ink dark:text-paper', font, preview.q)}>
                নিউটনের দ্বিতীয় সূত্র অনুযায়ী বস্তুর ত্বরণ কিসের সমানুপাতিক?
              </p>
              <div className="mt-3 space-y-1.5">
                {['প্রযুক্ত বলের', 'বস্তুর ভরের'].map((opt, i) => (
                  <div
                    key={opt}
                    className={cx(
                      'flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 dark:bg-white/[0.05]',
                      i === 0 ? 'ring-emerald-500/40' : 'ring-ink/[0.06] dark:ring-white/10',
                    )}
                  >
                    <span
                      className={cx(
                        'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-extrabold',
                        i === 0 ? 'bg-emerald-600 text-white' : 'bg-ink/[0.06] text-ink/70 dark:bg-white/10 dark:text-white/70',
                      )}
                    >
                      {i === 0 ? 'ক' : 'খ'}
                    </span>
                    <span className={cx('leading-relaxed text-ink dark:text-paper', font, preview.o)}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-4 md:space-y-5">
          {/* account */}
          <Card className="overflow-hidden" aria-label="অ্যাকাউন্ট">
            <div className="px-5 pt-5 md:px-6 md:pt-6">
              <SectionHeader icon={Shield} title="অ্যাকাউন্ট" subtitle="তথ্য ও নিরাপত্তা" />
            </div>
            <div className="mt-2 divide-y divide-ink/[0.06] dark:divide-white/[0.07]">
              <SettingRow icon={Pencil} tone="brand" title="প্রোফাইল এডিট" meta="নাম, ছবি, ব্যাচ, কলেজ" onClick={onEditProfile} />
              <SettingRow icon={Mail} title="ইমেইল" meta={identity.email || 'যোগ করা হয়নি'} />
              <SettingRow
                icon={Phone}
                title="মোবাইল"
                meta={identity.phoneNumber ? formatBdPhone(identity.phoneNumber) : 'যোগ করা হয়নি'}
                onClick={identity.phoneNumber ? undefined : onEditProfile}
              />
              {canResetPassword && (
                <SettingRow
                  icon={KeyRound}
                  tone="gold"
                  title="পাসওয়ার্ড বদলাও"
                  meta={resetState === 'sent' ? 'রিসেট লিংক ইমেইলে পাঠানো হয়েছে' : resetState === 'sending' ? 'পাঠানো হচ্ছে…' : 'ইমেইলে রিসেট লিংক পাঠাও'}
                  onClick={reset}
                  disabled={resetState !== 'idle'}
                />
              )}
            </div>
            <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
              <Btn variant="danger" icon={LogOut} onClick={onLogout} full>
                লগআউট
              </Btn>
            </div>
          </Card>
          {/* policies */}
          <Card className="overflow-hidden" aria-label="নীতিমালা">
            <div className="px-5 pt-5 md:px-6 md:pt-6">
              <SectionHeader icon={FileText} title="নীতিমালা" subtitle="পরীক্ষাঙ্গন সম্পর্কে" />
            </div>
            <div className="mt-2 divide-y divide-ink/[0.06] pb-2 dark:divide-white/[0.07]">
              {[
                { icon: Shield, label: 'প্রাইভেসি পলিসি', path: '/privacy' },
                { icon: FileText, label: 'ব্যবহারের শর্তাবলী', path: '/terms' },
                { icon: RefreshCw, label: 'রিফান্ড পলিসি', path: '/refund' },
              ].map((item) => (
                <SettingRow key={item.path} icon={item.icon} title={item.label} onClick={() => onNavigate(item.path)} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <p className="pt-2 text-center text-[11.5px] font-semibold text-mist dark:text-white/40">পরীক্ষাঙ্গন · ভার্সন ১.০.০</p>
    </div>
  );
}
