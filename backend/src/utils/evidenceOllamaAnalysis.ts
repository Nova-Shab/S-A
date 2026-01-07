/**
 * Evidence-Based Ollama Analysis
 *
 * Anti-hallucination prompts that extract ONLY what's in the text.
 * No assumptions, no world knowledge - only evidence from chunks.
 */

import axios from 'axios';
import {
  ContentChunk,
  ChunkFinding,
  ChunkExtractionResult,
  AIFeatureType,
  EvidenceBasedFinding,
  Evidence,
  EvidenceBasedAnalysis,
  ScannerConfig,
  DEFAULT_SCANNER_CONFIG,
} from '../types/evidenceTypes';
import { AnalysisLogger } from './analysisLogger';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// ============================================================================
// CHUNK EXTRACTION PROMPT (Evidence-Only)
// ============================================================================

const CHUNK_EXTRACTION_PROMPT = `Du bist ein präziser Textanalyst für EU AI Act Compliance.

DEINE AUFGABE:
Extrahiere NUR Hinweise auf KI/ML-Systeme, die EXPLIZIT im gegebenen Text stehen.

REGELN (STRIKT EINHALTEN):
1. NUR extrahieren was WÖRTLICH im Text steht
2. KEINE Annahmen, KEIN Weltwissen
3. evidence_quote MUSS exakt im Text vorkommen (max 150 Zeichen)
4. Bei Unsicherheit: nicht extrahieren
5. Leeres Array wenn nichts gefunden

KATEGORIEN ZU SUCHEN:
- chatbot: Chatbots, virtuelle Assistenten, Sprachassistenten
- recommendation: Personalisierung, Empfehlungssysteme, Profiling
- generation: KI-generierte Inhalte, Text/Bild-Generierung
- analysis: Datenanalyse, Mustererkennung, Vorhersagen
- automation: Prozessautomatisierung, automatische Workflows
- biometric: Gesichtserkennung, Fingerabdruck, biometrische Daten
- decision: Automatisierte Entscheidungen, Scoring
- emotion: Emotionserkennung, Stimmungsanalyse
- scoring: Social Scoring, Kredit-Scoring, Bewertungssysteme
- surveillance: Überwachung, Monitoring, Tracking
- profiling: Nutzerprofile, Verhaltensanalyse

ANTWORTFORMAT (NUR JSON, KEINE ERKLÄRUNG):
{
  "findings": [
    {
      "feature_type": "chatbot|recommendation|...",
      "claim": "Kurze Aussage (max 100 Zeichen)",
      "evidence_quote": "Exaktes Zitat aus dem Text (max 150 Zeichen)",
      "confidence": 0.0-1.0,
      "why_it_matters": "EU AI Act Relevanz (max 150 Zeichen)"
    }
  ],
  "no_ai_evidence": true|false
}

Wenn KEINE KI-Hinweise gefunden: {"findings":[],"no_ai_evidence":true}`;

// ============================================================================
// AGGREGATION PROMPT (Site-Level Decision)
// ============================================================================

