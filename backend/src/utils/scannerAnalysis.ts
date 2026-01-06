import axios from 'axios';
import * as cheerio from 'cheerio';
import { RiskLevel, ScanFinding, ScanAnalysis } from '../models/ScanResult';
import { analyzeWithGPT, isGPTAvailable } from './gptAnalysis';
import { analyzeWithOllama, isOllamaAvailable } from './ollamaAnalysis';
import { advancedWebScrape, DetectedAIFeature } from './advancedWebScraper';

// ============================================================================
// EU AI ACT ARTICLE 5 - PROHIBITED AI PRACTICES (Complete Implementation)
// ============================================================================

// Art. 5(1)(a) - Unterschwellige Manipulation / Subliminal Manipulation
const PROHIBITED_SUBLIMINAL = [
  'subliminal', 'unterschwellig', 'subliminal manipulation', 'unterschwellige manipulation',
  'subliminal techniques', 'unterschwellige techniken', 'subliminal messaging',
  'beyond consciousness', 'unterhalb der bewusstseinsschwelle',
  'manipulative techniques', 'manipulative techniken',
  'covert manipulation', 'verdeckte manipulation',
  'psychological manipulation', 'psychologische manipulation',
  'behavioral manipulation without awareness', 'verhaltensmanipulation ohne bewusstsein',
];

// Art. 5(1)(b) - Ausnutzung schutzbedürftiger Gruppen / Exploitation of Vulnerabilities
const PROHIBITED_VULNERABLE_EXPLOITATION = [
  'exploit vulnerable', 'ausnutzung schutzbedürftig', 'exploitation of vulnerabilities',
  'target children', 'kinder gezielt', 'targeting minors', 'minderjährige gezielt',
  'exploit elderly', 'ältere ausnutzen', 'targeting seniors', 'senioren gezielt',
  'exploit disabled', 'behinderte ausnutzen', 'exploit disability', 'behinderung ausnutzen',
  'exploit mental', 'psychisch ausnutzen', 'mental vulnerability', 'psychische schwäche',
  'exploit addiction', 'sucht ausnutzen', 'addictive design', 'suchtförderndes design',
  'exploit poverty', 'armut ausnutzen', 'economic vulnerability', 'wirtschaftliche schwäche',
  'dark patterns', 'dunkle muster', 'deceptive design', 'täuschendes design',
  'predatory targeting', 'räuberisches targeting', 'vulnerable group targeting',
  'schutzbedürftige gruppen', 'vulnerable persons', 'schutzbedürftige personen',
  'cognitive impairment', 'kognitive beeinträchtigung',
];

// Art. 5(1)(c) - Social Scoring durch Behörden / Social Scoring by Public Authorities
const PROHIBITED_SOCIAL_SCORING = [
  'social scoring', 'soziales bewertungssystem', 'social credit', 'sozialpunkte',
  'citizen scoring', 'bürgerbewertung', 'citizen rating', 'bürger-rating',
  'social rating system', 'soziales ratingsystem', 'trustworthiness score',
  'vertrauenswürdigkeitsbewertung', 'behavioral scoring', 'verhaltensbewertung',
  'social behavior score', 'sozialverhaltenspunkte', 'public authority scoring',
  'behördliche bewertung', 'government scoring', 'staatliche bewertung',
  'citizen reputation', 'bürger-reputation', 'social trustworthiness',
  'soziale vertrauenswürdigkeit', 'creditworthiness based on social behavior',
];

// Art. 5(1)(d) - Prädiktive Polizeiarbeit auf Einzelpersonen / Individual Predictive Policing
const PROHIBITED_PREDICTIVE_POLICING = [
  'predictive policing individual', 'vorhersagende polizeiarbeit einzelperson',
  'individual crime prediction', 'individuelle kriminalitätsprognose',
  'predict criminal behavior', 'kriminelles verhalten vorhersagen',
  'crime risk individual', 'kriminalitätsrisiko einzelperson',
  'predict offending', 'straftaten vorhersagen', 'risk of offending',
  'rückfallrisiko', 'recidivism prediction individual', 'rückfallprognose einzelperson',
  'profiling for crime prediction', 'profiling für kriminalitätsprognose',
  'pre-crime', 'pre-crime system', 'precrime', 'vorhersage straftat',
  'future criminal', 'zukünftiger straftäter', 'potential offender',
  'potenzieller straftäter', 'crime propensity', 'kriminalitätsneigung',
  'individual risk assessment law enforcement', 'einzelrisikobewertung strafverfolgung',
];

// Art. 5(1)(e) - Ungezieltes Scraping von Gesichtsbildern / Untargeted Facial Image Scraping
const PROHIBITED_FACIAL_SCRAPING = [
  'facial scraping', 'gesichtsbilder scraping', 'face scraping',
  'scrape faces', 'gesichter scrapen', 'facial database scraping',
  'clearview', 'web scraping faces', 'internet facial images',
  'social media face scraping', 'soziale medien gesichter scraping',
  'untargeted facial recognition database', 'ungezielte gesichtserkennungsdatenbank',
  'mass facial collection', 'massensammlung gesichtsbilder',
  'building facial database from internet', 'gesichtsdatenbank aus internet',
  'scraping profile pictures', 'profilbilder scraping',
  'harvesting facial images', 'gesichtsbilder sammeln',
  'bulk face collection', 'massenhafte gesichtssammlung',
  'facial recognition training data from web', 'gesichtserkennung trainingsdaten web',
];

