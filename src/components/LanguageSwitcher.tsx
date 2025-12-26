import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700
        hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
      title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
    >
      <span className="text-lg">{language === 'de' ? '🇩🇪' : '🇬🇧'}</span>
      <span className="hidden sm:inline">{language === 'de' ? 'DE' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;
