"use client";

import { useState, useEffect } from 'react';
import { languageManager, languages } from '../lib/language-support';

export default function LanguageSelector({ onLanguageChange }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLanguage(languageManager.getCurrentLanguage());
  }, []);

  const handleLanguageChange = (languageCode) => {
    if (languageManager.setLanguage(languageCode)) {
      setCurrentLanguage(languageCode);
      setIsOpen(false);
      if (onLanguageChange) {
        onLanguageChange(languageCode);
      }
    }
  };

  const currentLang = languages[currentLanguage];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLanguage === code ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLanguage === code && (
                  <svg className="w-4 h-4 ml-auto text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