// Art. 5(1)(f) - Emotionserkennung am Arbeitsplatz/in Schulen / Emotion Recognition at Work/School
const PROHIBITED_EMOTION_WORKPLACE = [
  'emotion recognition workplace', 'emotionserkennung arbeitsplatz',
  'emotion detection work', 'emotionserkennung arbeit',
  'emotion recognition school', 'emotionserkennung schule',
  'emotion detection education', 'emotionserkennung bildung',
  'affective computing workplace', 'affective computing arbeitsplatz',
  'employee emotion monitoring', 'mitarbeiter emotionsüberwachung',
  'student emotion monitoring', 'schüler emotionsüberwachung',
  'workplace sentiment analysis', 'arbeitsplatz stimmungsanalyse',
  'employee mood detection', 'mitarbeiter stimmungserkennung',
  'classroom emotion detection', 'klassenzimmer emotionserkennung',
  'work emotion ai', 'arbeits emotions ki',
  'employee facial expression', 'mitarbeiter gesichtsausdruck',
  'student engagement emotion', 'schüler engagement emotion',
  'workforce emotion analytics', 'belegschaft emotionsanalyse',
  'emotional state monitoring employees', 'emotionszustand überwachung mitarbeiter',
];

// Art. 5(1)(g) - Biometrische Kategorisierung nach sensiblen Merkmalen / Biometric Categorization by Sensitive Attributes
const PROHIBITED_BIOMETRIC_CATEGORIZATION = [
  'biometric categorization race', 'biometrische kategorisierung rasse',
  'biometric ethnicity', 'biometrische ethnizität',
  'biometric religion', 'biometrische religion',
  'biometric political', 'biometrische politisch',
  'biometric sexual orientation', 'biometrische sexuelle orientierung',
  'race detection', 'rassenerkennung', 'ethnicity detection', 'ethnizitätserkennung',
  'infer race from face', 'rasse aus gesicht ableiten',
  'infer religion', 'religion ableiten', 'infer political views', 'politische ansichten ableiten',
  'sexual orientation detection', 'erkennung sexueller orientierung',
  'biometric profiling sensitive', 'biometrisches profiling sensibel',
  'categorize by skin color', 'kategorisieren nach hautfarbe',
  'facial analysis race', 'gesichtsanalyse rasse',
  'ethnic profiling biometric', 'ethnisches profiling biometrisch',
];

// Art. 5(1)(h) - Echtzeit-Fernidentifikation im öffentlichen Raum / Real-time Remote Biometric Identification
const PROHIBITED_REALTIME_BIOMETRIC = [
  'real-time biometric', 'echtzeit-biometrisch', 'realtime biometric',
  'real-time facial recognition public', 'echtzeit gesichtserkennung öffentlich',
  'live facial recognition', 'live gesichtserkennung',
  'real-time remote identification', 'echtzeit-fernidentifikation',
  'mass surveillance biometric', 'massenüberwachung biometrisch',
  'public space facial recognition', 'öffentlicher raum gesichtserkennung',
  'live biometric identification', 'live biometrische identifikation',
  'street facial recognition', 'straßen gesichtserkennung',
  'real-time face matching', 'echtzeit gesichtsabgleich',
  'continuous biometric monitoring public', 'kontinuierliche biometrische überwachung öffentlich',
  'mass biometric surveillance', 'biometrische massenüberwachung',
];

// Combined PROHIBITED_KEYWORDS for backward compatibility
const PROHIBITED_KEYWORDS = [
  ...PROHIBITED_SUBLIMINAL,
  ...PROHIBITED_VULNERABLE_EXPLOITATION,
  ...PROHIBITED_SOCIAL_SCORING,
  ...PROHIBITED_PREDICTIVE_POLICING,
  ...PROHIBITED_FACIAL_SCRAPING,
  ...PROHIBITED_EMOTION_WORKPLACE,
  ...PROHIBITED_BIOMETRIC_CATEGORIZATION,
  ...PROHIBITED_REALTIME_BIOMETRIC,
];

const HIGH_RISK_KEYWORDS = [
  // Biometrics
  'biometric', 'biometrisch', 'facial recognition', 'gesichtserkennung',
  'fingerprint', 'fingerabdruck', 'iris scan', 'voice recognition', 'stimmerkennung',

  // Critical Infrastructure
  'critical infrastructure', 'kritische infrastruktur', 'energy grid', 'stromnetz',
  'water supply', 'wasserversorgung', 'traffic management', 'verkehrssteuerung',

  // Education & Employment - HR/Recruitment (Anhang III Nr. 4)
  'educational assessment', 'bildungsbewertung', 'exam scoring', 'prüfungsbewertung',
  'recruitment', 'einstellung', 'hiring decision', 'einstellungsentscheidung',
  'employee monitoring', 'mitarbeiterüberwachung', 'performance evaluation', 'leistungsbewertung',
  // Additional HR keywords
  'bewerbung', 'bewerbungen', 'bewerber', 'bewerberin', 'bewerberinnen',
  'lebenslauf', 'lebensläufe', 'cv', 'resume', 'résumé',
  'personalauswahl', 'personalentscheidung', 'hr screening', 'screening tool',
  'applicant', 'applicants', 'candidate', 'kandidat', 'kandidaten',
  'job application', 'stellenbewerbung', 'bewerbungsverfahren',
  'applicant tracking', 'bewerbermanagement', 'talent acquisition',
  'ranking', 'bewerberranking', 'kandidatenranking',
  'hiring', 'einstellungsprozess', 'recruiting', 'rekrutierung',
  'human resources', 'personalwesen', 'hr-system', 'hr system',
  'qualifikation', 'qualifikationen', 'berufserfahrung', 'soft skills',

  // Essential Services
  'credit scoring', 'kreditbewertung', 'loan decision', 'kreditentscheidung',
  'insurance pricing', 'versicherungspreis', 'healthcare diagnosis', 'medizinische diagnose',

  // Law Enforcement & Justice
  'law enforcement', 'strafverfolgung', 'criminal justice', 'strafjustiz',
  'recidivism', 'rückfallprognose', 'evidence evaluation', 'beweisbewertung',

  // Migration & Border
  'migration', 'border control', 'grenzkontrolle', 'asylum', 'asyl',
  'visa assessment', 'visumprüfung',

  // Safety Components
  'medical device', 'medizinprodukt', 'safety component', 'sicherheitskomponente',
  'autonomous vehicle', 'autonomes fahrzeug', 'robot', 'roboter',
];

