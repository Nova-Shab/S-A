import axios from 'axios';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { DocumentAIAnalysis } from '../models/SystemAudit';
import { getRequirementById } from '../data/euAiActRequirements';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'eu-ai-act';

// Extract text from various document types
export async function extractTextFromDocument(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  console.log(`[DocAnalysis] Extracting text from: ${filePath} (type: ${ext})`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`Datei nicht gefunden: ${filePath}`);
  }

  try {
    let text = '';

    switch (ext) {
      case '.pdf':
        console.log('[DocAnalysis] Processing PDF...');
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfParser = new PDFParse({ data: pdfBuffer });
        const pdfResult = await pdfParser.getText();
        text = pdfResult.text;
        await pdfParser.destroy();
        break;

      case '.docx':
      case '.doc':
        console.log('[DocAnalysis] Processing DOCX/DOC...');
        const docxResult = await mammoth.extractRawText({ path: filePath });
        text = docxResult.value;
        if (docxResult.messages && docxResult.messages.length > 0) {
          console.log('[DocAnalysis] Mammoth warnings:', docxResult.messages);
        }
        break;

      case '.txt':
      case '.md':
        console.log('[DocAnalysis] Processing text file...');
        text = fs.readFileSync(filePath, 'utf-8');
        break;

      default:
        throw new Error(`Nicht unterstütztes Dateiformat: ${ext}`);
    }

    console.log(`[DocAnalysis] Extracted ${text.length} characters`);

    if (!text || text.trim().length === 0) {
      throw new Error('Dokument enthält keinen extrahierbaren Text');
    }

    return text;
  } catch (error) {
    console.error('[DocAnalysis] Error extracting text:', error);
    throw error;
  }
}

// Analyze document with Ollama for a specific requirement
export async function analyzeDocumentForRequirement(
  documentText: string,
  requirementId: string,
  fileName: string
): Promise<DocumentAIAnalysis> {
  const requirement = getRequirementById(requirementId);

  if (!requirement) {
    throw new Error(`Anforderung ${requirementId} nicht gefunden`);
  }

  const prompt = `Du bist ein EU AI Act Calmpliance-Prüfer. Analysiere das folgende Dokument als Nachweis für die Anforderung "${requirement.title}" (${requirement.articleReference}).

ANFORDERUNG:
${requirement.description}

PRÜFPUNKTE:
${requirement.checklistItems?.map(item => `- ${item}`).join('\n') || 'Keine spezifischen Prüfpunkte'}

DOKUMENT (${fileName}):
${documentText.substring(0, 8000)}

Analysiere das Dokument und antworte NUR mit validem JSON:
{
  "completenessScore": 0-100,
  "relevanceScore": 0-100,
  "findings": ["Liste der positiven Befunde"],
  "gaps": ["Liste der Lücken oder fehlenden Aspekte"],
  "recommendations": ["Konkrete Verbesserungsvorschläge"],
  "overallAssessment": "adequate|needs_improvement|insufficient"
}

Bewerte streng nach EU AI Act Standards.`;

  try {
    console.log(`[DocAnalysis] Sending to Ollama (${OLLAMA_MODEL}) at ${OLLAMA_API_URL}...`);
    console.log(`[DocAnalysis] Document text length: ${documentText.length} chars`);

    const response = await axios.post(
      `${OLLAMA_API_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 1500,
        },
      },
      { timeout: 120000 }
    );

    const content = response.data.response;
    console.log(`[DocAnalysis] Ollama response received (${content?.length || 0} chars)`);

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('[DocAnalysis] No JSON found in response, using fallback');
      return createFallbackAnalysis(documentText, requirement.title);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[DocAnalysis] Analysis complete: completeness=${parsed.completenessScore}, relevance=${parsed.relevanceScore}`);

    return {
      analyzedAt: new Date().toISOString(),
      model: OLLAMA_MODEL,
      completenessScore: Math.min(100, Math.max(0, parsed.completenessScore || 50)),
      relevanceScore: Math.min(100, Math.max(0, parsed.relevanceScore || 50)),
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      overallAssessment: ['adequate', 'needs_improvement', 'insufficient'].includes(parsed.overallAssessment)
        ? parsed.overallAssessment
        : 'needs_improvement',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[DocAnalysis] Ollama request failed: ${error.code} - ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.error('[DocAnalysis] Ollama is not running. Start with: ollama serve');
      }
    } else {
      console.error('[DocAnalysis] Ollama analysis error:', error);
    }
    return createFallbackAnalysis(documentText, requirement.title);
  }
}

