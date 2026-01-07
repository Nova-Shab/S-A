import { AiSystemInfo, RiskClass, AnnexIIICategory, EuAiActRole } from "../models/types";

/**
 * V-01: Risikoklassen-Vorschlag basierend auf partiellen Eingaben
 * Zeigt frühzeitig eine Einschätzung der wahrscheinlichen Risikoklasse
 */
export interface RiskSuggestion {
  suggestedRisk: RiskClass | null;
  confidence: "low" | "medium" | "high";
  reasons: string[];
  warnings: string[];
}

export function suggestRiskClass(
  annexIIICategories: AnnexIIICategory[],
  euAiActRole: EuAiActRole | "",
  primaryPurpose: string,
  biometricOrSurveillance?: boolean
): RiskSuggestion {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let suggestedRisk: RiskClass | null = null;
  let confidence: "low" | "medium" | "high" = "low";

  // Keine Kategorien ausgewählt
  if (annexIIICategories.length === 0) {
    return {
      suggestedRisk: null,
      confidence: "low",
      reasons: ["Wählen Sie Kategorien aus für eine Risikoeinschätzung"],
      warnings: [],
    };
  }

  // Hochrisiko-Kategorien nach Anhang III
  const highRiskCategories: AnnexIIICategory[] = [
    "BIOMETRIC_IDENTIFICATION",
    "CRITICAL_INFRASTRUCTURE",
    "EDUCATION_VOCATIONAL",
    "EMPLOYMENT_HR",
    "ESSENTIAL_SERVICES",
    "LAW_ENFORCEMENT",
    "MIGRATION_ASYLUM",
    "JUSTICE_DEMOCRACY",
  ];

  const selectedHighRisk = annexIIICategories.filter((cat) =>
    highRiskCategories.includes(cat)
  );

  // Prüfe auf verbotene Praktiken (alle 8 Kategorien nach Art. 5)
  const purposeLower = primaryPurpose.toLowerCase();

  // All prohibited keyword arrays combined for checking
  const allProhibitedKeywords = [
    // Art. 5(1)(a) - Subliminal
    "subliminal", "unterschwellig", "subliminal manipulation",
    // Art. 5(1)(b) - Vulnerable exploitation
    "exploit vulnerable", "ausnutzung schutzbedürftig", "target children",
    "dark patterns", "dunkle muster", "predatory targeting",
    // Art. 5(1)(c) - Social scoring
    "social scoring", "soziales bewertungssystem", "social credit", "citizen scoring",
    // Art. 5(1)(d) - Predictive policing
    "predictive policing", "vorhersagende polizeiarbeit", "pre-crime", "precrime",
    "crime prediction", "kriminalitätsprognose",
    // Art. 5(1)(e) - Facial scraping
    "facial scraping", "face scraping", "clearview", "gesichtsbilder scraping",
    // Art. 5(1)(f) - Emotion at work/school
    "emotion recognition workplace", "emotionserkennung arbeitsplatz",
    "emotion recognition school", "emotionserkennung schule",
    "employee emotion", "mitarbeiter emotion", "student emotion", "schüler emotion",
    // Art. 5(1)(g) - Biometric categorization
    "biometric categorization", "biometrische kategorisierung", "race detection",
    "ethnicity detection", "rassenerkennung",
    // Art. 5(1)(h) - Realtime biometric
    "real-time biometric", "echtzeit-biometrisch", "mass surveillance",
    "massenüberwachung", "live facial recognition",
  ];

  const foundProhibitedKeywords = allProhibitedKeywords.filter(kw => purposeLower.includes(kw));

  if (foundProhibitedKeywords.length > 0) {
    suggestedRisk = "PROHIBITED";
    confidence = "high";
    reasons.push(`Verbotene KI-Praktik erkannt: ${foundProhibitedKeywords.slice(0, 3).join(", ")}`);
    warnings.push("⛔ ACHTUNG: Dieses System ist nach Art. 5 EU AI Act VERBOTEN!");
  }

  // Biometrie + Strafverfolgung = potenziell verboten
  if (
    biometricOrSurveillance &&
    annexIIICategories.includes("LAW_ENFORCEMENT")
  ) {
    suggestedRisk = "PROHIBITED";
    confidence = "high";
    reasons.push("Biometrie in Strafverfolgung ist stark reglementiert");
    warnings.push("Echtzeit-Fernidentifikation im öffentlichen Raum ist grundsätzlich verboten");
  }

  // Hochrisiko-Kategorien
  if (!suggestedRisk && selectedHighRisk.length > 0) {
    suggestedRisk = "HIGH_RISK";
    confidence = selectedHighRisk.length >= 2 ? "high" : "medium";

    const categoryNames: Record<AnnexIIICategory, string> = {
      BIOMETRIC_IDENTIFICATION: "Biometrische Identifizierung",
      CRITICAL_INFRASTRUCTURE: "Kritische Infrastruktur",
      EDUCATION_VOCATIONAL: "Bildung",
      EMPLOYMENT_HR: "Beschäftigung/HR",
      ESSENTIAL_SERVICES: "Wesentliche Dienste",
      LAW_ENFORCEMENT: "Strafverfolgung",
      MIGRATION_ASYLUM: "Migration/Asyl",
      JUSTICE_DEMOCRACY: "Justiz",
      OTHER: "Sonstiges",
    };

    reasons.push(
      `Hochrisiko-Kategorie${selectedHighRisk.length > 1 ? "n" : ""}: ${selectedHighRisk
        .map((c) => categoryNames[c])
        .join(", ")}`
    );

    // Rollenspezifische Hinweise
    if (euAiActRole === "PROVIDER") {
      warnings.push("Als Anbieter tragen Sie die volle Verantwortung für Konformitätsbewertung");
    } else if (euAiActRole === "DEPLOYER") {
      warnings.push("Als Betreiber müssen Sie die Anweisungen des Anbieters befolgen");
    }
  }

  // Nur "Sonstiges" gewählt
  if (!suggestedRisk && annexIIICategories.includes("OTHER") && annexIIICategories.length === 1) {
    // Prüfe auf Limited Risk Indikatoren
    if (
      purposeLower.includes("chatbot") ||
      purposeLower.includes("assistent") ||
      purposeLower.includes("generierung") ||
      purposeLower.includes("deepfake")
    ) {
      suggestedRisk = "LIMITED_RISK";
      confidence = "medium";
      reasons.push("Transparenzpflichtige Anwendung erkannt (z.B. Chatbot, Generierung)");
    } else {
      suggestedRisk = "MINIMAL_RISK";
      confidence = "low";
      reasons.push("Keine Hochrisiko-Kategorie ausgewählt");
      reasons.push("Weitere Details zur Risikobewertung erforderlich");
    }
  }

  // Biometrie erhöht immer das Risiko
  if (biometricOrSurveillance && suggestedRisk !== "PROHIBITED") {
    if (suggestedRisk !== "HIGH_RISK") {
      suggestedRisk = "HIGH_RISK";
    }
    confidence = "high";
    reasons.push("Biometrische Datenverarbeitung ist grundsätzlich Hochrisiko");
  }

  return {
    suggestedRisk,
    confidence,
    reasons,
    warnings,
  };
}