const LIMITED_RISK_KEYWORDS = [
  'chatbot', 'chat bot', 'conversational ai', 'konversations-ki',
  'virtual assistant', 'virtueller assistent', 'customer service bot',
  'emotion detection', 'emotionserkennung',
  'deepfake', 'synthetic media', 'synthetische medien',
  'ai-generated', 'ki-generiert', 'content generation', 'inhaltsgenerierung',
  'recommendation system', 'empfehlungssystem',
];

const TRANSPARENCY_KEYWORDS = [
  'automated decision', 'automatisierte entscheidung',
  'profiling', 'profilierung',
  'personalization', 'personalisierung',
];

// AI-related keywords to detect if a page is about AI systems
const AI_CONTEXT_KEYWORDS = [
  'artificial intelligence', 'künstliche intelligenz', 'ki', 'ai',
  'machine learning', 'maschinelles lernen', 'deep learning',
  'neural network', 'neuronales netzwerk',
  'natural language processing', 'nlp',
  'computer vision', 'bildverarbeitung',
  'automation', 'automatisierung',
  'algorithm', 'algorithmus',
  'data processing', 'datenverarbeitung',
  'predictive', 'vorhersage',
];

// Fetch and extract text from URL
async function fetchUrlContent(url: string): Promise<{ text: string; title: string; metaDescription: string }> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Nur HTTP und HTTPS URLs werden unterstützt');
    }

    // Fetch with timeout and headers
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'EU-AI-Act-Scanner/1.0 (Compliance Analysis Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de,en;q=0.9',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content elements
    $('script, style, nav, footer, header, aside, noscript, iframe, svg').remove();

    // Extract title
    const title = $('title').text().trim() ||
                  $('h1').first().text().trim() ||
                  '';

    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') ||
                            $('meta[property="og:description"]').attr('content') ||
                            '';

    // Extract main content
    const mainContent = $('main, article, .content, .main, #content, #main').text();
    const bodyText = mainContent || $('body').text();

    // Clean up text
    const text = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 50000); // Limit to prevent memory issues

    return { text, title, metaDescription };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Zeitüberschreitung beim Laden der URL');
      }
      if (error.response?.status === 403) {
        throw new Error('Zugriff auf URL verweigert (403)');
      }
      if (error.response?.status === 404) {
        throw new Error('Seite nicht gefunden (404)');
      }
      throw new Error(`Fehler beim Laden der URL: ${error.message}`);
    }
    throw error;
  }
}

// Detailed prohibited practice detection
interface ProhibitedPracticeMatch {
  category: string;
  article: string;
  keywords: string[];
  description: string;
}

function detectProhibitedPractices(text: string): ProhibitedPracticeMatch[] {
  const lowerText = text.toLowerCase();
  const detected: ProhibitedPracticeMatch[] = [];

  const subliminalMatches = PROHIBITED_SUBLIMINAL.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (subliminalMatches.length > 0) {
    detected.push({
      category: 'Unterschwellige Manipulation',
      article: 'Art. 5(1)(a)',
      keywords: subliminalMatches,
      description: 'KI-Systeme, die unterschwellige Techniken einsetzen, um das Verhalten von Personen in einer Weise wesentlich zu beeinflussen, die physischen oder psychischen Schaden verursachen kann.',
    });
  }

  const vulnerableMatches = PROHIBITED_VULNERABLE_EXPLOITATION.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (vulnerableMatches.length > 0) {
    detected.push({
      category: 'Ausnutzung Schutzbedürftiger',
      article: 'Art. 5(1)(b)',
      keywords: vulnerableMatches,
      description: 'KI-Systeme, die Schwächen aufgrund von Alter, Behinderung oder sozialer/wirtschaftlicher Situation ausnutzen, um das Verhalten wesentlich zu beeinflussen.',
    });
  }

  const socialScoringMatches = PROHIBITED_SOCIAL_SCORING.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (socialScoringMatches.length > 0) {
    detected.push({
      category: 'Social Scoring',
      article: 'Art. 5(1)(c)',
      keywords: socialScoringMatches,
      description: 'KI-Systeme für Social Scoring durch Behörden, die zu nachteiliger Behandlung von Personen führen können.',
    });
  }

  const predictiveMatches = PROHIBITED_PREDICTIVE_POLICING.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (predictiveMatches.length > 0) {
    detected.push({
      category: 'Prädiktive Polizeiarbeit auf Einzelpersonen',
      article: 'Art. 5(1)(d)',
      keywords: predictiveMatches,
      description: 'KI-Systeme zur Vorhersage von Straftaten einer Einzelperson allein auf Basis von Profiling oder Persönlichkeitsmerkmalen.',
    });
  }

  const scrapingMatches = PROHIBITED_FACIAL_SCRAPING.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (scrapingMatches.length > 0) {
    detected.push({
      category: 'Ungezieltes Gesichtsbilder-Scraping',
      article: 'Art. 5(1)(e)',
      keywords: scrapingMatches,
      description: 'KI-Systeme zum ungezielten Auslesen von Gesichtsbildern aus dem Internet oder Überwachungsaufnahmen zur Erstellung von Gesichtserkennungsdatenbanken.',
    });
  }

  const emotionWorkMatches = PROHIBITED_EMOTION_WORKPLACE.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (emotionWorkMatches.length > 0) {
    detected.push({
      category: 'Emotionserkennung am Arbeitsplatz/Schule',
      article: 'Art. 5(1)(f)',
      keywords: emotionWorkMatches,
      description: 'KI-Systeme zur Ableitung von Emotionen am Arbeitsplatz oder in Bildungseinrichtungen (außer für medizinische oder Sicherheitszwecke).',
    });
  }

  const biometricCatMatches = PROHIBITED_BIOMETRIC_CATEGORIZATION.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (biometricCatMatches.length > 0) {
    detected.push({
      category: 'Biometrische Kategorisierung nach sensiblen Merkmalen',
      article: 'Art. 5(1)(g)',
      keywords: biometricCatMatches,
      description: 'KI-Systeme zur biometrischen Kategorisierung von Personen nach Rasse, politischer Meinung, Gewerkschaftszugehörigkeit, Religion, sexueller Orientierung.',
    });
  }

  const realtimeBioMatches = PROHIBITED_REALTIME_BIOMETRIC.filter(kw => lowerText.includes(kw.toLowerCase()));
  if (realtimeBioMatches.length > 0) {
    detected.push({
      category: 'Echtzeit-Biometrie im öffentlichen Raum',
      article: 'Art. 5(1)(h)',
      keywords: realtimeBioMatches,
      description: 'Echtzeit-Fernidentifizierungssysteme in öffentlich zugänglichen Räumen für Strafverfolgungszwecke (mit eng begrenzten Ausnahmen).',
    });
  }

  return detected;
}

