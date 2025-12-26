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
    title: 'KI-Scanner',
    subtitle: 'Analysieren Sie Websites auf KI-Funktionen',
    enterUrl: 'URL eingeben',
    scanButton: 'Scannen',
    scanning: 'Scanning läuft...',
    results: 'Ergebnisse',
    noResults: 'Keine KI-Funktionen gefunden',
    aiFeatures: 'Erkannte KI-Funktionen',
    riskIndicators: 'Risikoindikatoren',
    recommendations: 'Empfehlungen',
    downloadPdf: 'PDF-Report herunterladen',
    scanAgain: 'Erneut scannen',
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
    title: 'AI Scanner',
    subtitle: 'Analyze websites for AI features',
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
};

export const translations: Record<Language, TranslationKeys> = { de, en };