/**
 * Gibt eine Kurzbezeichnung für die Risikoklasse zurück
 */
export function getRiskClassLabel(riskClass: RiskClass): string {
  switch (riskClass) {
    case "PROHIBITED":
      return "Verboten";
    case "HIGH_RISK":
      return "Hochrisiko";
    case "LIMITED_RISK":
      return "Begrenztes Risiko";
    case "MINIMAL_RISK":
      return "Minimales Risiko";
  }
}

/**
 * Gibt die Farbe für die Risikoklasse zurück
 */
export function getRiskClassColor(riskClass: RiskClass): {
  bg: string;
  text: string;
  border: string;
} {
  switch (riskClass) {
    case "PROHIBITED":
      return { bg: "bg-red-100", text: "text-red-800", border: "border-red-500" };
    case "HIGH_RISK":
      return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-500" };
    case "LIMITED_RISK":
      return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-500" };
    case "MINIMAL_RISK":
      return { bg: "bg-green-100", text: "text-green-800", border: "border-green-500" };
  }
}

/**
 * Risikoklassifizierung gemäß EU AI Act
 * Erweitert um Anhang III Kategorien (K-02)
 */
export function classifyRisk(systemInfo: AiSystemInfo): RiskClass {
  // 1. PROHIBITED: Verbotene Systeme (Art. 5)
  if (isProhibited(systemInfo)) {
    return "PROHIBITED";
  }

  // 2. HIGH_RISK: Anhang III Kategorien prüfen
  if (isHighRisk(systemInfo)) {
    return "HIGH_RISK";
  }

  // 3. LIMITED_RISK: Transparenzpflichten
  if (isLimitedRisk(systemInfo)) {
    return "LIMITED_RISK";
  }

  // 4. MINIMAL_RISK: Standard-Fall
  return "MINIMAL_RISK";
}