// Analyze text for risk indicators
function analyzeText(text: string): {
  prohibitedMatches: string[];
  prohibitedPractices: ProhibitedPracticeMatch[];
  highRiskMatches: string[];
  limitedRiskMatches: string[];
  transparencyMatches: string[];
  aiContextMatches: string[];
} {
  const lowerText = text.toLowerCase();

  const prohibitedMatches = PROHIBITED_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const prohibitedPractices = detectProhibitedPractices(text);
  const highRiskMatches = HIGH_RISK_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const limitedRiskMatches = LIMITED_RISK_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const transparencyMatches = TRANSPARENCY_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const aiContextMatches = AI_CONTEXT_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));

  return { prohibitedMatches, prohibitedPractices, highRiskMatches, limitedRiskMatches, transparencyMatches, aiContextMatches };
}

// Determine risk level based on matches
function determineRiskLevel(matches: ReturnType<typeof analyzeText>): RiskLevel {
  if (matches.prohibitedMatches.length > 0) {
    return 'PROHIBITED';
  }
  if (matches.highRiskMatches.length >= 2) {
    return 'HIGH_RISK';
  }
  if (matches.highRiskMatches.length === 1) {
    return 'HIGH_RISK'; // Even one high-risk indicator suggests caution
  }
  if (matches.limitedRiskMatches.length > 0 || matches.transparencyMatches.length > 0) {
    return 'LIMITED_RISK';
  }
  return 'MINIMAL_RISK';
}

// Calculate risk score (0-100)
function calculateRiskScore(matches: ReturnType<typeof analyzeText>, riskLevel: RiskLevel): number {
  let score = 0;

  // Base score by risk level
  switch (riskLevel) {
    case 'PROHIBITED': score = 95; break;
    case 'HIGH_RISK': score = 70; break;
    case 'LIMITED_RISK': score = 40; break;
    case 'MINIMAL_RISK': score = 15; break;
    default: score = 50;
  }

  // Adjust based on number of matches
  score += matches.prohibitedMatches.length * 5;
  score += matches.highRiskMatches.length * 3;
  score += matches.limitedRiskMatches.length * 1;

  return Math.min(100, Math.max(0, score));
}