const AGGREGATION_PROMPT = `Du bist ein EU AI Act Compliance-Experte.

AUFGABE:
Analysiere die gesammelten Evidence-Einträge und klassifiziere das System.

EU AI ACT RISIKOKLASSEN:
1. PROHIBITED (Art. 5): Social Scoring durch Behörden, unterschwellige Manipulation,
   Echtzeit-Biometrie in öffentlichen Räumen, Emotionserkennung am Arbeitsplatz/Schule
2. HIGH_RISK (Anhang III): Biometrie, kritische Infrastruktur, Bildung, Beschäftigung,
   Kredit/Versicherung, Strafverfolgung, Migration
3. LIMITED_RISK (Art. 50): Chatbots (Kennzeichnungspflicht), Emotionserkennung (Einwilligung),
   KI-generierte Inhalte (Kennzeichnung)
4. MINIMAL_RISK: Alle anderen KI-Systeme

WICHTIGE REGELN:
1. NUR basierend auf den gegebenen Evidence-Einträgen urteilen
2. Bei fehlender Evidence: "UNKNOWN" oder "MINIMAL_RISK"
3. Hochrisiko/Verboten NUR bei EINDEUTIGER Evidence
4. Konservativ klassifizieren (im Zweifel niedrigere Risikostufe)
5. Jede Aussage muss durch Evidence belegbar sein

ANTWORTFORMAT (NUR JSON):
{
  "risk_level": "PROHIBITED|HIGH_RISK|LIMITED_RISK|MINIMAL_RISK|UNKNOWN",
  "risk_score": 0-100,
  "confidence": 0.0-1.0,
  "ai_detected": true|false,
  "summary": "2-3 Sätze Zusammenfassung basierend auf Evidence",
  "classification_reasoning": "Begründung mit Verweis auf konkrete Evidence",
  "key_evidence": ["Evidence 1", "Evidence 2"],
  "applicable_articles": ["Art. X", "Anhang III Nr. Y"],
  "compliance_gaps": ["Gap 1", "Gap 2"],
  "next_steps": ["Schritt 1", "Schritt 2"]
}`;

// ============================================================================
// CHUNK ANALYSIS
// ============================================================================

export async function analyzeChunk(
  chunk: ContentChunk,
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG,
  logger?: AnalysisLogger
): Promise<ChunkExtractionResult> {
  const startTime = Date.now();

  const prompt = `${CHUNK_EXTRACTION_PROMPT}

TEXT ZU ANALYSIEREN:
---
${chunk.content}
---

Antworte NUR mit JSON:`;

  try {
    logger?.debug(`Analyzing chunk: ${chunk.id}`, {
      charCount: chunk.charCount,
      headings: chunk.headings,
    });

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: config.llm.temperature,
          top_p: config.llm.topP,
          num_predict: 1000,
        },
      },
      { timeout: config.llm.timeout }
    );

    const rawResponse = response.data.response || '';
    const processingTimeMs = Date.now() - startTime;

    // Parse JSON response
    const parsed = parseJsonResponse(rawResponse);

    if (!parsed || typeof parsed !== 'object') {
      logger?.warn(`Failed to parse chunk response: ${chunk.id}`);
      return {
        findings: [],
        hasAiContent: false,
        rawResponse,
        processingTimeMs,
      };
    }

    // Validate findings
    const findings = validateChunkFindings(parsed.findings || [], chunk.content, logger);

    // Log for trace
    logger?.logChunkAnalysis({
      chunkId: chunk.id,
      prompt: prompt.substring(0, 500) + '...',
      response: rawResponse,
      findings,
      processingTimeMs,
      timestamp: new Date().toISOString(),
    });

    return {
      findings,
      hasAiContent: findings.length > 0 || parsed.no_ai_evidence === false,
      rawResponse,
      processingTimeMs,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    logger?.error(`Chunk analysis failed: ${chunk.id}`, { error: String(error) });

    return {
      findings: [],
      hasAiContent: false,
      rawResponse: `Error: ${error}`,
      processingTimeMs,
    };
  }
}

