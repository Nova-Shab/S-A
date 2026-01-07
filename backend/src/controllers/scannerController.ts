import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ScanResult from '../models/ScanResult';
import { analyzeSystem, RISK_LEVEL_INFO } from '../utils/scannerAnalysis';
import generatePdfReport from '../utils/pdfReportGenerator';
import { isOllamaAvailable, getOllamaModels, checkOllamaConnection } from '../utils/ollamaAnalysis';
import { isGPTAvailable } from '../utils/gptAnalysis';

// Perform a new scan
export const performScan = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validierungsfehler',
        details: errors.array(),
      });
      return;
    }

    const { inputType, inputValue, systemName } = req.body;

    if (!inputType || !inputValue) {
      res.status(400).json({
        success: false,
        error: 'inputType und inputValue sind erforderlich',
      });
      return;
    }

    // Perform analysis (now async for URL scraping)
    const analysis = await analyzeSystem(inputType, inputValue);

    // Get user ID if authenticated
    const userId = req.user?.id;

    // Save scan result
    const scanResult = await ScanResult.create({
      userId,
      inputType,
      inputValue,
      systemName: systemName || `Scan vom ${new Date().toLocaleDateString('de-DE')}`,
      analysis,
      status: 'completed',
    });

    // Get risk level info
    const riskInfo = RISK_LEVEL_INFO[analysis.riskLevel];

    res.status(201).json({
      success: true,
      scanId: scanResult.id,
      riskLevel: analysis.riskLevel,
      riskLevelLabel: riskInfo.label,
      riskScore: analysis.riskScore,
      summary: analysis.summary,
      findingsCount: analysis.findings.length,
      criticalCount: analysis.findings.filter(f => f.severity === 'critical').length,
      highCount: analysis.findings.filter(f => f.severity === 'high').length,
      analysis,
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler bei der Analyse. Bitte versuchen Sie es erneut.',
    });
  }
};

// Get scan result by ID
export const getScanResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const scanResult = await ScanResult.findByPk(id);

    if (!scanResult) {
      res.status(404).json({
        success: false,
        error: 'Scan nicht gefunden',
      });
      return;
    }

    // Check access (if user is authenticated, they can only see their own scans)
    if (req.user && scanResult.userId && scanResult.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Zugriff verweigert',
      });
      return;
    }

    const riskInfo = RISK_LEVEL_INFO[scanResult.analysis.riskLevel];

    res.json({
      success: true,
      scan: {
        id: scanResult.id,
        inputType: scanResult.inputType,
        inputValue: scanResult.inputValue,
        systemName: scanResult.systemName,
        status: scanResult.status,
        createdAt: scanResult.createdAt,
        riskLevel: scanResult.analysis.riskLevel,
        riskLevelLabel: riskInfo.label,
        riskScore: scanResult.analysis.riskScore,
        analysis: scanResult.analysis,
      },
    });
  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Laden des Scans',
    });
  }
};

// Get scan history for authenticated user
export const getScanHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentifizierung erforderlich',
      });
      return;
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { rows: scans, count: total } = await ScanResult.findAndCountAll({
      where: { userId: req.user.id },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'inputType', 'systemName', 'status', 'analysis', 'createdAt'],
    });

    const formattedScans = scans.map(scan => ({
      id: scan.id,
      inputType: scan.inputType,
      systemName: scan.systemName,
      status: scan.status,
      riskLevel: scan.analysis.riskLevel,
      riskLevelLabel: RISK_LEVEL_INFO[scan.analysis.riskLevel].label,
      riskScore: scan.analysis.riskScore,
      findingsCount: scan.analysis.findings.length,
      createdAt: scan.createdAt,
    }));

    res.json({
      success: true,
      scans: formattedScans,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Laden der Scan-Historie',
    });
  }
};

// Delete a scan
export const deleteScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const scanResult = await ScanResult.findByPk(id);

    if (!scanResult) {
      res.status(404).json({
        success: false,
        error: 'Scan nicht gefunden',
      });
      return;
    }

    // Check ownership
    if (req.user && scanResult.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Zugriff verweigert',
      });
      return;
    }

    await scanResult.destroy();

    res.json({
      success: true,
      message: 'Scan erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Löschen des Scans',
    });
  }
};