// Generate findings based on analysis
function generateFindings(matches: ReturnType<typeof analyzeText>, riskLevel: RiskLevel, isUrlScan: boolean, pageTitle?: string): ScanFinding[] {
  const findings: ScanFinding[] = [];

  // Add URL scan info if applicable
  if (isUrlScan && pageTitle) {
    findings.push({
      category: 'Scan-Information',
      title: `Webseite analysiert: ${pageTitle.substring(0, 100)}`,
      severity: 'info',
      description: `Der Inhalt der Webseite wurde erfolgreich extrahiert und analysiert.`,
      recommendation: 'Prüfen Sie, ob alle relevanten Seiten des Systems gescannt wurden.',
      articleReference: '',
    });
  }

  // Check if page is about AI
  if (isUrlScan && matches.aiContextMatches.length === 0) {
    findings.push({
      category: 'Hinweis',
      title: 'Kein KI-Bezug erkannt',
      severity: 'info',
      description: 'Auf dieser Seite wurden keine expliziten Hinweise auf KI-Systeme gefunden. Dies könnte bedeuten, dass die Seite nicht KI-bezogen ist oder die KI-Funktionalität nicht beschrieben wird.',
      recommendation: 'Überprüfen Sie, ob die richtige Seite gescannt wurde. Versuchen Sie ggf. eine Produktbeschreibungs- oder Feature-Seite.',
      articleReference: '',
    });
  }

  // Prohibited findings - detailed per practice type
  if (matches.prohibitedPractices && matches.prohibitedPractices.length > 0) {
    // Add overall warning
    findings.push({
      category: '⛔ VERBOTENE KI-PRAKTIKEN',
      title: `${matches.prohibitedPractices.length} verbotene Praktik(en) nach Art. 5 EU AI Act erkannt`,
      severity: 'critical',
      description: `ACHTUNG: Dieses System weist Merkmale von ${matches.prohibitedPractices.length} verbotenen KI-Praktiken auf. Der Betrieb in der EU ist NICHT ZULÄSSIG.`,
      recommendation: 'SOFORTIGE MASSNAHMEN: 1) Entwicklung/Betrieb stoppen, 2) Rechtliche Beratung einholen, 3) Alternative Ansätze evaluieren, 4) Dokumentation für Behörden vorbereiten.',
      articleReference: 'Art. 5 EU AI Act',
    });

    // Add detailed finding for each prohibited practice
    for (const practice of matches.prohibitedPractices) {
      findings.push({
        category: `⛔ ${practice.category}`,
        title: `Verboten: ${practice.category} (${practice.article})`,
        severity: 'critical',
        description: `${practice.description}\n\nErkannte Indikatoren: ${practice.keywords.slice(0, 5).join(', ')}${practice.keywords.length > 5 ? '...' : ''}`,
        recommendation: `Diese Praktik ist nach ${practice.article} EU AI Act verboten. Der Einsatz dieses Systems in der EU ist in dieser Form untersagt. Prüfen Sie alternative Ansätze ohne verbotene Funktionen.`,
        articleReference: practice.article,
      });
    }
  } else if (matches.prohibitedMatches.length > 0) {
    // Fallback for backward compatibility
    findings.push({
      category: 'Verbotene KI-Praktiken',
      title: 'Potenziell verbotene KI-Anwendung erkannt',
      severity: 'critical',
      description: `Folgende Indikatoren für verbotene KI-Praktiken wurden gefunden: ${matches.prohibitedMatches.join(', ')}. Diese Anwendungen sind nach Artikel 5 EU AI Act untersagt.`,
      recommendation: 'Sofortige rechtliche Prüfung erforderlich. Das System darf in dieser Form nicht in der EU betrieben werden.',
      articleReference: 'Art. 5 EU AI Act',
    });
  }

  // High-risk findings
  if (matches.highRiskMatches.length > 0) {
    findings.push({
      category: 'Hochrisiko-KI-System',
      title: 'Hochrisiko-Klassifizierung wahrscheinlich',
      severity: 'high',
      description: `Das System weist Merkmale eines Hochrisiko-KI-Systems auf: ${matches.highRiskMatches.join(', ')}. Diese unterliegen strengen Anforderungen nach Anhang III EU AI Act.`,
      recommendation: 'Vollständige Konformitätsbewertung durchführen. Risikomanagement, Datenqualität, technische Dokumentation und menschliche Aufsicht sicherstellen.',
      articleReference: 'Art. 6, Anhang III EU AI Act',
    });

    // Specific high-risk findings
    if (matches.highRiskMatches.some(m => m.includes('biometric') || m.includes('biometrisch'))) {
      findings.push({
        category: 'Biometrische Daten',
        title: 'Verarbeitung biometrischer Daten',
        severity: 'high',
        description: 'Das System verarbeitet biometrische Daten. Dies erfordert besondere Schutzmaßnahmen und kann unter bestimmten Umständen verboten sein.',
        recommendation: 'DSGVO Art. 9 beachten. Einwilligung oder andere Rechtsgrundlage sicherstellen. Bei Echtzeit-Fernidentifikation: Prüfung auf Verbot nach Art. 5.',
        articleReference: 'Art. 5(1)(d), Art. 26 EU AI Act',
      });
    }

    // HR/Employment/Recruitment detection - Anhang III Nr. 4
    const hrKeywords = [
      'employment', 'recruitment', 'einstellung', 'hiring', 'rekrutierung',
      'bewerbung', 'bewerber', 'lebenslauf', 'cv', 'resume',
      'personalauswahl', 'hr', 'human resources', 'personalwesen',
      'applicant', 'candidate', 'kandidat', 'ranking', 'screening',
      'qualifikation', 'berufserfahrung', 'soft skills'
    ];
    if (matches.highRiskMatches.some(m => hrKeywords.some(kw => m.includes(kw)))) {
      findings.push({
        category: 'Beschäftigung & Personalwesen',
        title: 'Hochrisiko: KI im Beschäftigungs-/Rekrutierungskontext',
        severity: 'critical',
        description: 'Das System wird für Personalentscheidungen eingesetzt (z.B. Bewerbungs-Screening, CV-Analyse, Bewerber-Ranking). Dies ist ein HOCHRISIKO-Bereich nach Anhang III Nr. 4 EU AI Act. KI-Systeme zur Einstellung, Auswahl oder Bewertung von Bewerbern unterliegen strengen Anforderungen.',
        recommendation: 'PFLICHTEN: 1) Risikomanagement-System implementieren, 2) Diskriminierungsfreiheit nachweisen, 3) Transparenz gegenüber Bewerbern, 4) Menschliche Aufsicht bei allen Entscheidungen, 5) Technische Dokumentation erstellen, 6) Konformitätsbewertung vor Inbetriebnahme.',
        articleReference: 'Anhang III Nr. 4, Art. 6, Art. 9-15 EU AI Act',
      });
    }

    if (matches.highRiskMatches.some(m => m.includes('credit') || m.includes('kredit') || m.includes('insurance') || m.includes('versicherung'))) {
      findings.push({
        category: 'Finanzdienstleistungen',
        title: 'KI bei Finanzentscheidungen',
        severity: 'high',
        description: 'Das System wird für Kredit- oder Versicherungsentscheidungen eingesetzt. Dies ist ein Hochrisiko-Bereich nach Anhang III Nr. 5.',
        recommendation: 'Erklärbarkeit der Entscheidungen sicherstellen. Diskriminierungsfreie Algorithmen nachweisen. Verbraucherrechte beachten.',
        articleReference: 'Anhang III Nr. 5 EU AI Act',
      });
    }
  }

  // Limited risk findings
  if (matches.limitedRiskMatches.length > 0) {
    findings.push({
      category: 'Transparenzpflichten',
      title: 'Transparenzanforderungen beachten',
      severity: 'medium',
      description: `Für folgende Funktionen gelten Transparenzpflichten: ${matches.limitedRiskMatches.join(', ')}.`,
      recommendation: 'Nutzer müssen informiert werden, dass sie mit einem KI-System interagieren. Bei synthetischen Inhalten: Kennzeichnungspflicht beachten.',
      articleReference: 'Art. 50 EU AI Act',
    });

    if (matches.limitedRiskMatches.some(m => m.includes('chatbot') || m.includes('assistant'))) {
      findings.push({
        category: 'Chatbot/Assistent',
        title: 'KI-Interaktion kennzeichnen',
        severity: 'medium',
        description: 'Bei Chatbots und virtuellen Assistenten muss der Nutzer wissen, dass er mit einer KI kommuniziert.',
        recommendation: 'Deutliche Kennzeichnung am Beginn der Interaktion. Möglichkeit zur Kontaktaufnahme mit einem Menschen anbieten.',
        articleReference: 'Art. 50(1) EU AI Act',
      });
    }

    if (matches.limitedRiskMatches.some(m => m.includes('deepfake') || m.includes('synthetic') || m.includes('generated'))) {
      findings.push({
        category: 'Synthetische Inhalte',
        title: 'KI-generierte Inhalte kennzeichnen',
        severity: 'medium',
        description: 'KI-generierte oder manipulierte Inhalte (Audio, Video, Bilder, Text) müssen als solche gekennzeichnet werden.',
        recommendation: 'Maschinenlesbare Kennzeichnung implementieren. Sichtbare Hinweise für Nutzer anbringen.',
        articleReference: 'Art. 50(4) EU AI Act',
      });
    }
  }

  // General compliance findings
  if (riskLevel !== 'MINIMAL_RISK') {
    findings.push({
      category: 'Allgemeine Anforderungen',
      title: 'Dokumentationspflichten',
      severity: 'low',
      description: 'Unabhängig von der Risikoklasse sollte eine grundlegende Dokumentation des KI-Systems vorhanden sein.',
      recommendation: 'Technische Dokumentation erstellen. Zweckbestimmung definieren. Verantwortlichkeiten festlegen.',
      articleReference: 'Art. 11, Anhang IV EU AI Act',
    });
  }

  // Add positive finding for minimal risk
  if (riskLevel === 'MINIMAL_RISK' && findings.filter(f => f.severity !== 'info').length === 0) {
    findings.push({
      category: 'Risikoklassifizierung',
      title: 'Minimales Risiko identifiziert',
      severity: 'info',
      description: 'Basierend auf der Analyse scheint das System ein minimales Risiko darzustellen. Es unterliegt keinen spezifischen Anforderungen des EU AI Act.',
      recommendation: 'Freiwillige Verhaltenskodizes nach Art. 95 in Betracht ziehen. Best Practices für KI-Ethik befolgen.',
      articleReference: 'Art. 95 EU AI Act',
    });
  }

  return findings;
}

