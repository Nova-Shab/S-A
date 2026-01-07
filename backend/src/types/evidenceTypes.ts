/**
 * Evidence-First EU AI Act Scanner Types
 *
 * All claims must be backed by concrete evidence from crawled content.
 * No assumptions, no world knowledge - only what's in the text.
 */

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export interface Evidence {
  /** Unique identifier for this evidence */
  id: string;
  /** Direct quote from the source (max 200 chars) */
  quote: string;
  /** URL where this evidence was found */
  sourceUrl: string;
  /** Page title where evidence was found */
  pageTitle: string;
  /** Chunk ID where this evidence was found */
  chunkId: string;
  /** Heading context (h1, h2, h3 above the quote) */
  headingContext: string[];
  /** Character position in original text */
  charPosition: number;
  /** Confidence that this quote supports the claim (0-1) */
  relevanceScore: number;
}

export interface EvidenceBasedFinding {
  /** Unique finding ID */
  id: string;
  /** Type of AI feature detected */
  featureType: AIFeatureType;
  /** Short claim/assertion */
  claim: string;
  /** Detailed description */
  description: string;
  /** Why this matters for EU AI Act */
  euAiActRelevance: string;
  /** Relevant EU AI Act article(s) */
  articleReferences: string[];
  /** Severity: critical, high, medium, low, info */
  severity: FindingSeverity;
  /** All evidence supporting this finding */
  evidence: Evidence[];
  /** Confidence score (0-1) based on evidence strength */
  confidence: number;
  /** Recommendation for action */
  recommendation: string;
}

export type AIFeatureType =
  | 'chatbot'           // Chatbots, virtual assistants
  | 'recommendation'    // Personalization, recommendations
  | 'generation'        // AI-generated content, deepfakes
  | 'analysis'          // Data analysis, pattern recognition
  | 'automation'        // Process automation
  | 'biometric'         // Biometric identification/categorization
  | 'decision'          // Automated decision making
  | 'emotion'           // Emotion recognition
  | 'scoring'           // Social scoring, credit scoring
  | 'surveillance'      // Surveillance, monitoring
  | 'profiling'         // User profiling
  | 'other';            // Other AI systems

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// ============================================================================
// CHUNK TYPES
// ============================================================================

export interface ContentChunk {
  /** Unique chunk identifier */
  id: string;
  /** Source URL */
  url: string;
  /** Page title */
  pageTitle: string;
  /** Heading hierarchy above this chunk */
  headings: string[];
  /** The actual text content */
  content: string;
  /** Character count */
  charCount: number;
  /** Word count */
  wordCount: number;
  /** Position in the page (0-based) */
  position: number;
  /** Content type: main, sidebar, footer, etc. */
  contentType: 'main' | 'sidebar' | 'navigation' | 'footer' | 'unknown';
  /** Hash for deduplication */
  contentHash: string;
}

export interface ChunkExtractionResult {
  /** Findings extracted from this chunk */
  findings: ChunkFinding[];
  /** Whether any AI-related content was found */
  hasAiContent: boolean;
  /** Raw model response for debugging */
  rawResponse: string;
  /** Processing time in ms */
  processingTimeMs: number;
}

export interface ChunkFinding {
  /** Type of AI feature */
  featureType: AIFeatureType;
  /** Short claim */
  claim: string;
  /** Direct quote from chunk (MUST exist in chunk) */
  evidenceQuote: string;
  /** Confidence (0-1) */
  confidence: number;
  /** Brief explanation */
  whyItMatters: string;
}

// ============================================================================
// CRAWL TYPES
// ============================================================================

export interface CrawlResult {
  /** URL that was crawled */
  url: string;
  /** HTTP status code */
  statusCode: number;
  /** Page title */
  title: string;
  /** Meta description */
  metaDescription: string;
  /** Extracted main content */
  mainContent: string;
  /** Content after boilerplate removal */
  cleanedContent: string;
  /** Character count of cleaned content */
  contentLength: number;
  /** Crawl timestamp */
  timestamp: Date;
  /** Time to fetch in ms */
  fetchTimeMs: number;
  /** Error message if failed */
  error?: string;
  /** Links found on this page */
  foundLinks: string[];
  /** Whether this page was successfully processed */
  success: boolean;
}

export interface CrawlSession {
  /** Session ID (same as scan ID) */
  sessionId: string;
  /** Start URL */
  startUrl: string;
  /** All crawled pages */
  pages: CrawlResult[];
  /** Total pages attempted */
  pagesAttempted: number;
  /** Successfully crawled pages */
  pagesSuccessful: number;
  /** Total content characters extracted */
  totalContentChars: number;
  /** Unique content hashes (for deduplication) */
  uniqueContentHashes: Set<string>;
  /** Crawl start time */
  startTime: Date;
  /** Crawl end time */
  endTime?: Date;
  /** Total duration in ms */
  durationMs?: number;
}

// ============================================================================
// ANALYSIS TRACE TYPES (for audit/debugging)
// ============================================================================

export interface AnalysisTrace {
  /** Scan/trace ID */
  scanId: string;
  /** Trace version for schema changes */
  traceVersion: string;
  /** Timestamp when analysis started */
  startTime: string;
  /** Timestamp when analysis completed */
  endTime: string;
  /** Total duration in ms */
  durationMs: number;

  /** Input information */
  input: {
    type: 'url' | 'description';
    value: string;
    systemName?: string;
  };

  /** Crawl phase details */
  crawl: {
    urls: CrawlTraceEntry[];
    totalPagesAttempted: number;
    totalPagesSuccessful: number;
    totalContentChars: number;
    uniqueContentChars: number;
    duplicateCharsRemoved: number;
  };

