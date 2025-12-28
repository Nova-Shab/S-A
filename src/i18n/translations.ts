export type Language = 'de' | 'en';

export interface TranslationKeys {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    previous: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    close: string;
    search: string;
    filter: string;
    noData: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    required: string;
    optional: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    systems: string;
    scanner: string;
    actionsOverview: string;
    auditWizard: string;
    auditHistory: string;
    settings: string;
    logout: string;
    login: string;
    register: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    welcome: string;
    recentAudits: string;
    quickActions: string;
    newAudit: string;
    viewAll: string;
    progress: string;
    status: string;
    lastUpdated: string;
    noAudits: string;
    startFirstAudit: string;
    // Extended dashboard translations
    pageTitle: string;
    scannerTitle: string;
    scannerSubtitle: string;
    advancedAnalysis: string;
    quickScanPlaceholder: string;
    quickScan: string;
    analyzing: string;
    quickScanEmptyError: string;
    quickScanMinCharsError: string;
    quickScanError: string;
    createAuditTitle: string;
    createAuditDescription: string;
    riskClassification: string;
    complianceChecklist: string;
    actionPlan: string;
    startAudit: string;
    systemsOverview: string;
    manageAllSystems: string;
    systems: string;
    compliant: string;
    nonCompliant: string;
    highRisk: string;
    actionRequired: string;
    auditsDue: string;
    systemsRequiringAction: string;
    more: string;
    systemsManagement: string;
    registerSystemsDesc: string;
    registerSystem: string;
    activeAuditProcesses: string;
    activeAuditProcessesDesc: string;
    auditsFound: string;
    auditFound: string;
    searchLabel: string;
    searchPlaceholder: string;
    filterStatus: string;
    allStatus: string;
    draft: string;
    inProgress: string;
    completed: string;
    archived: string;
    loadingAudits: string;
    noAuditsYet: string;
    noAuditsDesc: string;
    createdByYou: string;
    sharedBy: string;
    created: string;
    updated: string;
    deleteAudit: string;
    deleteAuditTitle: string;
    deleteAuditConfirm: string;
    cancel: string;
    delete: string;
    deleting: string;
    auditDeleted: string;
  };

  // Audit
  audit: {
    title: string;
    newAudit: string;
    editAudit: string;
    systemName: string;
    systemDescription: string;
    riskClass: string;
    status: string;
    progress: string;
    created: string;
    updated: string;
    version: string;
    saveProgress: string;
    savedSuccessfully: string;
    saveFailed: string;
  };

  // Risk Classes
  riskClasses: {
    title: string;
    prohibited: string;
    prohibitedDesc: string;
    highRisk: string;
    highRiskDesc: string;
    limitedRisk: string;
    limitedRiskDesc: string;
    minimalRisk: string;
    minimalRiskDesc: string;
  };

  // Scanner
  scanner: {
    title: string;
    subtitle: string;
    enterUrl: string;
    scanButton: string;
    scanning: string;
    results: string;
    noResults: string;
    aiFeatures: string;
    riskIndicators: string;
    recommendations: string;
    downloadPdf: string;
    scanAgain: string;
    // Extended
    analyzeTitle: string;
    description: string;
    websiteUrl: string;
    systemName: string;
    optional: string;
    systemNamePlaceholder: string;
    descriptionLabel: string;
    urlLabel: string;
    descriptionHint: string;
    urlHint: string;
    minCharsError: string;
    emptyError: string;
    analyzingSystem: string;
    startAnalysis: string;
    riskClassification: string;
    riskScore: string;
    findings: string;
    findingsTotal: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    info: string;
    category: string;
    descriptionLabel2: string;
    recommendation: string;
    nextSteps: string;
    detectedFeatures: string;
    newAnalysis: string;
    disclaimer: string;
    autoAnalysis: string;
    autoAnalysisDesc: string;
    euAiActCompliant: string;
    euAiActCompliantDesc: string;
    detailedReport: string;
    detailedReportDesc: string;
    invalidUrlError: string;
    complianceGaps: string;
    complianceGapsDesc: string;
    notFulfilled: string;
    fulfilled: string;
    notAssessable: string;
  };

  // Nova Chatbot
  nova: {
    title: string;
    subtitle: string;
    welcome: string;
    welcomeDesc: string;
    placeholder: string;
    suggestions: string;
    thinking: string;
    errorMessage: string;
    connectionError: string;
  };

  // Auth
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    loginButton: string;
    registerButton: string;
    logoutButton: string;
  };

  // System Info
  systemInfo: {
    title: string;
    name: string;
    description: string;
    purpose: string;
    domain: string;
    useCase: string;
    provider: string;
    deployer: string;
  };

  // Steps
  steps: {
    intro: string;
    scope: string;
    aiSystem: string;
    riskClassification: string;
    requirements: string;
    evaluation: string;
    actions: string;
  };

  // Action Items
  actions: {
    title: string;
    pending: string;
    inProgress: string;
    completed: string;
    addAction: string;
    priority: string;
    dueDate: string;
    assignee: string;
  };

  // Profile
  profile: {
    title: string;
    subtitle: string;
    personalInfo: string;
    security: string;
    settings: string;
    firstName: string;
    lastName: string;
    email: string;
    emailCannotChange: string;
    organization: string;
    organizationPlaceholder: string;
    role: string;
    roleAssignedByAdmin: string;
    profileUpdated: string;
    updateFailed: string;
    changePassword: string;
    passwordDescription: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    passwordChanged: string;
    passwordChangeFailed: string;
    passwordsMismatch: string;
    passwordMinLength: string;
    passwordUppercase: string;
    passwordLowercase: string;
    passwordNumber: string;
    passwordSpecial: string;
    passwordWeak: string;
    passwordMedium: string;
    passwordStrong: string;
    languageSettings: string;
    preferredLanguage: string;
    notificationSettings: string;
    emailNotifications: string;
    emailNotificationsDesc: string;
    auditReminders: string;
    auditRemindersDesc: string;
    securityAlerts: string;
    securityAlertsDesc: string;
    saveSettings: string;
    settingsSaved: string;
    dangerZone: string;
    dangerZoneDesc: string;
    deleteAccount: string;
    twoFactorComingSoon: string;
  };

  // Errors
  errors: {
    required: string;
    invalidEmail: string;
    passwordMismatch: string;
    networkError: string;
    serverError: string;
    unauthorized: string;
    notFound: string;
  };

  // Systems Page
  systems: {
    title: string;
    subtitle: string;
    totalSystems: string;
    compliant: string;
    nonCompliant: string;
    highRisk: string;
    actionRequired: string;
    upcomingAudits: string;
    export: string;
    registerSystem: string;
    searchPlaceholder: string;
    allStatus: string;
    allRiskClasses: string;
    lastUpdated: string;
    newestFirst: string;
    oldestFirst: string;
    nameAZ: string;
    nameZA: string;
    riskHighestFirst: string;
    complianceScore: string;
    selected: string;
    clearSelection: string;
    exportSelected: string;
    noSystems: string;
    noSystemsDesc: string;
    registerFirst: string;
    auditsCompleted: string;
    startAudit: string;
    edit: string;
    duplicate: string;
    delete: string;
    deleteConfirmTitle: string;
    deleteConfirmText: string;
    cancel: string;
    domain: string;
    department: string;
    responsible: string;
    compliance: string;
    system: string;
    status: string;
    riskClass: string;
    updated: string;
    actions: string;
    audit: string;
    notClassified: string;
    unnamedSystem: string;
  };
}