// Generate summary text
function generateSummary(riskLevel: RiskLevel, findings: ScanFinding[], isUrlScan: boolean): string {
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;

  let summary = isUrlScan ? 'Der Inhalt der Webseite wurde analysiert. ' : '';

  switch (riskLevel) {
    case 'PROHIBITED':
      summary += `ACHTUNG: Das System weist Merkmale auf, die nach dem EU AI Act verboten sind. `;
      summary += `${criticalCount} kritische Befunde erfordern sofortige Maßnahmen. `;
      summary += `Der Betrieb dieses Systems in der EU ist in der aktuellen Form nicht zulässig.`;
      break;
    case 'HIGH_RISK':
      summary += `Das System wird als Hochrisiko-KI-System eingestuft. `;
      summary += `${highCount} Hochrisiko-Befunde und ${mediumCount} mittlere Befunde wurden identifiziert. `;
      summary += `Vor Inbetriebnahme ist eine vollständige Konformitätsbewertung nach Kapitel 3 EU AI Act erforderlich.`;
      break;
    case 'LIMITED_RISK':
      summary += `Das System unterliegt Transparenzpflichten nach Art. 50 EU AI Act. `;
      summary += `${mediumCount} Befunde weisen auf Handlungsbedarf hin. `;
      summary += `Hauptsächlich sind Informationspflichten gegenüber Nutzern zu beachten.`;
      break;
    case 'MINIMAL_RISK':
      summary += `Das System scheint ein minimales Risiko darzustellen. `;
      summary += `Es unterliegt keinen spezifischen Anforderungen des EU AI Act. `;
      summary += `Freiwillige Verhaltenskodizes und ethische Grundsätze werden empfohlen.`;
      break;
    default:
      summary += `Die Risikoklassifizierung konnte nicht eindeutig bestimmt werden. `;
      summary += `Eine manuelle Prüfung wird empfohlen.`;
  }

  return summary;
}

