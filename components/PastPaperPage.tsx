import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, GraduationCap, CalendarDays, ListChecks } from 'lucide-react';
import { fetchQuestionsFromBankAPI } from '../services/api';
import { QuizQuestion } from '../types';
import {
  ADMISSION_EXAMS,
  CATEGORY_LABELS_BN,
  candidateSessions,
  findAdmissionExam,
  parseSessionSlug,
  sessionLabelBn,
  sessionSlug,
  sessionTag,
  subjectBase,
  subjectLabelBn,
  subjectRank,
  toBnDigits,
  type AdmissionExamDef,
} from '../data/admissionExams';

/**
 * Public, no-auth "previous-year admission paper" viewer.
 *
 *   /admission-questions/                      all exams
 *   /admission-questions/:exam/                sessions of one exam
 *   /admission-questions/:exam/:session/       the full paper, fetched LIVE from
 *                                              the question bank (board=<tag>)
 *
 * The indexable versions of these URLs are the static pages produced by
 * scripts/generate-seo-pages.mjs; this route is the runtime fallback (kept
 * `noindex`, canonical → static URL) so that every link resolves inside the
 * app — including sittings added to the database after the last deploy.
 */

const LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
const SITE = 'https://www.porikkhangon.app';
const HUB = '/admission-questions/';

const staticHref = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

function Chrome({ children, title, canonical }: { children: React.ReactNode; title: string; canonical: string }) {
  return (
    <div className="pk-landing dash relative w-full min-h-[80vh] overflow-hidden bg-paper dark:bg-ink text-ink dark:text-paper">
      <Helmet>
        <title>{title}</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,82,0,0.09),transparent)] blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-24 w-72 h-72 bg-[radial-gradient(closest-side,rgba(255,185,46,0.14),transparent)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(22,18,16,0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:22px_22px]" />

      <header className="relative z-20 bg-ink shadow-[0_10px_30px_-18px_rgba(22,18,16,0.6)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 text-paper font-bold text-[17px]">
            <span className="w-8 h-8 rounded-xl ring-conic grid place-items-center text-white font-extrabold shadow-md">প</span>
            পরীক্ষাঙ্গন
          </Link>
          <Link
            to="/auth"
            className="bg-lime text-ink font-extrabold text-sm px-4 py-2 rounded-full shadow-[0_10px_24px_-10px_rgba(255,185,46,0.6)] transition-transform hover:-translate-y-0.5"
          >
            ফ্রি শুরু করো
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto relative z-10 py-8 px-4">{children}</div>
    </div>
  );
}