function validateChunkFindings(
  findings: unknown[],
  chunkContent: string,
  logger?: AnalysisLogger
): ChunkFinding[] {
  if (!Array.isArray(findings)) return [];

  const validFindings: ChunkFinding[] = [];
  const contentLower = chunkContent.toLowerCase();

  for (const f of findings) {
    if (!f || typeof f !== 'object') continue;

    const finding = f as Record<string, unknown>;

    // Required fields
    const featureType = finding.feature_type as string;
    const claim = finding.claim as string;
    const evidenceQuote = finding.evidence_quote as string;
    const confidence = typeof finding.confidence === 'number' ? finding.confidence : 0;
    const whyItMatters = finding.why_it_matters as string;

    if (!featureType || !claim || !evidenceQuote) {
      logger?.debug('Skipping finding: missing required fields');
      continue;
    }

    // CRITICAL: Validate evidence quote exists in chunk
    const quoteLower = evidenceQuote.toLowerCase().trim();
    const quoteWords = quoteLower.split(/\s+/).filter(w => w.length > 3);

    // Check if at least 60% of words from quote appear in content
    const matchingWords = quoteWords.filter(word => contentLower.includes(word));
    const matchRatio = quoteWords.length > 0 ? matchingWords.length / quoteWords.length : 0;

    if (matchRatio < 0.6) {
      logger?.debug(`Skipping finding: evidence quote not found in chunk (match: ${matchRatio.toFixed(2)})`, {
        quote: evidenceQuote.substring(0, 100),
      });
      continue;
    }

    // Validate feature type
    const validTypes: AIFeatureType[] = [
      'chatbot', 'recommendation', 'generation', 'analysis', 'automation',
      'biometric', 'decision', 'emotion', 'scoring', 'surveillance', 'profiling', 'other'
    ];
    const normalizedType = (featureType.toLowerCase() as AIFeatureType);
    const finalType = validTypes.includes(normalizedType) ? normalizedType : 'other';

    validFindings.push({
      featureType: finalType,
      claim: claim.substring(0, 200),
      evidenceQuote: evidenceQuote.substring(0, 200),
      confidence: Math.min(1, Math.max(0, confidence)),
      whyItMatters: (whyItMatters || '').substring(0, 200),
    });
  }

  return validFindings;
}

// ============================================================================
// AGGREGATION
// ============================================================================

export interface AggregatedFindings {
  /** All chunk findings grouped */
  byFeatureType: Map<AIFeatureType, ChunkFinding[]>;
  /** Total finding count */
  totalCount: number;
  /** Unique claims */
  uniqueClaims: Set<string>;
  /** All evidence quotes */
  evidenceQuotes: string[];
  /** Average confidence */
  avgConfidence: number;
  /** Feature types found */
  featureTypes: AIFeatureType[];
}

export function aggregateChunkFindings(
  chunkResults: Map<string, ChunkExtractionResult>,
  chunks: ContentChunk[]
): AggregatedFindings {
  const byFeatureType = new Map<AIFeatureType, ChunkFinding[]>();
  const uniqueClaims = new Set<string>();
  const evidenceQuotes: string[] = [];
  let totalConfidence = 0;
  let totalCount = 0;

  for (const [chunkId, result] of chunkResults) {
    const chunk = chunks.find(c => c.id === chunkId);

    for (const finding of result.findings) {
      // Deduplicate by claim
      const claimKey = finding.claim.toLowerCase().trim();
      if (uniqueClaims.has(claimKey)) continue;
      uniqueClaims.add(claimKey);

      // Group by feature type
      if (!byFeatureType.has(finding.featureType)) {
        byFeatureType.set(finding.featureType, []);
      }
      byFeatureType.get(finding.featureType)!.push(finding);

      evidenceQuotes.push(finding.evidenceQuote);
      totalConfidence += finding.confidence;
      totalCount++;
    }
  }

  return {
    byFeatureType,
    totalCount,
    uniqueClaims,
    evidenceQuotes,
    avgConfidence: totalCount > 0 ? totalConfidence / totalCount : 0,
    featureTypes: Array.from(byFeatureType.keys()),
  };
}

// ============================================================================
// SITE-LEVEL ANALYSIS
// ============================================================================