// Generate next steps
function generateNextSteps(riskLevel: RiskLevel): string[] {
  const steps: string[] = [];

  switch (riskLevel) {
    case 'PROHIBITED':
      steps.push('Sofortige Einstellung der Entwicklung/des Betriebs prüfen');
      steps.push('Rechtliche Beratung einholen');
      steps.push('Alternative Ansätze ohne verbotene Praktiken evaluieren');
      steps.push('Dokumentation für Behörden vorbereiten');
      break;
    case 'HIGH_RISK':
      steps.push('Risikomanagement-System implementieren (Art. 9)');
      steps.push('Datenqualitäts-Anforderungen sicherstellen (Art. 10)');
      steps.push('Technische Dokumentation erstellen (Art. 11)');
      steps.push('Aufzeichnungspflichten einrichten (Art. 12)');
      steps.push('Transparenz-Informationen bereitstellen (Art. 13)');
      steps.push('Menschliche Aufsicht gewährleisten (Art. 14)');
      steps.push('Genauigkeit und Robustheit nachweisen (Art. 15)');
      steps.push('Konformitätsbewertung durchführen (Art. 43)');
      steps.push('EU-Konformitätserklärung erstellen (Art. 47)');
      steps.push('CE-Kennzeichnung anbringen (Art. 48)');
      break;
    case 'LIMITED_RISK':
      steps.push('Transparenz-Hinweise für Nutzer implementieren');
      steps.push('Kennzeichnung von KI-Interaktionen sicherstellen');
      steps.push('Bei synthetischen Inhalten: Maschinenlesbare Markierung');
      steps.push('Nutzerdokumentation aktualisieren');
      break;
    case 'MINIMAL_RISK':
      steps.push('Freiwillige Verhaltenskodizes prüfen (Art. 95)');
      steps.push('Ethische KI-Grundsätze dokumentieren');
      steps.push('Regelmäßige Überprüfung der Risikoklassifizierung planen');
      break;
  }

  steps.push('Regelmäßige Compliance-Überprüfung einplanen');
  steps.push('Schulung der Mitarbeiter zu EU AI Act');

  return steps;
}

// Keyword-based analysis (fallback when GPT is not available)
function analyzeWithKeywords(
  textToAnalyze: string,
  isUrlScan: boolean,
  pageTitle?: string
): ScanAnalysis {
  const matches = analyzeText(textToAnalyze);
  const riskLevel = determineRiskLevel(matches);
  const riskScore = calculateRiskScore(matches, riskLevel);
  const findings = generateFindings(matches, riskLevel, isUrlScan, pageTitle);
  const summary = generateSummary(riskLevel, findings, isUrlScan);
  const nextSteps = generateNextSteps(riskLevel);

  // Collect detected features
  const detectedFeatures: string[] = [
    ...matches.prohibitedMatches,
    ...matches.highRiskMatches,
    ...matches.limitedRiskMatches,
  ];

  // Add AI context if detected
  if (matches.aiContextMatches.length > 0) {
    detectedFeatures.push(...matches.aiContextMatches.slice(0, 5));
  }

  // Identify compliance gaps
  const complianceGaps: string[] = [];
  if (riskLevel === 'HIGH_RISK') {
    complianceGaps.push('Konformitätsbewertung ausstehend');
    complianceGaps.push('Risikomanagement-System erforderlich');
    complianceGaps.push('Technische Dokumentation erforderlich');
  }
  if (riskLevel === 'LIMITED_RISK' || riskLevel === 'HIGH_RISK') {
    complianceGaps.push('Transparenzpflichten prüfen');
  }

  // Add info about analysis method
  findings.unshift({
    category: 'Analyse-Information',
    title: 'Keyword-basierte Analyse',
    severity: 'info',
    description: 'Diese Analyse wurde mit regelbasiertem Keyword-Matching durchgeführt. Für eine KI-gestützte Tiefenanalyse kann Ollama lokal konfiguriert werden.',
    recommendation: 'Für präzisere Ergebnisse: Ollama installieren und das EU AI Act Modell mit backend/ollama/setup.sh einrichten.',
    articleReference: '',
  });

  return {
    riskLevel,
    riskScore,
    findings,
    summary,
    detectedFeatures: [...new Set(detectedFeatures)],
    complianceGaps,
    nextSteps,
  };
}

// Convert detected AI features to findings
function featuresToFindings(features: DetectedAIFeature[]): ScanFinding[] {
  return features.map(feature => {
    let severity: ScanFinding['severity'] = 'medium';
    if (feature.type === 'biometric' || feature.type === 'decision') {
      severity = 'high';
    } else if (feature.type === 'chatbot' || feature.type === 'generation') {
      severity = 'medium';
    } else {
      severity = 'low';
    }

    return {
      category: `KI-Feature: ${feature.type}`,
      title: feature.name,
      severity,
      description: `${feature.description}. Gefunden auf: ${feature.location}`,
      recommendation: feature.euAiActRelevance,
      articleReference: feature.riskIndicators.join(', '),
    };
  });
}

