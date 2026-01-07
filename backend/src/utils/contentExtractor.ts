/**
 * Content Extractor - Advanced boilerplate removal and main content extraction
 *
 * Focuses on extracting meaningful content while removing:
 * - Cookie banners, navigation, footers
 * - Repeated content (menus, sidebars)
 * - Scripts, styles, ads
 * - Duplicate paragraphs across pages
 */

import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { ContentChunk, CrawlResult, ScannerConfig, DEFAULT_SCANNER_CONFIG } from '../types/evidenceTypes';
import { AnalysisLogger } from './analysisLogger';

// ============================================================================
// BOILERPLATE SELECTORS TO REMOVE
// ============================================================================

const BOILERPLATE_SELECTORS = [
  // Scripts and styles
  'script', 'style', 'noscript',
  // Navigation and headers
  'nav', 'header', '.nav', '.navbar', '.navigation', '.menu', '.header',
  '#nav', '#navbar', '#navigation', '#menu', '#header',
  '[role="navigation"]', '[role="banner"]',
  // Footers
  'footer', '.footer', '#footer', '[role="contentinfo"]',
  // Sidebars
  'aside', '.sidebar', '#sidebar', '.aside', '[role="complementary"]',
  // Cookie banners and popups
  '.cookie', '.cookies', '.cookie-banner', '.cookie-consent', '.cookie-notice',
  '#cookie', '#cookies', '#cookie-banner', '#cookie-consent',
  '.consent', '.consent-banner', '.gdpr', '#gdpr',
  '.popup', '.modal', '.overlay', '.dialog',
  '[class*="cookie"]', '[id*="cookie"]',
  // Ads and promotions
  '.ad', '.ads', '.advertisement', '.banner', '.promo',
  '#ad', '#ads', '[class*="advert"]',
  // Social and sharing
  '.social', '.share', '.sharing', '.social-links',
  // Comments
  '.comments', '#comments', '.comment-section',
  // Forms (often login/newsletter)
  '.newsletter', '.signup-form', '.login-form',
  // Breadcrumbs
  '.breadcrumb', '.breadcrumbs', '[aria-label="breadcrumb"]',
  // Skip links
  '.skip-link', '.skip-nav', '#skip-nav',
  // Hidden elements
  '[hidden]', '[aria-hidden="true"]', '.hidden', '.sr-only', '.visually-hidden',
  // SVGs and icons (usually decorative)
  'svg', '.icon', '.icons',
  // iframes
  'iframe',
];

// Content-rich selectors (prioritized for extraction)
const MAIN_CONTENT_SELECTORS = [
  'main', 'article', '[role="main"]',
  '.content', '.main-content', '.page-content', '.post-content',
  '#content', '#main-content', '#main',
  '.article', '.post', '.entry',
  '.text-content', '.body-content',
];

// Headings for semantic structure
const HEADING_SELECTORS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

// ============================================================================
// CONTENT HASH FOR DEDUPLICATION
// ============================================================================

function hashContent(text: string): string {
  // Normalize text before hashing
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('md5').update(normalized).digest('hex');
}

function hashParagraph(text: string): string {
  // Hash individual paragraphs for fine-grained deduplication
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  // Only hash if paragraph is meaningful (>50 chars)
  if (normalized.length < 50) return '';

  return crypto.createHash('md5').update(normalized).digest('hex');
}

// ============================================================================
// MAIN CONTENT EXTRACTION
// ============================================================================

export interface ExtractedContent {
  /** Main content text */
  mainContent: string;
  /** Page title */
  title: string;
  /** Meta description */
  metaDescription: string;
  /** Heading structure */
  headings: HeadingInfo[];
  /** Unique paragraph hashes (for deduplication) */
  paragraphHashes: string[];
  /** Content sections with their headings */
  sections: ContentSection[];
  /** Overall content quality score (0-1) */
  qualityScore: number;
  /** Extraction warnings */
  warnings: string[];
}

export interface HeadingInfo {
  level: number;
  text: string;
  position: number;
}