/**
 * EU AI Act Art. 5 - Verbotene KI-Praktiken (Vollständige Implementierung)
 * 8 Kategorien verbotener Praktiken nach Art. 5(1)(a) bis (h)
 */

// Art. 5(1)(a) - Unterschwellige Manipulation
const PROHIBITED_SUBLIMINAL_KEYWORDS = [
  "subliminal", "unterschwellig", "subliminal manipulation", "unterschwellige manipulation",
  "subliminal techniques", "unterschwellige techniken", "beyond consciousness",
  "unterhalb der bewusstseinsschwelle", "manipulative techniques", "manipulative techniken",
  "covert manipulation", "verdeckte manipulation", "psychological manipulation",
];

// Art. 5(1)(b) - Ausnutzung schutzbedürftiger Gruppen
const PROHIBITED_VULNERABLE_KEYWORDS = [
  "exploit vulnerable", "ausnutzung schutzbedürftig", "exploitation of vulnerabilities",
  "target children", "kinder gezielt", "targeting minors", "minderjährige gezielt",
  "exploit elderly", "ältere ausnutzen", "exploit disabled", "behinderte ausnutzen",
  "exploit mental", "psychisch ausnutzen", "exploit addiction", "sucht ausnutzen",
  "dark patterns", "dunkle muster", "deceptive design", "täuschendes design",
  "predatory targeting", "schutzbedürftige gruppen", "vulnerable persons",
];

// Art. 5(1)(c) - Social Scoring
const PROHIBITED_SOCIAL_SCORING_KEYWORDS = [
  "social scoring", "soziales bewertungssystem", "social credit", "sozialpunkte",
  "citizen scoring", "bürgerbewertung", "citizen rating", "bürger-rating",
  "social rating system", "soziales ratingsystem", "trustworthiness score",
  "vertrauenswürdigkeitsbewertung", "behavioral scoring", "verhaltensbewertung",
  "government scoring", "staatliche bewertung", "citizen reputation",
];

// Art. 5(1)(d) - Prädiktive Polizeiarbeit auf Einzelpersonen
const PROHIBITED_PREDICTIVE_POLICING_KEYWORDS = [
  "predictive policing individual", "vorhersagende polizeiarbeit einzelperson",
  "individual crime prediction", "individuelle kriminalitätsprognose",
  "predict criminal behavior", "kriminelles verhalten vorhersagen",
  "pre-crime", "precrime", "vorhersage straftat", "future criminal",
  "zukünftiger straftäter", "potential offender", "potenzieller straftäter",
  "crime propensity", "kriminalitätsneigung", "profiling for crime prediction",
];