export async function performSiteLevelAnalysis(
  aggregated: AggregatedFindings,
  chunks: ContentChunk[],
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG,
  logger?: AnalysisLogger
): Promise<EvidenceBasedAnalysis> {
  const startTime = Date.now();

  // If no AI evidence found, return minimal risk
  if (aggregated.totalCount === 0) {
    logger?.info('No AI evidence found, returning MINIMAL_RISK');
    return createNoEvidenceResult(chunks, config, Date.now() - startTime, logger);
  }

  // Build evidence summary for LLM
  const evidenceSummary = buildEvidenceSummary(aggregated);

  const prompt = `${AGGREGATION_PROMPT}

GEFUNDENE EVIDENCE (${aggregated.totalCount} Einträge):
${evidenceSummary}

FEATURE-TYPEN GEFUNDEN: ${aggregated.featureTypes.join(', ')}
DURCHSCHNITTLICHE KONFIDENZ: ${aggregated.avgConfidence.toFixed(2)}

Analysiere und klassifiziere. Antworte NUR mit JSON:`;

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: config.llm.temperature,
          top_p: config.llm.topP,
          num_predict: 2000,
        },
      },
      { timeout: config.llm.timeout }
    );

    const rawResponse = response.data.response || '';
    const parsed = parseJsonResponse(rawResponse);

    logger?.logAggregation(prompt, rawResponse);

    if (!parsed) {
      logger?.warn('Failed to parse aggregation response, using rule-based classification');
      return createRuleBasedResult(aggregated, chunks, config, Date.now() - startTime, logger);
    }

    // Build final result
    return buildAnalysisResult(parsed, aggregated, chunks, config, Date.now() - startTime, logger);

  } catch (error) {
    logger?.error('Site-level analysis failed, using rule-based fallback', { error: String(error) });
    return createRuleBasedResult(aggregated, chunks, config, Date.now() - startTime, logger);
  }
}

function buildEvidenceSummary(aggregated: AggregatedFindings): string {
  const lines: string[] = [];

  for (const [featureType, findings] of aggregated.byFeatureType) {
    lines.push(`\n[${featureType.toUpperCase()}]`);
    for (const finding of findings.slice(0, 5)) { // Limit to 5 per type
      lines.push(`- Claim: ${finding.claim}`);
      lines.push(`  Evidence: "${finding.evidenceQuote}"`);
      lines.push(`  Confidence: ${finding.confidence.toFixed(2)}`);
    }
  }

  return lines.join('\n');
}

function createNoEvidenceResult(
  chunks: ContentChunk[],
  config: ScannerConfig,
  processingTimeMs: number,
  logger?: AnalysisLogger
): EvidenceBasedAnalysis {
  const result: EvidenceBasedAnalysis = {
    riskLevel: 'MINIMAL_RISK',
    riskScore: 10,
    classificationConfidence: 0.9,
    aiContentDetected: false,
    noAiReason: 'Keine öffentlich dokumentierten KI-Funktionen auf der Website nachweisbar.',
    summary: 'Die Analyse hat keine Hinweise auf KI-Systeme oder automatisierte Entscheidungsfindung gefunden. Das System wird als minimales Risiko eingestuft.',
    classificationReasoning: 'Keine Evidence für KI-Einsatz gefunden. Bei fehlender Dokumentation von KI-Funktionen wird konservativ MINIMAL_RISK angenommen.',
    findings: [{
      id: 'no-evidence-finding',
      featureType: 'other',
      claim: 'Kein KI-Bezug nachweisbar',
      description: 'Auf den analysierten Seiten wurden keine expliziten Hinweise auf KI-Systeme, maschinelles Lernen oder automatisierte Entscheidungsfindung gefunden.',
      euAiActRelevance: 'Ohne nachweisbaren KI-Einsatz fallen keine spezifischen Pflichten nach dem EU AI Act an.',
      articleReferences: [],
      severity: 'info',
      evidence: [],
      confidence: 0.9,
      recommendation: 'Optional: Interne Systeme separat auf KI-Einsatz prüfen, falls nicht öffentlich dokumentiert.',
    }],
    detectedFeatureTypes: [],
    complianceGaps: [],
    nextSteps: [
      'Prüfen Sie, ob KI-Systeme intern genutzt werden, die nicht öffentlich dokumentiert sind',
      'Bei Einsatz von KI: Dokumentation und Transparenz sicherstellen',
    ],
    dataQuality: {
      sufficientData: chunks.length >= 2,
      pagesAnalyzed: new Set(chunks.map(c => c.url)).size,
      contentCharacters: chunks.reduce((sum, c) => sum + c.charCount, 0),
      uniqueContentCharacters: chunks.reduce((sum, c) => sum + c.charCount, 0),
      qualityScore: Math.min(1, chunks.length / 10),
      issues: chunks.length < 3 ? ['Wenige Seiten analysiert'] : [],
    },
    metadata: {
      analysisMethod: 'ollama',
      modelUsed: OLLAMA_MODEL,
      processingTimeMs,
      chunksProcessed: chunks.length,
      traceId: '',
    },
  };

  logger?.setRiskClassification(
    result.riskLevel,
    result.riskScore,
    result.classificationReasoning,
    []
  );

  return result;
}

