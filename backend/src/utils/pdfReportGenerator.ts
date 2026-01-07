import PDFDocument from 'pdfkit';

interface ScanFinding {
  category: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  recommendation: string;
  articleReference?: string;
}

interface ScanAnalysis {
  riskLevel: string;
  riskScore: number;
  findings: ScanFinding[];
  summary: string;
  detectedFeatures: string[];
  complianceGaps: string[];
  nextSteps: string[];
}

interface ReportData {
  scanId: number;
  systemName: string;
  inputType: string;
  inputValue: string;
  createdAt: Date;
  analysis: ScanAnalysis;
  riskLevelLabel: string;
}

// Risk level German labels and colors
const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  PROHIBITED: { label: 'VERBOTEN', color: '#dc2626' },
  HIGH_RISK: { label: 'Hochrisiko', color: '#ea580c' },
  LIMITED_RISK: { label: 'Begrenztes Risiko', color: '#ca8a04' },
  MINIMAL_RISK: { label: 'Minimales Risiko', color: '#16a34a' },
  UNKNOWN: { label: 'Unbekannt', color: '#6b7280' },
};

// Severity config
const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: 'KRITISCH', color: '#dc2626' },
  high: { label: 'Hoch', color: '#ea580c' },
  medium: { label: 'Mittel', color: '#ca8a04' },
  low: { label: 'Niedrig', color: '#2563eb' },
  info: { label: 'Info', color: '#6b7280' },
};