  /** Chunking phase details */
  chunking: {
    strategy: 'semantic' | 'fixed' | 'hybrid';
    chunkSize: number;
    chunkOverlap: number;
    totalChunks: number;
    chunks: ChunkTraceEntry[];
  };

  /** LLM analysis phase */
  llmAnalysis: {
    provider: 'ollama' | 'gpt' | 'keyword' | 'none';
    model?: string;
    temperature?: number;
    topP?: number;
    seed?: number;
    chunkResults: ChunkAnalysisTraceEntry[];
    aggregationPrompt?: string;
    aggregationResponse?: string;
  };

  /** Final aggregation */
  aggregation: {
    totalFindings: number;
    findingsBeforeDedup: number;
    findingsAfterDedup: number;
    evidenceCount: number;
    aiContentDetected: boolean;
    riskClassification: {
      level: string;
      score: number;
      reasoning: string;
      evidenceSummary: string[];
    };
  };

  /** Configuration used */
  config: {
    maxPages: number;
    maxDepth: number;
    chunkSize: number;
    chunkOverlap: number;
    minContentChars: number;
    confidenceThreshold: number;
    ollamaUrl?: string;
    ollamaModel?: string;
  };

  /** Any errors or warnings */
  issues: AnalysisIssue[];
}

export interface CrawlTraceEntry {
  url: string;
  statusCode: number;
  success: boolean;
  contentLength: number;
  fetchTimeMs: number;
  timestamp: string;
  error?: string;
}

export interface ChunkTraceEntry {
  chunkId: string;
  url: string;
  headings: string[];
  charCount: number;
  wordCount: number;
  contentPreview: string; // First 200 chars
}

export interface ChunkAnalysisTraceEntry {
  chunkId: string;
  prompt: string;
  response: string;
  findings: ChunkFinding[];
  processingTimeMs: number;
  timestamp: string;
}

export interface AnalysisIssue {
  level: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// AGGREGATED ANALYSIS RESULT
// ============================================================================

export interface EvidenceBasedAnalysis {
  /** Risk level classification */
  riskLevel: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | 'UNKNOWN';
  /** Risk score (0-100) */
  riskScore: number;
  /** Confidence in the classification (0-1) */
  classificationConfidence: number;

  /** Whether AI content was detected */
  aiContentDetected: boolean;
  /** If no AI detected, reason why */
  noAiReason?: string;

  /** Summary text */
  summary: string;
  /** Detailed reasoning for classification */
  classificationReasoning: string;

  /** All evidence-based findings */
  findings: EvidenceBasedFinding[];

  /** Detected AI feature types */
  detectedFeatureTypes: AIFeatureType[];

  /** Compliance gaps identified */
  complianceGaps: string[];

  /** Recommended next steps */
  nextSteps: string[];

  /** Data quality assessment */
  dataQuality: {
    sufficientData: boolean;
    pagesAnalyzed: number;
    contentCharacters: number;
    uniqueContentCharacters: number;
    qualityScore: number; // 0-1
    issues: string[];
  };

  /** Analysis metadata */
  metadata: {
    analysisMethod: 'ollama' | 'gpt' | 'keyword' | 'hybrid';
    modelUsed?: string;
    processingTimeMs: number;
    chunksProcessed: number;
    traceId: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ScannerConfig {
  /** Enable debug logging */
  debugMode: boolean;
  /** Save analysis trace to file */
  saveTrace: boolean;
  /** Trace output directory */
  traceDir: string;

  /** Crawl settings */
  crawl: {
    maxPages: number;
    maxDepth: number;
    timeoutMs: number;
    userAgent: string;
    respectRobotsTxt: boolean;
    priorityPaths: string[]; // Paths to always try (e.g., /faq, /datenschutz)
  };

  /** Content extraction settings */
  extraction: {
    minContentChars: number;
    maxContentChars: number;
    removeBoilerplate: boolean;
    deduplicateContent: boolean;
  };

  /** Chunking settings */
  chunking: {
    strategy: 'semantic' | 'fixed' | 'hybrid';
    maxChunkChars: number;
    chunkOverlap: number;
    minChunkChars: number;
  };

  /** LLM settings */
  llm: {
    provider: 'ollama' | 'gpt' | 'auto';
    temperature: number;
    topP: number;
    maxTokens: number;
    timeout: number;
  };

  /** Classification settings */
  classification: {
    minConfidenceForHighRisk: number;
    minEvidenceForClaim: number;
    conservativeMode: boolean; // When true, defaults to lower risk
  };
}

export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  debugMode: process.env.SCANNER_DEBUG === 'true',
  saveTrace: process.env.SCANNER_SAVE_TRACE === 'true',
  traceDir: process.env.SCANNER_TRACE_DIR || './traces',

  crawl: {
    maxPages: 10,
    maxDepth: 2,
    timeoutMs: 15000,
    userAgent: 'EU-AI-Act-Scanner/2.0 (Compliance Analysis Bot)',
    respectRobotsTxt: true,
    priorityPaths: ['/faq', '/datenschutz', '/privacy', '/agb', '/terms', '/hilfe', '/help', '/about', '/ueber-uns', '/kontakt', '/contact', '/features', '/produkte', '/products', '/services', '/leistungen'],
  },

  extraction: {
    minContentChars: 500,
    maxContentChars: 100000,
    removeBoilerplate: true,
    deduplicateContent: true,
  },

  chunking: {
    strategy: 'semantic',
    maxChunkChars: 2000,
    chunkOverlap: 200,
    minChunkChars: 100,
  },

  llm: {
    provider: 'auto',
    temperature: 0.1,
    topP: 0.9,
    maxTokens: 2000,
    timeout: 120000,
  },

  classification: {
    minConfidenceForHighRisk: 0.7,
    minEvidenceForClaim: 1,
    conservativeMode: true,
  },
};