// Art. 5(1)(e) - Ungezieltes Gesichtsbilder-Scraping
const PROHIBITED_FACIAL_SCRAPING_KEYWORDS = [
  "facial scraping", "gesichtsbilder scraping", "face scraping", "scrape faces",
  "clearview", "web scraping faces", "internet facial images",
  "untargeted facial recognition database", "ungezielte gesichtserkennungsdatenbank",
  "mass facial collection", "massensammlung gesichtsbilder",
  "scraping profile pictures", "profilbilder scraping", "harvesting facial images",
];

// Art. 5(1)(f) - Emotionserkennung am Arbeitsplatz/Schule
const PROHIBITED_EMOTION_WORK_KEYWORDS = [
  "emotion recognition workplace", "emotionserkennung arbeitsplatz",
  "emotion detection work", "emotionserkennung arbeit",
  "emotion recognition school", "emotionserkennung schule",
  "affective computing workplace", "affective computing arbeitsplatz",
  "employee emotion monitoring", "mitarbeiter emotionsüberwachung",
  "student emotion monitoring", "schüler emotionsüberwachung",
  "workplace sentiment analysis", "arbeitsplatz stimmungsanalyse",
  "employee mood detection", "mitarbeiter stimmungserkennung",
  "classroom emotion detection", "klassenzimmer emotionserkennung",
  // Additional keywords for better detection
  "emotionserkennung arbeitskontext", "emotion arbeitskontext",
  "gesichtsausdruck mitarbeiter", "gesichtsausdrücke mitarbeiter",
  "stimmungsbewertung mitarbeiter", "stimmungsanalyse mitarbeiter",
  "emotionen mitarbeiter", "emotion mitarbeiter",
  "mitarbeiter emotion", "mitarbeitenden emotion",
  "leistungsbewertung emotion", "leistungsbewertung stimmung",
  "stimmungserkennung arbeit", "stimmungserkennung mitarbeiter",
  "gefühlserkennung arbeitsplatz", "gefühlserkennung mitarbeiter",
  "emotionale überwachung mitarbeiter", "emotionale analyse mitarbeiter",
  "employee emotion", "worker emotion", "staff emotion",
  "employee mood", "worker mood", "staff mood",
  "employee sentiment", "worker sentiment", "staff sentiment",
  "employee facial expression", "gesichtsausdruck analyse arbeit",
  "emotional state employee", "emotionszustand mitarbeiter",
  "affect recognition work", "affekterkennung arbeit",
];

// Keywords indicating emotion analysis
const EMOTION_KEYWORDS = [
  "emotion", "emotionserkennung", "emotionsanalyse", "emotionen",
  "stimmungserkennung", "stimmungsanalyse", "stimmungsbewertung", "stimmung",
  "gefühlserkennung", "gefühlsanalyse", "affective", "affekt",
  "gesichtsausdruck", "gesichtsausdrücke", "facial expression",
  "mood detection", "mood analysis", "sentiment analysis",
];

// Keywords indicating workplace/employee context
const WORKPLACE_KEYWORDS = [
  "arbeitsplatz", "arbeitskontext", "arbeit", "workplace", "work",
  "mitarbeiter", "mitarbeitende", "mitarbeitenden", "employee", "employees",
  "belegschaft", "personal", "angestellte", "beschäftigte",
  "workforce", "worker", "staff", "personnel",
  "büro", "office", "firma", "unternehmen", "company",
  "hr", "human resources", "personalwesen",
  "leistungsbewertung", "performance evaluation", "performance review",
];

// Keywords indicating school/education context
const SCHOOL_KEYWORDS = [
  "schule", "school", "schüler", "student", "students",
  "klassenzimmer", "classroom", "bildung", "education",
  "unterricht", "lesson", "prüfung", "exam",
  "universität", "university", "hochschule",
];

