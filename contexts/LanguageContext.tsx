
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hardcode language to 'bn' (Bengali)
  const [language] = useState<Language>('bn');

  // Dummy setLanguage function that does nothing, effectively disabling switching
  const setLanguage = (lang: Language) => {
    console.log("Language fixed to Bengali");
  };

  useEffect(() => {
    // Ensure local storage is synced to 'bn' if needed by other parts, though strictly not necessary now
    localStorage.setItem('app_language', 'bn');
  }, []);

  const t = (key: keyof typeof translations['en']) => {
    // Always fetch from 'bn' keys
    return translations['bn'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
