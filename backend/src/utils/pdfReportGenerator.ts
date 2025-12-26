import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

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

// Risk level German labels
const RISK_LABELS: Record<string, string> = {
  PROHIBITED: 'Verboten',
  HIGH_RISK: 'Hochrisiko',
  LIMITED_RISK: 'Begrenztes Risiko',
  MINIMAL_RISK: 'Minimal',
  UNKNOWN: 'Unbekannt',
};

// Severity German labels
const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Moderat',
  low: 'Niedrig',
  info: 'Info',
};

// Article mapping status
type ArticleStatus = 'compliant' | 'non_compliant' | 'unknown' | 'not_applicable';

interface ArticleMapping {
  article: string;
  title: string;
  status: ArticleStatus;
  requirement: string;
  evidence?: string;
  reason: string;
}

// Generate Scan ID string
function generateScanIdString(scanId: number): string {
  const randomPart = uuidv4().substring(0, 8);
  return `scan_${randomPart}_${scanId.toString().padStart(8, '0')}`;
}

// Generate PDF Report
export function generatePdfReport(data: ReportData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'EU AI Act Readiness Snapshot',
      Author: 'VAMO - EU AI Act Risk Analysis',
      Subject: `Compliance Report für ${data.systemName}`,
      Keywords: 'EU AI Act, Compliance, Risk Assessment',
    },
  });

  const scanIdString = generateScanIdString(data.scanId);
  const today = new Date();
  const dateStr = today.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Colors
  const primaryColor = '#1e3a5f';
  const accentColor = '#2563eb';
  const mutedColor = '#6b7280';
  const headerBg = '#f1f5f9';

  // Helper functions
  const drawSectionHeader = (title: string, number: string) => {
    doc.moveDown(0.5);
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`${number}. ${title}`, { underline: false });
    doc.moveDown(0.3);
    doc.strokeColor('#e5e7eb').lineWidth(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
  };

  const drawSubSection = (title: string) => {
    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(title);
    doc.moveDown(0.2);
  };

  const drawParagraph = (text: string) => {
    doc.fillColor('#374151').fontSize(10).font('Helvetica').text(text, {
      align: 'justify',
      lineGap: 2,
    });
    doc.moveDown(0.3);
  };

  const drawBulletPoint = (text: string, indent = 0) => {
    doc
      .fillColor('#374151')
      .fontSize(10)
      .font('Helvetica')
      .text(`• ${text}`, 50 + indent, doc.y, {
        width: 495 - indent,
        lineGap: 2,
      });
    doc.moveDown(0.2);
  };

  // Header
  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('EU AI Act Readiness Snapshot', { align: 'left' });

  doc.moveDown(0.3);

  // Risk Level Badge
  const riskLabel = RISK_LABELS[data.analysis.riskLevel] || data.riskLevelLabel;
  doc
    .fillColor(accentColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(riskLabel, { align: 'left' });

  doc.moveDown(0.5);

  // Meta information
  doc
    .fillColor(mutedColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Bewertungsdatum: ${dateStr}`);
  doc.text(
    `Eingabetyp: ${data.inputType === 'url' ? 'Website-URL' : 'Beschreibung'}`
  );
  doc.text(`Scan ID: ${scanIdString}`);
  doc.text('EU AI Act Version: 2024-1689');

  doc.moveDown(0.3);
  doc
    .fillColor(mutedColor)
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text(
      'Bewertung der EU AI Act Compliance-Risiken basierend auf bereitgestellten Informationen',
      { align: 'left' }
    );

  // ============================================
  // 1. Zusammenfassung
  // ============================================
  drawSectionHeader('Zusammenfassung', '1');
  drawParagraph(data.analysis.summary);

  drawSubSection('Risikobegründung:');
  const riskReason =
    data.analysis.findings.length > 0
      ? data.analysis.findings[0].description
      : 'Keine spezifischen Risikofaktoren identifiziert.';
  drawParagraph(riskReason);

  doc
    .fillColor(mutedColor)
    .fontSize(9)
    .font('Helvetica')
    .text('Konfidenz: medium');

  // ============================================
  // 2. Was wurde bewertet
  // ============================================
  drawSectionHeader('Was wurde bewertet', '2');

  drawSubSection(data.inputType === 'url' ? 'Website-Inhalt' : 'Systembeschreibung');
  if (data.inputType === 'url') {
    drawParagraph(`Analysierte URL: ${data.inputValue}`);
  } else {
    const truncatedDesc =
      data.inputValue.length > 200
        ? data.inputValue.substring(0, 200) + '...'
        : data.inputValue;
    drawParagraph(truncatedDesc);
  }

  doc.moveDown(0.3);
  drawSubSection('Einschränkungen');
  drawBulletPoint('Keine Informationen über die technische Umsetzung der KI');
  drawBulletPoint('Keine Informationen über die Datenverarbeitung');

  doc.moveDown(0.3);
  drawSubSection('Nicht bewertet');
  drawBulletPoint('Technische Dokumentation');
  drawBulletPoint('Datenschutzbestimmungen');

  // ============================================
  // 3. KI-System-Identifikation
  // ============================================
  drawSectionHeader('KI-System-Identifikation', '3');

  drawSubSection(data.systemName);
  doc
    .fillColor(mutedColor)
    .fontSize(9)
    .font('Helvetica')
    .text('Status: Wahrscheinlich vorhanden');
  doc.moveDown(0.2);

  if (data.analysis.detectedFeatures.length > 0) {
    drawSubSection('Erkannte Merkmale:');
    data.analysis.detectedFeatures.forEach((feature) => {
      drawBulletPoint(feature);
    });
  }

  // ============================================
  // 4. EU AI Act Risikoklassifizierung
  // ============================================
  drawSectionHeader('EU AI Act Risikoklassifizierung', '4');

  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`Zugewiesene Risikostufe: ${riskLabel}`);
  doc.moveDown(0.2);

  doc
    .fillColor(mutedColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Risiko-Score: ${data.analysis.riskScore}/100`);
  doc.text('Konfidenz: medium');

  // ============================================
  // 5. Artikel-Zuordnung
  // ============================================
  drawSectionHeader('Artikel-Zuordnung', '5');

  drawParagraph(data.analysis.summary);

  // Map findings to articles
  const articleMappings: ArticleMapping[] = [];

  data.analysis.findings.forEach((finding) => {
    if (finding.articleReference) {
      articleMappings.push({
        article: finding.articleReference,
        title: finding.title,
        status:
          finding.severity === 'critical' || finding.severity === 'high'
            ? 'non_compliant'
            : 'unknown',
        requirement: finding.description,
        evidence: 'Kein Nachweis verfügbar',
        reason: finding.recommendation,
      });
    }
  });

  // Add default transparency article if not present
  if (!articleMappings.some((m) => m.article.includes('50'))) {
    articleMappings.push({
      article: 'Artikel 50',
      title: 'Transparenzpflichten für Anbieter und Betreiber bestimmter KI Systeme',
      status: 'unknown',
      requirement:
        'Anbieter müssen sicherstellen, dass Benutzer informiert werden, wenn sie mit einem KI-System interagieren',
      evidence: 'Kein Nachweis verfügbar',
      reason: 'Transparenz ist wichtig, um Benutzer über die Verwendung von KI zu informieren',
    });
  }

  articleMappings.forEach((mapping) => {
    doc.moveDown(0.3);
    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`${mapping.article}: ${mapping.title}`);

    const statusLabel =
      mapping.status === 'compliant'
        ? 'Konform'
        : mapping.status === 'non_compliant'
          ? 'Nicht konform'
          : 'Unbekannt';
    doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text(statusLabel);
    doc.moveDown(0.2);

    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text('Anforderung: ', {
      continued: true,
    });
    doc.font('Helvetica').text(mapping.requirement);
    doc.moveDown(0.1);
    doc.fillColor(mutedColor).fontSize(9).text(mapping.evidence || '');
    doc.moveDown(0.1);
    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text('Warum wichtig: ', {
      continued: true,
    });
    doc.font('Helvetica').text(mapping.reason);
  });

  // ============================================
  // 6. Lücken und Unsicherheiten
  // ============================================
  doc.addPage();
  drawSectionHeader('Lücken und Unsicherheiten', '6');

  drawSubSection('Identifizierte Lücken');
  if (data.analysis.complianceGaps.length > 0) {
    data.analysis.complianceGaps.forEach((gap) => {
      drawBulletPoint(`${gap} (Moderat)`);
    });
  } else {
    drawParagraph('Keine spezifischen Lücken identifiziert.');
  }

  doc.moveDown(0.3);
  drawSubSection('Unsicherheiten');
  drawBulletPoint('Technische Umsetzung - Es ist unklar, wie die KI-Technologie implementiert ist');
  drawBulletPoint('Datenverarbeitung - Keine Details zur Datenverarbeitung verfügbar');

  // ============================================
  // 7. Evidenz- und Dokumentations-Checkliste
  // ============================================
  drawSectionHeader('Evidenz- und Dokumentations-Checkliste', '7');

  const checklistItems = [
    {
      item: 'Technische Dokumentation',
      desc: 'Beschreibung der KI-System-Architektur',
      status: 'Erforderlich',
    },
    {
      item: 'Datenschutz-Folgenabschätzung',
      desc: 'DSGVO-konforme Bewertung',
      status: 'Empfohlen',
    },
    {
      item: 'Risikobewertung',
      desc: 'Dokumentierte Risikobewertung gemäß EU AI Act',
      status: 'Erforderlich',
    },
    {
      item: 'Qualitätsmanagementsystem',
      desc: 'QMS-Dokumentation',
      status: 'Empfohlen',
    },
  ];

  checklistItems.forEach((item) => {
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(item.item, { continued: true });
    doc.font('Helvetica').text(` - ${item.desc}`);
    doc.fillColor(mutedColor).fontSize(9).text(`Status: ${item.status}`);
    doc.moveDown(0.2);
  });

  // ============================================
  // 8. Praktische nächste Schritte
  // ============================================
  drawSectionHeader('Praktische nächste Schritte', '8');

  // Immediate
  drawSubSection('Sofort (7 Tage)');
  if (data.analysis.findings.some((f) => f.severity === 'critical')) {
    data.analysis.findings
      .filter((f) => f.severity === 'critical')
      .forEach((f) => {
        drawBulletPoint(f.recommendation);
      });
  } else {
    drawParagraph('Keine sofortigen Maßnahmen erforderlich.');
  }

  // Short-term
  doc.moveDown(0.3);
  drawSubSection('Kurzfristig (30 Tage)');
  if (data.analysis.nextSteps.length > 0) {
    data.analysis.nextSteps.slice(0, 3).forEach((step) => {
      drawBulletPoint(step);
    });
  } else {
    drawParagraph('Keine kurzfristigen Maßnahmen erforderlich.');
  }

  // Mid-term
  doc.moveDown(0.3);
  drawSubSection('Mittelfristig (90 Tage)');
  if (data.analysis.nextSteps.length > 3) {
    data.analysis.nextSteps.slice(3).forEach((step) => {
      drawBulletPoint(step);
    });
  } else {
    drawParagraph('Keine mittelfristigen Maßnahmen erforderlich.');
  }

  // ============================================
  // 9. Offene Fragen
  // ============================================
  drawSectionHeader('Offene Fragen', '9');

  const openQuestions = [
    'Wie wird die KI-Technologie implementiert?',
    'Welche Daten werden verarbeitet und wie?',
    'Gibt es eine menschliche Überwachung der KI-Entscheidungen?',
    'Wie werden Benutzer über die KI-Nutzung informiert?',
  ];

  openQuestions.forEach((q) => {
    drawBulletPoint(q);
  });

  // ============================================
  // 10. Wichtiger Hinweis
  // ============================================
  drawSectionHeader('Wichtiger Hinweis', '10');

  doc
    .fillColor('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(
      'Dieses Dokument ist eine Bereitschafts- und Risikobewertung auf Basis öffentlich verfügbarer Informationen. ' +
        'Es stellt keine Rechtsberatung dar und sollte nicht als Ersatz für qualifizierte rechtliche Beratung herangezogen werden. ' +
        'Die Bewertung spiegelt Informationen zum Bewertungsdatum wider. ' +
        'Unbekannte Faktoren können die Schlussfolgerungen wesentlich beeinflussen.',
      { align: 'justify', lineGap: 2 }
    );

  // Footer
  doc.moveDown(1);
  doc.strokeColor('#e5e7eb').lineWidth(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  doc
    .fillColor(mutedColor)
    .fontSize(8)
    .font('Helvetica')
    .text('Erstellt von VAMO - EU AI Act Risk Analysis', { align: 'center' });
  doc.text(`Scan ID: ${scanIdString} | ${dateStr}`, { align: 'center' });

  return doc;
}

export default generatePdfReport;