// Art. 5(1)(g) - Biometrische Kategorisierung nach sensiblen Merkmalen
const PROHIBITED_BIOMETRIC_CAT_KEYWORDS = [
  "biometric categorization race", "biometrische kategorisierung rasse",
  "biometric ethnicity", "biometrische ethnizität", "race detection", "rassenerkennung",
  "ethnicity detection", "ethnizitätserkennung", "infer race from face",
  "sexual orientation detection", "erkennung sexueller orientierung",
  "biometric profiling sensitive", "ethnic profiling biometric",
];

// Art. 5(1)(h) - Echtzeit-Biometrie im öffentlichen Raum
const PROHIBITED_REALTIME_BIO_KEYWORDS = [
  "real-time biometric", "echtzeit-biometrisch", "realtime biometric",
  "real-time facial recognition public", "echtzeit gesichtserkennung öffentlich",
  "live facial recognition", "live gesichtserkennung",
  "mass surveillance biometric", "massenüberwachung biometrisch",
  "public space facial recognition", "öffentlicher raum gesichtserkennung",
  "real-time remote identification", "echtzeit-fernidentifikation",
];

interface ProhibitedPracticeResult {
  isProhibited: boolean;
  practices: {
    category: string;
    article: string;
    matchedKeywords: string[];
  }[];
}