// Main analysis function - uses GPT when available, falls back to keywords
export async function analyzeSystem(inputType: 'url' | 'description', inputValue: string): Promise<ScanAnalysis> {
  let textToAnalyze: string;
  let pageTitle: string | undefined;
  let isUrlScan = false;
  let advancedFeatures: DetectedAIFeature[] = [];
  let scrapedPages: string[] = [];

  if (inputType === 'url') {
    isUrlScan = true;
    try {
      // Use advanced multi-page scraping
      console.log('Starting advanced web scrape...');
      const scrapeResult = await advancedWebScrape(inputValue, { maxPages: 5, maxDepth: 2 });

      textToAnalyze = scrapeResult.totalContent;
      pageTitle = `Website-Analyse (${scrapeResult.pagesScraped} Seiten)`;
      advancedFeatures = scrapeResult.detectedFeatures;
      scrapedPages = scrapeResult.scrapedUrls;

      console.log(`Scraped ${scrapeResult.pagesScraped} pages, found ${advancedFeatures.length} AI features`);

      // If no content found, try single page fallback
      if (!textToAnalyze || textToAnalyze.length < 100) {
        const urlContent = await fetchUrlContent(inputValue);
        textToAnalyze = `${urlContent.title} ${urlContent.metaDescription} ${urlContent.text}`;
        pageTitle = urlContent.title;
      }
    } catch (error) {
      // If URL fetch fails, return an error analysis
      return {
        riskLevel: 'UNKNOWN',
        riskScore: 0,
        findings: [{
          category: 'Fehler',
          title: 'URL konnte nicht geladen werden',
          severity: 'info',
          description: error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden der URL',
          recommendation: 'Überprüfen Sie die URL und versuchen Sie es erneut. Stellen Sie sicher, dass die Seite öffentlich zugänglich ist.',
          articleReference: '',
        }],
        summary: `Die URL konnte nicht analysiert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        detectedFeatures: [],
        complianceGaps: [],
        nextSteps: ['URL-Zugriff prüfen', 'Alternative Eingabemethode nutzen (Beschreibung)'],
      };
    }
  } else {
    textToAnalyze = inputValue;
  }

  // Try GPT analysis first if available
  if (isGPTAvailable()) {
    try {
      console.log('Using GPT-powered analysis...');
      const gptResult = await analyzeWithGPT(inputType, textToAnalyze, pageTitle);
      return gptResult;
    } catch (error) {
      console.error('GPT analysis failed:', error);
      // Fall through to try Ollama or keyword analysis
    }
  }

  // Try Ollama analysis if available
  if (await isOllamaAvailable()) {
    try {
      console.log('Using Ollama local analysis...');
      const ollamaResult = await analyzeWithOllama(inputType, textToAnalyze, pageTitle);
      // Merge with advanced features if available
      if (advancedFeatures.length > 0) {
        const featureFindings = featuresToFindings(advancedFeatures);
        ollamaResult.findings = [...featureFindings, ...ollamaResult.findings];
        ollamaResult.detectedFeatures = [
          ...advancedFeatures.map(f => f.name),
          ...ollamaResult.detectedFeatures,
        ];
      }
      return ollamaResult;
    } catch (error) {
      console.error('Ollama analysis failed:', error);
      // Fall through to keyword analysis
    }
  }

  // Fallback to keyword-based analysis
  console.log('Using keyword-based analysis...');
  const keywordResult = analyzeWithKeywords(textToAnalyze, isUrlScan, pageTitle);

  // Merge with advanced features from web scraping
  if (advancedFeatures.length > 0) {
    const featureFindings = featuresToFindings(advancedFeatures);

    // Add scraped pages info
    if (scrapedPages.length > 1) {
      featureFindings.unshift({
        category: 'Multi-Page-Analyse',
        title: `${scrapedPages.length} Seiten analysiert`,
        severity: 'info',
        description: `Folgende Seiten wurden untersucht: ${scrapedPages.slice(0, 5).join(', ')}${scrapedPages.length > 5 ? ` und ${scrapedPages.length - 5} weitere` : ''}`,
        recommendation: 'Die Analyse basiert auf mehreren Unterseiten der Website.',
        articleReference: '',
      });
    }

    // Merge findings - advanced features first
    keywordResult.findings = [...featureFindings, ...keywordResult.findings];

    // Add advanced feature names to detected features
    keywordResult.detectedFeatures = [
      ...advancedFeatures.map(f => f.name),
      ...keywordResult.detectedFeatures,
    ];

    // Update summary to include feature count
    if (advancedFeatures.length > 0) {
      keywordResult.summary = `${advancedFeatures.length} KI-Feature(s) erkannt. ` + keywordResult.summary;
    }

    // Adjust risk level based on advanced features
    const hasBiometric = advancedFeatures.some(f => f.type === 'biometric');
    const hasDecision = advancedFeatures.some(f => f.type === 'decision');
    if ((hasBiometric || hasDecision) && keywordResult.riskLevel === 'MINIMAL_RISK') {
      keywordResult.riskLevel = 'HIGH_RISK';
      keywordResult.riskScore = Math.max(keywordResult.riskScore, 70);
    }
  }

  return keywordResult;
}

// Risk level display helpers
export const RISK_LEVEL_INFO = {
  PROHIBITED: {
    label: 'Verboten',
    color: 'red',
    bgColor: 'bg-red-600',
    description: 'Dieses System ist nach Art. 5 EU AI Act verboten.',
  },
  HIGH_RISK: {
    label: 'Hochrisiko',
    color: 'orange',
    bgColor: 'bg-orange-500',
    description: 'Dieses System unterliegt strengen Anforderungen.',
  },
  LIMITED_RISK: {
    label: 'Begrenztes Risiko',
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    description: 'Transparenzpflichten sind zu beachten.',
  },
  MINIMAL_RISK: {
    label: 'Minimales Risiko',
    color: 'green',
    bgColor: 'bg-green-500',
    description: 'Keine spezifischen Anforderungen.',
  },
  UNKNOWN: {
    label: 'Unbekannt',
    color: 'gray',
    bgColor: 'bg-gray-500',
    description: 'Risikoklassifizierung nicht möglich.',
  },
};