function createRuleBasedResult(
  aggregated: AggregatedFindings,
  chunks: ContentChunk[],
  config: ScannerConfig,
  processingTimeMs: number,
  logger?: AnalysisLogger
): EvidenceBasedAnalysis {
  // Rule-based classification based on feature types
  let riskLevel: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' = 'MINIMAL_RISK';
  let riskScore = 15;

  const hasHighRiskFeatures = aggregated.featureTypes.some(t =>
    ['biometric', 'decision', 'scoring', 'surveillance'].includes(t)
  );
  const hasLimitedRiskFeatures = aggregated.featureTypes.some(t =>
    ['chatbot', 'generation', 'emotion', 'recommendation'].includes(t)
  );

  if (hasHighRiskFeatures && aggregated.avgConfidence >= config.classification.minConfidenceForHighRisk) {
    riskLevel = 'HIGH_RISK';
    riskScore = 70;
  } else if (hasLimitedRiskFeatures) {
    riskLevel = 'LIMITED_RISK';
    riskScore = 40;
  } else if (aggregated.totalCount > 0) {
    riskLevel = 'LIMITED_RISK';
    riskScore = 30;
  }

  // Build findings from aggregated data
  const findings = buildFindingsFromAggregated(aggregated, chunks);

  const result: EvidenceBasedAnalysis = {
    riskLevel,
    riskScore,
    classificationConfidence: aggregated.avgConfidence,
    aiContentDetected: aggregated.totalCount > 0,
    summary: `${aggregated.totalCount} KI-bezogene Hinweise gefunden. Feature-Typen: ${aggregated.featureTypes.join(', ')}.`,
    classificationReasoning: `Regelbasierte Klassifizierung basierend auf ${aggregated.totalCount} Evidence-Einträgen.`,
    findings,
    detectedFeatureTypes: aggregated.featureTypes,
    complianceGaps: determineComplianceGaps(riskLevel, aggregated.featureTypes),
    nextSteps: determineNextSteps(riskLevel, aggregated.featureTypes),
    dataQuality: {
      sufficientData: true,
      pagesAnalyzed: new Set(chunks.map(c => c.url)).size,
      contentCharacters: chunks.reduce((sum, c) => sum + c.charCount, 0),
      uniqueContentCharacters: chunks.reduce((sum, c) => sum + c.charCount, 0),
      qualityScore: 0.7,
      issues: [],
    },
    metadata: {
      analysisMethod: 'ollama',
      modelUsed: OLLAMA_MODEL,
      processingTimeMs,
      chunksProcessed: chunks.length,
      traceId: '',
    },
  };

  logger?.setRiskClassification(
    result.riskLevel,
    result.riskScore,
    result.classificationReasoning,
    aggregated.evidenceQuotes.slice(0, 5)
  );

  return result;
}

