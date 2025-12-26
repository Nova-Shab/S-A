import axios from 'axios';
import * as cheerio from 'cheerio';

// Detected AI feature on a website
export interface DetectedAIFeature {
  name: string;
  type: 'chatbot' | 'recommendation' | 'generation' | 'analysis' | 'automation' | 'biometric' | 'decision' | 'other';
  description: string;
  location: string; // URL where found
  confidence: 'high' | 'medium' | 'low';
  euAiActRelevance: string;
  riskIndicators: string[];
}

// Scraped page data
interface PageData {
  url: string;
  title: string;
  content: string;
  links: string[];
  aiIndicators: string[];
  features: DetectedAIFeature[];
}

// AI feature detection patterns
const AI_FEATURE_PATTERNS = [
  // Chatbots & Assistants
  {
    patterns: ['chatbot', 'chat-bot', 'live chat', 'virtual assistant', 'ai assistant', 'conversational ai', 'customer support bot', 'support chat'],
    type: 'chatbot' as const,
    name: 'Chatbot / Virtueller Assistent',
    euRelevance: 'Art. 50 - Transparenzpflichten: Nutzer müssen informiert werden',
    risk: ['Transparenz erforderlich', 'KI-Kennzeichnung notwendig'],
  },
  // Content Generation
  {
    patterns: ['ai-generated', 'generate content', 'content generation', 'text generation', 'image generation', 'ai writer', 'ai art', 'create with ai', 'ai-powered creation'],
    type: 'generation' as const,
    name: 'KI-Inhaltsgenerierung',
    euRelevance: 'Art. 50(4) - Kennzeichnung synthetischer Inhalte',
    risk: ['Kennzeichnungspflicht', 'Deepfake-Regelungen beachten'],
  },
  // Recommendations
  {
    patterns: ['recommendation', 'personalized', 'suggested for you', 'you might like', 'based on your', 'tailored', 'curated for', 'smart suggestions'],
    type: 'recommendation' as const,
    name: 'Empfehlungssystem',
    euRelevance: 'Transparenz bei Personalisierung empfohlen',
    risk: ['Profilierung prüfen', 'DSGVO beachten'],
  },
  // Analysis & Recognition
  {
    patterns: ['facial recognition', 'face detection', 'image recognition', 'voice recognition', 'speech recognition', 'biometric', 'fingerprint', 'emotion detection'],
    type: 'biometric' as const,
    name: 'Biometrische Erkennung',
    euRelevance: 'Potenziell Hochrisiko nach Anhang III',
    risk: ['Hochrisiko-Klassifizierung möglich', 'Konformitätsbewertung erforderlich', 'Art. 5 Verbote prüfen'],
  },
  // Automated Decision Making
  {
    patterns: ['automated decision', 'auto-approve', 'instant approval', 'automatic scoring', 'ai-powered decision', 'smart screening', 'auto-filter'],
    type: 'decision' as const,
    name: 'Automatisierte Entscheidungsfindung',
    euRelevance: 'Art. 14 - Menschliche Aufsicht erforderlich',
    risk: ['Menschliche Aufsicht sicherstellen', 'Erklärbarkeit gewährleisten'],
  },
  // Analysis Tools
  {
    patterns: ['ai analysis', 'smart analytics', 'predictive', 'machine learning', 'deep learning', 'neural network', 'ai-powered insights', 'intelligent analysis'],
    type: 'analysis' as const,
    name: 'KI-gestützte Analyse',
    euRelevance: 'Je nach Anwendungsbereich unterschiedlich',
    risk: ['Anwendungskontext prüfen', 'Datenqualität sicherstellen'],
  },
  // Automation
  {
    patterns: ['automation', 'automate', 'auto-pilot', 'autonomous', 'self-driving', 'robotic process', 'rpa', 'workflow automation'],
    type: 'automation' as const,
    name: 'Prozessautomatisierung',
    euRelevance: 'Je nach Einsatzbereich unterschiedlich',
    risk: ['Sicherheitskomponenten prüfen', 'Menschliche Kontrolle'],
  },
];

// Links to follow for AI-related content
const RELEVANT_LINK_PATTERNS = [
  /features?/i, /product/i, /how.?it.?works/i, /technology/i,
  /about/i, /pricing/i, /solutions?/i, /platform/i,
  /ai/i, /machine.?learning/i, /automation/i,
  /capabilities/i, /tools?/i, /services?/i,
];

// Links to avoid
const EXCLUDED_LINK_PATTERNS = [
  /login/i, /sign.?up/i, /register/i, /cart/i, /checkout/i,
  /privacy/i, /terms/i, /legal/i, /cookie/i, /gdpr/i,
  /blog\/\d/i, /news\/\d/i, // Individual blog/news posts
  /\.(pdf|doc|zip|png|jpg|gif)$/i,
  /mailto:/i, /tel:/i, /javascript:/i,
  /#$/,
];