function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-mist">
      {items.map(([label, href], i) => (
        <React.Fragment key={label + i}>
          {i > 0 && <span className="text-ink/25 dark:text-paper/25">›</span>}
          {href ? (
            <a href={href} className="hover:text-brand-deep dark:hover:text-brand-bright transition-colors">
              {label}
            </a>
          ) : (
            <span className="text-ink dark:text-paper">{label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

const card =
  'bg-white dark:bg-ink-2 ring-1 ring-ink/10 dark:ring-white/10 rounded-[22px] shadow-[0_1px_2px_rgba(22,18,16,0.04)]';

/* ── /admission-questions/ ───────────────────────────────────────────── */
function ExamIndex() {
  const groups = useMemo(() => {
    const m = new Map<string, AdmissionExamDef[]>();
    [...ADMISSION_EXAMS]
      .sort((a, b) => a.priority - b.priority)
      .forEach((e) => m.set(e.category, [...(m.get(e.category) || []), e]));
    return [...m.entries()];
  }, []);

  return (
    <Chrome title="ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান | পরীক্ষাঙ্গন" canonical={`${SITE}${HUB}`}>
      <Crumbs items={[['পরীক্ষাঙ্গন', '/'], ['ভর্তি প্রশ্নব্যাংক']]} />
      <h1 className="font-bangla text-2xl md:text-3xl font-extrabold leading-snug">ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান</h1>
      <p className="mt-2 text-[15px] text-mist max-w-2xl">
        পরীক্ষা বেছে নাও — প্রতিটি সেশনের সম্পূর্ণ প্রশ্নপত্র সঠিক উত্তর ও ব্যাখ্যাসহ, বিষয় অনুযায়ী সাজানো।
      </p>
      {groups.map(([cat, exams]) => (
        <section key={cat} className="mt-8">
          <h2 className="font-bangla text-lg font-bold mb-3">{CATEGORY_LABELS_BN[cat as keyof typeof CATEGORY_LABELS_BN] || cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {exams.map((e) => (
              <a key={e.id} href={staticHref(`${HUB}${e.id}/`)} className={`${card} p-5 hover:ring-brand/40 transition-all hover:-translate-y-0.5 block`}>
                <p className="font-bold text-[15.5px] leading-snug">{e.nameBn}</p>
                <p className="text-[12.5px] text-mist mt-1">{e.nameEn}</p>
                <span className="inline-block mt-3 text-[12px] font-extrabold text-brand-deep dark:text-brand-bright bg-mint dark:bg-brand/15 rounded-full px-3 py-1">
                  সেশন অনুযায়ী প্রশ্ন →
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </Chrome>
  );
}

/* ── /admission-questions/:exam/ ─────────────────────────────────────── */
function SessionIndex({ exam }: { exam: AdmissionExamDef }) {
  const years = useMemo(() => candidateSessions(), []);
  return (
    <Chrome title={`${exam.shortBn} ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন | পরীক্ষাঙ্গন`} canonical={`${SITE}${HUB}${exam.id}/`}>
      <Crumbs items={[['পরীক্ষাঙ্গন', '/'], ['ভর্তি প্রশ্নব্যাংক', staticHref(HUB)], [exam.shortBn]]} />
      <h1 className="font-bangla text-2xl md:text-3xl font-extrabold leading-snug">{exam.nameBn} — বিগত বছরের প্রশ্ন ও সমাধান</h1>
      <p className="mt-2 text-[15px] text-mist max-w-2xl">{exam.descriptionBn}</p>
      {exam.formatBn && (
        <ul className="mt-5 space-y-1.5 text-[14px] bg-cream dark:bg-brand/10 border-l-4 border-brand rounded-2xl px-5 py-4">
          {exam.formatBn.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      <h2 className="font-bangla text-lg font-bold mt-8 mb-3">সেশন বেছে নাও</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {years.map((y) => (
          <a key={y} href={staticHref(`${HUB}${exam.id}/${sessionSlug(y)}/`)} className={`${card} p-4 hover:ring-brand/40 transition-all hover:-translate-y-0.5 block`}>
            <p className="font-bangla text-xl font-extrabold">{sessionLabelBn(y)}</p>
            <p className="text-[12px] text-mist mt-0.5">প্রশ্ন ও সমাধান →</p>
          </a>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] text-mist">যে সেশনের প্রশ্ন এখনও ডেটাবেসে যুক্ত হয়নি, সেটি খুললে "প্রশ্ন পাওয়া যায়নি" দেখাবে।</p>
    </Chrome>
  );
}

/* ── /admission-questions/:exam/:session/ ────────────────────────────── */
function PaperView({ exam, year }: { exam: AdmissionExamDef; year: number }) {
  const tag = sessionTag(exam.tagPrefix, year);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [revealAll, setRevealAll] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setQuestions([]);
    setRevealed({});
    setRevealAll(false);
    (async () => {
      try {
        const collected: QuizQuestion[] = [];
        for (let page = 1; page <= 3; page++) {
          // `board` = exact tag filter on the server (e.g. "Medical '21-22")
          const res: any = await fetchQuestionsFromBankAPI(page, 200, undefined, undefined, undefined, undefined, undefined, undefined, tag);
          const list: QuizQuestion[] = res?.questions || [];
          collected.push(...list);
          const total = Number(res?.total) || list.length;
          if (collected.length >= total || list.length === 0 || total > 2000) break;
        }
        if (cancelled) return;
        const seen = new Set<string>();
        const unique = collected.filter((q) => {
          const key = String(q.question || '').replace(/\s+/g, ' ').trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setQuestions(unique);
        setState(unique.length ? 'ready' : 'empty');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tag]);

  // Typeset TeX once content is in the DOM (MathJax is lazy-loaded app-wide)
  useEffect(() => {
    if (state !== 'ready') return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const M = (window as any).MathJax;
      if (M?.typesetPromise && bodyRef.current) {
        M.typesetPromise([bodyRef.current]).catch(() => {});
        window.clearInterval(timer);
      } else if (++tries > 8) {
        window.clearInterval(timer);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [state, revealAll, revealed]);

  const groups = useMemo(() => {
    const ordered = questions
      .map((q, i) => ({ q, i }))
      .sort(
        (a, b) =>
          subjectRank(a.q.subject || '', exam.subjectOrder) - subjectRank(b.q.subject || '', exam.subjectOrder) ||
          (Number(a.q.orderIndex) || 1e9) - (Number(b.q.orderIndex) || 1e9) ||
          a.i - b.i
      )
      .map((x) => x.q);
    const out: { label: string; id: string; items: QuizQuestion[] }[] = [];
    ordered.forEach((q) => {
      const base = subjectBase(q.subject || '');
      const label = subjectLabelBn(base) || 'অন্যান্য';
      const last = out[out.length - 1];
      if (!last || last.label !== label) out.push({ label, id: base.toLowerCase().replace(/\s+/g, '-') || 'other', items: [] });
      out[out.length - 1].items.push(q);
    });
    return out;
  }, [questions, exam.subjectOrder]);

  const titleBn = `${exam.nameBn} ${sessionLabelBn(year)}`;
  const canonical = `${SITE}${HUB}${exam.id}/${sessionSlug(year)}/`;
  let n = 0;

  return (
    <Chrome title={`${exam.shortBn} ভর্তি পরীক্ষা ${sessionLabelBn(year)} প্রশ্ন সমাধান | পরীক্ষাঙ্গন`} canonical={canonical}>
      <Crumbs
        items={[
          ['পরীক্ষাঙ্গন', '/'],
          ['ভর্তি প্রশ্নব্যাংক', staticHref(HUB)],
          [exam.shortBn, staticHref(`${HUB}${exam.id}/`)],
          [sessionLabelBn(year)],
        ]}
      />
      <div className="flex items-center justify-between gap-3 mb-4">
        <a
          href={staticHref(`${HUB}${exam.id}/`)}
          className="focus-ring flex items-center gap-2 text-sm font-bold text-mist hover:text-brand-deep dark:hover:text-brand-bright transition-colors"
        >
          <ArrowLeft size={16} /> সব সেশন
        </a>
        {state === 'ready' && (
          <button
            onClick={() => setRevealAll((v) => !v)}
            className="focus-ring flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-bold text-ink dark:text-paper ring-1 ring-ink/10 dark:ring-white/15 shadow-sm hover:shadow transition-all"
          >
            {revealAll ? <EyeOff size={16} className="text-brand-deep" /> : <Eye size={16} className="text-brand-deep" />}
            {revealAll ? 'সব উত্তর লুকাও' : 'সব উত্তর দেখাও'}
          </button>
        )}
      </div>

      <h1 className="font-bangla text-2xl md:text-3xl font-extrabold leading-snug">{titleBn} — প্রশ্ন ও সমাধান</h1>
      <p className="mt-1 text-[13.5px] font-semibold text-mist">{exam.nameEn} {sessionSlug(year)} · Question with Answers &amp; Explanations</p>

      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24 text-mist">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold">প্রশ্নপত্র লোড হচ্ছে…</p>
        </div>
      )}

      {(state === 'empty' || state === 'error') && (
        <div className={`${card} mt-6 p-8 text-center`}>
          <GraduationCap className="mx-auto h-9 w-9 text-brand" />
          <h2 className="font-bangla text-xl font-extrabold mt-3">
            {state === 'error' ? 'প্রশ্ন লোড করা যায়নি' : 'এই সেশনের প্রশ্ন এখনও যুক্ত হয়নি'}
          </h2>
          <p className="text-sm text-mist mt-2 max-w-md mx-auto">
            {state === 'error'
              ? 'ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।'
              : `${titleBn} এর প্রশ্ন আমাদের ডেটাবেসে এখনও নেই। অন্য সেশন দেখো অথবা প্রশ্নব্যাংকে প্র্যাকটিস করো।`}
          </p>
          <div className="flex justify-center gap-3 flex-wrap mt-6">
            <a href={staticHref(`${HUB}${exam.id}/`)} className="focus-ring px-5 py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-bold rounded-full transition-all hover:-translate-y-0.5">
              অন্য সেশন দেখো
            </a>
            <Link to={`/qbank?level=ADMISSION&admissionCategory=${encodeURIComponent(exam.category)}`} className="focus-ring px-5 py-2.5 ring-1 ring-ink/15 dark:ring-white/20 text-sm font-bold rounded-full hover:ring-brand/40 transition-all">
              প্রশ্নব্যাংক খোলো
            </Link>
          </div>
        </div>
      )}

      {state === 'ready' && (
        <div ref={bodyRef}>
          <div className="mt-5 grid grid-cols-3 gap-2.5 max-w-md">
            {[
              [toBnDigits(questions.length), 'মোট প্রশ্ন', ListChecks],
              [toBnDigits(groups.length), 'বিষয়', GraduationCap],
              [sessionLabelBn(year), 'শিক্ষাবর্ষ', CalendarDays],
            ].map(([v, l, Icon]: any) => (
              <div key={l} className={`${card} px-3.5 py-3`}>
                <Icon className="h-4 w-4 text-brand-deep dark:text-brand-bright" />
                <p className="font-bangla text-lg font-extrabold leading-tight mt-1.5">{v}</p>
                <p className="text-[11.5px] font-semibold text-mist">{l}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="rounded-full bg-white dark:bg-white/10 ring-1 ring-ink/10 dark:ring-white/15 px-3.5 py-1.5 text-[13px] font-bold hover:ring-brand/40">
                {g.label} <span className="text-mist font-semibold">{toBnDigits(g.items.length)}</span>
              </a>
            ))}
          </div>

          {groups.map((g) => (
            <section key={g.id} id={g.id} className="mt-8 scroll-mt-24">
              <h2 className="font-bangla text-xl font-bold mb-3">
                {g.label} <span className="text-sm font-semibold text-mist">({toBnDigits(g.items.length)}টি প্রশ্ন)</span>
              </h2>
              <div className="space-y-3">
                {g.items.map((q) => {
                  n += 1;
                  const key = String((q as any)._id || q.id || n);
                  const open = revealAll || !!revealed[key];
                  const ci = Number(q.correctAnswerIndex) || 0;
                  return (
                    <article key={key} className={`${card} p-4 md:p-5`}>
                      {q.contextText && (
                        <div className="mb-3 rounded-xl bg-paper dark:bg-white/5 border border-dashed border-ink/10 dark:border-white/10 px-3.5 py-2.5 text-[14px]">{q.contextText}</div>
                      )}
                      <div className="flex gap-3 items-start">
                        <span className="flex-none grid place-items-center w-8 h-8 rounded-xl bg-ink text-lime text-[13px] font-extrabold mt-0.5">{toBnDigits(n)}</span>
                        <h3 className="text-[15.5px] font-bold leading-relaxed flex-1">{q.question}</h3>
                      </div>
                      {q.questionImage && <img src={q.questionImage} alt="" className="mt-3 max-w-full rounded-xl" loading="lazy" />}
                      <ol className="mt-3 grid gap-2">
                        {q.options.map((opt, i) => {
                          const isCorrect = open && i === ci;
                          return (
                            <li
                              key={i}
                              className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-[14.5px] ${
                                isCorrect
                                  ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 font-bold'
                                  : 'border-ink/10 dark:border-white/10 bg-paper dark:bg-white/5'
                              }`}
                            >
                              <span className={`flex-none grid place-items-center w-7 h-7 rounded-lg text-[13px] font-extrabold ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-mint dark:bg-brand/20 text-brand-deep dark:text-brand-bright'}`}>
                                {LETTERS[i] || i + 1}
                              </span>
                              <span className="flex-1">
                                {opt}
                                {q.optionsImages?.[i] && <img src={q.optionsImages[i]} alt="" className="mt-2 max-w-full rounded-lg" loading="lazy" />}
                              </span>
                              {isCorrect && <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />}
                            </li>
                          );
                        })}
                      </ol>
                      {!open ? (
                        <button
                          onClick={() => setRevealed((r) => ({ ...r, [key]: true }))}
                          className="focus-ring mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 px-4 py-2 text-[13.5px] font-extrabold"
                        >
                          <Eye size={15} /> উত্তর ও ব্যাখ্যা দেখো
                        </button>
                      ) : (
                        <div className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/30 px-4 py-3 text-[14.5px]">
                          <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
                            সঠিক উত্তর: ({LETTERS[ci] || ci + 1}) {q.options[ci]}
                          </p>
                          {q.explanation && (
                            <div className="mt-2 whitespace-pre-line text-ink/85 dark:text-paper/85">
                              <span className="block text-[12px] font-extrabold tracking-wide text-brand-deep dark:text-brand-bright">ব্যাখ্যা</span>
                              {q.explanation}
                              {q.explanationImage && <img src={q.explanationImage} alt="" className="mt-2 max-w-full rounded-lg" loading="lazy" />}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="mt-10 rounded-[26px] bg-ink text-paper p-7 text-center">
            <h2 className="font-bangla text-xl font-extrabold text-lime">{exam.shortBn} প্রস্তুতির জন্য মডেল টেস্ট দাও</h2>
            <p className="text-sm text-paper/70 mt-2">বিগত বছরের প্রশ্নসহ পূর্ণাঙ্গ প্রশ্নব্যাংক, টাইমার ও AI দুর্বলতা রিপোর্ট — ফ্রি।</p>
            <Link to={`/qbank?level=ADMISSION&admissionCategory=${encodeURIComponent(exam.category)}`} className="inline-block mt-4 bg-lime text-ink font-extrabold text-sm px-6 py-2.5 rounded-full">
              প্রশ্নব্যাংক খোলো
            </Link>
          </div>
        </div>
      )}
    </Chrome>
  );
}

/* ── Router glue ─────────────────────────────────────────────────────── */
const PastPaperPage: React.FC = () => {
  const { exam: examId = '', session = '' } = useParams<{ exam?: string; session?: string }>();
  const exam = examId ? findAdmissionExam(examId) : undefined;

  if (!examId) return <ExamIndex />;
  if (!exam) {
    return (
      <Chrome title="পরীক্ষা পাওয়া যায়নি | পরীক্ষাঙ্গন" canonical={`${SITE}${HUB}`}>
        <div className={`${card} p-8 text-center`}>
          <h1 className="font-bangla text-xl font-extrabold">এই পরীক্ষাটি আমাদের তালিকায় নেই</h1>
          <p className="text-sm text-mist mt-2">সব ভর্তি পরীক্ষার তালিকা থেকে বেছে নাও।</p>
          <a href={staticHref(HUB)} className="focus-ring inline-block mt-5 px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-full">
            সব পরীক্ষা দেখো
          </a>
        </div>
      </Chrome>
    );
  }
  if (!session) return <SessionIndex exam={exam} />;
  const year = parseSessionSlug(session);
  if (year === null) return <SessionIndex exam={exam} />;
  return <PaperView exam={exam} year={year} />;
};

export default PastPaperPage;