export interface ContentSection {
  heading: string;
  headingLevel: number;
  content: string;
  charCount: number;
}

export function extractContent(
  html: string,
  url: string,
  logger?: AnalysisLogger
): ExtractedContent {
  const $ = cheerio.load(html);
  const warnings: string[] = [];

  // Extract metadata first
  const title = $('title').text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    '';

  const metaDescription = $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

  // Remove boilerplate elements
  BOILERPLATE_SELECTORS.forEach(selector => {
    $(selector).remove();
  });

  // Try to find main content area
  let $mainContent = $('body');
  for (const selector of MAIN_CONTENT_SELECTORS) {
    const $found = $(selector);
    if ($found.length > 0 && $found.text().trim().length > 100) {
      $mainContent = $found.first();
      logger?.debug(`Found main content using selector: ${selector}`);
      break;
    }
  }

  // Extract heading structure
  const headings: HeadingInfo[] = [];
  let position = 0;
  $mainContent.find(HEADING_SELECTORS.join(', ')).each((_, el) => {
    const $heading = $(el);
    const level = parseInt(el.tagName.substring(1), 10);
    const text = $heading.text().trim();
    if (text.length > 0 && text.length < 200) {
      headings.push({ level, text, position: position++ });
    }
  });

  // Extract content sections (grouped by headings)
  const sections: ContentSection[] = [];
  let currentHeading = '';
  let currentLevel = 0;
  let currentContent: string[] = [];

  function saveCurrentSection() {
    if (currentContent.length > 0) {
      const content = currentContent.join('\n').trim();
      if (content.length > 50) {
        sections.push({
          heading: currentHeading,
          headingLevel: currentLevel,
          content,
          charCount: content.length,
        });
      }
    }
    currentContent = [];
  }

  // Walk through elements
  $mainContent.children().each((_, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();

    if (HEADING_SELECTORS.includes(tagName)) {
      // Save previous section
      saveCurrentSection();
      // Start new section
      currentHeading = $el.text().trim();
      currentLevel = parseInt(tagName.substring(1), 10);
    } else {
      // Add content to current section
      const text = extractTextFromElement($, $el);
      if (text.length > 20) {
        currentContent.push(text);
      }
    }
  });
  saveCurrentSection();

  // If no sections found, extract all text
  if (sections.length === 0) {
    const fullText = cleanText($mainContent.text());
    if (fullText.length > 100) {
      sections.push({
        heading: title || 'Hauptinhalt',
        headingLevel: 1,
        content: fullText,
        charCount: fullText.length,
      });
    }
    warnings.push('No structured sections found, extracted full text');
  }

  // Collect paragraph hashes for deduplication
  const paragraphHashes: string[] = [];
  $mainContent.find('p, li, td, blockquote').each((_, el) => {
    const text = $(el).text().trim();
    const hash = hashParagraph(text);
    if (hash) {
      paragraphHashes.push(hash);
    }
  });

  // Build main content from sections
  const mainContent = sections
    .map(s => `${s.heading ? `## ${s.heading}\n\n` : ''}${s.content}`)
    .join('\n\n');

  // Calculate quality score
  const qualityScore = calculateQualityScore(mainContent, headings.length, sections.length);

  if (qualityScore < 0.3) {
    warnings.push(`Low content quality score: ${qualityScore.toFixed(2)}`);
  }

  logger?.debug(`Extracted content: ${mainContent.length} chars, ${sections.length} sections, quality: ${qualityScore.toFixed(2)}`);

  return {
    mainContent,
    title,
    metaDescription,
    headings,
    paragraphHashes,
    sections,
    qualityScore,
    warnings,
  };
}

function extractTextFromElement($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>): string {
  // Get text content, preserving some structure
  let text = '';

  $el.contents().each((_, node) => {
    if (node.type === 'text') {
      text += $(node).text();
    } else if (node.type === 'tag') {
      const tagName = (node as cheerio.Element).tagName?.toLowerCase();
      const $child = $(node);

      // Add appropriate spacing
      if (['p', 'div', 'br', 'li', 'tr'].includes(tagName)) {
        text += '\n' + extractTextFromElement($, $child) + '\n';
      } else if (['span', 'a', 'strong', 'em', 'b', 'i'].includes(tagName)) {
        text += ' ' + extractTextFromElement($, $child) + ' ';
      } else {
        text += extractTextFromElement($, $child);
      }
    }
  });

  return cleanText(text);
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/^\s+|\s+$/gm, '') // Trim lines
    .trim();
}

