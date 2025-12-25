import axios from 'axios';
import { RiskLevel, ScanFinding, ScanAnalysis } from '../models/ScanResult';

// GPT-based EU AI Act Analysis
// This provides intelligent, context-aware analysis using OpenAI's GPT models

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// System prompt for EU AI Act analysis
const EU_AI_ACT_SYSTEM_PROMPT = `Du bist ein EU AI Act Compliance-Experte. Analysiere KI-Systeme basierend auf der EU-Verordnung 2024/1689 (EU AI Act).

RISIKOKLASSIFIZIERUNG:
1. PROHIBITED (Verboten - Art. 5): Social Scoring, unterschwellige Manipulation, Ausnutzung von Schutzbedürftigen, biometrische Echtzeit-Fernidentifikation in öffentlichen Räumen (mit Ausnahmen), Emotionserkennung am Arbeitsplatz/in Schulen, biometrische Kategorisierung nach sensiblen Merkmalen, ungezielte Gesichtsbilddatenbanken, prädiktive Polizeiarbeit auf Einzelpersonen.

2. HIGH_RISK (Hochrisiko - Art. 6, Anhang III):
- Biometrische Identifikation (nicht Echtzeit)
- Kritische Infrastruktur (Verkehr, Energie, Wasser)
- Bildung und Berufsausbildung (Zugang, Bewertung)
- Beschäftigung (Einstellung, Leistungsbewertung, Beförderung)
- Wesentliche Dienstleistungen (Kredit, Versicherung, Sozialleistungen)
- Strafverfolgung (Risikobewertung, Beweismittel)
- Migration und Grenzkontrolle
- Rechtspflege und demokratische Prozesse
- Sicherheitskomponenten von Produkten

3. LIMITED_RISK (Begrenztes Risiko - Art. 50):
- Chatbots und Conversational AI
- Emotionserkennung (außer verbotene Kontexte)
- Deepfakes und synthetische Medien
- KI-generierte Inhalte

4. MINIMAL_RISK: Alle anderen KI-Systeme ohne spezifische Anforderungen

ANALYSE-AUSGABE (JSON):
{
  "riskLevel": "PROHIBITED|HIGH_RISK|LIMITED_RISK|MINIMAL_RISK",
  "riskScore": 0-100,
  "summary": "Kurze Zusammenfassung der Analyse",
  "findings": [
    {
      "category": "Kategorie",
      "title": "Titel des Befunds",
      "severity": "critical|high|medium|low|info",
      "description": "Detaillierte Beschreibung",
      "recommendation": "Konkrete Handlungsempfehlung",
      "articleReference": "Relevanter EU AI Act Artikel"
    }
  ],
  "detectedFeatures": ["Liste erkannter KI-Merkmale"],
  "complianceGaps": ["Liste der Compliance-Lücken"],
  "nextSteps": ["Empfohlene nächste Schritte"]
}

Analysiere das System gründlich und gib nur valides JSON zurück.`;

interface GPTAnalysisResponse {
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  findings: ScanFinding[];
  detectedFeatures: string[];
  complianceGaps: string[];
  nextSteps: string[];
}

// Validate and sanitize GPT response
function validateGPTResponse(data: unknown): GPTAnalysisResponse | null {
  if (!data || typeof data !== 'object') return null;

  const response = data as Record<string, unknown>;

  // Validate riskLevel
  const validRiskLevels: RiskLevel[] = ['PROHIBITED', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK', 'UNKNOWN'];
  if (!validRiskLevels.includes(response.riskLevel as RiskLevel)) {
    response.riskLevel = 'UNKNOWN';
  }

  // Validate riskScore
  if (typeof response.riskScore !== 'number' || response.riskScore < 0 || response.riskScore > 100) {
    response.riskScore = 50;
  }

  // Validate summary
  if (typeof response.summary !== 'string') {
    response.summary = 'Analyse konnte nicht vollständig durchgeführt werden.';
  }

  // Validate findings array
  if (!Array.isArray(response.findings)) {
    response.findings = [];
  } else {
    response.findings = (response.findings as unknown[]).filter((f): f is ScanFinding => {
      if (!f || typeof f !== 'object') return false;
      const finding = f as Record<string, unknown>;
      return (
        typeof finding.category === 'string' &&
        typeof finding.title === 'string' &&
        typeof finding.description === 'string' &&
        typeof finding.recommendation === 'string' &&
        ['critical', 'high', 'medium', 'low', 'info'].includes(finding.severity as string)
      );
    });
  }

  // Validate arrays
  const validateStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item): item is string => typeof item === 'string');
  };

  response.detectedFeatures = validateStringArray(response.detectedFeatures);
  response.complianceGaps = validateStringArray(response.complianceGaps);
  response.nextSteps = validateStringArray(response.nextSteps);

  return response as unknown as GPTAnalysisResponse;
}

// Extract JSON from GPT response (handles markdown code blocks)
function extractJSON(text: string): string {
  // Try to find JSON in markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find JSON object directly
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return text;
}

// Analyze system using GPT
export async function analyzeWithGPT(
  inputType: 'url' | 'description',
  inputText: string,
  pageTitle?: string
): Promise<ScanAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API Key nicht konfiguriert');
  }

  const userPrompt = inputType === 'url'
    ? `Analysiere diese Webseite eines KI-Systems (Titel: "${pageTitle || 'Unbekannt'}"):\n\n${inputText}`
    : `Analysiere diese Beschreibung eines KI-Systems:\n\n${inputText}`;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model,
        messages: [
          { role: 'system', content: EU_AI_ACT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Keine Antwort von GPT erhalten');
    }

    const jsonStr = extractJSON(content);
    const parsed = JSON.parse(jsonStr);
    const validated = validateGPTResponse(parsed);

    if (!validated) {
      throw new Error('GPT-Antwort konnte nicht validiert werden');
    }

    // Add GPT indicator to findings
    validated.findings.unshift({
      category: 'Analyse-Information',
      title: 'GPT-gestützte Analyse',
      severity: 'info',
      description: 'Diese Analyse wurde mit Hilfe von künstlicher Intelligenz (GPT) durchgeführt und bietet eine tiefgehende, kontextbezogene Bewertung.',
      recommendation: 'Die Ergebnisse sollten von einem qualifizierten Rechtsberater überprüft werden.',
      articleReference: ''
    });

    return validated;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('OpenAI API Key ungültig');
      }
      if (error.response?.status === 429) {
        throw new Error('OpenAI Rate Limit erreicht. Bitte versuchen Sie es später erneut.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('GPT-Analyse Timeout. Bitte versuchen Sie es erneut.');
      }
    }
    throw error;
  }
}

// Check if GPT analysis is available
export function isGPTAvailable(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  const useGPT = process.env.SCANNER_USE_GPT !== 'false';
  return useGPT && !!apiKey && apiKey !== 'your_openai_api_key_here';
}
