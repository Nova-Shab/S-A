import axios from 'axios';
import { RiskLevel, ScanFinding, ScanAnalysis } from '../models/ScanResult';

// Ollama-based EU AI Act Analysis
// Uses local LLM models via Ollama for privacy-preserving analysis

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// System prompt for EU AI Act analysis (optimized for smaller models)
const EU_AI_ACT_SYSTEM_PROMPT = `Du bist ein EU AI Act Calmpliance-Experte. Analysiere KI-Systeme nach EU-Verordnung 2024/1689.

RISIKOKLASSEN:
1. PROHIBITED (Verboten): Social Scoring, unterschwellige Manipulation, biometrische Echtzeit-Überwachung
2. HIGH_RISK (Hochrisiko): Biometrie, kritische Infrastruktur, Bildung, Beschäftigung, Kredit, Strafverfolgung, Migration
3. LIMITED_RISK (Begrenztes Risiko): Chatbots, Emotionserkennung, Deepfakes, KI-generierte Inhalte
4. MINIMAL_RISK: Alle anderen KI-Systeme

Antworte NUR mit validem JSON im folgenden Format:
{
  "riskLevel": "PROHIBITED|HIGH_RISK|LIMITED_RISK|MINIMAL_RISK",
  "riskScore": 0-100,
  "summary": "Kurze Zusammenfassung",
  "findings": [{"category": "Kategorie", "title": "Titel", "severity": "critical|high|medium|low|info", "description": "Beschreibung", "recommendation": "Empfehlung", "articleReference": "Art. X EU AI Act"}],
  "detectedFeatures": ["feature1", "feature2"],
  "complianceGaps": ["gap1", "gap2"],
  "nextSteps": ["step1", "step2"]
}`;

interface OllamaResponse {
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  findings: ScanFinding[];
  detectedFeatures: string[];
  complianceGaps: string[];
  nextSteps: string[];
}

// Extract JSON from response (handles markdown and extra text)
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

// Validate Ollama response
function validateResponse(data: unknown): OllamaResponse | null {
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
    response.summary = 'Analyse durchgeführt.';
  }

  // Validate findings
  if (!Array.isArray(response.findings)) {
    response.findings = [];
  } else {
    response.findings = (response.findings as unknown[]).filter((f): f is ScanFinding => {
      if (!f || typeof f !== 'object') return false;
      const finding = f as Record<string, unknown>;
      return (
        typeof finding.title === 'string' &&
        typeof finding.description === 'string' &&
        ['critical', 'high', 'medium', 'low', 'info'].includes(finding.severity as string)
      );
    }).map(f => ({
      category: f.category || 'Allgemein',
      title: f.title,
      severity: f.severity,
      description: f.description,
      recommendation: f.recommendation || '',
      articleReference: f.articleReference || ''
    }));
  }

  // Validate arrays
  const validateStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item): item is string => typeof item === 'string');
  };

  response.detectedFeatures = validateStringArray(response.detectedFeatures);
  response.complianceGaps = validateStringArray(response.complianceGaps);
  response.nextSteps = validateStringArray(response.nextSteps);

  return response as unknown as OllamaResponse;
}

// Check if Ollama is available
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    console.log(`[Ollama] Checking connection to ${OLLAMA_API_URL}/api/tags...`);
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 5000 });
    const models = response.data?.models || [];
    console.log(`[Ollama] Connected! Available models: ${models.map((m: { name: string }) => m.name).join(', ') || 'none'}`);
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(`[Ollama] Connection failed: ${error.code} - ${error.message}`);
    } else {
      console.log(`[Ollama] Connection failed:`, error);
    }
    return false;
  }
}

// Get available Ollama models
export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 5000 });
    return response.data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

// Analyze with Ollama
export async function analyzeWithOllama(
  inputType: 'url' | 'description',
  inputText: string,
  pageTitle?: string
): Promise<ScanAnalysis> {
  const model = process.env.OLLAMA_MODEL || 'llama3.2';

  const userPrompt = inputType === 'url'
    ? `Analysiere diese Webseite eines KI-Systems (Titel: "${pageTitle || 'Unbekannt'}"):\n\n${inputText.substring(0, 4000)}`
    : `Analysiere diese Beschreibung eines KI-Systems:\n\n${inputText.substring(0, 4000)}`;

  try {
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/generate`,
      {
        model,
        prompt: `${EU_AI_ACT_SYSTEM_PROMPT}\n\nAnalysiere:\n${userPrompt}`,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 2000,
        }
      },
      {
        timeout: 120000 // 2 minutes for local models
      }
    );

    const content = response.data.response;
    if (!content) {
      throw new Error('Keine Antwort von Ollama erhalten');
    }

    const jsonStr = extractJSON(content);
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, create a basic response
      console.error('Failed to parse Ollama JSON response:', jsonStr);
      return createFallbackResponse(inputText);
    }

    const validated = validateResponse(parsed);
    if (!validated) {
      return createFallbackResponse(inputText);
    }

    // Add Ollama indicator
    validated.findings.unshift({
      category: 'Analyse-Information',
      title: 'Lokale KI-Analyse (Ollama)',
      severity: 'info',
      description: `Diese Analyse wurde lokal mit dem Modell "${model}" durchgeführt. Alle Daten bleiben auf Ihrem System.`,
      recommendation: 'Die Ergebnisse sollten von einem qualifizierten Rechtsberater überprüft werden.',
      articleReference: ''
    });

    return validated;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama ist nicht erreichbar. Stellen Sie sicher, dass Ollama läuft (ollama serve).');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Ollama Timeout. Das Modell benötigt möglicherweise mehr Zeit.');
      }
      if (error.response?.status === 404) {
        throw new Error(`Modell "${process.env.OLLAMA_MODEL || 'llama3.2'}" nicht gefunden. Installieren Sie es mit: ollama pull ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
      }
    }
    throw error;
  }
}

// Create fallback response when JSON parsing fails
function createFallbackResponse(inputText: string): ScanAnalysis {
  const lowerText = inputText.toLowerCase();

  // Simple keyword detection for fallback
  let riskLevel: RiskLevel = 'MINIMAL_RISK';
  let riskScore = 20;

  if (lowerText.includes('social scoring') || lowerText.includes('manipulation')) {
    riskLevel = 'PROHIBITED';
    riskScore = 95;
  } else if (lowerText.includes('biometric') || lowerText.includes('recruitment') || lowerText.includes('credit')) {
    riskLevel = 'HIGH_RISK';
    riskScore = 75;
  } else if (lowerText.includes('chatbot') || lowerText.includes('deepfake')) {
    riskLevel = 'LIMITED_RISK';
    riskScore = 45;
  }

  return {
    riskLevel,
    riskScore,
    findings: [{
      category: 'Analyse-Information',
      title: 'Vereinfachte Analyse',
      severity: 'info',
      description: 'Die KI-Analyse konnte nicht vollständig durchgeführt werden. Eine vereinfachte Keyword-Analyse wurde verwendet.',
      recommendation: 'Versuchen Sie es erneut oder verwenden Sie ein größeres Modell.',
      articleReference: ''
    }],
    summary: `Vorläufige Risikoeinschätzung: ${riskLevel}`,
    detectedFeatures: [],
    complianceGaps: [],
    nextSteps: ['Detaillierte Analyse mit vollständigem Modell durchführen']
  };
}

// Check if Ollama is configured and available
export function isOllamaConfigured(): boolean {
  return process.env.SCANNER_USE_OLLAMA === 'true';
}

export async function isOllamaAvailable(): Promise<boolean> {
  if (!isOllamaConfigured()) return false;
  return await checkOllamaConnection();
}