export function checkProhibitedPractices(systemInfo: AiSystemInfo): ProhibitedPracticeResult {
  // Combine all relevant text fields for analysis
  const useCase = systemInfo.useCase?.toLowerCase() || "";
  const purpose = systemInfo.primaryPurpose?.toLowerCase() || "";
  const prohibitedUses = systemInfo.prohibitedUses?.toLowerCase() || "";
  const foreseenMisuse = systemInfo.foreseenMisuse?.toLowerCase() || "";
  const intendedUsers = systemInfo.intendedUsers?.toLowerCase() || "";
  const domain = systemInfo.domain?.toLowerCase() || "";
  const systemName = (systemInfo as unknown as Record<string, unknown>).systemName?.toString().toLowerCase() || "";
  const description = (systemInfo as unknown as Record<string, unknown>).description?.toString().toLowerCase() || "";

  // Combine all fields for comprehensive analysis
  const combined = `${useCase} ${purpose} ${prohibitedUses} ${foreseenMisuse} ${intendedUsers} ${domain} ${systemName} ${description}`;

  const practices: ProhibitedPracticeResult["practices"] = [];

  // Art. 5(1)(a) - Unterschwellige Manipulation
  const subliminalMatches = PROHIBITED_SUBLIMINAL_KEYWORDS.filter(kw => combined.includes(kw));
  if (subliminalMatches.length > 0) {
    practices.push({
      category: "Unterschwellige Manipulation",
      article: "Art. 5(1)(a)",
      matchedKeywords: subliminalMatches,
    });
  }

  // Art. 5(1)(b) - Ausnutzung Schutzbedürftiger
  const vulnerableMatches = PROHIBITED_VULNERABLE_KEYWORDS.filter(kw => combined.includes(kw));
  if (vulnerableMatches.length > 0) {
    practices.push({
      category: "Ausnutzung Schutzbedürftiger",
      article: "Art. 5(1)(b)",
      matchedKeywords: vulnerableMatches,
    });
  }

  // Art. 5(1)(c) - Social Scoring
  const socialMatches = PROHIBITED_SOCIAL_SCORING_KEYWORDS.filter(kw => combined.includes(kw));
  if (socialMatches.length > 0) {
    practices.push({
      category: "Social Scoring",
      article: "Art. 5(1)(c)",
      matchedKeywords: socialMatches,
    });
  }

  // Art. 5(1)(d) - Prädiktive Polizeiarbeit
  const predictiveMatches = PROHIBITED_PREDICTIVE_POLICING_KEYWORDS.filter(kw => combined.includes(kw));
  if (predictiveMatches.length > 0) {
    practices.push({
      category: "Prädiktive Polizeiarbeit auf Einzelpersonen",
      article: "Art. 5(1)(d)",
      matchedKeywords: predictiveMatches,
    });
  }

  // Art. 5(1)(e) - Gesichtsbilder-Scraping
  const scrapingMatches = PROHIBITED_FACIAL_SCRAPING_KEYWORDS.filter(kw => combined.includes(kw));
  if (scrapingMatches.length > 0) {
    practices.push({
      category: "Ungezieltes Gesichtsbilder-Scraping",
      article: "Art. 5(1)(e)",
      matchedKeywords: scrapingMatches,
    });
  }

  // Art. 5(1)(f) - Emotionserkennung am Arbeitsplatz/Schule
  const emotionWorkMatches = PROHIBITED_EMOTION_WORK_KEYWORDS.filter(kw => combined.includes(kw));
  if (emotionWorkMatches.length > 0) {
    practices.push({
      category: "Emotionserkennung am Arbeitsplatz/Schule",
      article: "Art. 5(1)(f)",
      matchedKeywords: emotionWorkMatches,
    });
  } else {
    // Also check for combination of emotion keywords + workplace/school keywords
    const hasEmotionKeyword = EMOTION_KEYWORDS.some(kw => combined.includes(kw));
    const workplaceMatches = WORKPLACE_KEYWORDS.filter(kw => combined.includes(kw));
    const schoolMatches = SCHOOL_KEYWORDS.filter(kw => combined.includes(kw));

    if (hasEmotionKeyword && (workplaceMatches.length > 0 || schoolMatches.length > 0)) {
      const context = workplaceMatches.length > 0 ? "Arbeitsplatz" : "Schule/Bildung";
      const matchedContext = workplaceMatches.length > 0 ? workplaceMatches : schoolMatches;
      const emotionMatches = EMOTION_KEYWORDS.filter(kw => combined.includes(kw));
      practices.push({
        category: `Emotionserkennung am ${context}`,
        article: "Art. 5(1)(f)",
        matchedKeywords: [...emotionMatches, ...matchedContext],
      });
    }
  }

  // Art. 5(1)(g) - Biometrische Kategorisierung nach sensiblen Merkmalen
  const biometricCatMatches = PROHIBITED_BIOMETRIC_CAT_KEYWORDS.filter(kw => combined.includes(kw));
  if (biometricCatMatches.length > 0 ||
      (systemInfo.biometricOrSurveillance && (
        combined.includes("rasse") || combined.includes("ethnie") ||
        combined.includes("religion") || combined.includes("politische überzeugung") ||
        combined.includes("sexuelle orientierung")
      ))) {
    practices.push({
      category: "Biometrische Kategorisierung nach sensiblen Merkmalen",
      article: "Art. 5(1)(g)",
      matchedKeywords: biometricCatMatches,
    });
  }

  // Art. 5(1)(h) - Echtzeit-Biometrie im öffentlichen Raum
  const realtimeMatches = PROHIBITED_REALTIME_BIO_KEYWORDS.filter(kw => combined.includes(kw));
  if (realtimeMatches.length > 0 ||
      (systemInfo.biometricOrSurveillance &&
       systemInfo.annexIIICategories?.includes("LAW_ENFORCEMENT"))) {
    practices.push({
      category: "Echtzeit-Biometrie im öffentlichen Raum",
      article: "Art. 5(1)(h)",
      matchedKeywords: realtimeMatches,
    });
  }

  return {
    isProhibited: practices.length > 0,
    practices,
  };
}

/**
 * Prüft auf verbotene KI-Praktiken nach Art. 5
 */
function isProhibited(systemInfo: AiSystemInfo): boolean {
  const result = checkProhibitedPractices(systemInfo);
  return result.isProhibited;
}

/**
 * Prüft auf Hochrisiko-Klassifizierung nach Anhang III
 */
