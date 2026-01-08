import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import SystemAudit, { EvidenceDocument, RequirementAnswer } from '../models/SystemAudit';
import {
  extractTextFromDocument,
  analyzeDocumentForRequirement,
  isDocumentAnalysisAvailable,
} from '../utils/documentAnalysis';

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/evidence');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Nicht unterstütztes Dateiformat. Erlaubt: ${allowedTypes.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload document and analyze with AI
export const uploadAndAnalyzeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { auditId, requirementId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: 'Keine Datei hochgeladen' });
      return;
    }

    if (!auditId || !requirementId) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      res.status(400).json({ success: false, error: 'auditId und requirementId sind erforderlich' });
      return;
    }

    // Find audit
    const audit = await SystemAudit.findByPk(auditId);
    if (!audit) {
      fs.unlinkSync(file.path);
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      fs.unlinkSync(file.path);
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Check if Ollama is available for analysis
    const aiAvailable = await isDocumentAnalysisAvailable();

    // Create evidence document record
    const evidenceDoc: EvidenceDocument = {
      id: uuidv4(),
      fileName: file.originalname,
      fileType: path.extname(file.originalname).toLowerCase(),
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.id.toString(),
      filePath: file.path,
    };

    // Perform AI analysis if available
    if (aiAvailable) {
      try {
        const documentText = await extractTextFromDocument(file.path);
        const aiAnalysis = await analyzeDocumentForRequirement(
          documentText,
          requirementId,
          file.originalname
        );
        evidenceDoc.aiAnalysis = aiAnalysis;
      } catch (analysisError) {
        console.error('AI analysis error:', analysisError);
        // Continue without AI analysis
      }
    }

    // Update audit answers with new evidence
    const updatedAnswers = audit.answers.map((answer: RequirementAnswer) => {
      if (answer.requirementId === requirementId) {
        return {
          ...answer,
          evidence: [...(answer.evidence || []), evidenceDoc],
          lastUpdated: new Date().toISOString(),
        };
      }
      return answer;
    });

    await audit.update({ answers: updatedAnswers });

    res.status(201).json({
      success: true,
      document: {
        id: evidenceDoc.id,
        fileName: evidenceDoc.fileName,
        fileType: evidenceDoc.fileType,
        fileSize: evidenceDoc.fileSize,
        uploadedAt: evidenceDoc.uploadedAt,
        aiAnalysis: evidenceDoc.aiAnalysis || null,
      },
      message: aiAvailable
        ? 'Dokument hochgeladen und KI-Analyse durchgeführt'
        : 'Dokument hochgeladen (KI-Analyse nicht verfügbar)',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Hochladen des Dokuments' });
  }
};

// Re-analyze a document that was already uploaded
export const reanalyzeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { auditId, requirementId, documentId } = req.params;

    const audit = await SystemAudit.findByPk(auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Find the document in the answers
    const answer = audit.answers.find((a: RequirementAnswer) => a.requirementId === requirementId);
    if (!answer) {
      res.status(404).json({ success: false, error: 'Anforderung nicht gefunden' });
      return;
    }

    const document = answer.evidence?.find((e: EvidenceDocument) => e.id === documentId);
    if (!document) {
      res.status(404).json({ success: false, error: 'Dokument nicht gefunden' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      res.status(404).json({ success: false, error: 'Dokumentdatei nicht gefunden' });
      return;
    }

    // Perform analysis
    const documentText = await extractTextFromDocument(document.filePath);
    const aiAnalysis = await analyzeDocumentForRequirement(
      documentText,
      requirementId,
      document.fileName
    );

    // Update the document with new analysis
    const updatedAnswers = audit.answers.map((a: RequirementAnswer) => {
      if (a.requirementId === requirementId) {
        return {
          ...a,
          evidence: a.evidence?.map((e: EvidenceDocument) => {
            if (e.id === documentId) {
              return { ...e, aiAnalysis };
            }
            return e;
          }),
          lastUpdated: new Date().toISOString(),
        };
      }
      return a;
    });

    await audit.update({ answers: updatedAnswers });

    res.json({
      success: true,
      aiAnalysis,
      message: 'Dokument erneut analysiert',
    });
  } catch (error) {
    console.error('Reanalyze error:', error);
    res.status(500).json({ success: false, error: 'Fehler bei der erneuten Analyse' });
  }
};

// Delete an evidence document
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { auditId, requirementId, documentId } = req.params;

    const audit = await SystemAudit.findByPk(auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Find and remove the document
    let documentPath: string | null = null;
    const updatedAnswers = audit.answers.map((a: RequirementAnswer) => {
      if (a.requirementId === requirementId) {
        const doc = a.evidence?.find((e: EvidenceDocument) => e.id === documentId);
        if (doc) {
          documentPath = doc.filePath;
        }
        return {
          ...a,
          evidence: a.evidence?.filter((e: EvidenceDocument) => e.id !== documentId) || [],
          lastUpdated: new Date().toISOString(),
        };
      }
      return a;
    });

    await audit.update({ answers: updatedAnswers });

    // Delete file from disk
    if (documentPath && fs.existsSync(documentPath)) {
      fs.unlinkSync(documentPath);
    }

    res.json({
      success: true,
      message: 'Dokument gelöscht',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Löschen des Dokuments' });
  }
};

// Check if AI analysis is available
export const checkAnalysisAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const available = await isDocumentAnalysisAvailable();
    res.json({
      success: true,
      aiAnalysisAvailable: available,
      message: available
        ? 'KI-Dokumentanalyse verfügbar (Ollama läuft)'
        : 'KI-Dokumentanalyse nicht verfügbar (Ollama nicht erreichbar)',
    });
  } catch (error) {
    res.json({
      success: true,
      aiAnalysisAvailable: false,
      message: 'KI-Dokumentanalyse nicht verfügbar',
    });
  }
};

// Simple analyze-only endpoint (doesn't require auditId)
// Used for local/frontend document analysis
export const analyzeDocumentOnly = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { requirementId, requirementTitle } = req.body;

    console.log('[DocAnalysis] analyzeDocumentOnly called');
    console.log('[DocAnalysis] File:', file?.originalname, file?.size);
    console.log('[DocAnalysis] requirementId:', requirementId);

    if (!file) {
      res.status(400).json({ success: false, error: 'Keine Datei hochgeladen' });
      return;
    }

    if (!requirementId) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      res.status(400).json({ success: false, error: 'requirementId ist erforderlich' });
      return;
    }

    // Check if Ollama is available for analysis
    const aiAvailable = await isDocumentAnalysisAvailable();
    console.log('[DocAnalysis] AI available:', aiAvailable);

    let analysis = null;

    if (aiAvailable) {
      try {
        console.log('[DocAnalysis] Extracting text from:', file.path);
        const documentText = await extractTextFromDocument(file.path);
        console.log('[DocAnalysis] Extracted text length:', documentText.length);

        console.log('[DocAnalysis] Starting AI analysis...');
        analysis = await analyzeDocumentForRequirement(
          documentText,
          requirementId,
          file.originalname
        );
        console.log('[DocAnalysis] Analysis complete:', analysis);
      } catch (analysisError) {
        console.error('[DocAnalysis] AI analysis error:', analysisError);
        // Continue without AI analysis
      }
    }

    // Clean up uploaded file after analysis
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.warn('[DocAnalysis] Could not delete temp file:', file.path);
    }

    // Return response matching frontend expectations
    res.status(200).json({
      success: true,
      analysis: analysis ? {
        relevanceScore: analysis.relevanceScore,
        completenessScore: analysis.completenessScore,
        status: 'completed',
        findings: analysis.findings || [],
        gaps: analysis.gaps || [],
        recommendations: analysis.recommendations || [],
        summary: `Bewertung: ${analysis.overallAssessment === 'adequate' ? 'Ausreichend' : analysis.overallAssessment === 'needs_improvement' ? 'Verbesserungsbedarf' : 'Unzureichend'}`,
        analyzedAt: analysis.analyzedAt,
      } : null,
      aiAnalysisAvailable: aiAvailable,
      message: analysis
        ? 'Dokument erfolgreich analysiert'
        : aiAvailable
          ? 'Analyse fehlgeschlagen'
          : 'KI-Analyse nicht verfügbar (Ollama nicht erreichbar)',
    });
  } catch (error) {
    console.error('[DocAnalysis] Analyze error:', error);
    res.status(500).json({ success: false, error: 'Fehler bei der Dokumentanalyse' });
  }
};
