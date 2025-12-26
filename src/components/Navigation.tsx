import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName?: string;
  hasDemoAccess?: boolean;
  demoEnabled?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onLogout,
  userName,
  hasDemoAccess = false,
  demoEnabled = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { id: 'scanner', labelKey: 'nav.scanner', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', primary: true },
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'systems', labelKey: 'nav.systems', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const isActive = (id: string) => currentView === id;

  // Design system navigation button styles
  const getNavButtonClass = (item: typeof navItems[0]) => {
    if (item.primary) {
      // Primary action (Scanner) - prominent but calm
      return isActive(item.id)
        ? 'bg-audit-deep text-white shadow-audit'
        : 'bg-audit-steel text-white hover:bg-audit-deep hover:shadow-audit';
    }
    // Regular nav items
    return isActive(item.id)
      ? 'bg-audit-bg text-audit-deep font-medium'
      : 'text-audit-cool hover:bg-audit-bg hover:text-audit-deep';
  };

  return (
    <nav className="bg-white shadow-audit border-b border-audit-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                src="/images/logo.svg"
                alt="EU AI Act Audit Platform"
                className="h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-audit transition-all duration-200 ${getNavButtonClass(item)}`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Language Switcher, Demo Button & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Audit Tools (Demo) Button */}
            {demoEnabled && (
              <button
                onClick={() => onNavigate(hasDemoAccess ? 'audit-tools' : 'demo-access')}
                className={`hidden md:inline-flex items-center px-4 py-2 text-sm font-medium rounded-audit transition-all duration-200 ${
                  isActive('audit-tools') || isActive('demo-access')
                    ? 'bg-audit-deep text-white shadow-audit'
                    : 'bg-audit-steel text-white hover:bg-audit-deep'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Audit Tools
                {!hasDemoAccess && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-audit-bg text-audit-steel rounded-full border border-audit-light">
                    Demo
                  </span>
                )}
              </button>
            )}

            {/* User Info */}
            {userName && (
              <div className="hidden md:flex items-center text-sm text-audit-cool">
                <svg
                  className="w-5 h-5 mr-2 text-audit-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {userName}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-audit-cool hover:text-audit-deep hover:bg-audit-bg rounded-audit transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t('nav.logout')}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-audit text-audit-cool hover:text-audit-deep hover:bg-audit-bg"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-audit-light">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 text-base font-medium rounded-audit transition-colors ${
                  item.primary
                    ? isActive(item.id)
                      ? 'bg-audit-deep text-white'
                      : 'bg-audit-steel text-white'
                    : isActive(item.id)
                      ? 'bg-audit-bg text-audit-deep'
                      : 'text-audit-cool hover:bg-audit-bg hover:text-audit-deep'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {t(item.labelKey)}
              </button>
            ))}

            {demoEnabled && (
              <button
                onClick={() => {
                  onNavigate(hasDemoAccess ? 'audit-tools' : 'demo-access');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2.5 text-base font-medium rounded-audit bg-audit-steel text-white"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Audit Tools {!hasDemoAccess && '(Demo)'}
              </button>
            )}

            <div className="border-t border-audit-light pt-2 mt-2">
              {/* Mobile Language Switcher */}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              {userName && (
                <div className="px-3 py-2 text-sm text-audit-cool">
                  {userName}
                </div>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2.5 text-base font-medium text-audit-steel hover:bg-audit-bg rounded-audit"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