function calculateQualityScore(content: string, headingCount: number, sectionCount: number): number {
  let score = 0;

  // Length score (0-0.4)
  const length = content.length;
  if (length > 5000) score += 0.4;
  else if (length > 2000) score += 0.3;
  else if (length > 500) score += 0.2;
  else if (length > 100) score += 0.1;

  // Structure score (0-0.3)
  if (headingCount >= 5) score += 0.3;
  else if (headingCount >= 3) score += 0.2;
  else if (headingCount >= 1) score += 0.1;

  // Section score (0-0.3)
  if (sectionCount >= 5) score += 0.3;
  else if (sectionCount >= 3) score += 0.2;
  else if (sectionCount >= 1) score += 0.1;

  return Math.min(1, score);
}

// ============================================================================
// SEMANTIC CHUNKING
// ============================================================================

export function createSemanticChunks(
  content: ExtractedContent,
  url: string,
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG,
  logger?: AnalysisLogger
): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const { maxChunkChars, chunkOverlap, minChunkChars } = config.chunking;

  let chunkIndex = 0;

  for (const section of content.sections) {
    // If section fits in one chunk, use it as-is
    if (section.charCount <= maxChunkChars) {
      if (section.charCount >= minChunkChars) {
        const chunk = createChunk(
          section.content,
          url,
          content.title,
          [section.heading],
          chunkIndex++
        );
        chunks.push(chunk);
        logger?.logChunk({
          chunkId: chunk.id,
          url,
          headings: [section.heading],
          charCount: chunk.charCount,
          wordCount: chunk.wordCount,
          contentPreview: chunk.content.substring(0, 200),
        });
      }
      continue;
    }

    // Split large section into chunks
    const sectionChunks = splitIntoChunks(
      section.content,
      maxChunkChars,
      chunkOverlap,
      minChunkChars
    );

    for (const chunkContent of sectionChunks) {
      const chunk = createChunk(
        chunkContent,
        url,
        content.title,
        [section.heading],
        chunkIndex++
      );
      chunks.push(chunk);
      logger?.logChunk({
        chunkId: chunk.id,
        url,
        headings: [section.heading],
        charCount: chunk.charCount,
        wordCount: chunk.wordCount,
        contentPreview: chunk.content.substring(0, 200),
      });
    }
  }

  logger?.debug(`Created ${chunks.length} semantic chunks from ${content.sections.length} sections`);

  return chunks;
}

function createChunk(
  content: string,
  url: string,
  pageTitle: string,
  headings: string[],
  position: number
): ContentChunk {
  const cleanedContent = cleanText(content);
  return {
    id: `chunk_${position}_${hashContent(cleanedContent).substring(0, 8)}`,
    url,
    pageTitle,
    headings: headings.filter(h => h.length > 0),
    content: cleanedContent,
    charCount: cleanedContent.length,
    wordCount: cleanedContent.split(/\s+/).length,
    position,
    contentType: 'main',
    contentHash: hashContent(cleanedContent),
  };
}