// Generate PDF Report
export function generatePdfReport(data: ReportData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `EU AI Act Compliance Report - ${data.systemName}`,
      Author: 'Calmpliance Scanner',
      Subject: `Compliance Report für ${data.systemName}`,
      Keywords: 'EU AI Act, Compliance, Risk Assessment, Calmpliance',
    },
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Colors
  const primaryColor = '#1e3a5f';
  const mutedColor = '#6b7280';

  // Get risk config
  const riskConfig = RISK_CONFIG[data.analysis.riskLevel] || RISK_CONFIG.UNKNOWN;

  // Helper functions
  const drawLine = () => {
    doc.strokeColor('#e5e7eb').lineWidth(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
  };

  const checkPageSpace = (needed: number) => {
    if (doc.y > 750 - needed) {
      doc.addPage();
    }
  };

  // ========== HEADER ==========
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('EU AI Act Compliance Report', { align: 'center' });

  doc
    .fillColor(mutedColor)
    .fontSize(10)
    .font('Helvetica')
    .text('Calmpliance Scanner - Automatisierte Risikoanalyse', { align: 'center' });

  doc.moveDown(0.5);
  drawLine();

  // ========== SYSTEM INFO ==========
  doc.moveDown(0.3);
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('System: ', { continued: true });
  doc.font('Helvetica').text(data.systemName);

  doc.fillColor(mutedColor).fontSize(10).font('Helvetica');
  doc.text(`Datum: ${dateStr}`);
  doc.text(`Scan-ID: ${data.scanId}`);
  doc.text(`Eingabe: ${data.inputType === 'url' ? 'URL-Analyse' : 'Beschreibung'}`);

  if (data.inputType === 'url') {
    doc.text(`URL: ${data.inputValue.substring(0, 80)}${data.inputValue.length > 80 ? '...' : ''}`);
  }

  doc.moveDown(0.5);

  // ========== RISK LEVEL BOX ==========
  const boxY = doc.y;
  doc.rect(50, boxY, 495, 60).fillAndStroke('#f8fafc', '#e2e8f0');

  doc.fillColor(riskConfig.color).fontSize(18).font('Helvetica-Bold');
  doc.text(`Risikoklassifizierung: ${riskConfig.label}`, 60, boxY + 12);

  doc.fillColor(primaryColor).fontSize(11).font('Helvetica');
  doc.text(`Risiko-Score: ${data.analysis.riskScore}/100`, 60, boxY + 38);

  doc.y = boxY + 70;
  doc.moveDown(0.5);

  // ========== SUMMARY ==========
  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Zusammenfassung');
  doc.moveDown(0.3);
  doc.fillColor('#374151').fontSize(10).font('Helvetica').text(data.analysis.summary, {
    align: 'justify',
    lineGap: 2,
  });
  doc.moveDown(0.5);
  drawLine();

  // ========== FINDINGS ==========
  doc.moveDown(0.3);
  const criticalCount = data.analysis.findings.filter(f => f.severity === 'critical').length;
  const highCount = data.analysis.findings.filter(f => f.severity === 'high').length;
  const mediumCount = data.analysis.findings.filter(f => f.severity === 'medium').length;

  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold');
  doc.text(`Befunde (${data.analysis.findings.length} gesamt)`);

  doc.fillColor(mutedColor).fontSize(9).font('Helvetica');
  doc.text(`${criticalCount} Kritisch | ${highCount} Hoch | ${mediumCount} Mittel`);
  doc.moveDown(0.5);

  // Sort findings by severity
  const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
  const sortedFindings = [...data.analysis.findings].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  sortedFindings.forEach((finding, index) => {
    checkPageSpace(80);

    const sevConfig = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;

    // Finding header with severity badge
    doc.fillColor(sevConfig.color).fontSize(10).font('Helvetica-Bold');
    doc.text(`[${sevConfig.label}] `, { continued: true });
    doc.fillColor(primaryColor).text(finding.title);

    // Category and article reference
    doc.fillColor(mutedColor).fontSize(9).font('Helvetica');
    let meta = finding.category;
    if (finding.articleReference) {
      meta += ` | ${finding.articleReference}`;
    }
    doc.text(meta);

    // Description
    doc.moveDown(0.2);
    doc.fillColor('#374151').fontSize(9).font('Helvetica');
    const descText = finding.description.length > 300
      ? finding.description.substring(0, 300) + '...'
      : finding.description;
    doc.text(descText, { lineGap: 1 });

    // Recommendation
    if (finding.recommendation) {
      doc.moveDown(0.2);
      doc.fillColor('#059669').fontSize(9).font('Helvetica-Bold').text('Empfehlung: ', { continued: true });
      doc.font('Helvetica').fillColor('#374151');
      const recText = finding.recommendation.length > 200
        ? finding.recommendation.substring(0, 200) + '...'
        : finding.recommendation;
      doc.text(recText);
    }

    doc.moveDown(0.4);

    // Separator between findings (except last)
    if (index < sortedFindings.length - 1) {
      doc.strokeColor('#e5e7eb').lineWidth(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.4);
    }
  });

  // ========== DETECTED FEATURES ==========
  if (data.analysis.detectedFeatures.length > 0) {
    checkPageSpace(60);
    doc.moveDown(0.5);
    drawLine();

    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Erkannte KI-Merkmale');
    doc.moveDown(0.3);

    doc.fillColor('#374151').fontSize(10).font('Helvetica');
    data.analysis.detectedFeatures.slice(0, 15).forEach(feature => {
      doc.text(`• ${feature}`);
    });
    if (data.analysis.detectedFeatures.length > 15) {
      doc.fillColor(mutedColor).text(`... und ${data.analysis.detectedFeatures.length - 15} weitere`);
    }
  }

  // ========== COMPLIANCE GAPS ==========
  if (data.analysis.complianceGaps.length > 0) {
    checkPageSpace(60);
    doc.moveDown(0.5);
    drawLine();

    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Compliance-Lücken');
    doc.moveDown(0.3);

    doc.fillColor('#374151').fontSize(10).font('Helvetica');
    data.analysis.complianceGaps.forEach(gap => {
      doc.text(`• ${gap}`);
    });
  }

  // ========== NEXT STEPS ==========
  if (data.analysis.nextSteps.length > 0) {
    checkPageSpace(60);
    doc.moveDown(0.5);
    drawLine();

    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Empfohlene nächste Schritte');
    doc.moveDown(0.3);

    doc.fillColor('#374151').fontSize(10).font('Helvetica');
    data.analysis.nextSteps.forEach((step, idx) => {
      doc.text(`${idx + 1}. ${step}`);
    });
  }

  // ========== DISCLAIMER ==========
  checkPageSpace(100);
  doc.moveDown(1);
  drawLine();

  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Wichtiger Hinweis');
  doc.moveDown(0.3);

  doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text(
    'Dieser Bericht ist eine automatisierte Risikoeinschätzung basierend auf den bereitgestellten Informationen. ' +
    'Er stellt keine Rechtsberatung dar und sollte nicht als Ersatz für qualifizierte rechtliche Beratung verwendet werden. ' +
    'Die Bewertung spiegelt den Informationsstand zum Bewertungszeitpunkt wider. ' +
    'Für eine verbindliche Einschätzung konsultieren Sie bitte qualifizierte Rechtsberater.',
    { align: 'justify', lineGap: 2 }
  );

  // ========== FOOTER ==========
  doc.moveDown(1);
  drawLine();

  doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(
    'Erstellt von Calmpliance Scanner - EU AI Act Risikoanalyse',
    { align: 'center' }
  );
  doc.text(`Scan-ID: ${data.scanId} | ${dateStr}`, { align: 'center' });
  doc.text('www.calmpliance.eu', { align: 'center' });

  return doc;
}

export default generatePdfReport;