// Scrape a single page
async function scrapePage(url: string, baseUrl: string): Promise<PageData | null> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'EU-AI-Act-Scanner/1.0 (Compliance Analysis)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de,en;q=0.9',
      },
      maxRedirects: 3,
      validateStatus: (status) => status < 400,
    });

    const $ = cheerio.load(response.data);

    // Remove non-content elements
    $('script, style, nav, footer, noscript, iframe, svg, [aria-hidden="true"]').remove();

    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim() || '';

    // Extract main content
    const mainContent = $('main, article, .content, .main, #content, #main, [role="main"]').text();
    const content = (mainContent || $('body').text())
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 30000);

    // Extract links
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          // Only include links from same domain
          if (absoluteUrl.startsWith(baseUrl) && !links.includes(absoluteUrl)) {
            // Check if link matches relevant patterns and not excluded
            const isRelevant = RELEVANT_LINK_PATTERNS.some(p => p.test(href));
            const isExcluded = EXCLUDED_LINK_PATTERNS.some(p => p.test(href));
            if (isRelevant && !isExcluded) {
              links.push(absoluteUrl);
            }
          }
        } catch {
          // Invalid URL, skip
        }
      }
    });

    // Find AI indicators
    const lowerContent = content.toLowerCase();
    const aiIndicators: string[] = [];

    const indicatorKeywords = [
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'ai-powered', 'ai powered', 'automated',
      'intelligent', 'smart', 'predictive', 'generative ai',
    ];

    indicatorKeywords.forEach(kw => {
      if (lowerContent.includes(kw)) {
        aiIndicators.push(kw);
      }
    });

    // Detect specific AI features
    const features: DetectedAIFeature[] = [];

    AI_FEATURE_PATTERNS.forEach(pattern => {
      const matchedPatterns = pattern.patterns.filter(p => lowerContent.includes(p.toLowerCase()));
      if (matchedPatterns.length > 0) {
        features.push({
          name: pattern.name,
          type: pattern.type,
          description: `Erkannt durch: ${matchedPatterns.join(', ')}`,
          location: url,
          confidence: matchedPatterns.length >= 2 ? 'high' : matchedPatterns.length === 1 ? 'medium' : 'low',
          euAiActRelevance: pattern.euRelevance,
          riskIndicators: pattern.risk,
        });
      }
    });

    return {
      url,
      title,
      content,
      links: links.slice(0, 10), // Limit links per page
      aiIndicators,
      features,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Main advanced scraping function
export async function advancedWebScrape(
  url: string,
  options: { maxPages?: number; maxDepth?: number } = {}
): Promise<{
  pagesScraped: number;
  totalContent: string;
  detectedFeatures: DetectedAIFeature[];
  allAiIndicators: string[];
  scrapedUrls: string[];
  summary: string;
}> {
  const { maxPages = 5, maxDepth = 2 } = options;

  // Normalize base URL
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  const visitedUrls = new Set<string>();
  const urlQueue: { url: string; depth: number }[] = [{ url, depth: 0 }];
  const allContent: string[] = [];
  const allFeatures: DetectedAIFeature[] = [];
  const allIndicators: string[] = [];
  const scrapedUrls: string[] = [];

  while (urlQueue.length > 0 && visitedUrls.size < maxPages) {
    const current = urlQueue.shift();
    if (!current || visitedUrls.has(current.url)) continue;

    visitedUrls.add(current.url);
    console.log(`Scraping (${visitedUrls.size}/${maxPages}): ${current.url}`);

    const pageData = await scrapePage(current.url, baseUrl);
    if (!pageData) continue;

    scrapedUrls.push(current.url);
    allContent.push(`[${pageData.title}] ${pageData.content}`);
    allFeatures.push(...pageData.features);
    allIndicators.push(...pageData.aiIndicators);

    // Add new links to queue if not at max depth
    if (current.depth < maxDepth) {
      pageData.links.forEach(link => {
        if (!visitedUrls.has(link)) {
          urlQueue.push({ url: link, depth: current.depth + 1 });
        }
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Deduplicate features by name
  const uniqueFeatures = allFeatures.reduce((acc, feature) => {
    const existing = acc.find(f => f.name === feature.name);
    if (!existing) {
      acc.push(feature);
    } else if (feature.confidence === 'high' && existing.confidence !== 'high') {
      // Replace with higher confidence version
      const idx = acc.indexOf(existing);
      acc[idx] = feature;
    }
    return acc;
  }, [] as DetectedAIFeature[]);

  // Deduplicate indicators
  const uniqueIndicators = [...new Set(allIndicators)];

  // Generate summary
  let summary = `${scrapedUrls.length} Seiten wurden analysiert. `;

  if (uniqueFeatures.length > 0) {
    summary += `${uniqueFeatures.length} KI-Feature(s) erkannt: ${uniqueFeatures.map(f => f.name).join(', ')}. `;
  } else if (uniqueIndicators.length > 0) {
    summary += `KI-Indikatoren gefunden: ${uniqueIndicators.slice(0, 5).join(', ')}. `;
  } else {
    summary += 'Keine expliziten KI-Features auf der Website erkannt. ';
  }

  return {
    pagesScraped: scrapedUrls.length,
    totalContent: allContent.join('\n\n').substring(0, 50000),
    detectedFeatures: uniqueFeatures,
    allAiIndicators: uniqueIndicators,
    scrapedUrls,
    summary,
  };
}

export default advancedWebScrape;