function splitIntoChunks(
  text: string,
  maxChars: number,
  overlap: number,
  minChars: number
): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChars) {
      currentChunk += sentence;
    } else {
      // Save current chunk if it meets minimum
      if (currentChunk.length >= minChars) {
        chunks.push(currentChunk.trim());
      }

      // Start new chunk with overlap
      if (overlap > 0 && currentChunk.length > overlap) {
        // Take last `overlap` characters from previous chunk
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + sentence;
      } else {
        currentChunk = sentence;
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length >= minChars) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

export interface DeduplicationResult {
  /** Deduplicated chunks */
  chunks: ContentChunk[];
  /** Number of duplicates removed */
  duplicatesRemoved: number;
  /** Character count saved */
  charsSaved: number;
}

export function deduplicateChunks(
  chunks: ContentChunk[],
  existingHashes: Set<string> = new Set(),
  logger?: AnalysisLogger
): DeduplicationResult {
  const uniqueChunks: ContentChunk[] = [];
  const seenHashes = new Set(existingHashes);
  let duplicatesRemoved = 0;
  let charsSaved = 0;

  for (const chunk of chunks) {
    if (seenHashes.has(chunk.contentHash)) {
      duplicatesRemoved++;
      charsSaved += chunk.charCount;
      logger?.debug(`Duplicate chunk removed: ${chunk.id} (${chunk.charCount} chars)`);
    } else {
      seenHashes.add(chunk.contentHash);
      uniqueChunks.push(chunk);
    }
  }

  logger?.debug(`Deduplication: ${duplicatesRemoved} duplicates removed, ${charsSaved} chars saved`);

  return {
    chunks: uniqueChunks,
    duplicatesRemoved,
    charsSaved,
  };
}

// ============================================================================
// DATA QUALITY ASSESSMENT
// ============================================================================

export interface DataQualityAssessment {
  /** Is data sufficient for analysis? */
  sufficient: boolean;
  /** Quality score (0-1) */
  score: number;
  /** Number of pages analyzed */
  pagesAnalyzed: number;
  /** Total characters */
  totalChars: number;
  /** Unique characters after dedup */
  uniqueChars: number;
  /** Number of chunks */
  chunkCount: number;
  /** Issues found */
  issues: string[];
  /** Recommendations */
  recommendations: string[];
}

export function assessDataQuality(
  crawlResults: CrawlResult[],
  chunks: ContentChunk[],
  config: ScannerConfig = DEFAULT_SCANNER_CONFIG
): DataQualityAssessment {
  const issues: string[] = [];
  const recommendations: string[] = [];

  const successfulPages = crawlResults.filter(r => r.success).length;
  const totalChars = crawlResults.reduce((sum, r) => sum + r.contentLength, 0);
  const uniqueChars = chunks.reduce((sum, c) => sum + c.charCount, 0);

  let score = 0;

  // Page count score (0-0.3)
  if (successfulPages >= 5) score += 0.3;
  else if (successfulPages >= 3) score += 0.2;
  else if (successfulPages >= 1) score += 0.1;
  else issues.push('Keine Seiten erfolgreich gecrawlt');

  // Character count score (0-0.3)
  if (uniqueChars >= config.extraction.minContentChars * 3) score += 0.3;
  else if (uniqueChars >= config.extraction.minContentChars) score += 0.2;
  else if (uniqueChars >= 200) score += 0.1;
  else issues.push(`Zu wenig Inhalt extrahiert (${uniqueChars} Zeichen)`);

  // Chunk count score (0-0.2)
  if (chunks.length >= 10) score += 0.2;
  else if (chunks.length >= 5) score += 0.15;
  else if (chunks.length >= 2) score += 0.1;
  else issues.push('Zu wenige Inhaltsabschnitte');

  // Diversity score (0-0.2)
  const uniqueUrls = new Set(chunks.map(c => c.url)).size;
  if (uniqueUrls >= 3) score += 0.2;
  else if (uniqueUrls >= 2) score += 0.1;
  else recommendations.push('Mehr Unterseiten scannen für bessere Abdeckung');

  // Determine if sufficient
  const sufficient = score >= 0.4 && uniqueChars >= config.extraction.minContentChars;

  if (!sufficient) {
    recommendations.push('Prüfen Sie, ob die URL öffentlich zugänglich ist');
    recommendations.push('Versuchen Sie spezifische Produkt- oder Feature-Seiten zu scannen');
  }

  return {
    sufficient,
    score,
    pagesAnalyzed: successfulPages,
    totalChars,
    uniqueChars,
    chunkCount: chunks.length,
    issues,
    recommendations,
  };
}
