import React, { createContext, useContext, useState, useEffect } from 'react';

type QuestionFont = 'font-sans' | 'font-tiro' | 'font-noto';
type QuestionFontSize = 'text-sm' | 'text-base' | 'text-lg' | 'text-xl';

interface PreferencesContextType {
  questionFont: QuestionFont;
  setQuestionFont: (font: QuestionFont) => void;
  questionFontSize: QuestionFontSize;
  setQuestionFontSize: (size: QuestionFontSize) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questionFont, setQuestionFontState] = useState<QuestionFont>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('questionFont') as QuestionFont) || 'font-noto';
    }
    return 'font-noto';
  });

  const [questionFontSize, setQuestionFontSizeState] = useState<QuestionFontSize>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('questionFontSize') as QuestionFontSize) || 'text-base';
    }
    return 'text-base';
  });

  const setQuestionFont = (font: QuestionFont) => {
    setQuestionFontState(font);
    localStorage.setItem('questionFont', font);
  };

  const setQuestionFontSize = (size: QuestionFontSize) => {
    setQuestionFontSizeState(size);
    localStorage.setItem('questionFontSize', size);
  };

  return (
    <PreferencesContext.Provider value={{ questionFont, setQuestionFont, questionFontSize, setQuestionFontSize }}>
      {children}
    </PreferencesContext.Provider>
  );
};
