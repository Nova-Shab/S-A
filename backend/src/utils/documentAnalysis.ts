import axios from 'axios';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
import { DocumentAIAnalysis } from '../models/SystemAudit';
import { getRequirementById } from '../data/euAiActRequirements';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'eu-ai-act';

// Extract text from various document types
export async function extractTextFromDocument(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  try {
    switch (ext) {
      case '.pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;

      case '.docx':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;

      case '.txt':
      case '.md':
        return fs.readFileSync(filePath, 'utf-8');

      default:
        throw new Error(`Nicht unterstütztes Dateiformat: ${ext}`);
    }
  } catch (error) {
    console.error('Error extracting text:', error);
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

  const prompt = `Du bist ein EU AI Act Compliance-Prüfer. Analysiere das folgende Dokument als Nachweis für die Anforderung "${requirement.title}" (${requirement.articleReference}).

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
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return createFallbackAnalysis(documentText, requirement.title);
    }

    const parsed = JSON.parse(jsonMatch[0]);

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
    console.error('Ollama analysis error:', error);
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

// Check if document analysis is available (Ollama running)
export async function isDocumentAnalysisAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 5000 });
    return response.status === 200;
  } catch {
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
