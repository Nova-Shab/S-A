import axios from 'axios';
import * as cheerio from 'cheerio';
import { RiskLevel, ScanFinding, ScanAnalysis } from '../models/ScanResult';
import { analyzeWithGPT, isGPTAvailable } from './gptAnalysis';
import { analyzeWithOllama, isOllamaAvailable } from './ollamaAnalysis';
import { advancedWebScrape, DetectedAIFeature } from './advancedWebScraper';

// Keywords and patterns for detecting AI system characteristics
const PROHIBITED_KEYWORDS = [
  'social scoring', 'soziales bewertungssystem', 'social credit',
  'subliminal', 'unterschwellig', 'manipulation',
  'exploitation', 'ausbeutung', 'vulnerable groups', 'schutzbedürftige',
  'real-time biometric', 'echtzeit-biometrisch', 'mass surveillance', 'massenüberwachung',
  'emotion recognition workplace', 'emotionserkennung arbeitsplatz',
  'predictive policing individual', 'vorhersagende polizeiarbeit',
];

const HIGH_RISK_KEYWORDS = [
  // Biometrics
  'biometric', 'biometrisch', 'facial recognition', 'gesichtserkennung',
  'fingerprint', 'fingerabdruck', 'iris scan', 'voice recognition', 'stimmerkennung',

  // Critical Infrastructure
  'critical infrastructure', 'kritische infrastruktur', 'energy grid', 'stromnetz',
  'water supply', 'wasserversorgung', 'traffic management', 'verkehrssteuerung',

  // Education & Employment
  'educational assessment', 'bildungsbewertung', 'exam scoring', 'prüfungsbewertung',
  'recruitment', 'einstellung', 'hiring decision', 'einstellungsentscheidung',
  'employee monitoring', 'mitarbeiterüberwachung', 'performance evaluation', 'leistungsbewertung',

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

// Analyze text for risk indicators
function analyzeText(text: string): {
  prohibitedMatches: string[];
  highRiskMatches: string[];
  limitedRiskMatches: string[];
  transparencyMatches: string[];
  aiContextMatches: string[];
} {
  const lowerText = text.toLowerCase();

  const prohibitedMatches = PROHIBITED_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const highRiskMatches = HIGH_RISK_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const limitedRiskMatches = LIMITED_RISK_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const transparencyMatches = TRANSPARENCY_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
  const aiContextMatches = AI_CONTEXT_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));

  return { prohibitedMatches, highRiskMatches, limitedRiskMatches, transparencyMatches, aiContextMatches };
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

  // Prohibited findings
  if (matches.prohibitedMatches.length > 0) {
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

    if (matches.highRiskMatches.some(m => m.includes('employment') || m.includes('recruitment') || m.includes('einstellung'))) {
      findings.push({
        category: 'Beschäftigung',
        title: 'KI im Beschäftigungskontext',
        severity: 'high',
        description: 'Das System wird im Beschäftigungskontext eingesetzt. Dies ist ein Hochrisiko-Bereich nach Anhang III Nr. 4.',
        recommendation: 'Transparenz gegenüber Bewerbern/Mitarbeitern sicherstellen. Diskriminierungsfreiheit nachweisen. Menschliche Aufsicht bei Entscheidungen gewährleisten.',
        articleReference: 'Anhang III Nr. 4 EU AI Act',
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
    description: 'Diese Analyse wurde mit Keyword-Matching durchgeführt. Für eine tiefgehendere Analyse konfigurieren Sie einen OpenAI API-Key.',
    recommendation: 'Erwägen Sie die Aktivierung der GPT-gestützten Analyse für präzisere Ergebnisse.',
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
