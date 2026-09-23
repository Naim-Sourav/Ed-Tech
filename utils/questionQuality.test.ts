import { describe, it, expect } from 'vitest';
import {
  cleanExplanation,
  cleanTags,
  collectFieldIssues,
  comparisonKey,
  dedupeSentences,
  findDuplicateGroups,
  fixQuestion,
  mergeDuplicateQuestions,
  normalizeQuestionText,
  areDuplicateQuestions,
  splitOnExplanationLabels,
  questionFingerprint,
} from './questionQuality';

/** Same canonical form the module promises: NFC + precomposed য়/ড়/ঢ়. */
const canon = (text: string): string =>
  text
    .normalize('NFC')
    .replace(/\u09AF\u09BC/g, '\u09DF')
    .replace(/\u09A1\u09BC/g, '\u09DC')
    .replace(/\u09A2\u09BC/g, '\u09DD');

describe('normalizeQuestionText', () => {
  it('unifies the Bengali letter variants used inconsistently in the bank', () => {
    // য + ় (NFC) vs precomposed য়
    expect(normalizeQuestionText('বাংলা')).toBe('বাংলা');
    expect(normalizeQuestionText('প্র\u09AF\u09BCোজন')).toBe(normalizeQuestionText('প্রয়োজন'));
    expect(normalizeQuestionText('ব\u09A1\u09BC')).toBe('বড়');
  });

  it('removes zero-width characters and doubles spaces', () => {
    expect(normalizeQuestionText('প্রশ্ন\u200b?  উত্তর')).toBe('প্রশ্ন? উত্তর');
  });
});