function isHighRisk(systemInfo: AiSystemInfo): boolean {
  // Hochrisiko-Kategorien nach Anhang III
  const highRiskCategories: AnnexIIICategory[] = [
    "BIOMETRIC_IDENTIFICATION",
    "CRITICAL_INFRASTRUCTURE",
    "EDUCATION_VOCATIONAL",
    "EMPLOYMENT_HR",
    "ESSENTIAL_SERVICES",
    "LAW_ENFORCEMENT",
    "MIGRATION_ASYLUM",
    "JUSTICE_DEMOCRACY",
  ];

  // Prüfe ob eine Hochrisiko-Kategorie ausgewählt wurde
  const hasHighRiskCategory = systemInfo.annexIIICategories?.some((cat) =>
    highRiskCategories.includes(cat)
  );

  if (hasHighRiskCategory && systemInfo.euImpact) {
    return true;
  }

  // Legacy-Logik: Domain-basierte Prüfung
  const highRiskDomains = [
    "Gesundheitswesen",
    "Personal/HR",
    "Kreditvergabe",
    "Kritische Infrastruktur",
    "Bildung",
    "Strafverfolgung",
    "Migration/Asyl",
    "Justiz",
  ];

  const isHighRiskDomain = highRiskDomains.some((domain) =>
    systemInfo.domain?.toLowerCase().includes(domain.toLowerCase())
  );

  if (
    isHighRiskDomain &&
    systemInfo.impactLevel === "high" &&
    systemInfo.euImpact
  ) {
    return true;
  }

  // Biometrische Systeme sind grundsätzlich Hochrisiko
  if (
    systemInfo.biometricOrSurveillance &&
    systemInfo.euImpact &&
    systemInfo.impactLevel !== "low"
  ) {
    return true;
  }

  // Entscheidungsunterstützungssysteme mit hohem Impact
  const useCase = systemInfo.useCase?.toLowerCase() || "";
  const purpose = systemInfo.primaryPurpose?.toLowerCase() || "";
  const combined = `${useCase} ${purpose}`;

  if (
    systemInfo.impactLevel === "high" &&
    systemInfo.euImpact &&
    (combined.includes("entscheidung") ||
      combined.includes("bewertung") ||
      combined.includes("scoring") ||
      combined.includes("auswahl") ||
      combined.includes("prüfung"))
  ) {
    return true;
  }

  return false;
}

/**
 * Prüft auf begrenzte Risiken (Transparenzpflichten)
 */
function isLimitedRisk(systemInfo: AiSystemInfo): boolean {
  const useCase = systemInfo.useCase?.toLowerCase() || "";
  const purpose = systemInfo.primaryPurpose?.toLowerCase() || "";
  const combined = `${useCase} ${purpose}`;

  // Chatbots und Konversationssysteme
  if (
    combined.includes("chatbot") ||
    combined.includes("konversation") ||
    combined.includes("dialog") ||
    combined.includes("assistent")
  ) {
    return true;
  }

  // Emotionserkennung
  if (
    combined.includes("emotion") ||
    combined.includes("gefühl") ||
    combined.includes("stimmung")
  ) {
    return true;
  }

  // Deepfakes / Synthetische Inhalte
  if (
    combined.includes("deepfake") ||
    combined.includes("synthetisch") ||
    combined.includes("generiert") ||
    combined.includes("generation")
  ) {
    return true;
  }

  // "Sonstiges" Kategorie mit mittlerem Impact
  if (
    systemInfo.annexIIICategories?.includes("OTHER") &&
    systemInfo.impactLevel === "medium"
  ) {
    return true;
  }

  // Mittleres Risiko allgemein
  if (systemInfo.impactLevel === "medium") {
    return true;
  }

  return false;
}

/**
 * Gibt eine erklärende Beschreibung zur Risikoklasse zurück
 */
