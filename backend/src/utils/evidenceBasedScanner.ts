/**
 * Evidence-Based Scanner - Main orchestration module
 *
 * Coordinates crawling, extraction, chunking, LLM analysis, and aggregation.
 * All findings must be backed by concrete evidence.
 */

import axios from 'axios';
import {
  ContentChunk,
  CrawlResult,
  EvidenceBasedAnalysis,
  ScannerConfig,
  DEFAULT_SCANNER_CONFIG,
  ChunkExtractionResult,
} from '../types/evidenceTypes';
import { AnalysisLogger, createLogger, removeLogger } from './analysisLogger';
import {
  extractContent,
  createSemanticChunks,
  deduplicateChunks,
  assessDataQuality,
  ExtractedContent,
} from './contentExtractor';
import {
  analyzeChunk,
  aggregateChunkFindings,
  performSiteLevelAnalysis,
} from './evidenceOllamaAnalysis';

// ============================================================================
// CRAWLER
// ============================================================================

async function crawlUrl(
  url: string,
  config: ScannerConfig,
  logger: AnalysisLogger
): Promise<CrawlResult> {
  const startTime = Date.now();
  logger.logCrawlStart(url);

  try {
    const response = await axios.get(url, {
      timeout: config.crawl.timeoutMs,
      headers: {
        'User-Agent': config.crawl.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de,en;q=0.9',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    const html = response.data;
    const extracted = extractContent(html, url, logger);

    const result: CrawlResult = {
      url,
      statusCode: response.status,
      title: extracted.title,
      metaDescription: extracted.metaDescription,
      mainContent: extracted.mainContent,
      cleanedContent: extracted.mainContent,
      contentLength: extracted.mainContent.length,
      timestamp: new Date(),
      fetchTimeMs: Date.now() - startTime,
      foundLinks: extractLinks(html, url),
      success: true,
    };

    logger.logCrawlResult({
      url: result.url,
      statusCode: result.statusCode,
      success: true,
      contentLength: result.contentLength,
      fetchTimeMs: result.fetchTimeMs,
      timestamp: result.timestamp.toISOString(),
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    const result: CrawlResult = {
      url,
      statusCode: 0,
      title: '',
      metaDescription: '',
      mainContent: '',
      cleanedContent: '',
      contentLength: 0,
      timestamp: new Date(),
      fetchTimeMs: Date.now() - startTime,
      error: errorMessage,
      foundLinks: [],
      success: false,
    };

    logger.logCrawlResult({
      url: result.url,
      statusCode: 0,
      success: false,
      contentLength: 0,
      fetchTimeMs: result.fetchTimeMs,
      timestamp: result.timestamp.toISOString(),
      error: errorMessage,
    });

    return result;
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;

  const baseUrlObj = new URL(baseUrl);

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
        continue;
      }

      const fullUrl = new URL(href, baseUrl);

      // Only include same-domain links
      if (fullUrl.hostname === baseUrlObj.hostname) {
        links.push(fullUrl.href);
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return [...new Set(links)];
}

function filterRelevantLinks(
  links: string[],
  crawledUrls: Set<string>,
  config: ScannerConfig
): string[] {
  const priorityPatterns = config.crawl.priorityPaths.map(p => p.toLowerCase());

  const excludePatterns = [
    '/login', '/signup', '/signin', '/register', '/logout',
    '/cart', '/checkout', '/basket', '/warenkorb',
    '/blog/', '/news/', '/press/', '/presse/',
    '.pdf', '.doc', '.xls', '.zip', '.jpg', '.png', '.gif',
    '/wp-admin', '/admin',
  ];

  const includePatterns = [
    '/features', '/produkt', '/product', '/service', '/leistung',
    '/technology', '/technologie', '/how', '/wie',
    '/about', '/ueber', '/über',
    '/faq', '/help', '/hilfe',
    '/privacy', '/datenschutz', '/agb', '/terms', '/impressum',
    '/contact', '/kontakt',
    '/solutions', '/loesung', '/lösung',
    '/platform', '/plattform',
    '/pricing', '/preise',
  ];

  return links.filter(link => {
    if (crawledUrls.has(link)) return false;

    const lowerLink = link.toLowerCase();

    // Exclude unwanted patterns
    if (excludePatterns.some(p => lowerLink.includes(p))) return false;

    // Priority paths always included
    if (priorityPatterns.some(p => lowerLink.includes(p))) return true;

    // Include relevant patterns
    if (includePatterns.some(p => lowerLink.includes(p))) return true;

    // Include root-level pages (likely important)
    const path = new URL(link).pathname;
    const segments = path.split('/').filter(s => s.length > 0);
    if (segments.length <= 1) return true;

    return false;
  });
}

// ============================================================================
// MAIN SCANNER
// ============================================================================

export interface ScanOptions {
  config?: Partial<ScannerConfig>;
  systemName?: string;
}

export async function performEvidenceBasedScan(
  inputType: 'url' | 'description',
  inputValue: string,
  options: ScanOptions = {}
): Promise<EvidenceBasedAnalysis> {
  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const config = { ...DEFAULT_SCANNER_CONFIG, ...options.config };
  const logger = createLogger(scanId, config);

  try {
    logger.info(`Starting evidence-based scan: ${inputType}`);
    logger.setInput(inputType, inputValue, options.systemName);

    let result: EvidenceBasedAnalysis;

    if (inputType === 'url') {
      result = await scanUrl(inputValue, config, logger);
    } else {
      result = await scanDescription(inputValue, config, logger);
    }

    // Set trace ID
    result.metadata.traceId = scanId;

    // Finalize logging
    const trace = logger.finalize();

    logger.info(`Scan complete: ${result.riskLevel} (score: ${result.riskScore})`);

    return result;

  } catch (error) {
    logger.error(`Scan failed: ${error}`);
    throw error;
  } finally {
    removeLogger(scanId);
  }
}

async function scanUrl(
  startUrl: string,
  config: ScannerConfig,
  logger: AnalysisLogger
): Promise<EvidenceBasedAnalysis> {
  // Phase 1: Crawl pages
  logger.info('Phase 1: Crawling website');
  const crawlResults: CrawlResult[] = [];
  const crawledUrls = new Set<string>();
  const urlQueue: string[] = [startUrl];

  // Add priority paths
  try {
    const baseUrl = new URL(startUrl);
    for (const path of config.crawl.priorityPaths) {
      const priorityUrl = new URL(path, baseUrl.origin).href;
      if (!urlQueue.includes(priorityUrl)) {
        urlQueue.push(priorityUrl);
      }
    }
  } catch {
    // Invalid URL, continue with original
  }

  while (urlQueue.length > 0 && crawledUrls.size < config.crawl.maxPages) {
    const url = urlQueue.shift()!;
    if (crawledUrls.has(url)) continue;

    crawledUrls.add(url);
    const result = await crawlUrl(url, config, logger);
    crawlResults.push(result);

    // Add new links to queue
    if (result.success && result.foundLinks.length > 0) {
      const relevantLinks = filterRelevantLinks(result.foundLinks, crawledUrls, config);
      urlQueue.push(...relevantLinks.slice(0, 5)); // Limit new links per page
    }
  }

  const successfulCrawls = crawlResults.filter(r => r.success);
  logger.info(`Crawled ${successfulCrawls.length}/${crawlResults.length} pages successfully`);

  if (successfulCrawls.length === 0) {
    return createErrorResult('Keine Seiten konnten erfolgreich gecrawlt werden.', logger);
  }

  // Phase 2: Extract and chunk content
  logger.info('Phase 2: Extracting and chunking content');
  let allChunks: ContentChunk[] = [];
  const seenHashes = new Set<string>();

  for (const crawlResult of successfulCrawls) {
    const extracted = extractContent(crawlResult.mainContent, crawlResult.url, logger);
    const chunks = createSemanticChunks(extracted, crawlResult.url, config, logger);

    // Deduplicate
    const dedupResult = deduplicateChunks(chunks, seenHashes, logger);
    allChunks.push(...dedupResult.chunks);

    // Update seen hashes
    for (const chunk of dedupResult.chunks) {
      seenHashes.add(chunk.contentHash);
    }
  }

  logger.info(`Created ${allChunks.length} unique chunks`);

  // Assess data quality
  const dataQuality = assessDataQuality(crawlResults, allChunks, config);

  if (!dataQuality.sufficient) {
    logger.warn('Insufficient data for reliable analysis', dataQuality);
  }

  // Phase 3: Analyze chunks with LLM
  logger.info('Phase 3: Analyzing chunks with LLM');

  // Check if Ollama is available
  const ollamaAvailable = await checkOllamaAvailable();
  if (ollamaAvailable) {
    logger.setLLMProvider('ollama', process.env.OLLAMA_MODEL || 'llama3.2');
    logger.setLLMParams(config.llm.temperature, config.llm.topP);
  } else {
    logger.setLLMProvider('keyword');
    logger.warn('Ollama not available, falling back to keyword analysis');
  }

  const chunkResults = new Map<string, ChunkExtractionResult>();

  if (ollamaAvailable) {
    // Analyze each chunk with Ollama
    for (const chunk of allChunks) {
      const result = await analyzeChunk(chunk, config, logger);
      chunkResults.set(chunk.id, result);
    }
  } else {
    // Keyword-based analysis (fallback)
    for (const chunk of allChunks) {
      const result = performKeywordAnalysis(chunk);
      chunkResults.set(chunk.id, result);
    }
  }

  // Phase 4: Aggregate findings
  logger.info('Phase 4: Aggregating findings');
  const aggregated = aggregateChunkFindings(chunkResults, allChunks);

  logger.setAggregationResult(
    aggregated.totalCount,
    aggregated.totalCount,
    aggregated.uniqueClaims.size,
    aggregated.evidenceQuotes.length,
    aggregated.totalCount > 0
  );

  // Phase 5: Site-level analysis
  logger.info('Phase 5: Performing site-level analysis');
  let analysis: EvidenceBasedAnalysis;

  if (ollamaAvailable) {
    analysis = await performSiteLevelAnalysis(aggregated, allChunks, config, logger);
  } else {
    analysis = createKeywordBasedResult(aggregated, allChunks, dataQuality, logger);
  }

  // Update data quality in result
  analysis.dataQuality = {
    ...analysis.dataQuality,
    ...dataQuality,
  };

  return analysis;
}

async function scanDescription(
  description: string,
  config: ScannerConfig,
  logger: AnalysisLogger
): Promise<EvidenceBasedAnalysis> {
  logger.info('Analyzing description input');

  // Create a single "page" from the description
  const crawlResult: CrawlResult = {
    url: 'description-input',
    statusCode: 200,
    title: 'Systembeschreibung',
    metaDescription: '',
    mainContent: description,
    cleanedContent: description,
    contentLength: description.length,
    timestamp: new Date(),
    fetchTimeMs: 0,
    foundLinks: [],
    success: true,
  };

  // Create chunks
  const extracted: ExtractedContent = {
    mainContent: description,
    title: 'Systembeschreibung',
    metaDescription: '',
    headings: [],
    paragraphHashes: [],
    sections: [{ heading: '', headingLevel: 1, content: description, charCount: description.length }],
    qualityScore: 0.5,
    warnings: [],
  };

  const chunks = createSemanticChunks(extracted, 'description-input', config, logger);

  // Analyze with LLM
  const ollamaAvailable = await checkOllamaAvailable();
  const chunkResults = new Map<string, ChunkExtractionResult>();

  if (ollamaAvailable) {
    logger.setLLMProvider('ollama', process.env.OLLAMA_MODEL || 'llama3.2');
    for (const chunk of chunks) {
      const result = await analyzeChunk(chunk, config, logger);
      chunkResults.set(chunk.id, result);
    }
  } else {
    logger.setLLMProvider('keyword');
    for (const chunk of chunks) {
      const result = performKeywordAnalysis(chunk);
      chunkResults.set(chunk.id, result);
    }
  }

  // Aggregate and analyze
  const aggregated = aggregateChunkFindings(chunkResults, chunks);

  logger.setAggregationResult(
    aggregated.totalCount,
    aggregated.totalCount,
    aggregated.uniqueClaims.size,
    aggregated.evidenceQuotes.length,
    aggregated.totalCount > 0
  );

  if (ollamaAvailable) {
    return await performSiteLevelAnalysis(aggregated, chunks, config, logger);
  } else {
    const dataQuality = assessDataQuality([crawlResult], chunks, config);
    return createKeywordBasedResult(aggregated, chunks, dataQuality, logger);
  }
}

// ============================================================================
// KEYWORD FALLBACK ANALYSIS
// ============================================================================

const KEYWORD_PATTERNS = {
  chatbot: ['chatbot', 'chat-bot', 'virtual assistant', 'virtueller assistent', 'sprachassistent', 'voice assistant'],
  recommendation: ['empfehlung', 'recommendation', 'personalisier', 'personaliz', 'vorschlag'],
  generation: ['generie', 'generate', 'ki-erstellt', 'ai-generated', 'deepfake', 'synthetisch'],
  analysis: ['analyse', 'analysis', 'auswert', 'mustererkennung', 'pattern'],
  automation: ['automat', 'roboter', 'robot', 'workflow'],
  biometric: ['biometr', 'gesichtserkennung', 'facial recognition', 'fingerabdruck', 'fingerprint'],
  decision: ['entscheidung', 'decision', 'scoring', 'bewertung', 'beurteilung'],
  emotion: ['emotion', 'stimmung', 'sentiment', 'gefühl'],
  scoring: ['scoring', 'rating', 'bewertungssystem', 'punktesystem'],
  surveillance: ['überwach', 'surveillance', 'monitoring', 'tracking'],
  profiling: ['profil', 'profile', 'nutzerverhalten', 'user behavior'],
};

function performKeywordAnalysis(chunk: ContentChunk): ChunkExtractionResult {
  const findings: ChunkExtractionResult['findings'] = [];
  const contentLower = chunk.content.toLowerCase();

  for (const [featureType, keywords] of Object.entries(KEYWORD_PATTERNS)) {
    for (const keyword of keywords) {
      const index = contentLower.indexOf(keyword.toLowerCase());
      if (index >= 0) {
        // Extract context around keyword
        const start = Math.max(0, index - 50);
        const end = Math.min(chunk.content.length, index + keyword.length + 100);
        const evidenceQuote = chunk.content.substring(start, end).trim();

        findings.push({
          featureType: featureType as any,
          claim: `Hinweis auf ${featureType} gefunden`,
          evidenceQuote: evidenceQuote.substring(0, 150),
          confidence: 0.5, // Lower confidence for keyword matches
          whyItMatters: 'Keyword-basierte Erkennung, Kontext prüfen',
        });

        break; // One finding per feature type
      }
    }
  }

  return {
    findings,
    hasAiContent: findings.length > 0,
    rawResponse: 'keyword-analysis',
    processingTimeMs: 0,
  };
}

function createKeywordBasedResult(
  aggregated: ReturnType<typeof aggregateChunkFindings>,
  chunks: ContentChunk[],
  dataQuality: ReturnType<typeof assessDataQuality>,
  logger: AnalysisLogger
): EvidenceBasedAnalysis {
  // Conservative classification for keyword-only
  let riskLevel: 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | 'UNKNOWN' = 'MINIMAL_RISK';
  let riskScore = 15;

  const hasPotentialHighRisk = aggregated.featureTypes.some(t =>
    ['biometric', 'decision', 'scoring', 'surveillance'].includes(t)
  );
  const hasLimitedRisk = aggregated.featureTypes.some(t =>
    ['chatbot', 'generation', 'emotion'].includes(t)
  );

  if (hasPotentialHighRisk) {
    riskLevel = 'LIMITED_RISK'; // Conservative: don't classify as HIGH_RISK on keywords alone
    riskScore = 45;
  } else if (hasLimitedRisk || aggregated.totalCount > 0) {
    riskLevel = 'LIMITED_RISK';
    riskScore = 35;
  }

  const result: EvidenceBasedAnalysis = {
    riskLevel,
    riskScore,
    classificationConfidence: 0.5, // Lower confidence for keyword-only
    aiContentDetected: aggregated.totalCount > 0,
    noAiReason: aggregated.totalCount === 0 ? 'Keine KI-bezogenen Keywords gefunden' : undefined,
    summary: aggregated.totalCount > 0
      ? `Keyword-Analyse: ${aggregated.totalCount} potenzielle KI-Hinweise gefunden.`
      : 'Keine eindeutigen Hinweise auf KI-Systeme gefunden.',
    classificationReasoning: 'Keyword-basierte Analyse (Ollama nicht verfügbar). Für präzisere Ergebnisse Ollama aktivieren.',
    findings: [],
    detectedFeatureTypes: aggregated.featureTypes,
    complianceGaps: [],
    nextSteps: [
      'Für genauere Analyse: Ollama installieren und eu-ai-act Modell erstellen',
      'Manuelle Prüfung der identifizierten Bereiche empfohlen',
    ],
    dataQuality: {
      sufficientData: dataQuality.sufficient,
      pagesAnalyzed: dataQuality.pagesAnalyzed,
      contentCharacters: dataQuality.totalChars,
      uniqueContentCharacters: dataQuality.uniqueChars,
      qualityScore: dataQuality.score,
      issues: [...dataQuality.issues, 'Keyword-basierte Analyse (LLM nicht verfügbar)'],
    },
    metadata: {
      analysisMethod: 'keyword',
      processingTimeMs: 0,
      chunksProcessed: chunks.length,
      traceId: '',
    },
  };

  logger.setRiskClassification(
    result.riskLevel,
    result.riskScore,
    result.classificationReasoning,
    []
  );

  return result;
}

function createErrorResult(
  errorMessage: string,
  logger: AnalysisLogger
): EvidenceBasedAnalysis {
  logger.error(errorMessage);

  return {
    riskLevel: 'UNKNOWN',
    riskScore: 0,
    classificationConfidence: 0,
    aiContentDetected: false,
    noAiReason: errorMessage,
    summary: `Analyse fehlgeschlagen: ${errorMessage}`,
    classificationReasoning: 'Analyse konnte nicht durchgeführt werden.',
    findings: [{
      id: 'error-finding',
      featureType: 'other',
      claim: 'Analyse fehlgeschlagen',
      description: errorMessage,
      euAiActRelevance: '',
      articleReferences: [],
      severity: 'info',
      evidence: [],
      confidence: 0,
      recommendation: 'Bitte URL prüfen und erneut versuchen.',
    }],
    detectedFeatureTypes: [],
    complianceGaps: [],
    nextSteps: ['URL-Zugriff prüfen', 'Alternative Eingabemethode nutzen'],
    dataQuality: {
      sufficientData: false,
      pagesAnalyzed: 0,
      contentCharacters: 0,
      uniqueContentCharacters: 0,
      qualityScore: 0,
      issues: [errorMessage],
    },
    metadata: {
      analysisMethod: 'keyword',
      processingTimeMs: 0,
      chunksProcessed: 0,
      traceId: '',
    },
  };
}

// ============================================================================
// OLLAMA AVAILABILITY CHECK
// ============================================================================

async function checkOllamaAvailable(): Promise<boolean> {
  if (process.env.SCANNER_USE_OLLAMA !== 'true') {
    return false;
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const response = await axios.get(`${ollamaUrl}/api/tags`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

// ============================================================================
// CONVERSION TO OLD FORMAT (for backward compatibility)
// ============================================================================

import { ScanAnalysis, ScanFinding, RiskLevel } from '../models/ScanResult';

export function convertToLegacyFormat(analysis: EvidenceBasedAnalysis): ScanAnalysis {
  const findings: ScanFinding[] = [];

  // Add analysis method info
  findings.push({
    category: 'Analyseverfahren',
    title: getAnalysisMethodTitle(analysis.metadata.analysisMethod),
    severity: 'info',
    description: getAnalysisMethodDescription(analysis.metadata.analysisMethod, analysis.metadata.modelUsed),
    recommendation: analysis.metadata.analysisMethod === 'keyword'
      ? 'Für präzisere Ergebnisse: Ollama installieren und eu-ai-act Modell erstellen.'
      : 'Die Ergebnisse basieren auf Evidence aus den analysierten Inhalten.',
    articleReference: '',
  });

  // Add data quality info
  if (!analysis.dataQuality.sufficientData) {
    findings.push({
      category: 'Datenqualität',
      title: 'Unzureichende Datenbasis',
      severity: 'medium',
      description: `Nur ${analysis.dataQuality.pagesAnalyzed} Seite(n) mit ${analysis.dataQuality.contentCharacters} Zeichen analysiert. ${analysis.dataQuality.issues.join('. ')}`,
      recommendation: 'Prüfen Sie die URL-Zugänglichkeit und versuchen Sie spezifische Unterseiten zu scannen.',
      articleReference: '',
    });
  }

  // Convert evidence-based findings to legacy format
  for (const f of analysis.findings) {
    const evidenceText = f.evidence.length > 0
      ? `\n\nEvidence:\n${f.evidence.map(e => `• "${e.quote}" (${e.sourceUrl})`).join('\n')}`
      : '';

    findings.push({
      category: getCategoryFromFeatureType(f.featureType),
      title: f.claim,
      severity: f.severity,
      description: f.description + evidenceText,
      recommendation: f.recommendation,
      articleReference: f.articleReferences.join(', '),
    });
  }

  return {
    riskLevel: analysis.riskLevel as RiskLevel,
    riskScore: analysis.riskScore,
    findings,
    summary: analysis.summary,
    detectedFeatures: analysis.detectedFeatureTypes.map(t => t.toString()),
    complianceGaps: analysis.complianceGaps,
    nextSteps: analysis.nextSteps,
  };
}

function getAnalysisMethodTitle(method: string): string {
  switch (method) {
    case 'ollama': return 'Lokale KI-Analyse (Ollama)';
    case 'gpt': return 'Cloud KI-Analyse (GPT)';
    case 'keyword': return 'Keyword-basierte Analyse';
    default: return 'Analyse durchgeführt';
  }
}

function getAnalysisMethodDescription(method: string, model?: string): string {
  switch (method) {
    case 'ollama':
      return `Diese Analyse wurde mit dem lokalen Ollama-Modell "${model || 'llama3.2'}" durchgeführt. Alle Daten bleiben auf Ihrem System. Die Ergebnisse basieren auf konkreter Evidence aus den analysierten Inhalten.`;
    case 'gpt':
      return `Diese Analyse wurde mit GPT durchgeführt. Die Ergebnisse basieren auf konkreter Evidence aus den analysierten Inhalten.`;
    case 'keyword':
      return 'Diese Analyse wurde mit regelbasiertem Keyword-Matching durchgeführt. Für eine KI-gestützte Tiefenanalyse kann Ollama lokal konfiguriert werden.';
    default:
      return 'Analyse durchgeführt.';
  }
}

function getCategoryFromFeatureType(featureType: string): string {
  const categories: Record<string, string> = {
    chatbot: 'Chatbot/Assistent',
    recommendation: 'Empfehlungssystem',
    generation: 'KI-generierte Inhalte',
    analysis: 'Datenanalyse',
    automation: 'Automatisierung',
    biometric: 'Biometrische Daten',
    decision: 'Automatisierte Entscheidung',
    emotion: 'Emotionserkennung',
    scoring: 'Scoring-System',
    surveillance: 'Überwachung',
    profiling: 'Profiling',
    other: 'Sonstiges KI-System',
  };
  return categories[featureType] || 'KI-System';
}