describe('cleanExplanation — the reported "Explanation" bug', () => {
  it('keeps one explanation when the same text is written on both sides of the label', () => {
    const raw =
      'মিনিটের কাঁটার পর্যায়কাল ৬০ মিনিট, তাই কৌণিক বেগ ১.৭৪×১০⁻³ rad/s। Explanation: মিনিটের কাঁটার পর্যায়কাল ৬০ মিনিট, তাই কৌণিক বেগ ১.৭৪×১০⁻³ rad/s।';
    const result = cleanExplanation(raw);
    expect(result.text).not.toMatch(/explanation/i);
    expect(result.text).toBe(canon('মিনিটের কাঁটার পর্যায়কাল ৬০ মিনিট, তাই কৌণিক বেগ ১.৭৪×১০⁻³ rad/s।'));
    expect(result.issues.map((i) => i.code)).toContain('explanation-marker');
  });

  it('keeps the richer of two near-identical explanations', () => {
    const raw =
      'আর্সেনিকের গ্রহণযোগ্য মাত্রা ০.০৫ মিগ্রা/লিটার। Explanation: WHO এর মতে আর্সেনিকের গ্রহণযোগ্য মাত্রা ০.০৫ মিগ্রা/লিটার।';
    const result = cleanExplanation(raw);
    expect(result.text).not.toMatch(/explanation/i);
    expect(result.text).toBe(canon('WHO এর মতে আর্সেনিকের গ্রহণযোগ্য মাত্রা ০.০৫ মিগ্রা/লিটার।'));
  });

  it('merges two different explanations separated by the label', () => {
    const raw = 'প্রথমে ভোল্টেজের কার্যকর মান বের করতে হবে। Explanation: তারপর তুল্য রোধ ৫ ওহম ধরে প্রবাহ নির্ণয় করি।';
    const result = cleanExplanation(raw);
    expect(result.text).toBe(canon('প্রথমে ভোল্টেজের কার্যকর মান বের করতে হবে। তারপর তুল্য রোধ ৫ ওহম ধরে প্রবাহ নির্ণয় করি।'));
  });

  it('handles the Bangla label, markdown wrapping and multiple labels', () => {
    const raw = '**ব্যাখ্যা:** ক্লোরোফিল ছাড়া সালোকসংশ্লেষণ হয় না। ব্যাখ্যা - ক্লোরোফিল আলো শোষণ করে।';
    const result = cleanExplanation(raw);
    expect(result.text).not.toMatch(/ব্যাখ্যা/);
    expect(result.text).toContain(canon('ক্লোরোফিল আলো শোষণ করে'));
  });

  it('strips a leading "Ans:" label and the answer letter stub that follows it', () => {
    const result = cleanExplanation('Ans: গ। নাইট্রোজেন ও অক্সিজেনের বিক্রিয়া তাপহারী।');
    expect(result.text).toBe(canon('নাইট্রোজেন ও অক্সিজেনের বিক্রিয়া তাপহারী।'));
  });

  it('does not damage a legitimate sentence that merely contains the word "answer"', () => {
    const raw = 'সঠিক answer পাওয়া যায় সমীকরণ থেকে।';
    expect(cleanExplanation(raw).text).toBe(canon(raw));
  });

  it('collapses an explanation that is simply written twice', () => {
    const once = 'রেডিয়ামের গড় জীবন অর্ধজীবনের ১.৪৪ গুণ।';
    const result = cleanExplanation(`${once} ${once}`);
    expect(result.text).toBe(canon(once));
    expect(result.text.length).toBeLessThan(once.length * 2);
    expect(result.issues.map((i) => i.code)).toContain('explanation-doubled');
  });

  it('removes repeated sentences inside one explanation', () => {
    expect(dedupeSentences('কোষই জীবনের একক। কোষই জীবনের একক। এতে প্রোটিন থাকে।')).toBe(
      canon('কোষই জীবনের একক। এতে প্রোটিন থাকে।'),
    );
  });

  it('flags an explanation that only repeats the question', () => {
    const result = cleanExplanation('বাংলাদেশে পানীয় জলে আর্সেনিকের গ্রহণযোগ্য মাত্রা কত?', {
      question: 'বাংলাদেশে পানীয় জলে আর্সেনিকের গ্রহণযোগ্য মাত্রা কত?',
    });
    expect(result.issues.map((i) => i.code)).toContain('explanation-only-question');
  });

  it('decodes entities, literal \\n and trims whitespace', () => {
    const result = cleanExplanation('&nbsp;প্রথম লাইন\\n\\n  দ্বিতীয় লাইন&nbsp;');
    expect(result.text).toBe(canon('প্রথম লাইন\n\nদ্বিতীয় লাইন'));
  });

  it('never returns an empty string for a non-empty label-only value', () => {
    const result = cleanExplanation('Explanation:');
    expect(result.text).toBe('');
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('splitOnExplanationLabels', () => {
  it('keeps plain explanations in one piece', () => {
    const { chunks, found } = splitOnExplanationLabels('এটি একটি সাধারণ ব্যাখ্যা।');
    expect(found).toBe(false);
    expect(chunks).toEqual(['এটি একটি সাধারণ ব্যাখ্যা।']);
  });

  it('splits the labelled text into chunks', () => {
    const { chunks, found } = splitOnExplanationLabels('প্রথম অংশ। Explanation: দ্বিতীয় অংশ।');
    expect(found).toBe(true);
    expect(chunks).toHaveLength(2);
  });
});

describe('duplicate detection', () => {
  const base = {
    _id: 'a',
    question: 'নিচের কোনটি তাপহারী বিক্রিয়া?',
    options: ['C+O2 = CO2', 'N2+O2 = 2NO', 'CH4+2O2 = CO2+2H2O', '2H2+O2 = H2O'],
    correctAnswerIndex: 1,
    explanation: 'NO উৎপন্ন হওয়া তাপহারী বিক্রিয়া।',
    subject: 'Chemistry 1st Paper',
    chapter: 'রাসায়নিক পরিবর্তন',
  };

  it('treats shuffled options with different spacing as the same question', () => {
    const copy = {
      ...base,
      _id: 'b',
      options: [' 2H2+O2 = H2O', 'CH4+2O2 = CO2+2H2O', 'N2+O2 = 2NO', 'C+O2 = CO2'],
      question: 'নিচের কোনটি তাপহারী (endothermic) বিক্রিয়া?',
    };
    expect(questionFingerprint(base)).not.toBe(questionFingerprint(copy));
    expect(areDuplicateQuestions(base, copy)).toBe(true);

    const groups = findDuplicateGroups([base, copy]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it('keeps genuinely different questions apart', () => {
    const other = { ...base, _id: 'c', question: 'নিচের কোনটি তাপোৎপাদী বিক্রিয়া?', options: ['A', 'B', 'C', 'D'] };
    expect(findDuplicateGroups([base, other])).toHaveLength(0);
  });

  it('does not merge across subjects/chapters', () => {
    const other = { ...base, _id: 'd', subject: 'Physics 1st Paper', chapter: 'পর্যাবৃত্ত গতি' };
    expect(findDuplicateGroups([base, other])).toHaveLength(0);
  });
});

describe('mergeDuplicateQuestions', () => {
  const group = [
    {
      _id: 'rich',
      question: 'কোষ প্রাচীর কত স্তর নিয়ে গঠিত?',
      options: ['১', '২', '৩', '৪'],
      correctAnswerIndex: 2,
      explanation: '',
      tags: ['DB 2019'],
      subject: 'Biology 1st Paper',
      chapter: 'কোষ ও এর গঠন',
      year: 2019,
    },
    {
      _id: 'other',
      question: 'কোষ প্রাচীর কত স্তর নিয়ে গঠিত?',
      options: ['১', '২', '৩', '৪'],
      correctAnswerIndex: 2,
      explanation: 'কোষ প্রাচীর মূলত সেলুলোজ নির্মিত তিন স্তরের।',
      tags: ['আজিবুর স্যার'],
      examRef: 'Biology 1st Paper কোষ ও এর গঠন, DB 2022',
      explanationImage: 'https://cdn/exp.png',
      slug: 'কোষ-প্রাচীর',
      subject: 'Biology 1st Paper',
      chapter: 'কোষ ও এর গঠন',
    },
  ];

  it('keeps one copy and unions tags / exam refs / explanation / images', () => {
    const result = mergeDuplicateQuestions(group);
    expect(result.keepId).toBe('other'); // richer because it has the explanation + image
    expect(result.deleteIds).toEqual(['rich']);
    expect(result.merged.explanation).toBe(canon('কোষ প্রাচীর মূলত সেলুলোজ নির্মিত তিন স্তরের।'));
    expect(result.merged.tags?.sort()).toEqual([canon('DB 2019'), canon('আজিবুর স্যার')].sort());
    expect(result.merged.examRef).toContain('DB 2022');
    expect(result.merged.explanationImage).toBe('https://cdn/exp.png');
    expect(result.merged.slug).toBe('কোষ-প্রাচীর');
    expect(result.merged.correctAnswerIndex).toBe(2);
    expect(result.merged.year).toBe(2019);
  });

  it('follows the majority when one copy has a wrong answer index', () => {
    const result = mergeDuplicateQuestions([
      { ...group[0], _id: 'x1', correctAnswerIndex: 2 },
      { ...group[0], _id: 'x2', correctAnswerIndex: 2 },
      { ...group[0], _id: 'x3', correctAnswerIndex: 0 },
    ]);
    expect(result.merged.correctAnswerIndex).toBe(2);
  });
});

describe('field issues & fixes', () => {
  it('reports structural problems', () => {
    const codes = collectFieldIssues({
      question: '',
      options: ['ক', 'ক', ''],
      correctAnswerIndex: 7,
    } as never).map((i) => i.code);
    expect(codes).toContain('question-empty');
    expect(codes).toContain('options-count');
    expect(codes).toContain('option-empty');
    expect(codes).toContain('option-duplicate');
    expect(codes).toContain('answer-out-of-range');
  });

  it('detects mojibake and unbalanced LaTeX', () => {
    const codes = collectFieldIssues({
      question: 'পানির সংকেত $H_2O',
      options: ['ক', 'খ', 'গ', 'ঘ'],
      correctAnswerIndex: 0,
      explanation: 'à¦ªà¦¾à¦¨à¦¿',
    } as never).map((i) => i.code);
    expect(codes).toContain('mojibake');
    expect(codes).toContain('latex-unbalanced');
  });

  it('fixQuestion returns a minimal patch and a cleaned document', () => {
    const { patch, question, issues } = fixQuestion({
      _id: 'z',
      question: 'প্রশ্ন\u200b  টি?',
      options: ['ক ', 'খ', 'গ', 'ঘ'],
      correctAnswerIndex: 4,
      explanation: 'ঠিক উত্তর খ। Explanation: ঠিক উত্তর খ।',
      tags: ['', 'দাঁড়িকমা', 'DB 2019', 'db 2019'],
      subject: ' Physics 1st Paper ',
      chapter: 'চল তড়িৎ',
    });
    expect(patch.question).toBe('প্রশ্ন টি?');
    expect(patch.options?.[0]).toBe('ক');
    expect(patch.explanation).toBe(canon('ঠিক উত্তর খ।'));
    expect(patch.tags).toEqual([canon('DB 2019')]);
    expect(patch.subject).toBe('Physics 1st Paper');
    expect(patch.correctAnswerIndex).toBe(3);
    expect(question.explanation).toBe(canon('ঠিক উত্তর খ।'));
    expect(issues.map((i) => i.code)).not.toContain('question-empty');
  });

  it('cleanTags drops junk and case-insensitive duplicates', () => {
    expect(cleanTags(['[TAG_MARKER: DB 2019]', 'db 2019', 'দাঁড়িকমা', ' ', 'RB 2021'])).toEqual([
      canon('DB 2019'),
      canon('RB 2021'),
    ]);
  });

  it('comparisonKey ignores punctuation and spacing', () => {
    expect(comparisonKey('প্রশ্ন:  টি?')).toBe(comparisonKey('প্রশ্ন টি'));
  });
});