const de: TranslationKeys = {
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück',
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolgreich',
    confirm: 'Bestätigen',
    close: 'Schließen',
    search: 'Suchen',
    filter: 'Filtern',
    noData: 'Keine Daten vorhanden',
    yes: 'Ja',
    no: 'Nein',
    or: 'oder',
    and: 'und',
    required: 'Erforderlich',
    optional: 'Optional',
  },

  nav: {
    dashboard: 'Dashboard',
    systems: 'Systeme',
    scanner: 'Scanner',
    actionsOverview: 'Maßnahmen',
    auditWizard: 'Audit-Assistent',
    auditHistory: 'Audit-Verlauf',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    login: 'Anmelden',
    register: 'Registrieren',
  },

  dashboard: {
    title: 'Dashboard',
    welcome: 'Willkommen zurück!',
    recentAudits: 'Aktuelle Audits',
    quickActions: 'Schnellaktionen',
    newAudit: 'Neues Audit',
    viewAll: 'Alle anzeigen',
    progress: 'Fortschritt',
    status: 'Status',
    lastUpdated: 'Zuletzt aktualisiert',
    noAudits: 'Noch keine Audits vorhanden',
    startFirstAudit: 'Starten Sie Ihr erstes EU AI Act Audit',
    // Extended dashboard translations
    pageTitle: 'EU AI Act Audit Dashboard',
    scannerTitle: 'KI-System Scanner',
    scannerSubtitle: 'EU AI Act Risikoanalyse',
    advancedAnalysis: 'Erweiterte Analyse',
    quickScanPlaceholder: 'Beschreiben Sie Ihr KI-System kurz, z.B.: Chatbot für Kundenservice mit automatischer Antwortgenerierung...',
    quickScan: 'Schnell-Scan',
    analyzing: 'Analysiere...',
    quickScanEmptyError: 'Bitte geben Sie eine Beschreibung ein.',
    quickScanMinCharsError: 'Die Beschreibung sollte mindestens 50 Zeichen lang sein.',
    quickScanError: 'Fehler bei der Analyse. Bitte versuchen Sie es erneut.',
    createAuditTitle: 'Neues Audit erstellen',
    createAuditDescription: 'Starten Sie eine EU AI Act Compliance-Prüfung für Ihr KI-System.',
    riskClassification: 'Risikoklassifizierung',
    complianceChecklist: 'Compliance-Checkliste',
    actionPlan: 'Maßnahmenplan',
    startAudit: 'Audit starten',
    systemsOverview: 'KI-Systeme Übersicht',
    manageAllSystems: 'Alle Systeme verwalten',
    systems: 'Systeme',
    compliant: 'Konform',
    nonCompliant: 'Nicht konform',
    highRisk: 'Hochrisiko',
    actionRequired: 'Handlungsbedarf',
    auditsDue: 'Audits fällig',
    systemsRequiringAction: 'Systeme mit Handlungsbedarf',
    more: 'weitere',
    systemsManagement: 'KI-Systeme Verwaltung',
    registerSystemsDesc: 'Registrieren Sie Ihre KI-Systeme für eine zentrale EU AI Act Compliance-Verwaltung.',
    registerSystem: 'System registrieren',
    activeAuditProcesses: 'Aktive Audit-Prozesse',
    activeAuditProcessesDesc: 'Übersicht aller laufenden und abgeschlossenen Compliance-Prüfungen',
    auditsFound: 'Audits gefunden',
    auditFound: 'Audit gefunden',
    searchLabel: 'Suche',
    searchPlaceholder: 'Nach Titel oder Beschreibung suchen...',
    filterStatus: 'Status filtern',
    allStatus: 'Alle Status',
    draft: 'Entwurf',
    inProgress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    archived: 'Archiviert',
    loadingAudits: 'Audits werden geladen...',
    noAuditsYet: 'Noch keine Audits vorhanden',
    noAuditsDesc: 'Nutzen Sie den Bereich oben, um Ihr erstes Audit zu starten.',
    createdByYou: 'Erstellt von Ihnen',
    sharedBy: 'Geteilt von',
    created: 'Erstellt',
    updated: 'Aktualisiert',
    deleteAudit: 'Audit löschen',
    deleteAuditTitle: 'Audit löschen?',
    deleteAuditConfirm: 'Möchten Sie dieses Audit wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    deleting: 'Löschen...',
    auditDeleted: 'Audit wurde erfolgreich gelöscht.',
  },

  audit: {
    title: 'Audit',
    newAudit: 'Neues Audit erstellen',
    editAudit: 'Audit bearbeiten',
    systemName: 'Systemname',
    systemDescription: 'Systembeschreibung',
    riskClass: 'Risikoklasse',
    status: 'Status',
    progress: 'Fortschritt',
    created: 'Erstellt',
    updated: 'Aktualisiert',
    version: 'Version',
    saveProgress: 'Fortschritt speichern',
    savedSuccessfully: 'Erfolgreich gespeichert',
    saveFailed: 'Speichern fehlgeschlagen',
  },

  riskClasses: {
    title: 'Risikoklassifizierung',
    prohibited: 'Verboten',
    prohibitedDesc: 'KI-Systeme, die verbotene Praktiken wie Manipulation oder Social Scoring verwenden',
    highRisk: 'Hochrisiko',
    highRiskDesc: 'KI-Systeme, die wichtige Entscheidungen über Menschen treffen',
    limitedRisk: 'Begrenztes Risiko',
    limitedRiskDesc: 'KI-Systeme mit Transparenzpflichten wie Chatbots',
    minimalRisk: 'Minimales Risiko',
    minimalRiskDesc: 'KI-Systeme ohne besondere Anforderungen',
  },

  scanner: {
    title: 'EU AI Act Compliance Scanner',
    subtitle: 'Automatisierte Risikoanalyse für KI-Systeme',
    enterUrl: 'URL eingeben',
    scanButton: 'Scannen',
    scanning: 'Scanning läuft...',
    results: 'Ergebnisse',
    noResults: 'Keine KI-Funktionen gefunden',
    aiFeatures: 'Erkannte KI-Funktionen',
    riskIndicators: 'Risikoindikatoren',
    recommendations: 'Empfehlungen',
    downloadPdf: 'PDF Report herunterladen',
    scanAgain: 'Erneut scannen',
    // Extended
    analyzeTitle: 'KI-System analysieren',
    description: 'Beschreibung',
    websiteUrl: 'Website URL',
    systemName: 'Systemname',
    optional: '(optional)',
    systemNamePlaceholder: 'z.B. Kunden-Chatbot, HR-Screening-Tool',
    descriptionLabel: 'Beschreibung des KI-Systems',
    urlLabel: 'Website URL',
    descriptionHint: 'Je detaillierter die Beschreibung, desto genauer die Analyse. Mindestens 50 Zeichen.',
    urlHint: 'Die URL wird analysiert, um Informationen über das KI-System zu extrahieren.',
    minCharsError: 'Die Beschreibung sollte mindestens 50 Zeichen lang sein für eine aussagekräftige Analyse.',
    emptyError: 'Bitte geben Sie eine Beschreibung Ihres KI-Systems ein.',
    analyzingSystem: 'Analysiere KI-System...',
    startAnalysis: 'Analyse starten',
    riskClassification: 'Risikoklassifizierung',
    riskScore: 'Risiko-Score',
    findings: 'Befunde',
    findingsTotal: 'Befunde gesamt',
    critical: 'Kritisch',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
    info: 'Info',
    category: 'Kategorie',
    descriptionLabel2: 'Beschreibung',
    recommendation: 'Empfehlung',
    nextSteps: 'Nächste Schritte',
    detectedFeatures: 'Erkannte Merkmale',
    newAnalysis: 'Neue Analyse starten',
    disclaimer: 'Hinweis: Diese Analyse dient nur zur Orientierung und ersetzt keine rechtliche Beratung. Für eine verbindliche Einschätzung konsultieren Sie bitte qualifizierte Rechtsberater.',
    autoAnalysis: 'Automatische Analyse',
    autoAnalysisDesc: 'Erkennung von Risikoindikatoren',
    euAiActCompliant: 'AI Act konform',
    euAiActCompliantDesc: 'Basierend auf Regulation 2024/1689',
    detailedReport: 'Detaillierter Report',
    detailedReportDesc: 'Konkrete Handlungsempfehlungen',
    invalidUrlError: 'Bitte geben Sie eine gültige URL ein (z.B. https://example.com)',
    complianceGaps: 'Compliance-Abweichungen',
    complianceGapsDesc: 'Folgende Anforderungen des EU AI Act werden derzeit nicht erfüllt:',
    notFulfilled: 'Nicht erfüllt',
    fulfilled: 'Erfüllt',
    notAssessable: 'Nicht bewertbar',
  },

  nova: {
    title: 'Nova',
    subtitle: 'Ihr freundlicher EU AI Act Helfer',
    welcome: 'Hallo! Ich bin Nova',
    welcomeDesc: 'Ich helfe Ihnen beim EU AI Act - einfach und verständlich erklärt!',
    placeholder: 'Fragen Sie mich einfach...',
    suggestions: 'Fragen Sie mich z.B.:',
    thinking: 'Nova denkt nach...',
    errorMessage: 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten.',
    connectionError: 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  },

  auth: {
    login: 'Anmelden',
    register: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    forgotPassword: 'Passwort vergessen?',
    noAccount: 'Noch kein Konto?',
    hasAccount: 'Bereits registriert?',
    loginButton: 'Anmelden',
    registerButton: 'Registrieren',
    logoutButton: 'Abmelden',
  },

  systemInfo: {
    title: 'Systeminformationen',
    name: 'Systemname',
    description: 'Beschreibung',
    purpose: 'Hauptzweck',
    domain: 'Einsatzbereich',
    useCase: 'Anwendungsfall',
    provider: 'Anbieter',
    deployer: 'Betreiber',
  },

  steps: {
    intro: 'Einführung',
    scope: 'Anwendungsbereich',
    aiSystem: 'KI-System',
    riskClassification: 'Risikoklassifizierung',
    requirements: 'Anforderungen',
    evaluation: 'Bewertung',
    actions: 'Maßnahmen',
  },

  actions: {
    title: 'Maßnahmen',
    pending: 'Ausstehend',
    inProgress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    addAction: 'Maßnahme hinzufügen',
    priority: 'Priorität',
    dueDate: 'Fälligkeitsdatum',
    assignee: 'Verantwortlich',
  },

  errors: {
    required: 'Dieses Feld ist erforderlich',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    passwordMismatch: 'Passwörter stimmen nicht überein',
    networkError: 'Netzwerkfehler. Bitte versuchen Sie es erneut.',
    serverError: 'Serverfehler. Bitte versuchen Sie es später erneut.',
    unauthorized: 'Nicht autorisiert. Bitte melden Sie sich an.',
    notFound: 'Nicht gefunden',
  },

  profile: {
    title: 'Mein Profil',
    subtitle: 'Verwalten Sie Ihre persönlichen Daten und Kontoeinstellungen',
    personalInfo: 'Persönliche Daten',
    security: 'Sicherheit',
    settings: 'Einstellungen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail-Adresse',
    emailCannotChange: 'Die E-Mail-Adresse kann nicht geändert werden',
    organization: 'Organisation',
    organizationPlaceholder: 'z.B. Firma GmbH',
    role: 'Rolle',
    roleAssignedByAdmin: 'Zugewiesen durch Administrator',
    profileUpdated: 'Profil erfolgreich aktualisiert',
    updateFailed: 'Aktualisierung fehlgeschlagen',
    changePassword: 'Passwort ändern',
    passwordDescription: 'Wählen Sie ein sicheres Passwort, das Sie nirgendwo anders verwenden',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmNewPassword: 'Neues Passwort bestätigen',
    updatePassword: 'Passwort aktualisieren',
    passwordChanged: 'Passwort erfolgreich geändert',
    passwordChangeFailed: 'Passwortänderung fehlgeschlagen. Bitte überprüfen Sie Ihr aktuelles Passwort.',
    passwordsMismatch: 'Die Passwörter stimmen nicht überein',
    passwordMinLength: 'Mindestens 8 Zeichen',
    passwordUppercase: 'Mindestens ein Großbuchstabe',
    passwordLowercase: 'Mindestens ein Kleinbuchstabe',
    passwordNumber: 'Mindestens eine Zahl',
    passwordSpecial: 'Mindestens ein Sonderzeichen',
    passwordWeak: 'Schwach',
    passwordMedium: 'Mittel',
    passwordStrong: 'Stark',
    languageSettings: 'Spracheinstellungen',
    preferredLanguage: 'Bevorzugte Sprache',
    notificationSettings: 'Benachrichtigungen',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    emailNotificationsDesc: 'Erhalten Sie wichtige Updates per E-Mail',
    auditReminders: 'Audit-Erinnerungen',
    auditRemindersDesc: 'Erinnerungen an anstehende Audits und Fristen',
    securityAlerts: 'Sicherheitswarnungen',
    securityAlertsDesc: 'Warnungen bei verdächtigen Kontoaktivitäten',
    saveSettings: 'Einstellungen speichern',
    settingsSaved: 'Einstellungen erfolgreich gespeichert',
    dangerZone: 'Gefahrenzone',
    dangerZoneDesc: 'Diese Aktionen können nicht rückgängig gemacht werden',
    deleteAccount: 'Konto löschen',
    twoFactorComingSoon: '2FA kommt bald',
  },

  systems: {
    title: 'KI-Systeme Verzeichnis',
    subtitle: 'Zentrale Verwaltung aller registrierten KI-Systeme nach EU AI Act',
    totalSystems: 'Systeme gesamt',
    compliant: 'Konform',
    nonCompliant: 'Nicht konform',
    highRisk: 'Hochrisiko',
    actionRequired: 'Handlungsbedarf',
    upcomingAudits: 'Audits anstehend',
    export: 'Exportieren',
    registerSystem: '+ System registrieren',
    searchPlaceholder: 'Suchen nach Name, Anwendungsfall, Abteilung...',
    allStatus: 'Alle Status',
    allRiskClasses: 'Alle Risikoklassen',
    lastUpdated: 'Zuletzt aktualisiert',
    newestFirst: 'Neueste zuerst',
    oldestFirst: 'Älteste zuerst',
    nameAZ: 'Name A-Z',
    nameZA: 'Name Z-A',
    riskHighestFirst: 'Risiko (höchstes zuerst)',
    complianceScore: 'Compliance-Score',
    selected: 'ausgewählt',
    clearSelection: 'Auswahl aufheben',
    exportSelected: 'Ausgewählte exportieren',
    noSystems: 'Keine KI-Systeme registriert',
    noSystemsDesc: 'Registrieren Sie Ihr erstes KI-System, um mit der EU AI Act Compliance zu beginnen.',
    registerFirst: '+ Erstes System registrieren',
    auditsCompleted: 'Audits durchgeführt',
    startAudit: 'Audit starten',
    edit: 'Bearbeiten',
    duplicate: 'Duplizieren',
    delete: 'Löschen',
    deleteConfirmTitle: 'System löschen?',
    deleteConfirmText: 'Möchten Sie dieses KI-System wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    domain: 'Domäne',
    department: 'Abteilung',
    responsible: 'Verantwortlich',
    compliance: 'Compliance',
    system: 'System',
    status: 'Status',
    riskClass: 'Risikoklasse',
    updated: 'Aktualisiert',
    actions: 'Aktionen',
    audit: 'Audit',
    notClassified: 'Nicht klassifiziert',
    unnamedSystem: 'Unbenanntes System',
  },
};

