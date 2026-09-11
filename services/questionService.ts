/**
 * questionService.ts
 * ---------------------------------------------------------------------------
 * Central service for fetching single question by slug / id.
 * Tries multiple backend endpoints to be resilient.
 */

import { API_BASE } from "./api";
import { QuizQuestion } from "../types";

export type FetchQuestionResult = {
  question: QuizQuestion | null;
  source: string;
};

const tryFetchJson = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
};

/**
 * Fetch a single question by slug or _id.
 * Backend may expose different routes depending on deployment version.
 * We try in order:
 *  - /question-bank/question/:identifier
 *  - /questions/:identifier
 *  - /questions/slug/:identifier
 *  - /admin/questions?search=:identifier (fallback via search)
 */
export const fetchQuestionBySlugOrId = async (
  identifier: string
): Promise<QuizQuestion | null> => {
  const id = identifier.trim();
  if (!id) return null;

  // 1. Direct public endpoints
  const endpoints = [
    `${API_BASE}/question-bank/question/${encodeURIComponent(id)}`,
    `${API_BASE}/questions/${encodeURIComponent(id)}`,
    `${API_BASE}/questions/slug/${encodeURIComponent(id)}`,
    `${API_BASE}/question/${encodeURIComponent(id)}`,
  ];

  for (const url of endpoints) {
    const data = await tryFetchJson(url);
    if (data) {
      // API may return { question } or direct question object
      if (data.question) return data.question as QuizQuestion;
      if (data._id || data.id || data.question) return data as QuizQuestion;
    }
  }

  // 2. Fallback: search via admin/questions endpoint
  try {
    const searchUrl = `${API_BASE}/admin/questions?page=1&limit=5&search=${encodeURIComponent(
      id
    )}`;
    const res = await tryFetchJson(searchUrl);
    if (res?.questions?.length) {
      // Prefer exact slug match
      const exact = res.questions.find(
        (q: any) => q.slug === id || q._id === id || q.id === id
      );
      if (exact) return exact;
      // If search returns something, return first (closest match)
      return res.questions[0];
    }
  } catch {}

  return null;
};

/**
 * Fetch related questions for SEO internal linking.
 * Same subject + chapter, limited.
 */
export const fetchRelatedQuestions = async (
  question: QuizQuestion,
  limit = 6
): Promise<QuizQuestion[]> => {
  try {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(limit));
    if (question.subject) params.set("subject", question.subject);
    if (question.chapter) params.set("chapter", question.chapter);
    // Avoid fetching itself by client filtering

    const url = `${API_BASE}/admin/questions?${params.toString()}`;
    const data = await tryFetchJson(url);
    if (data?.questions?.length) {
      return (data.questions as QuizQuestion[])
        .filter((q) => (q._id || q.id) !== (question._id || question.id))
        .slice(0, limit);
    }
  } catch {}
  return [];
};

/**
 * Strip HTML tags for meta description / JSON-LD
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Truncate text to max length for meta tags
 */
export const truncateForMeta = (text: string, max = 160): string => {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 3).trim() + "...";
};

/**
 * Build canonical URL for a question
 */
export const getQuestionCanonicalUrl = (q: QuizQuestion): string => {
  const slug = q.slug || q._id || q.id || "";
  return `https://www.porikkhangon.app/questions/${encodeURIComponent(slug)}/`;
};

/**
 * Build QAPage JSON-LD structured data
 * This is what makes Google show question rich results like SattAcademy / Chorcha
 */
export const buildQuestionJsonLd = (q: QuizQuestion) => {
  const canonical = getQuestionCanonicalUrl(q);
  const questionText = stripHtml(q.question);
  const answerText = q.options?.[q.correctAnswerIndex] || "";
  const explanationText = stripHtml(q.explanation || "");

  // QAPage is the recommended type for Q&A pages (Google Search Gallery)
  // See: https://developers.google.com/search/docs/appearance/structured-data/qapage
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "পরীক্ষাঙ্গন",
            "item": "https://www.porikkhangon.app/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "প্রশ্নব্যাংক",
            "item": "https://www.porikkhangon.app/questions/",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": q.subject || "প্রশ্ন",
            "item": q.subject
              ? `https://www.porikkhangon.app/questions/subject/${encodeURIComponent(
                  q.subject
                )}/`
              : "https://www.porikkhangon.app/questions/",
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": questionText.slice(0, 60),
            "item": canonical,
          },
        ],
      },
      {
        "@type": "QAPage",
        "@id": `${canonical}#qapage`,
        "mainEntity": {
          "@type": "Question",
          "@id": `${canonical}#question`,
          "name": questionText,
          "text": questionText,
          "answerCount": 1,
          "upvoteCount": 0,
          "datePublished": "2024-01-01",
          "author": {
            "@type": "Organization",
            "name": "Porikkhangon",
          },
          "acceptedAnswer": {
            "@type": "Answer",
            "@id": `${canonical}#answer`,
            "text": `${stripHtml(answerText)}${explanationText ? ` — ${explanationText}` : ""}`,
            "upvoteCount": 0,
            "url": canonical,
            "author": {
              "@type": "Organization",
              "name": "Porikkhangon",
            },
          },
        },
      },
      {
        "@type": "LearningResource",
        "name": questionText,
        "description": explanationText || questionText,
        "educationalLevel": "Higher Secondary / Admission",
        "learningResourceType": "MCQ Question",
        "about": q.subject ? [q.subject, q.chapter].filter(Boolean) : [],
        "inLanguage": "bn-BD",
        "isAccessibleForFree": true,
        "url": canonical,
        "provider": {
          "@type": "Organization",
          "name": "Porikkhangon",
          "sameAs": "https://www.porikkhangon.app/",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": questionText,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${stripHtml(answerText)}। ${explanationText}`,
            },
          },
        ],
      },
    ],
  };
};