export function getRiskClassDescription(riskClass: RiskClass): string {
  switch (riskClass) {
    case "PROHIBITED":
      return "Dieses System fällt in die Kategorie **verbotene KI-Systeme** nach Art. 5 EU AI Act. Solche Systeme dürfen in der EU grundsätzlich nicht entwickelt, in Verkehr gebracht oder eingesetzt werden. Beispiele: Social Scoring durch Behörden, unterschwellige Manipulation, Echtzeit-Fernidentifikation in öffentlichen Räumen zu Strafverfolgungszwecken (mit eng begrenzten Ausnahmen).";

    case "HIGH_RISK":
      return "Dieses System wird als **Hochrisiko-KI-System** nach Anhang III EU AI Act klassifiziert. Es unterliegt strengen Anforderungen: Risikomanagement (Art. 9), Datenqualität (Art. 10), technische Dokumentation (Art. 11), Aufzeichnungspflichten (Art. 12), Transparenz (Art. 13), menschliche Aufsicht (Art. 14), Genauigkeit und Robustheit (Art. 15). Eine Konformitätsbewertung und CE-Kennzeichnung sind vor Inverkehrbringen erforderlich.";

    case "LIMITED_RISK":
      return "Dieses System fällt in die Kategorie **begrenzte Risiken** nach Art. 50 EU AI Act. Die Hauptanforderung sind **Transparenzpflichten**: Nutzer müssen darüber informiert werden, dass sie mit einem KI-System interagieren (z.B. bei Chatbots) oder dass Inhalte künstlich erzeugt oder manipuliert wurden (z.B. Deepfakes).";

    case "MINIMAL_RISK":
      return "Dieses System wird als **minimales Risiko** eingestuft. Es unterliegt keinen spezifischen gesetzlichen Verpflichtungen aus dem EU AI Act. Die Entwicklung freiwilliger Verhaltenskodizes wird gefördert (Art. 95). Dennoch empfiehlt sich die Einhaltung von Best Practices und ethischen KI-Grundsätzen.";
  }
}

/**
 * Gibt Empfehlungen für nächste Schritte basierend auf Risikoklasse und Rolle
 */
export function getNextStepsForRisk(riskClass: RiskClass): string[] {
  switch (riskClass) {
    case "PROHIBITED":
      return [
        "Entwicklung/Einsatz des Systems sofort stoppen",
        "Rechtliche Beratung einholen zur Prüfung möglicher Ausnahmen",
        "Alternative Lösungsansätze evaluieren, die nicht verboten sind",
        "Entscheidung und Begründung dokumentieren",
        "Ggf. zuständige Marktüberwachungsbehörde kontaktieren",
      ];

    case "HIGH_RISK":
      return [
        "Vollständiges Audit der Anforderungen durchführen (Art. 8-15)",
        "Risikomanagement-System implementieren (Art. 9)",
        "Datenqualitätsanforderungen sicherstellen (Art. 10)",
        "Technische Dokumentation erstellen (Art. 11, Anhang IV)",
        "Aufzeichnungspflichten einrichten (Art. 12)",
        "Transparenzinformationen für Betreiber bereitstellen (Art. 13)",
        "Menschliche Aufsicht gewährleisten (Art. 14)",
        "Genauigkeit, Robustheit und Cybersicherheit nachweisen (Art. 15)",
        "Konformitätsbewertung durchführen (Art. 43)",
        "EU-Konformitätserklärung erstellen (Art. 47)",
        "CE-Kennzeichnung anbringen (Art. 48)",
        "In EU-Datenbank registrieren (Art. 49, 71)",
      ];

    case "LIMITED_RISK":
      return [
        "Transparenzpflichten nach Art. 50 implementieren",
        "Nutzer über KI-Interaktion informieren (bei Chatbots etc.)",
        "Synthetische Inhalte als solche kennzeichnen",
        "Maschinenlesbare Kennzeichnung implementieren",
        "Dokumentation der Transparenzmaßnahmen",
      ];

    case "MINIMAL_RISK":
      return [
        "Freiwillige Verhaltenskodizes prüfen (Art. 95)",
        "Ethische KI-Grundsätze dokumentieren",
        "Best Practices für Entwicklung und Einsatz einhalten",
        "Regelmäßige Überprüfung der Risikoklassifizierung planen",
        "Zukünftige Entwicklungen im EU AI Act beobachten",
      ];
  }
}
