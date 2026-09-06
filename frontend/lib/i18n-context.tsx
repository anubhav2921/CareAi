"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import hinglish from '../locales/hinglish.json';

const translations: Record<string, Record<string, Record<string, string>>> = { en, hi, hinglish };

export type Language = 'en' | 'hi' | 'hinglish';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('careai_lang');
  if (saved === 'en' || saved === 'hi' || saved === 'hinglish') return saved;
  return 'en';
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('careai_lang', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: Record<string, Record<string, string>> | Record<string, string> | string | undefined = translations[language];
    for (const k of keys) {
      if (current == null || typeof current !== 'object') return key;
      current = (current as Record<string, Record<string, string>>)[k] as unknown as Record<string, string>;
    }
    return typeof current === 'string' ? current : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
