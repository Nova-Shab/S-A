/**
 * Analysis Logger - Debug logging and trace file generation
 *
 * Creates audit-friendly analysis_trace.json files for debugging
 * and verifying analysis decisions.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AnalysisTrace,
  CrawlTraceEntry,
  ChunkTraceEntry,
  ChunkAnalysisTraceEntry,
  AnalysisIssue,
  ScannerConfig,
  DEFAULT_SCANNER_CONFIG,
} from '../types/evidenceTypes';

const TRACE_VERSION = '2.0.0';

export class AnalysisLogger {
  private trace: AnalysisTrace;
  private config: ScannerConfig;
  private debugMode: boolean;

  constructor(scanId: string, config?: Partial<ScannerConfig>) {
    this.config = { ...DEFAULT_SCANNER_CONFIG, ...config };
    this.debugMode = this.config.debugMode;

    this.trace = {
      scanId,
      traceVersion: TRACE_VERSION,
      startTime: new Date().toISOString(),
      endTime: '',
      durationMs: 0,
      input: { type: 'url', value: '' },
      crawl: {
        urls: [],
        totalPagesAttempted: 0,
        totalPagesSuccessful: 0,
        totalContentChars: 0,
        uniqueContentChars: 0,
        duplicateCharsRemoved: 0,
      },
      chunking: {
        strategy: this.config.chunking.strategy,
        chunkSize: this.config.chunking.maxChunkChars,
        chunkOverlap: this.config.chunking.chunkOverlap,
        totalChunks: 0,
        chunks: [],
      },
      llmAnalysis: {
        provider: 'none',
        chunkResults: [],
      },
      aggregation: {
        totalFindings: 0,
        findingsBeforeDedup: 0,
        findingsAfterDedup: 0,
        evidenceCount: 0,
        aiContentDetected: false,
        riskClassification: {
          level: 'UNKNOWN',
          score: 0,
          reasoning: '',
          evidenceSummary: [],
        },
      },
      config: {
        maxPages: this.config.crawl.maxPages,
        maxDepth: this.config.crawl.maxDepth,
        chunkSize: this.config.chunking.maxChunkChars,
        chunkOverlap: this.config.chunking.chunkOverlap,
        minContentChars: this.config.extraction.minContentChars,
        confidenceThreshold: this.config.classification.minConfidenceForHighRisk,
        ollamaUrl: process.env.OLLAMA_URL,
        ollamaModel: process.env.OLLAMA_MODEL,
      },
      issues: [],
    };
  }

  // ============================================================================
  // LOGGING METHODS
  // ============================================================================

  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    if (!this.debugMode && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [Scanner:${this.trace.scanId}] [${level.toUpperCase()}]`;

    if (data) {
      console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
    this.addIssue('warning', 'WARN', message, data as Record<string, unknown>);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
    this.addIssue('error', 'ERROR', message, data as Record<string, unknown>);
  }

  // ============================================================================
  // INPUT TRACKING
  // ============================================================================

  setInput(type: 'url' | 'description', value: string, systemName?: string): void {
    this.trace.input = { type, value, systemName };
    this.debug(`Input set: ${type} = ${value.substring(0, 100)}...`);
  }

  // ============================================================================
  // CRAWL TRACKING
  // ============================================================================

  logCrawlStart(url: string): void {
    this.debug(`Starting crawl: ${url}`);
    this.trace.crawl.totalPagesAttempted++;
  }

  logCrawlResult(entry: CrawlTraceEntry): void {
    this.trace.crawl.urls.push(entry);

    if (entry.success) {
      this.trace.crawl.totalPagesSuccessful++;
      this.trace.crawl.totalContentChars += entry.contentLength;
      this.debug(`Crawled successfully: ${entry.url} (${entry.contentLength} chars, ${entry.fetchTimeMs}ms)`);
    } else {
      this.warn(`Crawl failed: ${entry.url} - ${entry.error}`);
    }
  }

  updateUniqueContent(uniqueChars: number, duplicateChars: number): void {
    this.trace.crawl.uniqueContentChars = uniqueChars;
    this.trace.crawl.duplicateCharsRemoved = duplicateChars;
    this.debug(`Content deduplication: ${uniqueChars} unique chars, ${duplicateChars} duplicate chars removed`);
  }

  // ============================================================================
  // CHUNKING TRACKING
  // ============================================================================

  logChunk(entry: ChunkTraceEntry): void {
    this.trace.chunking.chunks.push(entry);
    this.trace.chunking.totalChunks++;
    this.debug(`Chunk created: ${entry.chunkId} from ${entry.url} (${entry.charCount} chars)`);
  }

  // ============================================================================
  // LLM ANALYSIS TRACKING
  // ============================================================================

  setLLMProvider(provider: 'ollama' | 'gpt' | 'keyword', model?: string): void {
    this.trace.llmAnalysis.provider = provider;
    this.trace.llmAnalysis.model = model;
    this.info(`LLM provider set: ${provider}${model ? ` (${model})` : ''}`);
  }

  setLLMParams(temperature: number, topP?: number, seed?: number): void {
    this.trace.llmAnalysis.temperature = temperature;
    this.trace.llmAnalysis.topP = topP;
    this.trace.llmAnalysis.seed = seed;
    this.debug(`LLM params: temp=${temperature}, topP=${topP}, seed=${seed}`);
  }

  logChunkAnalysis(entry: ChunkAnalysisTraceEntry): void {
    this.trace.llmAnalysis.chunkResults.push(entry);
    this.debug(`Chunk analysis complete: ${entry.chunkId} (${entry.findings.length} findings, ${entry.processingTimeMs}ms)`);
  }

  logAggregation(prompt: string, response: string): void {
    this.trace.llmAnalysis.aggregationPrompt = prompt;
    this.trace.llmAnalysis.aggregationResponse = response;
    this.debug('Aggregation complete');
  }

  // ============================================================================
  // AGGREGATION TRACKING
  // ============================================================================

  setAggregationResult(
    totalFindings: number,
    findingsBeforeDedup: number,
    findingsAfterDedup: number,
    evidenceCount: number,
    aiContentDetected: boolean
  ): void {
    this.trace.aggregation.totalFindings = totalFindings;
    this.trace.aggregation.findingsBeforeDedup = findingsBeforeDedup;
    this.trace.aggregation.findingsAfterDedup = findingsAfterDedup;
    this.trace.aggregation.evidenceCount = evidenceCount;
    this.trace.aggregation.aiContentDetected = aiContentDetected;

    this.info(`Aggregation: ${totalFindings} findings, ${evidenceCount} evidence items, AI detected: ${aiContentDetected}`);
  }

  setRiskClassification(
    level: string,
    score: number,
    reasoning: string,
    evidenceSummary: string[]
  ): void {
    this.trace.aggregation.riskClassification = {
      level,
      score,
      reasoning,
      evidenceSummary,
    };

    this.info(`Risk classification: ${level} (score: ${score})`, { reasoning, evidenceSummary });
  }

  // ============================================================================
  // ISSUE TRACKING
  // ============================================================================

  addIssue(level: 'error' | 'warning' | 'info', code: string, message: string, context?: Record<string, unknown>): void {
    const issue: AnalysisIssue = { level, code, message, context };
    this.trace.issues.push(issue);
  }

  // ============================================================================
  // FINALIZATION
  // ============================================================================

  finalize(): AnalysisTrace {
    this.trace.endTime = new Date().toISOString();
    this.trace.durationMs = new Date(this.trace.endTime).getTime() - new Date(this.trace.startTime).getTime();

    this.info(`Analysis complete in ${this.trace.durationMs}ms`);

    // Save trace file if configured
    if (this.config.saveTrace) {
      this.saveTraceFile();
    }

    return this.trace;
  }

  private saveTraceFile(): void {
    try {
      const traceDir = this.config.traceDir;

      // Ensure directory exists
      if (!fs.existsSync(traceDir)) {
        fs.mkdirSync(traceDir, { recursive: true });
      }

      const filename = `analysis_trace_${this.trace.scanId}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filepath = path.join(traceDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(this.trace, null, 2));
      this.info(`Trace saved: ${filepath}`);
    } catch (error) {
      this.error('Failed to save trace file', { error: String(error) });
    }
  }

  getTrace(): AnalysisTrace {
    return this.trace;
  }
}

// ============================================================================
// SINGLETON LOGGER FACTORY
// ============================================================================

const loggerInstances = new Map<string, AnalysisLogger>();

export function createLogger(scanId: string, config?: Partial<ScannerConfig>): AnalysisLogger {
  const logger = new AnalysisLogger(scanId, config);
  loggerInstances.set(scanId, logger);
  return logger;
}

export function getLogger(scanId: string): AnalysisLogger | undefined {
  return loggerInstances.get(scanId);
}

export function removeLogger(scanId: string): void {
  loggerInstances.delete(scanId);
}
