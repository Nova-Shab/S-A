import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-1 bg-audit-bg rounded-audit">
      <button
        onClick={() => setLanguage('de')}
        className={`px-2.5 py-1.5 text-sm font-medium rounded transition-colors ${
          language === 'de'
            ? 'bg-white text-audit-deep shadow-sm'
            : 'text-audit-cool hover:text-audit-deep'
        }`}
        title="Deutsch"
      >
        DE
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1.5 text-sm font-medium rounded transition-colors ${
          language === 'en'
            ? 'bg-white text-audit-deep shadow-sm'
            : 'text-audit-cool hover:text-audit-deep'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