// Generate PDF report and download
export const generateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { format } = req.query; // 'pdf' or 'json'

    const scanResult = await ScanResult.findByPk(id);

    if (!scanResult) {
      res.status(404).json({
        success: false,
        error: 'Scan nicht gefunden',
      });
      return;
    }

    const riskInfo = RISK_LEVEL_INFO[scanResult.analysis.riskLevel];

    // If JSON format requested, return structured data
    if (format === 'json') {
      const report = {
        title: 'EU AI Act Calmpliance Report',
        generatedAt: new Date().toISOString(),
        systemName: scanResult.systemName,
        scanDate: scanResult.createdAt,

        executiveSummary: {
          riskLevel: scanResult.analysis.riskLevel,
          riskLevelLabel: riskInfo.label,
          riskScore: scanResult.analysis.riskScore,
          summary: scanResult.analysis.summary,
        },

        findings: scanResult.analysis.findings.map((f, idx) => ({
          number: idx + 1,
          ...f,
        })),

        detectedFeatures: scanResult.analysis.detectedFeatures,
        complianceGaps: scanResult.analysis.complianceGaps,
        recommendedActions: scanResult.analysis.nextSteps,

        disclaimer: 'Dieser Bericht dient nur zur Orientierung und ersetzt keine rechtliche Beratung. ' +
          'Für eine verbindliche Einschätzung konsultieren Sie bitte qualifizierte Rechtsberater.',

        legalBasis: 'EU AI Act - Regulation (EU) 2024/1689',
      };

      res.json({
        success: true,
        report,
      });
      return;
    }

    // Generate PDF
    const doc = generatePdfReport({
      scanId: scanResult.id,
      systemName: scanResult.systemName || 'Unbekanntes System',
      inputType: scanResult.inputType,
      inputValue: scanResult.inputValue,
      createdAt: scanResult.createdAt,
      analysis: scanResult.analysis,
      riskLevelLabel: riskInfo.label,
    });

    // Set response headers for PDF download
    const systemNameSafe = (scanResult.systemName || 'Unknown_System').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `EU_AI_Act_Report_${systemNameSafe}_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Erstellen des Reports',
    });
  }
};

// Get scanner status (LLM availability)
export const getScannerStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ollamaConnected = await checkOllamaConnection();
    const ollamaConfigured = process.env.SCANNER_USE_OLLAMA === 'true';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    const gptConfigured = process.env.SCANNER_USE_GPT === 'true';
    const gptAvailable = await isGPTAvailable();

    let availableModels: string[] = [];
    if (ollamaConnected) {
      availableModels = await getOllamaModels();
    }

    // Determine current analysis mode
    let analysisMode: 'gpt' | 'ollama' | 'keyword' = 'keyword';
    let analysisDescription = 'Keyword-basierte Analyse (Fallback)';

    if (gptConfigured && gptAvailable) {
      analysisMode = 'gpt';
      analysisDescription = 'GPT-gestützte KI-Analyse (Cloud)';
    } else if (ollamaConfigured && ollamaConnected) {
      analysisMode = 'ollama';
      analysisDescription = `Ollama LLM-Analyse (Lokal: ${ollamaModel})`;
    }

    res.json({
      success: true,
      status: {
        analysisMode,
        analysisDescription,
        llmAvailable: analysisMode !== 'keyword',
        ollama: {
          configured: ollamaConfigured,
          connected: ollamaConnected,
          url: ollamaUrl,
          model: ollamaModel,
          availableModels,
          setupCommand: 'cd backend/ollama && ./setup.sh',
        },
        gpt: {
          configured: gptConfigured,
          available: gptAvailable,
        },
      },
      recommendation: analysisMode === 'keyword'
        ? 'Für bessere Ergebnisse: Ollama installieren (ollama.com) und backend/ollama/setup.sh ausführen'
        : null,
    });
  } catch (error) {
    console.error('Get scanner status error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen des Scanner-Status',
    });
  }
};
