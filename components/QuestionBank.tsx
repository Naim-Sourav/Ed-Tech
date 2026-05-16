import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  saveQuestionAPI,
  unsaveQuestionAPI,
  fetchSavedQuestionsAPI,
  fetchQuestionsFromBankAPI,
  fetchSyllabusStatsAPI,
  fetchQuestionsByExamRefAPI
} from '../services/api';
import { 
  ChevronLeft, 
  Archive, 
  Play, 
  Eye, 
  EyeOff,
  Dna,
  Beaker,
  Atom,
  Calculator,
  Languages,
  Book,
  Globe,
  Cpu,
  BrainCircuit,
  Bookmark,
  Share2,
  BookOpen,
  Stethoscope,
  Syringe,
  Shield
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import { normalizeBangla } from '../utils/normalization';

// --- HELPER COMPONENT: REVISION QUESTION CARD ---
const toBengaliNumber = (num: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (match) => bengaliDigits[parseInt(match)]);
};

// const bnNormalize alias removed

const RevisionQuestionCard = React.memo(({ 
    q, 
    idx, 
    userSelected, 
    showAllAnswers, 
    isSaved, 
    onOptionClick, 
    onToggleSave, 
    showChapter = false,
    isGroupStart = false,
    isGroupMiddle = false,
    isGroupEnd = false,
    stimulusStart,
    stimulusEnd
}: { 
    q: QuizQuestion, 
    idx: number, 
    userSelected: number | undefined, 
    showAllAnswers: boolean,
    isSaved: boolean,
    onOptionClick: (qIdx: number, oIdx: number) => void,
    onToggleSave: (q: QuizQuestion) => void,
    showChapter?: boolean,
    isGroupStart?: boolean,
    isGroupMiddle?: boolean,
    isGroupEnd?: boolean,
    stimulusStart?: number,
    stimulusEnd?: number
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isAnswered = userSelected !== undefined;
    const showFeedback = isAnswered || showAllAnswers;
    const isRepeatStimulus = isGroupMiddle || isGroupEnd;

    // Targeted MathJax rendering to prevent global lag
    useEffect(() => {
        if (window.MathJax && cardRef.current) {
            // Small timeout to allow DOM to render the explanation first
            const timer = setTimeout(() => {
                if (cardRef.current) {
                    window.MathJax.typesetPromise([cardRef.current]).catch((err: any) => console.error('MathJax card typeset:', err));
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [showFeedback, q.question]); // Only re-typeset this specific card when feedback toggles or question changes

    let roundedClasses = 'rounded-[2rem]';
    let borderClasses = 'border';
    let marginClass = 'mt-6';

    if (isGroupStart) {
        roundedClasses = 'rounded-t-[2rem] rounded-b-none';
        borderClasses = 'border border-b-dashed border-b-gray-200 dark:border-b-gray-800';
    } else if (isGroupMiddle) {
        roundedClasses = 'rounded-none';
        borderClasses = 'border-l border-r border-b-dashed border-b-gray-200 dark:border-b-gray-800 border-t-0';
        marginClass = 'mt-0';
    } else if (isGroupEnd) {
        roundedClasses = 'rounded-b-[2rem] rounded-t-none';
        borderClasses = 'border border-t-0';
        marginClass = 'mt-0';
    }

    return (
        <div ref={cardRef} className={`p-4 md:p-6 transition-all duration-300 relative group bg-white dark:bg-gray-900 ${roundedClasses} ${borderClasses} ${marginClass} border-gray-200 dark:border-gray-800`}>

            {/* Question Text & Stimulus */}
            <div className="relative z-10">
                {(q.contextText || q.contextImage) && !isRepeatStimulus && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/10 rounded-xl border-l-[3px] border-l-sky-400 dark:border-l-sky-500 border border-t-0 border-r-0 border-b-0 text-sm md:text-base text-gray-800 dark:text-gray-200 font-tiro leading-relaxed mb-6 shadow-sm">
                        {stimulusStart && stimulusEnd ? (
                            <div className="mb-3 pb-2 border-b border-sky-100 dark:border-sky-800/30">
                                <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wide">
                                    নিচের উদ্দীপকের আলোকে {toBengaliNumber(stimulusStart)} ও {toBengaliNumber(stimulusEnd)} নং প্রশ্নের উত্তর দাও:
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">উদ্দীপক (Context)</span>
                            </div>
                        )}
                        {q.contextText && <div dangerouslySetInnerHTML={{ __html: q.contextText }} />}
                        {q.contextImage && (
                            <img src={q.contextImage} alt="Context" className="mt-4 rounded-xl max-h-48 object-contain mx-auto bg-transparent border border-gray-100" referrerPolicy="no-referrer" />
                        )}
                    </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-black text-lg shrink-0 mt-0">
                        {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 space-y-4 pt-1">
                        <h3 className="text-base font-normal text-gray-900 dark:text-white leading-relaxed font-tiro">
                            <div dangerouslySetInnerHTML={{ __html: q.question }} />
                        </h3>
                        {q.questionImage && (
                            <img src={q.questionImage} alt="Question" className="rounded-xl max-h-64 object-contain mr-auto bg-transparent border border-gray-100 dark:border-gray-800 shadow-sm" referrerPolicy="no-referrer" />
                        )}
                        
                        {/* Tags below question */}
                        <div className="flex flex-wrap gap-2 items-center mt-2">
                            {q.examRef && (
                                <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded shadow-sm border border-blue-100/50 dark:border-blue-800/30">
                                    {q.examRef}
                                </span>
                            )}
                            {showChapter && q.chapter && (
                                <span className="text-[10px] font-bold bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded shadow-sm border border-orange-100/50 dark:border-orange-800/30">
                                    {q.chapter}
                                </span>
                            )}
                            {isRepeatStimulus && (
                                <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-200/50 dark:border-gray-700/50">
                                    পূর্বের উদ্দীপক
                                </span>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => onToggleSave(q)}
                        className={`p-2 shrink-0 transition-all ${
                            isSaved ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    >
                        <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} strokeWidth={2}/>
                    </button>
                </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 relative z-10 w-full pl-0 md:pl-12">
                {q.options.map((option, oIdx) => {
                    const isSelected = userSelected === oIdx;
                    const isRight = oIdx === q.correctAnswerIndex;
                    
                    let variant = 'default';
                    if (showFeedback) {
                        if (isRight) variant = 'correct';
                        else if (isSelected) variant = 'wrong';
                    } else if (isSelected) {
                        variant = 'selected';
                    }

                    return (
                        <button
                            key={oIdx}
                            disabled={showFeedback}
                            onClick={() => onOptionClick(idx, oIdx)}
                            className={`p-3 md:p-4 rounded-xl text-left text-sm md:text-base font-normal transition-all flex flex-col gap-3 shadow-sm border ${
                                variant === 'correct' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-500 text-green-800 dark:text-green-300' :
                                variant === 'wrong' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-500 text-red-800 dark:text-red-300' :
                                variant === 'selected' ? 'bg-primary/5 dark:bg-primary/10 border-primary text-gray-900 dark:text-white' :
                                'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-4 w-full">
                                <span className={`w-8 h-8 flex items-center justify-center font-bold text-xs rounded-lg shrink-0 transition-colors ${
                                    variant === 'correct' ? 'bg-green-500 text-white shadow-sm' :
                                    variant === 'wrong' ? 'bg-red-500 text-white shadow-sm' :
                                    variant === 'selected' ? 'bg-primary text-white shadow-sm' :
                                    'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200'
                                }`}>
                                    {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="flex-1 font-tiro" dangerouslySetInnerHTML={{ __html: option }}></span>
                                
                                {variant === 'correct' && (
                                    <div className="shrink-0 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                )}
                                {variant === 'wrong' && (
                                    <div className="shrink-0 text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                    </div>
                                )}
                            </div>
                            {q.optionsImages?.[oIdx] && (
                                <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="h-16 w-fit object-contain rounded self-center bg-transparent mix-blend-multiply dark:mix-blend-normal" referrerPolicy="no-referrer" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Feedback / Explanation */}
            {showFeedback && q.explanation && (
                <div className="mt-6 mb-2 ml-0 md:ml-12 p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/30 animate-in fade-in zoom-in-95 duration-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-orange-500" />
                        <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400">ব্যাখ্যা</h4>
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-200 leading-loose font-tiro">
                        <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                        {q.explanationImage && (
                            <img src={q.explanationImage} alt="Explanation" className="mt-4 rounded-xl max-h-48 object-contain mr-auto bg-transparent border border-orange-100 dark:border-orange-800" referrerPolicy="no-referrer" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

RevisionQuestionCard.displayName = 'RevisionQuestionCard';

// 1. All Available Subjects (Matching SYLLABUS_DB keys)
const SUBJECT_DEFINITIONS: Record<string, { display: string, icon: any, color: string }> = {
  'Biology 1st Paper': { display: 'জীববিজ্ঞান ১ম পত্র', icon: Dna, color: 'text-orange-600 bg-orange-100' },
  'Biology 2nd Paper': { display: 'জীববিজ্ঞান ২য় পত্র', icon: Dna, color: 'text-orange-600 bg-orange-100' },
  'Physics 1st Paper': { display: 'পদার্থবিজ্ঞান ১ম পত্র', icon: Atom, color: 'text-blue-600 bg-blue-100' },
  'Physics 2nd Paper': { display: 'পদার্থবিজ্ঞান ২য় পত্র', icon: Atom, color: 'text-blue-600 bg-blue-100' },
  'Chemistry 1st Paper': { display: 'রসায়ন ১ম পত্র', icon: Beaker, color: 'text-amber-600 bg-amber-100' },
  'Chemistry 2nd Paper': { display: 'রসায়ন ২য় পত্র', icon: Beaker, color: 'text-amber-600 bg-amber-100' },
  'Higher Math 1st Paper': { display: 'উচ্চতর গণিত ১ম পত্র', icon: Calculator, color: 'text-red-600 bg-red-100' },
  'Higher Math 2nd Paper': { display: 'উচ্চতর গণিত ২য় পত্র', icon: Calculator, color: 'text-red-600 bg-red-100' },
  'Bangla 1st Paper': { display: 'বাংলা ১ম পত্র', icon: Book, color: 'text-emerald-600 bg-emerald-100' },
  'Bangla 2nd Paper': { display: 'বাংলা ২য় পত্র', icon: Book, color: 'text-emerald-600 bg-emerald-100' },
  'English': { display: 'ইংরেজি', icon: Languages, color: 'text-indigo-600 bg-indigo-100' },
  'ICT': { display: 'আইসিটি', icon: Cpu, color: 'text-cyan-600 bg-cyan-100' },
  'General Knowledge': { display: 'সাধারণ জ্ঞান', icon: Globe, color: 'text-gray-600 bg-gray-100' },
  'Mental Ability': { display: 'মানসিক দক্ষতা', icon: BrainCircuit, color: 'text-purple-600 bg-purple-100' }
};

// 1.1 Admission Institutions
const ADMISSION_INSTITUTIONS = [
  {
    id: 'gst',
    name: 'GST গুচ্ছ',
    icon: Globe,
    color: 'text-blue-600 bg-blue-100',
    units: [
      {
        id: 'A',
        name: 'A ইউনিট',
        exams: [
          { name: 'GST A unit 25-26', examRef: 'GST (গুচ্ছ) A Unit 2025-26' },
          { name: 'GST A unit 24-25', examRef: 'GST (গুচ্ছ) A Unit 2024-25' },
          { name: 'GST A unit 23-24', examRef: 'GST (গুচ্ছ) A Unit 2023-24' },
          { name: 'GST A unit 22-23', examRef: 'GST (গুচ্ছ) A Unit 2022-23' },
          { name: 'GST A unit 21-22', examRef: 'GST (গুচ্ছ) A Unit 2021-22' },
          { name: 'GST A unit 20-21', examRef: 'GST (গুচ্ছ) A Unit 2020-21' }
        ]
      },
      {
        id: 'B',
        name: 'B ইউনিট',
        exams: [
          { name: 'GST B unit 25-26', examRef: 'GST (গুচ্ছ) B Unit 2025-26' },
          { name: 'GST B unit 24-25', examRef: 'GST (গুচ্ছ) B Unit 2024-25' },
          { name: 'GST B unit 23-24', examRef: 'GST (গুচ্ছ) B Unit 2023-24' },
          { name: 'GST B unit 22-23', examRef: 'GST (গুচ্ছ) B Unit 2022-23' },
          { name: 'GST B unit 21-22', examRef: 'GST (গুচ্ছ) B Unit 2021-22' },
          { name: 'GST B unit 20-21', examRef: 'GST (গুচ্ছ) B Unit 2020-21' }
        ]
      },
      {
        id: 'C',
        name: 'C ইউনিট',
        exams: [
          { name: 'GST C unit 25-26', examRef: 'GST (গুচ্ছ) C Unit 2025-26' },
          { name: 'GST C unit 24-25', examRef: 'GST (গুচ্ছ) C Unit 2024-25' },
          { name: 'GST C unit 23-24', examRef: 'GST (গুচ্ছ) C Unit 2023-24' },
          { name: 'GST C unit 22-23', examRef: 'GST (গুচ্ছ) C Unit 2022-23' },
          { name: 'GST C unit 21-22', examRef: 'GST (গুচ্ছ) C Unit 2021-22' },
          { name: 'GST C unit 20-21', examRef: 'GST (গুচ্ছ) C Unit 2020-21' }
        ]
      }
    ]
  },
  {
    id: 'medical',
    name: 'মেডিকেল ভর্তি পরীক্ষা',
    icon: Stethoscope,
    color: 'text-rose-600 bg-rose-100',
    units: [
      {
        id: 'mbbs',
        name: 'MBBS/BDS',
        exams: [
          { name: 'Medical 25-26', examRef: 'MAT 25-26' },
          { name: 'Medical 24-25', examRef: 'MAT 24-25' },
          { name: 'Medical 23-24', examRef: 'MAT 23-24' },
          { name: 'Medical 22-23', examRef: 'MAT 22-23' },
          { name: 'Medical 21-22', examRef: 'MAT 21-22' },
          { name: 'Medical 20-21', examRef: 'MAT 20-21' },
          { name: 'Medical 19-20', examRef: 'MAT 19-20' },
          { name: 'Medical 18-19', examRef: 'MAT 18-19' },
          { name: 'Medical 17-18', examRef: 'MAT 17-18' },
          { name: 'Medical 16-17', examRef: 'MAT 16-17' },
          { name: 'Medical 15-16', examRef: 'MAT 15-16' },
          { name: 'Medical 14-15', examRef: 'MAT 14-15' },
          { name: 'Medical 13-14', examRef: 'MAT 13-14' },
          { name: 'Medical 12-13', examRef: 'MAT 12-13' },
          { name: 'Medical 11-12', examRef: 'MAT 11-12' },
          { name: 'Medical 10-11', examRef: 'MAT 10-11' }
        ]
      }
    ]
  },
  {
    id: 'dental',
    name: 'ডেন্টাল ভর্তি পরীক্ষা',
    icon: Syringe,
    color: 'text-teal-600 bg-teal-100',
    units: [
      {
        id: 'bds',
        name: 'BDS',
        exams: [
          { name: 'Dental 25-26', examRef: 'DAT 25-26' },
          { name: 'Dental 24-25', examRef: 'DAT 24-25' },
          { name: 'Dental 23-24', examRef: 'DAT 23-24' },
          { name: 'Dental 22-23', examRef: 'DAT 22-23' },
          { name: 'Dental 21-22', examRef: 'DAT 21-22' },
          { name: 'Dental 20-21', examRef: 'DAT 20-21' },
          { name: 'Dental 19-20', examRef: 'DAT 19-20' },
          { name: 'Dental 18-19', examRef: 'DAT 18-19' },
          { name: 'Dental 17-18', examRef: 'DAT 17-18' },
          { name: 'Dental 16-17', examRef: 'DAT 16-17' },
          { name: 'Dental 15-16', examRef: 'DAT 15-16' },
          { name: 'Dental 14-15', examRef: 'DAT 14-15' },
          { name: 'Dental 13-14', examRef: 'DAT 13-14' },
          { name: 'Dental 12-13', examRef: 'DAT 12-13' },
          { name: 'Dental 11-12', examRef: 'DAT 11-12' },
          { name: 'Dental 10-11', examRef: 'DAT 10-11' }
        ]
      }
    ]
  },
  {
    id: 'afmc',
    name: 'AFMC ও AMC',
    icon: Shield,
    color: 'text-emerald-600 bg-emerald-100',
    units: [
      {
        id: 'afmc_amc',
        name: 'AFMC & AMC',
        exams: [
          { name: 'AFMC 25-26', examRef: 'AFMC 25-26' },
          { name: 'AFMC 24-25', examRef: 'AFMC 24-25' },
          { name: 'AFMC 23-24', examRef: 'AFMC 23-24' },
          { name: 'AFMC 22-23', examRef: 'AFMC 22-23' },
          { name: 'AFMC 21-22', examRef: 'AFMC 21-22' },
          { name: 'AFMC 20-21', examRef: 'AFMC 20-21' },
          { name: 'AFMC 19-20', examRef: 'AFMC 19-20' },
          { name: 'AFMC 18-19', examRef: 'AFMC 18-19' },
          { name: 'AFMC 17-18', examRef: 'AFMC 17-18' },
          { name: 'AFMC 16-17', examRef: 'AFMC 16-17' },
          { name: 'AFMC 15-16', examRef: 'AFMC 15-16' },
          { name: 'AFMC 14-15', examRef: 'AFMC 14-15' },
          { name: 'AFMC 13-14', examRef: 'AFMC 13-14' },
          { name: 'AFMC 12-13', examRef: 'AFMC 12-13' },
          { name: 'AFMC 11-12', examRef: 'AFMC 11-12' },
          { name: 'AFMC 10-11', examRef: 'AFMC 10-11' }
        ]
      }
    ]
  },
  {
    id: 'du',
    name: 'ঢাকা বিশ্ববিদ্যালয়',
    icon: BookOpen,
    color: 'text-indigo-600 bg-indigo-100',
    units: [
      {
        id: 'A',
        name: 'A ইউনিট',
        exams: [
          { name: 'DU A 25-26', examRef: 'DU A Unit 25-26' },
          { name: 'DU A 24-25', examRef: 'DU A Unit 24-25' },
          { name: 'DU A 23-24', examRef: 'DU A Unit 23-24' },
          { name: 'DU A 22-23', examRef: 'DU A Unit 22-23' },
          { name: 'DU A 21-22', examRef: 'DU A Unit 21-22' },
          { name: 'DU A 20-21', examRef: 'DU A Unit 20-21' },
          { name: 'DU A 19-20', examRef: 'DU A Unit 19-20' },
          { name: 'DU A 18-19', examRef: 'DU A Unit 18-19' },
          { name: 'DU A 17-18', examRef: 'DU A Unit 17-18' }
        ]
      },
      {
        id: 'B',
        name: 'B ইউনিট',
        exams: [
          { name: 'DU B 25-26', examRef: 'DU B Unit 25-26' },
          { name: 'DU B 24-25', examRef: 'DU B Unit 24-25' },
          { name: 'DU B 23-24', examRef: 'DU B Unit 23-24' },
          { name: 'DU B 22-23', examRef: 'DU B Unit 22-23' },
          { name: 'DU B 21-22', examRef: 'DU B Unit 21-22' },
          { name: 'DU B 20-21', examRef: 'DU B Unit 20-21' },
          { name: 'DU B 19-20', examRef: 'DU B Unit 19-20' },
          { name: 'DU B 18-19', examRef: 'DU B Unit 18-19' },
          { name: 'DU B 17-18', examRef: 'DU B Unit 17-18' }
        ]
      },
      {
        id: 'C',
        name: 'C ইউনিট',
        exams: [
          { name: 'DU C 25-26', examRef: 'DU C Unit 25-26' },
          { name: 'DU C 24-25', examRef: 'DU C Unit 24-25' },
          { name: 'DU C 23-24', examRef: 'DU C Unit 23-24' },
          { name: 'DU C 22-23', examRef: 'DU C Unit 22-23' },
          { name: 'DU C 21-22', examRef: 'DU C Unit 21-22' },
          { name: 'DU C 20-21', examRef: 'DU C Unit 20-21' },
          { name: 'DU C 19-20', examRef: 'DU C Unit 19-20' },
          { name: 'DU C 18-19', examRef: 'DU C Unit 18-19' },
          { name: 'DU C 17-18', examRef: 'DU C Unit 17-18' }
        ]
      }
    ]
  }
];

const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  // Navigation State from URL
  const selectedLevel = searchParams.get('level') as 'ACADEMIC' | 'ADMISSION' | null;
  const selectedSubject = searchParams.get('subject'); // This should be exact DB key
  const selectedChapter = searchParams.get('chapter');
  const selectedTopic = searchParams.get('topic');
  const selectedInstitution = searchParams.get('institution');
  const selectedUnit = searchParams.get('unit');
  const selectedExamRef = searchParams.get('examRef');

  // Question State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [syllabusStats, setSyllabusStats] = useState<any>(null);
  
  // Track last fetched filters to detect when to reset page
  const lastFetchParams = useRef({ subject: '', chapter: '', topic: '', level: '' });

  // Revision/Exam Mode State
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [userSelections, setUserSelections] = useState<Record<number, number>>({});
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set());

  // Trigger MathJax rendering globally only when the main list is loaded
  useEffect(() => {
    if (window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax typeset failed:', err));
      }, 100);
    }
  }, [questions, isRevisionMode]);

  // Load Stats when level changes
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchSyllabusStatsAPI(selectedLevel || undefined);
        setSyllabusStats(stats);
      } catch (err) {
        console.error("Failed to load syllabus stats", err);
      }
    };
    loadStats();
  }, [selectedLevel]);

  // Fetch Questions when filters or page change
  useEffect(() => {
    if (!selectedSubject && !selectedExamRef) return;

    let ignore = false;

    const currentParams = {
        level: selectedLevel || '',
        subject: selectedSubject || '',
        chapter: selectedChapter || '',
        topic: selectedTopic || '',
        examRef: selectedExamRef || ''
    };

    const isFilterChange = 
        lastFetchParams.current.level !== currentParams.level ||
        lastFetchParams.current.subject !== currentParams.subject ||
        lastFetchParams.current.chapter !== currentParams.chapter ||
        lastFetchParams.current.topic !== currentParams.topic ||
        (lastFetchParams.current as any).examRef !== currentParams.examRef;

    if (isFilterChange) {
        lastFetchParams.current = { ...currentParams } as any;
        if (page !== 1) {
            setPage(1);
            setQuestions([]);
            return;
        } else {
            setQuestions([]);
        }
    }

    const loadQuestions = async () => {
        setLoading(true);
        try {
            let res: any;
            if (selectedExamRef) {
                const data = await fetchQuestionsByExamRefAPI(selectedExamRef);
                res = {
                    questions: Array.isArray(data) ? data : (data.questions || []),
                    total: Array.isArray(data) ? data.length : (data.total || 0)
                };
            } else {
                res = await fetchQuestionsFromBankAPI(
                    page, 
                    50, 
                    selectedSubject ?? undefined,
                    selectedChapter ?? undefined, 
                    selectedTopic ?? undefined,
                    undefined,        // examRef
                    undefined,        // search
                    selectedLevel ?? undefined // level
                );
            }

            // AGGRESSIVE FETCHING FOR BANGLA UNICODE VARIANTS (Only for subject-based view)
            if (!selectedExamRef && selectedChapter && page === 1) {
                const normSelected = selectedChapter.normalize('NFC');
                const alternateChapter = selectedChapter === normSelected ? selectedChapter.normalize('NFD') : normSelected;

                // Only fetch alternate if it's actually different
                if (alternateChapter !== selectedChapter) {
                    try {
                        const altRes = await fetchQuestionsFromBankAPI(
                            page,
                            50,
                            selectedSubject ?? undefined,
                            alternateChapter,
                            selectedTopic ?? undefined,
                            undefined,
                            undefined,
                            selectedLevel ?? undefined
                        );
                        
                        if (altRes.questions && altRes.questions.length > 0) {
                            // Merge and unique-ify based on ID
                            const combined = [...(res.questions || []), ...altRes.questions];
                            const seen = new Set();
                            res.questions = combined.filter(q => {
                                const id = q._id || q.id;
                                if (seen.has(id)) return false;
                                seen.add(id);
                                return true;
                            });
                        }
                    } catch (e) {
                        console.warn("Failed to fetch alternate Unicode variant", e);
                    }
                }
            }
            
            if (ignore) return;

            const fetchedQuestions = res.questions || [];
            
            if (page === 1) {
                setQuestions(fetchedQuestions);
            } else {
                setQuestions((prev: any[]) => {
                    const existingIds = new Set(prev.map(q => q._id || q.id));
                    const newUnique = fetchedQuestions.filter((q: any) => !existingIds.has(q._id || q.id));
                    return [...prev, ...newUnique];
                });
            }
            
            setHasMore(fetchedQuestions.length >= 50);
        } catch (err) {
            console.error(err);
            if (!ignore) showToast("প্রশ্ন লোড করতে সমস্যা হয়েছে", "error");
        } finally {
            if (!ignore) setLoading(false);
        }
    };

    loadQuestions();

    return () => {
        ignore = true;
    };
  }, [selectedSubject, selectedChapter, selectedTopic, selectedLevel, selectedExamRef, page, showToast]);

  // Sync saved questions
  useEffect(() => {
    if (currentUser) {
      fetchSavedQuestionsAPI(currentUser.uid).then((saved: any[]) => {
        const ids = new Set(saved.map((s: any) => s.questionId?._id).filter(Boolean));
        setSavedQuestionIds(ids);
      }).catch(console.error);
    }
  }, [currentUser]);

  // Helper to normalize strings for comparison
  const normalizeText = normalizeBangla;

  const getStatsFor = (subjectKey: string, chapter?: string, topic?: string) => {
      if (!syllabusStats) return 0;
      
      const subjectNorm = normalizeText(subjectKey);
      const matchedSubjectKey = Object.keys(syllabusStats).find(k => normalizeText(k) === subjectNorm);
      if (!matchedSubjectKey || !syllabusStats[matchedSubjectKey]) return 0;
      
      const paperData = syllabusStats[matchedSubjectKey];
      if (!chapter) return paperData.total || 0;

      const chapterNorm = normalizeText(chapter);
      let totalCount = 0;
      
      // Sum up all chapters that normalize to the same text
      Object.keys(paperData.chapters || {}).forEach(k => {
          if (normalizeText(k) === chapterNorm) {
              const chapterData = paperData.chapters[k];
              if (!topic) {
                  totalCount += chapterData.total || 0;
              } else {
                  const topicNorm = normalizeText(topic);
                  Object.keys(chapterData.topics || {}).forEach(tk => {
                      if (normalizeText(tk) === topicNorm) {
                          totalCount += chapterData.topics[tk] || 0;
                      }
                  });
              }
          }
      });

      return totalCount;
  };

  const handleLevelSelect = (level: 'ACADEMIC' | 'ADMISSION') => {
    setSearchParams({ level });
  };

  const handleSubjectSelect = (subject: string) => {
    setSearchParams({ level: selectedLevel || '', subject });
  };

  const handleChapterSelect = (chapter: string) => {
    if (selectedChapter === chapter) {
        setSearchParams({ level: selectedLevel || '', subject: selectedSubject || '' });
    } else {
        setSearchParams({ level: selectedLevel || '', subject: selectedSubject || '', chapter });
    }
  };

  const handleInstitutionSelect = (instId: string) => {
    const inst = ADMISSION_INSTITUTIONS.find(i => i.id === instId);
    if (inst && inst.units && inst.units.length === 1) {
      setSearchParams({ level: 'ADMISSION', institution: instId, unit: inst.units[0].id });
    } else {
      setSearchParams({ level: 'ADMISSION', institution: instId });
    }
  };

  const handleUnitSelect = (unitId: string) => {
    setSearchParams({ level: 'ADMISSION', institution: selectedInstitution || '', unit: unitId });
  };

  const handleExamPaperSelect = (examRef: string) => {
    setSearchParams({ level: 'ADMISSION', institution: selectedInstitution || '', unit: selectedUnit || '', examRef });
  };

  const handleBack = () => {
    if (selectedExamRef) {
        setSearchParams({ level: 'ADMISSION', institution: selectedInstitution || '', unit: selectedUnit || '' });
    } else if (selectedUnit) {
        const inst = ADMISSION_INSTITUTIONS.find(i => i.id === selectedInstitution);
        if (inst && inst.units.length === 1) {
            setSearchParams({ level: 'ADMISSION' });
        } else {
            setSearchParams({ level: 'ADMISSION', institution: selectedInstitution || '' });
        }
    } else if (selectedInstitution) {
        setSearchParams({ level: 'ADMISSION' });
    } else if (selectedTopic) {
        setSearchParams({ level: selectedLevel || '', subject: selectedSubject || '', chapter: selectedChapter || '' });
    } else if (selectedChapter) {
        setSearchParams({ level: selectedLevel || '', subject: selectedSubject || '' });
    } else if (selectedSubject) {
        setSearchParams({ level: selectedLevel || '' });
    } else if (selectedLevel) {
        setSearchParams({});
    } else {
        navigate(-1);
    }
  };

  const handleStartRevision = () => {
    if (questions.length === 0) {
        showToast("কোনো প্রশ্ন পাওয়া যায়নি", "warning");
        return;
    }
    setIsRevisionMode(true);
    setShowAllAnswers(false);
    setUserSelections({});
  };

  const handleStartExam = () => {
    if (questions.length === 0) {
        showToast("কোনো প্রশ্ন পাওয়া যায়নি", "warning");
        return;
    }
    const examId = `qbank_exam_${Date.now()}`;
    
    // Stimulus-aware selection
    const grouped: Record<string, QuizQuestion[]> = {};
    const singles: QuizQuestion[] = [];
    const shuffledRaw = [...questions].sort(() => 0.5 - Math.random());
    
    shuffledRaw.forEach(q => {
        const key = q.contextText || q.contextImage || null;
        if (key) {
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(q);
        } else {
            singles.push(q);
        }
    });

    const selectedQs: QuizQuestion[] = [];
    const groups = Object.values(grouped).sort(() => 0.5 - Math.random());
    const singlesShuffled = singles.sort(() => 0.5 - Math.random());

    groups.forEach(group => {
        if (selectedQs.length + group.length <= 25) {
            selectedQs.push(...group);
        }
    });

    singlesShuffled.forEach(q => {
        if (selectedQs.length < 25) {
            selectedQs.push(q);
        }
    });

    // Fallback
    if (selectedQs.length < 25) {
        groups.forEach(group => {
            if (selectedQs.length < 25) {
                const needed = 25 - selectedQs.length;
                const alreadyIn = group.every(gq => selectedQs.some(sq => sq.question === gq.question));
                if (!alreadyIn) {
                    selectedQs.push(...group.slice(0, needed));
                }
            }
        });
    }

    const config = {
      title: `${selectedSubject} - ${selectedChapter || 'All Chapters'}`,
      questions: selectedQs, 
      timeLimit: 20,
      mode: 'ALL_AT_ONCE',
      type: 'QBANK_EXAM',
      isPracticeMode: false
    };
    localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
    navigate(`/exam/${examId}`);
  };

  const handleOptionClick = useCallback((qIdx: number, oIdx: number) => {
      setUserSelections(prev => ({ ...prev, [qIdx]: oIdx }));
  }, []);

  const toggleSaveQuestion = useCallback(async (question: QuizQuestion) => {
      if (!currentUser) { showToast("লগইন প্রয়োজন", "warning"); return; }
      const qId = question._id || question.id;
      if (!qId) return;

      setSavedQuestionIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(qId)) {
              newSet.delete(qId);
              unsaveQuestionAPI(currentUser.uid, qId).catch(console.error);
              showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
          } else {
              newSet.add(qId);
              saveQuestionAPI(currentUser.uid, qId).catch(console.error);
              showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
          }
          return newSet;
      });
  }, [currentUser, showToast]);

  const handleShare = useCallback((question: QuizQuestion) => {
      const url = `${window.location.origin}/#/question/${question.slug || question.id}`;
      if (navigator.share) {
          navigator.share({ title: question.question, url }).catch(console.error);
      } else {
          navigator.clipboard.writeText(url).then(() => showToast("লিংক কপি করা হয়েছে!", "success"));
      }
  }, [showToast]);

  const chapters = useMemo(() => {
    if (!selectedSubject || !SYLLABUS_DB[selectedSubject]) return [];
    return Object.keys(SYLLABUS_DB[selectedSubject]);
  }, [selectedSubject]);


  // --- VIEWS ---

  if (isRevisionMode) {
      return (
          <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4 sticky top-0 z-20 shadow-sm">
                  <div className="max-w-4xl mx-auto flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <button 
                              onClick={() => setIsRevisionMode(false)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
                          >
                              <ChevronLeft size={20} />
                          </button>
                          <div>
                              <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                                  {selectedSubject ? SUBJECT_DEFINITIONS[selectedSubject]?.display || selectedSubject : 'বিষয় নির্বাচন'}
                              </h1>
                              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                                  {questions.length} টি প্রশ্ন | রিভিশন মোড
                              </p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setShowAllAnswers(!showAllAnswers)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${showAllAnswers ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                          >
                              {showAllAnswers ? <EyeOff size={14}/> : <Eye size={14}/>} {showAllAnswers ? 'লুকান' : 'দেখুন'}
                          </button>
                      </div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-20">
                  <div className="max-w-3xl mx-auto flex flex-col">
                      {questions.map((q, idx) => {
                          const isRepeatStimulus = idx > 0 && q.contextText && q.contextText === questions[idx - 1].contextText && q.contextImage === questions[idx - 1].contextImage;
                          
                          let stimulusRange = null;
                          let isGroupStart = false;
                          let isGroupMiddle = false;
                          let isGroupEnd = false;

                          if (!isRepeatStimulus && (q.contextText || q.contextImage)) {
                              let endIndex = idx;
                              for (let i = idx + 1; i < questions.length; i++) {
                                  if (questions[i].contextText === q.contextText && questions[i].contextImage === q.contextImage) {
                                      endIndex = i;
                                  } else {
                                      break;
                                  }
                              }
                              if (endIndex > idx) {
                                  stimulusRange = { start: idx + 1, end: endIndex + 1 };
                                  isGroupStart = true;
                              }
                          } else if (isRepeatStimulus) {
                              const hasNextMatch = idx + 1 < questions.length && questions[idx + 1].contextText === q.contextText && questions[idx + 1].contextImage === q.contextImage;
                              if (hasNextMatch) {
                                  isGroupMiddle = true;
                              } else {
                                  isGroupEnd = true;
                              }
                          }

                          return (
                              <RevisionQuestionCard
                                  key={idx}
                                  idx={idx}
                                  q={q}
                                  userSelected={userSelections[idx]}
                                  showAllAnswers={showAllAnswers}
                                  isSaved={savedQuestionIds.has(q._id || q.id || '')}
                                  onOptionClick={handleOptionClick}
                                  onToggleSave={toggleSaveQuestion}
                                  showChapter={!selectedChapter}
                                  isGroupStart={isGroupStart}
                                  isGroupMiddle={isGroupMiddle}
                                  isGroupEnd={isGroupEnd}
                                  stimulusStart={stimulusRange?.start}
                                  stimulusEnd={stimulusRange?.end}
                              />
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      
      {/* Search/Header Pill */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(selectedLevel || selectedSubject) && (
                <button 
                    onClick={handleBack}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
            )}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {selectedExamRef ? selectedExamRef : selectedSubject ? (SUBJECT_DEFINITIONS[selectedSubject]?.display || selectedSubject) : (selectedLevel === 'ADMISSION' ? 'ভর্তি পরীক্ষা (Admission)' : selectedLevel === 'ACADEMIC' ? 'একাডেমিক (Academic)' : 'প্রশ্নব্যাংক')}
              </h1>
            </div>
          </div>
          {selectedSubject && (
              <div className="hidden md:flex gap-2">
                  <button onClick={handleStartRevision} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-200"><Eye size={16}/> রিভিশন</button>
                  <button onClick={handleStartExam} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-700"><Play size={16} fill="currentColor"/> পরীক্ষা</button>
              </div>
          )}
          {selectedExamRef && (
              <div className="hidden md:flex gap-2">
                  <button onClick={handleStartRevision} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-200"><Eye size={16}/> রিভিশন</button>
                  <button onClick={handleStartExam} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-700"><Play size={16} fill="currentColor"/> পরীক্ষা</button>
              </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto p-3 md:p-6 pb-40">
              
              {!selectedLevel ? (
                /* LEVEL 1: GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <button 
                    onClick={() => handleLevelSelect('ACADEMIC')}
                    className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-transparent hover:border-primary shadow-sm hover:shadow-xl transition-all group text-center"
                  >
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">একাডেমিক</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">বোর্ড ও কলেজ পরীক্ষার প্রশ্নাবলী</p>
                  </button>

                  <button 
                    onClick={() => handleLevelSelect('ADMISSION')}
                    className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-transparent hover:border-primary shadow-sm hover:shadow-xl transition-all group text-center"
                  >
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-primary rounded-3xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Stethoscope size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">এডমিশন</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">বিশ্ববিদ্যালয় ভর্তি পরীক্ষার প্রশ্নাবলী</p>
                  </button>
                </div>
              ) : (!selectedSubject && !selectedInstitution && !selectedExamRef) ? (
                /* LEVEL 2: ADMISSION - CHOOSING INSTITUTION OR SUBJECT */
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  {selectedLevel === 'ADMISSION' && (
                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-blue-500 rounded-full" />
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">প্রতিষ্ঠান ভিত্তিক</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {ADMISSION_INSTITUTIONS.map((inst, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleInstitutionSelect(inst.id)}
                            className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 shadow-sm hover:shadow-md transition-all group text-left"
                          >
                            <div className={`w-12 h-12 rounded-2xl ${inst.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                              <inst.icon size={24} />
                            </div>
                            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1">{inst.name}</h3>
                            <p className="text-[10px] md:text-xs text-gray-500">বিভিন্ন ইউনিটের প্রশ্ন</p>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-orange-500 rounded-full" />
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">বিষয় ভিত্তিক</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {Object.entries(SUBJECT_DEFINITIONS).map(([key, subject], idx) => {
                          const count = getStatsFor(key);
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSubjectSelect(key)}
                              className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-primary shadow-sm hover:shadow-md transition-all group text-left"
                            >
                              <div className={`w-12 h-12 rounded-2xl ${subject.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                                <subject.icon size={24} />
                              </div>
                              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1">{subject.display}</h3>
                              {count > 0 && <p className="text-[10px] md:text-xs font-bold text-primary">{count.toLocaleString()} টি প্রশ্ন</p>}
                            </button>
                          );
                      })}
                    </div>
                  </section>
                </div>
              ) : selectedInstitution && !selectedUnit && !selectedExamRef ? (
                /* LEVEL 2.1: INSTITUTION UNITS */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">ইউনিক নির্বাচন করুন</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ADMISSION_INSTITUTIONS.find(i => i.id === selectedInstitution)?.units.map((unit, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUnitSelect(unit.id)}
                        className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-blue-500 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                            {unit.id}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{unit.name}</h3>
                            <p className="text-xs text-gray-500">ভর্তি পরীক্ষার প্রশ্নপত্রসমূহ</p>
                          </div>
                        </div>
                        <Play size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedInstitution && selectedUnit && !selectedExamRef ? (
                /* LEVEL 2.2: EXAM PAPERS */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">প্রশ্নপত্র নির্বাচন করুন</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ADMISSION_INSTITUTIONS.find(i => i.id === selectedInstitution)?.units.find(u => u.id === selectedUnit)?.exams.map((exam, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExamPaperSelect(exam.examRef)}
                        className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-blue-500 shadow-sm hover:shadow-md transition-all group text-left"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Archive className="text-blue-500" size={24} />
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase tracking-widest">Question Bank</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{exam.name}</h3>
                        <p className="text-xs text-gray-500 italic">ভর্তি পরীক্ষার পূর্ণাঙ্গ প্রশ্নপত্র</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* LEVEL 3: QUESTION BROWSER */
                <div className="space-y-6">
                  {/* SLIDER 1: CHAPTERS - Only show for subject-based */}
                  {selectedSubject && (
                    <div>
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">অধ্যায়সমূহ</h3>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                          <button 
                              onClick={() => handleChapterSelect('')}
                              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!selectedChapter ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200'}`}
                          >
                              সব অধ্যায়
                          </button>
                          {chapters.map((chapter, idx) => {
                              const count = getStatsFor(selectedSubject, chapter);
                              const isSelected = selectedChapter && normalizeBangla(selectedChapter) === normalizeBangla(chapter);
                              return (
                                  <button 
                                      key={idx}
                                      onClick={() => handleChapterSelect(chapter)}
                                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${isSelected ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 hover:border-primary/50'}`}
                                  >
                                      {chapter} 
                                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${selectedChapter === chapter ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                          {count}
                                      </span>
                                  </button>
                              );
                          })}
                      </div>
                    </div>
                  )}

                  {/* TOPICS REMOVED AS PER REQUEST */}

                  {/* QUESTIONS LIST */}
                  <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                          <h2 className="text-base md:text-xl font-black text-gray-900 dark:text-white">
                              {selectedChapter || 'সব প্রশ্ন'} ({questions.length})
                          </h2>
                          <div className="flex md:hidden gap-2">
                              <button onClick={handleStartRevision} className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600"><Eye size={20}/></button>
                              <button onClick={handleStartExam} className="p-2.5 bg-primary text-white rounded-xl"><Play size={20} fill="currentColor"/></button>
                          </div>
                      </div>

                      {loading && questions.length === 0 ? (
                          <div className="space-y-6">
                              {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse"></div>)}
                          </div>
                      ) : questions.length > 0 ? (
                          <>
                            <div className="space-y-6">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                                        {/* Background Accent */}
                                        <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />

                                        <div className="absolute top-6 right-6 flex gap-2 z-10">
                                            <button onClick={() => toggleSaveQuestion(q)} className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 shadow-sm transition-all active:scale-90">
                                                <Bookmark size={18} className={savedQuestionIds.has(q._id || q.id || '') ? 'fill-primary text-primary' : 'text-gray-400'}/>
                                            </button>
                                        </div>

                                        <div className="flex gap-4 mb-3 relative z-10">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-2xl font-black text-gray-100 dark:text-gray-700 font-mono leading-none">{String(idx+1).padStart(2,'0')}</span>
                                                <div className="w-1 h-full bg-gray-100 dark:bg-gray-700 rounded-full min-h-[20px]" />
                                            </div>
                                            <div className="flex-1">
                                                {/* Stimulus Part (integrated) */}
                                                {(q.contextText || q.contextImage) && (
                                                    <div className="mb-4 p-4 bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border border-sky-100/50 dark:border-sky-800/30">
                                                        <p className="text-[9px] font-black text-sky-600/50 dark:text-sky-400/50 uppercase tracking-widest mb-2">উদ্দীপক</p>
                                                        {q.contextText && (
                                                            <div className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: q.contextText }} />
                                                        )}
                                                        {q.contextImage && (
                                                            <div className="rounded-xl overflow-hidden border border-white dark:border-gray-800 bg-white dark:bg-black/20 p-1 shadow-sm">
                                                                <img src={q.contextImage} alt="Context" className="max-w-full h-auto max-h-[300px] mx-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">{q.question}</h3>
                                                {q.questionImage && (
                                                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-2 border border-gray-100 dark:border-gray-800 shadow-inner">
                                                        <img src={q.questionImage} alt="Question" className="max-w-full h-auto max-h-[300px] mx-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 relative z-10">
                                            <div className="flex flex-wrap gap-2 mr-4">
                                                {q.examRef && (
                                                    <span className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-[9px] font-black uppercase tracking-tight border border-orange-500/20">
                                                        {q.examRef}
                                                    </span>
                                                )}
                                                {!selectedChapter && q.chapter && (
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black border border-blue-500/20">
                                                        {q.chapter}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setUserSelections(prev => ({ ...prev, [idx]: 99 })); // Dummy selection to show answer
                                                    }}
                                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
                                                >
                                                    উত্তর দেখুন
                                                </button>
                                                
                                                <button onClick={() => handleShare(q)} className="p-2.5 text-gray-400 hover:text-primary transition-colors">
                                                    <Share2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {userSelections[idx] !== undefined && (
                                            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900 rounded-[2rem] border border-green-100 dark:border-green-900/50 animate-in slide-in-from-top-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Correct Answer</p>
                                                </div>
                                                <p className="text-base font-bold text-gray-900 dark:text-white mb-4 pl-4">{q.options[q.correctAnswerIndex]}</p>
                                                
                                                {q.explanation && (
                                                    <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Explanation</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                                                            {q.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {hasMore && (
                                <button 
                                    onClick={() => setPage(page + 1)}
                                    className="w-full py-8 text-sm font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
                                >
                                    Load More Questions
                                </button>
                            )}
                          </>
                      ) : (
                          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                              <Archive size={48} className="mx-auto text-gray-200 mb-6" />
                              <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">অবাক করা বিষয়!</h3>
                              <p className="text-gray-400 text-sm">এই বিভাগে কোনো প্রশ্ন পাওয়া যায়নি।</p>
                          </div>
                      )}
                  </div>
                </div>
              )}

          </div>
      </div>

      {/* MOBILE FLOATING CTA */}
      {(selectedSubject || selectedExamRef) && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 md:hidden animate-in fade-in slide-in-from-bottom-8">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-2 rounded-2xl border border-white dark:border-gray-700 shadow-2xl flex gap-2">
                  <button onClick={handleStartRevision} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Eye size={16}/> রিভিশন</button>
                  <button onClick={handleStartExam} className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> পরীক্ষা</button>
              </div>
          </div>
      )}

    </div>
  );
};

export default QuestionBank;