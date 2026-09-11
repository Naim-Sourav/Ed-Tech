import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, Layers, Atom, Beaker, Calculator, Dna, Book, Languages, Cpu, Globe, ChevronRight, Sparkles } from "lucide-react";
import { QuizQuestion } from "../types";
import { API_BASE, fetchQuestionsFromBankAPI } from "../services/api";
import { SYLLABUS_DB } from "../services/syllabusData";

const SUBJECT_META: Record<string, { label: string; icon: any; color: string }> = {
  "Physics 1st Paper": { label: "পদার্থবিজ্ঞান ১ম", icon: Atom, color: "bg-blue-50 text-blue-600" },
  "Physics 2nd Paper": { label: "পদার্থবিজ্ঞান ২য়", icon: Atom, color: "bg-cyan-50 text-cyan-600" },
  "Chemistry 1st Paper": { label: "রসায়ন ১ম", icon: Beaker, color: "bg-emerald-50 text-emerald-600" },
  "Chemistry 2nd Paper": { label: "রসায়ন ২য়", icon: Beaker, color: "bg-teal-50 text-teal-600" },
  "Higher Math 1st Paper": { label: "উচ্চতর গণিত ১ম", icon: Calculator, color: "bg-indigo-50 text-indigo-600" },
  "Higher Math 2nd Paper": { label: "উচ্চতর গণিত ২য়", icon: Calculator, color: "bg-purple-50 text-purple-600" },
  "Biology 1st Paper": { label: "জীববিজ্ঞান ১ম", icon: Dna, color: "bg-rose-50 text-rose-600" },
  "Biology 2nd Paper": { label: "জীববিজ্ঞান ২য়", icon: Dna, color: "bg-amber-50 text-amber-600" },
  "Bangla 1st Paper": { label: "বাংলা ১ম", icon: Book, color: "bg-red-50 text-red-600" },
  "English": { label: "ইংরেজি", icon: Languages, color: "bg-violet-50 text-violet-600" },
  "ICT": { label: "আইসিটি", icon: Cpu, color: "bg-sky-50 text-sky-600" },
  "General Knowledge": { label: "সাধারণ জ্ঞান", icon: Globe, color: "bg-slate-50 text-slate-600" },
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const QuestionsHubPage: React.FC = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const [recent, setRecent] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>(() => {
    if (subjectName) {
      try {
        return decodeURIComponent(subjectName);
      } catch {
        return subjectName;
      }
    }
    return "ALL";
  });

  // Sync subjectName param to filter
  useEffect(() => {
    if (subjectName) {
      try {
        setSubjectFilter(decodeURIComponent(subjectName));
      } catch {
        setSubjectFilter(subjectName);
      }
    }
  }, [subjectName]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchQuestionsFromBankAPI(1, 20, subjectFilter === "ALL" ? undefined : subjectFilter, undefined, undefined, undefined, search || undefined);
        setRecent(data.questions || []);
      } catch {
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search, subjectFilter]);

  const canonical = "https://www.porikkhangon.app/questions/";
  const title = "প্রশ্নব্যাংক — HSC, Medical, BUET, DU, GST ভর্তি পরীক্ষার ২০,০০০+ MCQ | পরীক্ষাঙ্গন";
  const desc = "HSC ও ভর্তি পরীক্ষার ২০,০০০+ MCQ প্রশ্ন — ব্যাখ্যা সহ। Physics, Chemistry, Math, Biology, Bangla, English, ICT, GK। Medical, BUET, DU, GST প্রশ্নব্যাংক ফ্রিতে প্র্যাকটিস করো।";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "পরীক্ষাঙ্গন", "item": "https://www.porikkhangon.app/" },
          { "@type": "ListItem", "position": 2, "name": "প্রশ্নব্যাংক", "item": canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        "name": title,
        "description": desc,
        "url": canonical,
        "isPartOf": { "@type": "WebSite", "name": "Porikkhangon", "url": "https://www.porikkhangon.app/" },
      },
      {
        "@type": "ItemList",
        "name": "সাম্প্রতিক প্রশ্নসমূহ",
        "numberOfItems": recent.length,
        "itemListElement": recent.slice(0, 10).map((q, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": stripHtml(q.question).slice(0, 80),
          "url": `https://www.porikkhangon.app/questions/${encodeURIComponent(q.slug || q._id || q.id || "")}/`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://www.porikkhangon.app/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <img src="/Pshape.svg" alt="logo" className="w-7 h-7 dark:invert" />
            পরীক্ষাঙ্গন
          </Link>
          <Link to="/qbank" className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-sm font-bold">অ্যাপে খুলুন</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[28px] p-6 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold tracking-widest uppercase mb-3">
              <Sparkles size={12} /> ২০,০০০+ প্রশ্ন • ব্যাখ্যা সহ
            </div>
            <h1 className="text-2xl md:text-4xl font-black leading-tight mb-3">প্রশ্নব্যাংক — যেকোনো প্রশ্ন সার্চ করো, সাথে সাথে উত্তর ও ব্যাখ্যা</h1>
            <p className="text-white/80 text-[14px] md:text-[16px] leading-relaxed max-w-2xl">
              Satt Academy, Chorcha, Daricomma এর মতোই — আমাদের প্রতিটি প্রশ্নের আলাদা লিংক আছে। Google এ প্রশ্ন লিখে সার্চ করলে এখন পরীক্ষাঙ্গনের প্রশ্নও দেখাবে।
            </p>

            <div className="mt-6 max-w-xl relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="যেমন: নিউটনের সূত্র, DNA, পর্যায় সারণি..."
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/15 backdrop-blur border border-white/20 placeholder:text-white/50 text-white outline-none focus:bg-white/20"
              />
            </div>
          </div>
        </div>

        {/* Subject filter */}
        <div className="mt-8">
          <h2 className="text-[13px] font-black tracking-widest uppercase text-gray-500 mb-3 flex items-center gap-2">
            <Layers size={14} /> বিষয় অনুযায়ী
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button onClick={()=>setSubjectFilter("ALL")} className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap border transition-all ${subjectFilter==="ALL" ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400"}`}>সব</button>
            {Object.keys(SUBJECT_META).map(sub => {
              const meta = SUBJECT_META[sub];
              const isActive = subjectFilter===sub;
              return (
                <button key={sub} onClick={()=>setSubjectFilter(sub)} className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all ${isActive ? "bg-primary text-white border-primary" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}>
                  <meta.icon size={14} /> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Questions */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold flex items-center gap-2"><BookOpen size={18} className="text-primary" /> {search ? `সার্চ রেজাল্ট: "${search}"` : "সাম্প্রতিক প্রশ্ন"}</h2>
            <Link to="/qbank" className="text-[13px] font-bold text-primary flex items-center gap-1">সব দেখুন <ChevronRight size={14} /></Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 animate-pulse">
              {[1,2,3,4,5].map(i=> <div key={i} className="h-24 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800"></div>)}
            </div>
          ) : recent.length===0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed p-10 text-center text-gray-500">
              কোনো প্রশ্ন পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করো।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {recent.map(q => (
                <Link key={q._id || q.id} to={`/questions/${encodeURIComponent(q.slug || q._id || q.id || '')}/`} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700/50 hover:shadow-sm transition-all group">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${SUBJECT_META[q.subject||'']?.color || 'bg-gray-100 text-gray-600'}`}>
                      {(() => {
                        const Icon = SUBJECT_META[q.subject||'']?.icon || BookOpen;
                        return <Icon size={16} />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{__html: q.question}} />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.subject && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">{q.subject}</span>}
                        {q.chapter && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">{q.chapter}</span>}
                        {q.examRef && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/30">{q.examRef}</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* SEO Content */}
        <section className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6">
            <h3 className="font-bold text-[15px] mb-2">কেন পরীক্ষাঙ্গনের প্রশ্ন Google এ আসবে?</h3>
            <ul className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400 space-y-2 list-disc ml-4">
              <li>প্রতিটি প্রশ্নের আলাদা static URL: <code>/questions/&lt;slug&gt;/</code> — Google সহজে crawl করতে পারে</li>
              <li>QAPage + FAQPage structured data — Satt Academy / Chorcha যেভাবে করে</li>
              <li>Canonical, OG tags, Breadcrumb — rich result এর জন্য</li>
              <li>Subject / Chapter internal linking — topical authority বাড়ে</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6">
            <h3 className="font-bold text-[15px] mb-2">কিভাবে ব্যবহার করবে?</h3>
            <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">
              যেকোনো প্রশ্নের পেজে গিয়ে শেয়ার বাটনে ক্লিক করলে clean link কপি হবে। যেমন: <br />
              <code className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[12px]">https://www.porikkhangon.app/questions/&lt;slug&gt;/</code> <br />
              এই লিংক Facebook, Messenger, বা Google এ শেয়ার করলে সুন্দর preview দেখাবে এবং SEO friendly।
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/hsc-syllabus/" className="text-[12px] px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border">HSC সিলেবাস</Link>
              <Link to="/" className="text-[12px] px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">হোম</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QuestionsHubPage;