const en: TranslationKeys = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    noData: 'No data available',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',
    required: 'Required',
    optional: 'Optional',
  },

  nav: {
    dashboard: 'Dashboard',
    systems: 'Systems',
    scanner: 'Scanner',
    actionsOverview: 'Actions',
    auditWizard: 'Audit Wizard',
    auditHistory: 'Audit History',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
  },

  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back!',
    recentAudits: 'Recent Audits',
    quickActions: 'Quick Actions',
    newAudit: 'New Audit',
    viewAll: 'View All',
    progress: 'Progress',
    status: 'Status',
    lastUpdated: 'Last Updated',
    noAudits: 'No audits yet',
    startFirstAudit: 'Start your first EU AI Act audit',
    // Extended dashboard translations
    pageTitle: 'EU AI Act Audit Dashboard',
    scannerTitle: 'AI System Scanner',
    scannerSubtitle: 'EU AI Act Risk Analysis',
    advancedAnalysis: 'Advanced Analysis',
    quickScanPlaceholder: 'Briefly describe your AI system, e.g.: Customer service chatbot with automatic response generation...',
    quickScan: 'Quick Scan',
    analyzing: 'Analyzing...',
    quickScanEmptyError: 'Please enter a description.',
    quickScanMinCharsError: 'The description should be at least 50 characters long.',
    quickScanError: 'Analysis failed. Please try again.',
    createAuditTitle: 'Create New Audit',
    createAuditDescription: 'Start an EU AI Act compliance check for your AI system.',
    riskClassification: 'Risk Classification',
    complianceChecklist: 'Compliance Checklist',
    actionPlan: 'Action Plan',
    startAudit: 'Start Audit',
    systemsOverview: 'AI Systems Overview',
    manageAllSystems: 'Manage All Systems',
    systems: 'Systems',
    compliant: 'Compliant',
    nonCompliant: 'Non-Compliant',
    highRisk: 'High Risk',
    actionRequired: 'Action Required',
    auditsDue: 'Audits Due',
    systemsRequiringAction: 'Systems Requiring Action',
    more: 'more',
    systemsManagement: 'AI Systems Management',
    registerSystemsDesc: 'Register your AI systems for centralized EU AI Act compliance management.',
    registerSystem: 'Register System',
    activeAuditProcesses: 'Active Audit Processes',
    activeAuditProcessesDesc: 'Overview of all ongoing and completed compliance checks',
    auditsFound: 'audits found',
    auditFound: 'audit found',
    searchLabel: 'Search',
    searchPlaceholder: 'Search by title or description...',
    filterStatus: 'Filter by Status',
    allStatus: 'All Status',
    draft: 'Draft',
    inProgress: 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
    loadingAudits: 'Loading audits...',
    noAuditsYet: 'No audits yet',
    noAuditsDesc: 'Use the section above to start your first audit.',
    createdByYou: 'Created by you',
    sharedBy: 'Shared by',
    created: 'Created',
    updated: 'Updated',
    deleteAudit: 'Delete Audit',
    deleteAuditTitle: 'Delete Audit?',
    deleteAuditConfirm: 'Are you sure you want to delete this audit? This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting...',
    auditDeleted: 'Audit successfully deleted.',
  },

  audit: {
    title: 'Audit',
    newAudit: 'Create New Audit',
    editAudit: 'Edit Audit',
    systemName: 'System Name',
    systemDescription: 'System Description',
    riskClass: 'Risk Class',
    status: 'Status',
    progress: 'Progress',
    created: 'Created',
    updated: 'Updated',
    version: 'Version',
    saveProgress: 'Save Progress',
    savedSuccessfully: 'Saved successfully',
    saveFailed: 'Save failed',
  },

  riskClasses: {
    title: 'Risk Classification',
    prohibited: 'Prohibited',
    prohibitedDesc: 'AI systems using prohibited practices like manipulation or social scoring',
    highRisk: 'High Risk',
    highRiskDesc: 'AI systems making important decisions about people',
    limitedRisk: 'Limited Risk',
    limitedRiskDesc: 'AI systems with transparency requirements like chatbots',
    minimalRisk: 'Minimal Risk',
    minimalRiskDesc: 'AI systems without special requirements',
  },

  scanner: {
    title: 'EU AI Act Compliance Scanner',
    subtitle: 'Automated Risk Analysis for AI Systems',
    enterUrl: 'Enter URL',
    scanButton: 'Scan',
    scanning: 'Scanning...',
    results: 'Results',
    noResults: 'No AI features found',
    aiFeatures: 'Detected AI Features',
    riskIndicators: 'Risk Indicators',
    recommendations: 'Recommendations',
    downloadPdf: 'Download PDF Report',
    scanAgain: 'Scan Again',
    // Extended
    analyzeTitle: 'Analyze AI System',
    description: 'Description',
    websiteUrl: 'Website URL',
    systemName: 'System Name',
    optional: '(optional)',
    systemNamePlaceholder: 'e.g. Customer Chatbot, HR Screening Tool',
    descriptionLabel: 'AI System Description',
    urlLabel: 'Website URL',
    descriptionHint: 'The more detailed the description, the more accurate the analysis. Minimum 50 characters.',
    urlHint: 'The URL will be analyzed to extract information about the AI system.',
    minCharsError: 'The description should be at least 50 characters long for a meaningful analysis.',
    emptyError: 'Please enter a description of your AI system.',
    analyzingSystem: 'Analyzing AI system...',
    startAnalysis: 'Start Analysis',
    riskClassification: 'Risk Classification',
    riskScore: 'Risk Score',
    findings: 'Findings',
    findingsTotal: 'Total findings',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
    category: 'Category',
    descriptionLabel2: 'Description',
    recommendation: 'Recommendation',
    nextSteps: 'Next Steps',
    detectedFeatures: 'Detected Features',
    newAnalysis: 'Start New Analysis',
    disclaimer: 'Note: This analysis is for guidance only and does not replace legal advice. For a binding assessment, please consult qualified legal advisors.',
    autoAnalysis: 'Automatic Analysis',
    autoAnalysisDesc: 'Detection of risk indicators',
    euAiActCompliant: 'AI Act compliant',
    euAiActCompliantDesc: 'Based on Regulation 2024/1689',
    detailedReport: 'Detailed Report',
    detailedReportDesc: 'Concrete recommendations for action',
    invalidUrlError: 'Please enter a valid URL (e.g. https://example.com)',
    complianceGaps: 'Compliance Gaps',
    complianceGapsDesc: 'The following EU AI Act requirements are currently not met:',
    notFulfilled: 'Not fulfilled',
    fulfilled: 'Fulfilled',
    notAssessable: 'Not assessable',
  },

  nova: {
    title: 'Nova',
    subtitle: 'Your friendly EU AI Act helper',
    welcome: 'Hello! I\'m Nova',
    welcomeDesc: 'I help you understand the EU AI Act - simply and clearly explained!',
    placeholder: 'Just ask me anything...',
    suggestions: 'Try asking me:',
    thinking: 'Nova is thinking...',
    errorMessage: 'Sorry, I couldn\'t process your request.',
    connectionError: 'Connection error. Please check your internet connection.',
  },

  auth: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already registered?',
    loginButton: 'Log In',
    registerButton: 'Sign Up',
    logoutButton: 'Log Out',
  },

  systemInfo: {
    title: 'System Information',
    name: 'System Name',
    description: 'Description',
    purpose: 'Primary Purpose',
    domain: 'Domain',
    useCase: 'Use Case',
    provider: 'Provider',
    deployer: 'Deployer',
  },

  steps: {
    intro: 'Introduction',
    scope: 'Scope',
    aiSystem: 'AI System',
    riskClassification: 'Risk Classification',
    requirements: 'Requirements',
    evaluation: 'Evaluation',
    actions: 'Actions',
  },

  actions: {
    title: 'Actions',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    addAction: 'Add Action',
    priority: 'Priority',
    dueDate: 'Due Date',
    assignee: 'Assignee',
  },

  errors: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    passwordMismatch: 'Passwords do not match',
    networkError: 'Network error. Please try again.',
    serverError: 'Server error. Please try again later.',
    unauthorized: 'Unauthorized. Please log in.',
    notFound: 'Not found',
  },

  profile: {
    title: 'My Profile',
    subtitle: 'Manage your personal information and account settings',
    personalInfo: 'Personal Information',
    security: 'Security',
    settings: 'Settings',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    emailCannotChange: 'Email address cannot be changed',
    organization: 'Organization',
    organizationPlaceholder: 'e.g. Company Inc.',
    role: 'Role',
    roleAssignedByAdmin: 'Assigned by administrator',
    profileUpdated: 'Profile updated successfully',
    updateFailed: 'Update failed',
    changePassword: 'Change Password',
    passwordDescription: 'Choose a secure password that you don\'t use anywhere else',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    passwordChanged: 'Password changed successfully',
    passwordChangeFailed: 'Password change failed. Please check your current password.',
    passwordsMismatch: 'Passwords do not match',
    passwordMinLength: 'At least 8 characters',
    passwordUppercase: 'At least one uppercase letter',
    passwordLowercase: 'At least one lowercase letter',
    passwordNumber: 'At least one number',
    passwordSpecial: 'At least one special character',
    passwordWeak: 'Weak',
    passwordMedium: 'Medium',
    passwordStrong: 'Strong',
    languageSettings: 'Language Settings',
    preferredLanguage: 'Preferred Language',
    notificationSettings: 'Notifications',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive important updates via email',
    auditReminders: 'Audit Reminders',
    auditRemindersDesc: 'Reminders for upcoming audits and deadlines',
    securityAlerts: 'Security Alerts',
    securityAlertsDesc: 'Alerts for suspicious account activity',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'These actions cannot be undone',
    deleteAccount: 'Delete Account',
    twoFactorComingSoon: '2FA coming soon',
  },

  systems: {
    title: 'AI Systems Directory',
    subtitle: 'Central management of all registered AI systems under EU AI Act',
    totalSystems: 'Total systems',
    compliant: 'Compliant',
    nonCompliant: 'Non-compliant',
    highRisk: 'High risk',
    actionRequired: 'Action required',
    upcomingAudits: 'Upcoming audits',
    export: 'Export',
    registerSystem: '+ Register system',
    searchPlaceholder: 'Search by name, use case, department...',
    allStatus: 'All status',
    allRiskClasses: 'All risk classes',
    lastUpdated: 'Last updated',
    newestFirst: 'Newest first',
    oldestFirst: 'Oldest first',
    nameAZ: 'Name A-Z',
    nameZA: 'Name Z-A',
    riskHighestFirst: 'Risk (highest first)',
    complianceScore: 'Compliance score',
    selected: 'selected',
    clearSelection: 'Clear selection',
    exportSelected: 'Export selected',
    noSystems: 'No AI systems registered',
    noSystemsDesc: 'Register your first AI system to start with EU AI Act compliance.',
    registerFirst: '+ Register first system',
    auditsCompleted: 'Audits completed',
    startAudit: 'Start audit',
    edit: 'Edit',
    duplicate: 'Duplicate',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete system?',
    deleteConfirmText: 'Do you really want to delete this AI system? This action cannot be undone.',
    cancel: 'Cancel',
    domain: 'Domain',
    department: 'Department',
    responsible: 'Responsible',
    compliance: 'Compliance',
    system: 'System',
    status: 'Status',
    riskClass: 'Risk class',
    updated: 'Updated',
    actions: 'Actions',
    audit: 'Audit',
    notClassified: 'Not classified',
    unnamedSystem: 'Unnamed system',
  },
};

export const translations: Record<Language, TranslationKeys> = { de, en };
