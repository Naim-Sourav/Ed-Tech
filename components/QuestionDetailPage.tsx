import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Bookmark, Share2, BookOpen, CheckCircle, Atom, Beaker, Calculator, Dna, Book, Languages, Cpu, Globe, Layers } from "lucide-react";
import { QuizQuestion } from "../types";
import { fetchQuestionBySlugOrId, fetchRelatedQuestions, stripHtml, truncateForMeta, getQuestionCanonicalUrl, buildQuestionJsonLd } from "../services/questionService";
import { useAuth } from "../contexts/AuthContext";
import { saveQuestionAPI, unsaveQuestionAPI, fetchSavedQuestionsAPI } from "../services/api";

const SUBJECT_ICONS: Record<string, any> = {
  "Physics 1st Paper": Atom,
  "Physics 2nd Paper": Atom,
  "Chemistry 1st Paper": Beaker,
  "Chemistry 2nd Paper": Beaker,
  "Higher Math 1st Paper": Calculator,
  "Higher Math 2nd Paper": Calculator,
  "Biology 1st Paper": Dna,
  "Biology 2nd Paper": Dna,
  "Bangla 1st Paper": Book,
  "Bangla 2nd Paper": Book,
  "English": Languages,
  "ICT": Cpu,
  "General Knowledge": Globe,
};

const toBengaliNumber = (num: number | string) => {
  const map = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return String(num).replace(/\d/g, d => map[parseInt(d)]);
};

const QuestionDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [related, setRelated] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userSelected, setUserSelected] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!identifier) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = await fetchQuestionBySlugOrId(identifier);
        if (!q) {
          setError("প্রশ্নটি খুঁজে পাওয়া যায়নি। হয়তো লিংকটি ভুল বা প্রশ্নটি সরানো হয়েছে।");
          setLoading(false);
          return;
        }
        setQuestion(q);
        // MathJax typeset
        setTimeout(() => {
          // @ts-ignore
          if (window.MathJax?.typesetPromise) {
            // @ts-ignore
            window.MathJax.typesetPromise().catch(()=>{});
          }
        }, 200);

        // Fetch related
        fetchRelatedQuestions(q, 6).then(setRelated).catch(()=>{});
      } catch (e: any) {
        setError(e.message || "লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [identifier]);

  // Saved state
  useEffect(() => {
    if (!currentUser || !question) return;
    fetchSavedQuestionsAPI(currentUser.uid).then((saved: any[]) => {
      const qId = question._id || question.id;
      const found = saved.some((s: any) => (s.questionId?._id || s.questionId) === qId);
      setIsSaved(found);
    }).catch(()=>{});
  }, [currentUser, question]);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    if (!question) return;
    const qId = question._id || question.id;
    if (!qId) return;
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      if (prev) await unsaveQuestionAPI(currentUser.uid, qId);
      else await saveQuestionAPI(currentUser.uid, qId);
    } catch {
      setIsSaved(prev);
    }
  };

  const handleShare = async () => {
    if (!question) return;
    const url = getQuestionCanonicalUrl(question);
    if (navigator.share) {
      try { await navigator.share({ title: stripHtml(question.question), url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("লিংক কপি করা হয়েছে!");
    }
  };

  const handleOptionClick = (idx: number) => {
    if (userSelected !== undefined) return;
    setUserSelected(idx);
    setShowAnswer(true);
    setTimeout(() => {
      // @ts-ignore
      if (window.MathJax?.typesetPromise) {
        // @ts-ignore
        window.MathJax.typesetPromise().catch(()=>{});
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-1/3"></div>
          <div className="h-32 bg-white dark:bg-zinc-900 rounded-2xl border"></div>
          <div className="grid grid-cols-1 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-white dark:bg-zinc-900 rounded-xl border"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full border shadow-sm">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">প্রশ্ন পাওয়া যায়নি</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={()=>navigate(-1)} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold">ফিরে যান</button>
            <Link to="/qbank" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold">প্রশ্নব্যাংকে যান</Link>
          </div>
        </div>
      </div>
    );
  }

  const Icon = question.subject ? SUBJECT_ICONS[question.subject] || Layers : Layers;
  const canonical = getQuestionCanonicalUrl(question);
  const metaTitle = `${stripHtml(question.question).slice(0, 70)} | ${question.subject || ''} ${question.chapter || ''} | পরীক্ষাঙ্গন`;
  const metaDesc = truncateForMeta(question.explanation ? `${stripHtml(question.question)} — উত্তর: ${stripHtml(question.options[question.correctAnswerIndex])}. ${stripHtml(question.explanation)}` : `${stripHtml(question.question)} — ${question.subject || ''} ${question.chapter || ''} প্রশ্নের উত্তর ও ব্যাখ্যা সহ।`, 155);
  const jsonLd = buildQuestionJsonLd(question);

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-black text-gray-900 dark:text-gray-100">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://www.porikkhangon.app/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 font-bold">
              <img src="/Pshape.svg" alt="logo" className="w-7 h-7 dark:invert" />
              <span className="hidden sm:inline">পরীক্ষাঙ্গন</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleSave} className={`p-2.5 rounded-xl border transition-all ${isSaved ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-50'}`}>
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleShare} className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 mb-5 flex-wrap">
          <Link to="/" className="hover:text-primary">হোম</Link>
          <span className="opacity-40">›</span>
          <Link to="/questions/" className="hover:text-primary">প্রশ্নব্যাংক</Link>
          <span className="opacity-40">›</span>
          {question.subject && (
            <>
              <Link to={`/questions/subject/${encodeURIComponent(question.subject)}/`} className="hover:text-primary">{question.subject}</Link>
              <span className="opacity-40">›</span>
            </>
          )}
          <span className="text-gray-900 dark:text-white font-medium line-clamp-1">{stripHtml(question.question).slice(0, 40)}...</span>
        </nav>

        {/* Question Card */}
        <article className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Subject header */}
          <div className="px-5 md:px-7 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <Icon size={20} />
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {question.subject && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">{question.subject}</span>}
                  {question.chapter && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30">{question.chapter}</span>}
                  {question.topic && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border">{question.topic}</span>}
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {question.examRef || question.level || "প্রশ্নব্যাংক"} • {question.board || question.college || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Context */}
          {(question.contextText || question.contextImage) && (
            <div className="mx-5 md:mx-7 mt-5 p-4 bg-sky-50/70 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/30">
              <p className="text-[10px] font-black tracking-widest text-sky-600/70 dark:text-sky-400/70 uppercase mb-2">উদ্দীপক</p>
              {question.contextText && <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: question.contextText}} />}
              {question.contextImage && <img src={question.contextImage} alt="context" className="mt-3 rounded-xl max-h-64 object-contain border bg-white dark:bg-zinc-800 p-2" referrerPolicy="no-referrer" />}
            </div>
          )}

          {/* Question */}
          <div className="px-5 md:px-7 pt-6">
            <h1 className="text-[18px] md:text-[20px] font-bold leading-relaxed text-gray-900 dark:text-white">
              <span dangerouslySetInnerHTML={{__html: question.question}} />
            </h1>
            {question.questionImage && <img src={question.questionImage} alt="question" className="mt-4 rounded-xl max-h-80 object-contain border bg-gray-50 dark:bg-zinc-800 p-2" referrerPolicy="no-referrer" />}
          </div>

          {/* Options */}
          <div className="px-5 md:px-7 py-6 space-y-2.5">
            {question.options.map((opt, idx) => {
              const isCorrect = idx === question.correctAnswerIndex;
              const isSelected = userSelected === idx;
              const showFeedback = userSelected !== undefined || showAnswer;
              let style = "bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700/50 text-gray-700 dark:text-gray-300";
              if (showFeedback) {
                if (isCorrect) style = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300";
                else if (isSelected) style = "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300";
              } else if (isSelected) {
                style = "bg-orange-50 dark:bg-orange-950/20 border-orange-300 text-orange-700";
              }

              return (
                <button
                  key={idx}
                  onClick={()=>handleOptionClick(idx)}
                  disabled={userSelected !== undefined}
                  className={`w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${style} ${userSelected===undefined ? 'hover:border-gray-300 dark:hover:border-zinc-600 cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border shrink-0 mt-0.5 ${isCorrect && showFeedback ? 'bg-emerald-500 text-white border-emerald-500' : isSelected && showFeedback ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-500'}`}>
                    {["ক","খ","গ","ঘ"][idx] || String.fromCharCode(65+idx)}
                  </span>
                  <span className="flex-1 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{__html: opt}} />
                  {showFeedback && isCorrect && <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Answer / Explanation */}
          {(showAnswer || userSelected !== undefined) && (
            <div className="mx-5 md:mx-7 mb-7 p-5 bg-orange-50/60 dark:bg-orange-950/10 rounded-2xl border border-orange-200/50 dark:border-orange-900/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                  <BookOpen size={14} />
                </div>
                <h3 className="text-[13px] font-black tracking-widest text-orange-600 dark:text-orange-400 uppercase">সঠিক উত্তর ও ব্যাখ্যা</h3>
              </div>
              <p className="text-[15px] font-bold text-gray-900 dark:text-white mb-2">
                উত্তর: {["ক","খ","গ","ঘ"][question.correctAnswerIndex]}. <span dangerouslySetInnerHTML={{__html: question.options[question.correctAnswerIndex]}} />
              </p>
              {question.explanation ? (
                <div className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: question.explanation}} />
              ) : (
                <p className="text-sm text-gray-500">এই প্রশ্নের ব্যাখ্যা এখনো যোগ করা হয়নি।</p>
              )}
              {question.explanationImage && <img src={question.explanationImage} alt="explanation" className="mt-3 rounded-xl max-h-64 object-contain border bg-white dark:bg-zinc-800 p-2" referrerPolicy="no-referrer" />}
            </div>
          )}

          {/* CTA if not answered */}
          {userSelected===undefined && !showAnswer && (
            <div className="px-5 md:px-7 pb-6">
              <button onClick={()=>setShowAnswer(true)} className="text-sm font-bold text-primary hover:underline">উত্তর দেখুন →</button>
            </div>
          )}

          {/* Footer CTA */}
          <div className="px-5 md:px-7 py-5 bg-gray-50/70 dark:bg-zinc-800/30 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <p className="text-[13px] text-gray-600 dark:text-gray-400">
              আরও <strong className="text-gray-900 dark:text-white">{question.subject} {question.chapter}</strong> এর প্রশ্ন প্র্যাকটিস করতে চাও?
            </p>
            <div className="flex gap-2">
              <Link to={`/qbank?level=${question.level || 'ADMISSION'}&subject=${encodeURIComponent(question.subject||'')}&chapter=${encodeURIComponent(question.chapter||'')}`} className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm font-bold hover:bg-gray-50">অধ্যায়ের সব প্রশ্ন</Link>
              <Link to="/qbank" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-orange-600">প্রশ্নব্যাংক খুলুন</Link>
            </div>
          </div>
        </article>

        {/* Related Questions */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-primary" /> সম্পর্কিত প্রশ্ন
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {related.map((rq) => (
                <Link
                  key={rq._id || rq.id}
                  to={`/questions/${encodeURIComponent(rq.slug || rq._id || rq.id || '')}/`}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700/50 transition-colors group"
                >
                  <p className="text-[14px] font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{__html: rq.question}} />
                  <div className="flex gap-1.5 mt-2">
                    {rq.subject && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">{rq.subject}</span>}
                    {rq.chapter && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">{rq.chapter}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Text */}
        <section className="mt-10 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <h2 className="text-[15px] font-bold mb-2">এই প্রশ্ন সম্পর্কে</h2>
          <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">
            "{stripHtml(question.question).slice(0, 120)}" — এই প্রশ্নটি <strong>{question.subject}</strong> এর <strong>{question.chapter}</strong> অধ্যায় থেকে নেওয়া। 
            {question.examRef ? ` ${question.examRef} পরীক্ষায় এসেছিল।` : ''} 
            পরীক্ষাঙ্গনে এমন {toBengaliNumber(20000)}+ প্রশ্ন রয়েছে যা HSC, ভর্তি পরীক্ষা (Medical, BUET, DU, GST) এর প্রস্তুতির জন্য সাজানো। প্রতিটি প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা সহ প্র্যাকটিস করতে পারবে একদম ফ্রিতে।
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/hsc-syllabus/" className="text-[12px] px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/30 hover:bg-orange-100">HSC সিলেবাস গাইড</Link>
            <Link to="/questions/" className="text-[12px] px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100">সব প্রশ্ন দেখুন</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-10">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-[12px] text-gray-500">
          © {new Date().getFullYear()} পরীক্ষাঙ্গন — {question.subject} {question.chapter} প্রশ্ন সমাধান
        </div>
      </footer>
    </div>
  );
};

export default QuestionDetailPage;
