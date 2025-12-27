import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import authService, { User } from '../services/authService';

interface ProfilePageProps {
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'settings'>('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    organization: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    auditReminders: true,
    securityAlerts: true,
  });
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfileForm({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          organization: currentUser.organization || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const result = await authService.updateProfile(profileForm);
      setUser(result.user);
      setProfileMessage({ type: 'success', text: t('profile.profileUpdated') });
    } catch (error) {
      setProfileMessage({ type: 'error', text: t('profile.updateFailed') });
    } finally {
      setProfileSaving(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push(t('profile.passwordMinLength'));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('profile.passwordUppercase'));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('profile.passwordLowercase'));
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t('profile.passwordNumber'));
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push(t('profile.passwordSpecial'));
    }
    return errors;
  };

  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: t('profile.passwordWeak'), color: 'bg-red-500' };
    if (strength <= 4) return { level: 2, label: t('profile.passwordMedium'), color: 'bg-yellow-500' };
    return { level: 3, label: t('profile.passwordStrong'), color: 'bg-green-500' };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('profile.passwordsMismatch') });
      setPasswordSaving(false);
      return;
    }

    // Validate password strength
    const errors = validatePassword(passwordForm.newPassword);
    if (errors.length > 0) {
      setPasswordMessage({ type: 'error', text: errors[0] });
      setPasswordSaving(false);
      return;
    }

    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage({ type: 'success', text: t('profile.passwordChanged') });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: t('profile.passwordChangeFailed') });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSettingsSave = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    setSettingsMessage({ type: 'success', text: t('profile.settingsSaved') });
    setTimeout(() => setSettingsMessage(null), 3000);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-audit-deep text-white';
      case 'auditor': return 'bg-audit-steel text-white';
      default: return 'bg-audit-bg text-audit-steel';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, { de: string; en: string }> = {
      admin: { de: 'Administrator', en: 'Administrator' },
      auditor: { de: 'Auditor', en: 'Auditor' },
      viewer: { de: 'Betrachter', en: 'Viewer' },
    };
    return labels[role]?.[language] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-audit-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-audit-steel border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-audit-cool">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-audit-bg">
      {/* Page Header */}
      <div className="audit-page-header">
        <div className="audit-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="audit-btn-ghost"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('common.back')}
                </button>
              )}
              <div>
                <h1 className="text-h1 text-audit-deep mb-1">{t('profile.title')}</h1>
                <p className="text-body text-audit-cool">{t('profile.subtitle')}</p>
              </div>
            </div>

            {/* User Avatar & Info */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-body font-medium text-audit-deep">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role || 'viewer')}`}>
                  {getRoleLabel(user?.role || 'viewer')}
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-audit-steel text-white flex items-center justify-center text-lg font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-container py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="audit-card">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-audit text-left transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-audit-bg text-audit-deep font-medium'
                      : 'text-audit-cool hover:bg-audit-bg hover:text-audit-deep'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('profile.personalInfo')}
                </button>

                <button
                  onClick={() => setActiveSection('password')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-audit text-left transition-colors ${
                    activeSection === 'password'
                      ? 'bg-audit-bg text-audit-deep font-medium'
                      : 'text-audit-cool hover:bg-audit-bg hover:text-audit-deep'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('profile.security')}
                </button>

                <button
                  onClick={() => setActiveSection('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-audit text-left transition-colors ${
                    activeSection === 'settings'
                      ? 'bg-audit-bg text-audit-deep font-medium'
                      : 'text-audit-cool hover:bg-audit-bg hover:text-audit-deep'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('profile.settings')}
                </button>
              </nav>

              {/* 2FA Coming Soon Badge */}
              <div className="mt-6 pt-6 border-t border-audit-light">
                <div className="flex items-center gap-2 text-audit-cool text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{t('profile.twoFactorComingSoon')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="audit-card">
                <h2 className="text-xl font-semibold text-audit-deep mb-6">{t('profile.personalInfo')}</h2>

                {profileMessage && (
                  <div className={`mb-6 p-4 rounded-audit border-l-4 ${
                    profileMessage.type === 'success'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-500 text-red-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {profileMessage.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {profileMessage.text}
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="audit-form-group">
                      <label className="audit-label">{t('profile.firstName')}</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="audit-input"
                        required
                      />
                    </div>

                    <div className="audit-form-group">
                      <label className="audit-label">{t('profile.lastName')}</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="audit-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.email')}</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="audit-input bg-audit-bg"
                      disabled
                    />
                    <p className="audit-helper">{t('profile.emailCannotChange')}</p>
                  </div>

                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.organization')}</label>
                    <input
                      type="text"
                      value={profileForm.organization}
                      onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                      className="audit-input"
                      placeholder={t('profile.organizationPlaceholder')}
                    />
                  </div>

                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.role')}</label>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role || 'viewer')}`}>
                        {getRoleLabel(user?.role || 'viewer')}
                      </span>
                      <span className="text-audit-cool text-sm">{t('profile.roleAssignedByAdmin')}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-audit-light">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="audit-btn-primary"
                    >
                      {profileSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('common.loading')}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t('common.save')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Section */}
            {activeSection === 'password' && (
              <div className="audit-card">
                <h2 className="text-xl font-semibold text-audit-deep mb-2">{t('profile.changePassword')}</h2>
                <p className="text-audit-cool mb-6">{t('profile.passwordDescription')}</p>

                {passwordMessage && (
                  <div className={`mb-6 p-4 rounded-audit border-l-4 ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-500 text-red-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {passwordMessage.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {passwordMessage.text}
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.currentPassword')}</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="audit-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-audit-cool hover:text-audit-deep"
                      >
                        {showPasswords.current ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.newPassword')}</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="audit-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-audit-cool hover:text-audit-deep"
                      >
                        {showPasswords.new ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-2 bg-audit-light rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getPasswordStrength(passwordForm.newPassword).color}`}
                              style={{ width: `${(getPasswordStrength(passwordForm.newPassword).level / 3) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-audit-cool">
                            {getPasswordStrength(passwordForm.newPassword).label}
                          </span>
                        </div>

                        {/* Password Requirements */}
                        <ul className="text-sm space-y-1">
                          <li className={`flex items-center gap-2 ${passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-audit-cool'}`}>
                            {passwordForm.newPassword.length >= 8 ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            {t('profile.passwordMinLength')}
                          </li>
                          <li className={`flex items-center gap-2 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-audit-cool'}`}>
                            {/[A-Z]/.test(passwordForm.newPassword) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            {t('profile.passwordUppercase')}
                          </li>
                          <li className={`flex items-center gap-2 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-audit-cool'}`}>
                            {/[0-9]/.test(passwordForm.newPassword) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            {t('profile.passwordNumber')}
                          </li>
                          <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-audit-cool'}`}>
                            {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            {t('profile.passwordSpecial')}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.confirmNewPassword')}</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={`audit-input pr-10 ${
                          passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-audit-cool hover:text-audit-deep"
                      >
                        {showPasswords.confirm ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{t('profile.passwordsMismatch')}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-audit-light">
                    <button
                      type="submit"
                      disabled={passwordSaving || (passwordForm.newPassword !== passwordForm.confirmPassword)}
                      className="audit-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('common.loading')}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {t('profile.updatePassword')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                {/* Language Settings */}
                <div className="audit-card">
                  <h2 className="text-xl font-semibold text-audit-deep mb-6">{t('profile.languageSettings')}</h2>

                  <div className="audit-form-group">
                    <label className="audit-label">{t('profile.preferredLanguage')}</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setLanguage('de')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-audit border transition-colors ${
                          language === 'de'
                            ? 'border-audit-steel bg-audit-bg text-audit-deep'
                            : 'border-audit-light text-audit-cool hover:border-audit-cool'
                        }`}
                      >
                        <span className="text-xl">🇩🇪</span>
                        <span className="font-medium">Deutsch</span>
                        {language === 'de' && (
                          <svg className="w-5 h-5 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-audit border transition-colors ${
                          language === 'en'
                            ? 'border-audit-steel bg-audit-bg text-audit-deep'
                            : 'border-audit-light text-audit-cool hover:border-audit-cool'
                        }`}
                      >
                        <span className="text-xl">🇬🇧</span>
                        <span className="font-medium">English</span>
                        {language === 'en' && (
                          <svg className="w-5 h-5 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="audit-card">
                  <h2 className="text-xl font-semibold text-audit-deep mb-6">{t('profile.notificationSettings')}</h2>

                  {settingsMessage && (
                    <div className={`mb-6 p-4 rounded-audit border-l-4 ${
                      settingsMessage.type === 'success'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-red-50 border-red-500 text-red-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {settingsMessage.text}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-audit-bg rounded-audit cursor-pointer hover:bg-audit-light/30 transition-colors">
                      <div>
                        <p className="font-medium text-audit-deep">{t('profile.emailNotifications')}</p>
                        <p className="text-sm text-audit-cool">{t('profile.emailNotificationsDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                        className="w-5 h-5 text-audit-steel rounded focus:ring-audit-steel"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-audit-bg rounded-audit cursor-pointer hover:bg-audit-light/30 transition-colors">
                      <div>
                        <p className="font-medium text-audit-deep">{t('profile.auditReminders')}</p>
                        <p className="text-sm text-audit-cool">{t('profile.auditRemindersDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.auditReminders}
                        onChange={(e) => setNotifications({ ...notifications, auditReminders: e.target.checked })}
                        className="w-5 h-5 text-audit-steel rounded focus:ring-audit-steel"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-audit-bg rounded-audit cursor-pointer hover:bg-audit-light/30 transition-colors">
                      <div>
                        <p className="font-medium text-audit-deep">{t('profile.securityAlerts')}</p>
                        <p className="text-sm text-audit-cool">{t('profile.securityAlertsDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.securityAlerts}
                        onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                        className="w-5 h-5 text-audit-steel rounded focus:ring-audit-steel"
                      />
                    </label>
                  </div>

                  <div className="pt-6 mt-6 border-t border-audit-light">
                    <button
                      onClick={handleSettingsSave}
                      className="audit-btn-primary"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('profile.saveSettings')}
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="audit-card border-red-200">
                  <h2 className="text-xl font-semibold text-red-600 mb-2">{t('profile.dangerZone')}</h2>
                  <p className="text-audit-cool mb-6">{t('profile.dangerZoneDesc')}</p>

                  <button className="audit-btn-secondary border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('profile.deleteAccount')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