// Create fallback analysis when Ollama fails
function createFallbackAnalysis(documentText: string, requirementTitle: string): DocumentAIAnalysis {
  const wordCount = documentText.split(/\s+/).length;
  const hasContent = wordCount > 100;

  return {
    analyzedAt: new Date().toISOString(),
    model: 'fallback-keyword',
    completenessScore: hasContent ? 50 : 20,
    relevanceScore: hasContent ? 50 : 30,
    findings: hasContent
      ? ['Dokument enthält relevanten Text']
      : ['Dokument enthält wenig analysierbaren Text'],
    gaps: [
      'Automatische KI-Analyse nicht verfügbar',
      'Manuelle Prüfung empfohlen',
    ],
    recommendations: [
      'Stellen Sie sicher, dass Ollama läuft (ollama serve)',
      'Prüfen Sie das Dokument manuell auf Vollständigkeit',
    ],
    overallAssessment: 'needs_improvement',
  };
}

// Check if document analysis is available (Ollama running with correct model)
export async function isDocumentAnalysisAvailable(): Promise<boolean> {
  if (process.env.SCANNER_USE_OLLAMA !== 'true') {
    console.log('[DocAnalysis] Ollama is disabled (SCANNER_USE_OLLAMA !== true)');
    return false;
  }

  try {
    console.log(`[DocAnalysis] Checking Ollama availability at ${OLLAMA_API_URL}...`);
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 5000 });

    if (response.status === 200) {
      const models = response.data.models || [];
      const modelNames = models.map((m: { name: string }) => m.name);
      console.log(`[DocAnalysis] Ollama running. Available models: ${modelNames.join(', ')}`);

      // Check if the required model exists
      const hasModel = modelNames.some((name: string) =>
        name.includes(OLLAMA_MODEL) || name.startsWith(OLLAMA_MODEL)
      );

      if (!hasModel) {
        console.warn(`[DocAnalysis] Model '${OLLAMA_MODEL}' not found. Create with: ollama create ${OLLAMA_MODEL} -f Modelfile`);
      }

      return true;
    }
    return false;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      console.log('[DocAnalysis] Ollama not running (ECONNREFUSED)');
    } else {
      console.log('[DocAnalysis] Ollama check failed:', error);
    }
    return false;
  }
}

// Analyze multiple documents for a requirement
export async function analyzeDocumentsForRequirement(
  documents: Array<{ filePath: string; fileName: string }>,
  requirementId: string
): Promise<DocumentAIAnalysis[]> {
  const results: DocumentAIAnalysis[] = [];

  for (const doc of documents) {
    try {
      const text = await extractTextFromDocument(doc.filePath);
      const analysis = await analyzeDocumentForRequirement(text, requirementId, doc.fileName);
      results.push(analysis);
    } catch (error) {
      console.error(`Error analyzing ${doc.fileName}:`, error);
      results.push({
        analyzedAt: new Date().toISOString(),
        model: 'error',
        completenessScore: 0,
        relevanceScore: 0,
        findings: [],
        gaps: [`Fehler bei der Analyse: ${error instanceof Error ? error.message : 'Unbekannt'}`],
        recommendations: ['Prüfen Sie das Dateiformat und versuchen Sie es erneut'],
        overallAssessment: 'insufficient',
      });
    }
  }

  return results;
}