function buildAnalysisResult(
  parsed: Record<string, unknown>,
  aggregated: AggregatedFindings,
  chunks: ContentChunk[],
  config: ScannerConfig,
  processingTimeMs: number,
  logger?: AnalysisLogger
): EvidenceBasedAnalysis {
  // Extract and validate from parsed response
  const riskLevelRaw = (parsed.risk_level as string || 'MINIMAL_RISK').toUpperCase();
  const validLevels = ['PROHIBITED', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK', 'UNKNOWN'];
  const riskLevel = validLevels.includes(riskLevelRaw)
    ? riskLevelRaw as 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | 'UNKNOWN'
    : 'MINIMAL_RISK';

  const riskScore = typeof parsed.risk_score === 'number'
    ? Math.min(100, Math.max(0, parsed.risk_score))
    : calculateRiskScore(riskLevel, aggregated);

  const confidence = typeof parsed.confidence === 'number'
    ? Math.min(1, Math.max(0, parsed.confidence))
    : aggregated.avgConfidence;

  // Build findings from aggregated data
  const findings = buildFindingsFromAggregated(aggregated, chunks);

  const result: EvidenceBasedAnalysis = {
    riskLevel,
    riskScore,
    classificationConfidence: confidence,
    aiContentDetected: parsed.ai_detected !== false,
    summary: (parsed.summary as string) || `KI-System mit ${aggregated.totalCount} Evidence-Einträgen identifiziert.`,
    classificationReasoning: (parsed.classification_reasoning as string) || 'LLM-basierte Klassifizierung',
    findings,
    detectedFeatureTypes: aggregated.featureTypes,
    complianceGaps: Array.isArray(parsed.compliance_gaps)
      ? (parsed.compliance_gaps as string[])
      : determineComplianceGaps(riskLevel, aggregated.featureTypes),
    nextSteps: Array.isArray(parsed.next_steps)
      ? (parsed.next_steps as string[])
      : determineNextSteps(riskLevel, aggregated.featureTypes),
    dataQuality: {
      sufficientData: true,
      pagesAnalyzed: new Set(chunks.map(c => c.url)).size,
      contentCharacters: chunks.reduce((sum, c) => sum + c.charCount, 0),
      uniqueContentCharacters: chunks.reduce((sum, c) => sum + c.charCount, 0),
      qualityScore: 0.8,
      issues: [],
    },
    metadata: {
      analysisMethod: 'ollama',
      modelUsed: OLLAMA_MODEL,
      processingTimeMs,
      chunksProcessed: chunks.length,
      traceId: '',
    },
  };

  logger?.setRiskClassification(
    result.riskLevel,
    result.riskScore,
    result.classificationReasoning,
    Array.isArray(parsed.key_evidence) ? (parsed.key_evidence as string[]) : []
  );

  return result;
}

function buildFindingsFromAggregated(
  aggregated: AggregatedFindings,
  chunks: ContentChunk[]
): EvidenceBasedFinding[] {
  const findings: EvidenceBasedFinding[] = [];
  let findingIndex = 0;

  for (const [featureType, chunkFindings] of aggregated.byFeatureType) {
    // Group similar findings
    const evidences: Evidence[] = [];

    for (const cf of chunkFindings) {
      // Find the chunk for this finding
      const chunk = chunks.find(c =>
        c.content.toLowerCase().includes(cf.evidenceQuote.toLowerCase().substring(0, 50))
      );

      evidences.push({
        id: `evidence_${findingIndex}_${evidences.length}`,
        quote: cf.evidenceQuote,
        sourceUrl: chunk?.url || 'unknown',
        pageTitle: chunk?.pageTitle || 'unknown',
        chunkId: chunk?.id || 'unknown',
        headingContext: chunk?.headings || [],
        charPosition: 0,
        relevanceScore: cf.confidence,
      });
    }

    // Create one finding per feature type
    const mainClaim = chunkFindings[0];
    findings.push({
      id: `finding_${findingIndex++}`,
      featureType,
      claim: mainClaim.claim,
      description: mainClaim.whyItMatters || getDefaultDescription(featureType),
      euAiActRelevance: getEuAiActRelevance(featureType),
      articleReferences: getArticleReferences(featureType),
      severity: getSeverity(featureType),
      evidence: evidences,
      confidence: chunkFindings.reduce((sum, f) => sum + f.confidence, 0) / chunkFindings.length,
      recommendation: getRecommendation(featureType),
    });
  }

  return findings;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseJsonResponse(text: string): Record<string, unknown> | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to find JSON object directly
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    return JSON.parse(text);
  } catch {
    return null;
  }
}

function calculateRiskScore(
  riskLevel: string,
  aggregated: AggregatedFindings
): number {
  const baseScores: Record<string, number> = {
    'PROHIBITED': 95,
    'HIGH_RISK': 70,
    'LIMITED_RISK': 40,
    'MINIMAL_RISK': 15,
    'UNKNOWN': 25,
  };

  let score = baseScores[riskLevel] || 25;

  // Adjust based on evidence count
  score += Math.min(10, aggregated.totalCount * 2);

  // Adjust based on confidence
  score = score * (0.7 + 0.3 * aggregated.avgConfidence);

  return Math.min(100, Math.max(0, Math.round(score)));
}

function determineComplianceGaps(
  riskLevel: string,
  featureTypes: AIFeatureType[]
): string[] {
  const gaps: string[] = [];

  if (riskLevel === 'HIGH_RISK') {
    gaps.push('Konformitätsbewertung nach Art. 43 erforderlich');
    gaps.push('Risikomanagement-System nach Art. 9 prüfen');
    gaps.push('Technische Dokumentation nach Art. 11 erstellen');
  }

  if (riskLevel === 'LIMITED_RISK' || featureTypes.includes('chatbot')) {
    gaps.push('Transparenzpflicht nach Art. 50 umsetzen');
  }

  if (featureTypes.includes('generation')) {
    gaps.push('Kennzeichnung KI-generierter Inhalte nach Art. 50(4)');
  }

  return gaps;
}

function determineNextSteps(
  riskLevel: string,
  featureTypes: AIFeatureType[]
): string[] {
  const steps: string[] = [];

  if (riskLevel === 'PROHIBITED') {
    steps.push('Sofortige rechtliche Prüfung des Systems');
    steps.push('Betrieb in aktueller Form stoppen');
    steps.push('Alternative Ansätze evaluieren');
  } else if (riskLevel === 'HIGH_RISK') {
    steps.push('Vollständige Konformitätsbewertung durchführen');
    steps.push('Risikomanagement-System implementieren');
    steps.push('CE-Kennzeichnung und EU-Konformitätserklärung vorbereiten');
  } else if (riskLevel === 'LIMITED_RISK') {
    steps.push('Transparenz-Hinweise implementieren');
    steps.push('Nutzer über KI-Einsatz informieren');
  }

  steps.push('Regelmäßige Compliance-Überprüfung einplanen');

  return steps;
}

function getDefaultDescription(featureType: AIFeatureType): string {
  const descriptions: Record<AIFeatureType, string> = {
    chatbot: 'Automatisiertes Dialogsystem für Nutzerinteraktion',
    recommendation: 'Personalisiertes Empfehlungssystem basierend auf Nutzerdaten',
    generation: 'KI-basierte Inhaltsgenerierung',
    analysis: 'Automatisierte Datenanalyse und Mustererkennung',
    automation: 'Automatisierte Prozesssteuerung',
    biometric: 'Biometrische Identifikation oder Kategorisierung',
    decision: 'Automatisierte Entscheidungsfindung',
    emotion: 'Emotionserkennung oder Stimmungsanalyse',
    scoring: 'Automatisiertes Bewertungs- oder Scoring-System',
    surveillance: 'Überwachungs- oder Monitoring-System',
    profiling: 'Automatisiertes Nutzerprofiling',
    other: 'Sonstiges KI-basiertes System',
  };
  return descriptions[featureType] || descriptions.other;
}

function getEuAiActRelevance(featureType: AIFeatureType): string {
  const relevance: Record<AIFeatureType, string> = {
    chatbot: 'Transparenzpflicht nach Art. 50(1): Nutzer müssen informiert werden, dass sie mit einem KI-System interagieren.',
    recommendation: 'Bei Einfluss auf wesentliche Entscheidungen können Hochrisiko-Anforderungen gelten.',
    generation: 'Kennzeichnungspflicht für KI-generierte Inhalte nach Art. 50(4).',
    analysis: 'Je nach Einsatzbereich können Hochrisiko-Anforderungen nach Anhang III gelten.',
    automation: 'Bei sicherheitsrelevanten Systemen können Hochrisiko-Anforderungen gelten.',
    biometric: 'Biometrische Systeme fallen unter Hochrisiko (Anhang III Nr. 1) oder können verboten sein (Art. 5).',
    decision: 'Automatisierte Entscheidungen in sensiblen Bereichen sind Hochrisiko nach Anhang III.',
    emotion: 'Emotionserkennung unterliegt Art. 50(3). Am Arbeitsplatz/Schule nach Art. 5(1)(f) verboten.',
    scoring: 'Social Scoring durch Behörden ist verboten (Art. 5(1)(c)). Kredit-Scoring ist Hochrisiko.',
    surveillance: 'Biometrische Echtzeit-Überwachung in öffentlichen Räumen ist grundsätzlich verboten (Art. 5).',
    profiling: 'Profiling kann Transparenz- und bei Hochrisiko-Bereichen weitere Pflichten auslösen.',
    other: 'Je nach konkretem Einsatz können verschiedene Anforderungen des EU AI Act gelten.',
  };
  return relevance[featureType] || relevance.other;
}

function getArticleReferences(featureType: AIFeatureType): string[] {
  const refs: Record<AIFeatureType, string[]> = {
    chatbot: ['Art. 50(1) EU AI Act'],
    recommendation: ['Anhang III EU AI Act'],
    generation: ['Art. 50(4) EU AI Act'],
    analysis: ['Anhang III EU AI Act'],
    automation: ['Anhang III EU AI Act'],
    biometric: ['Art. 5 EU AI Act', 'Anhang III Nr. 1 EU AI Act'],
    decision: ['Anhang III EU AI Act', 'Art. 14 EU AI Act'],
    emotion: ['Art. 5(1)(f) EU AI Act', 'Art. 50(3) EU AI Act'],
    scoring: ['Art. 5(1)(c) EU AI Act', 'Anhang III Nr. 5 EU AI Act'],
    surveillance: ['Art. 5(1)(h) EU AI Act'],
    profiling: ['Art. 50 EU AI Act'],
    other: [],
  };
  return refs[featureType] || [];
}

function getSeverity(featureType: AIFeatureType): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  const severities: Record<AIFeatureType, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
    chatbot: 'medium',
    recommendation: 'medium',
    generation: 'medium',
    analysis: 'low',
    automation: 'low',
    biometric: 'high',
    decision: 'high',
    emotion: 'high',
    scoring: 'critical',
    surveillance: 'critical',
    profiling: 'medium',
    other: 'low',
  };
  return severities[featureType] || 'info';
}

function getRecommendation(featureType: AIFeatureType): string {
  const recs: Record<AIFeatureType, string> = {
    chatbot: 'Implementieren Sie einen klaren Hinweis, dass Nutzer mit einem KI-System kommunizieren.',
    recommendation: 'Dokumentieren Sie die Empfehlungslogik und ermöglichen Sie Opt-out-Optionen.',
    generation: 'Kennzeichnen Sie KI-generierte Inhalte maschinenlesbar und für Nutzer sichtbar.',
    analysis: 'Dokumentieren Sie Analysemethoden und stellen Sie Transparenz sicher.',
    automation: 'Implementieren Sie angemessene menschliche Aufsicht.',
    biometric: 'Prüfen Sie Rechtmäßigkeit, holen Sie Einwilligungen ein, erstellen Sie Datenschutz-Folgenabschätzung.',
    decision: 'Stellen Sie menschliche Aufsicht sicher und ermöglichen Sie Anfechtung von Entscheidungen.',
    emotion: 'Prüfen Sie ob der Einsatz nach Art. 5(1)(f) verboten ist. Bei erlaubtem Einsatz: Einwilligung einholen.',
    scoring: 'Prüfen Sie ob Social Scoring vorliegt (verboten). Bei Kredit-Scoring: Hochrisiko-Anforderungen umsetzen.',
    surveillance: 'Prüfen Sie Rechtmäßigkeit nach Art. 5. Echtzeit-Biometrie in öffentlichen Räumen ist grundsätzlich verboten.',
    profiling: 'Informieren Sie betroffene Personen und ermöglichen Sie Widerspruch.',
    other: 'Prüfen Sie die spezifischen Anforderungen basierend auf dem konkreten Einsatzzweck.',
  };
  return recs[featureType] || recs.other;
}
