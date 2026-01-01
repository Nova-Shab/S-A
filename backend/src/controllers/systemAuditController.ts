import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import SystemAudit, {
  AuditStatus,
  RequirementAnswer,
  ActionItem,
  AuditSummary,
} from '../models/SystemAudit';
import ScanResult from '../models/ScanResult';
import {
  EU_AI_ACT_REQUIREMENTS,
  getRequirementsForRiskClass,
  getAllRequirementIds,
  RiskClass,
} from '../data/euAiActRequirements';

// Get all requirements (for frontend)
export const getRequirements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { riskClass } = req.query;

    if (riskClass && ['HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK', 'PROHIBITED'].includes(riskClass as string)) {
      const filteredRequirements = getRequirementsForRiskClass(riskClass as RiskClass);
      res.json({
        success: true,
        categories: filteredRequirements,
      });
    } else {
      res.json({
        success: true,
        categories: EU_AI_ACT_REQUIREMENTS,
      });
    }
  } catch (error) {
    console.error('Get requirements error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Anforderungen' });
  }
};

// Create a new system audit
export const createSystemAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const {
      systemName,
      systemDescription,
      systemType,
      systemUrl,
      organizationName,
      riskClass,
      scanResultId,
    } = req.body;

    if (!systemName || !systemDescription || !systemType || !riskClass) {
      res.status(400).json({
        success: false,
        error: 'systemName, systemDescription, systemType und riskClass sind erforderlich',
      });
      return;
    }

    // Generate unique system ID
    const systemId = uuidv4();

    // Initialize answers for all applicable requirements
    const applicableRequirements = getRequirementsForRiskClass(riskClass);
    const initialAnswers: RequirementAnswer[] = applicableRequirements.flatMap(cat =>
      cat.requirements.map(req => ({
        requirementId: req.id,
        status: 'not_assessed' as const,
        score: 0,
        notes: '',
        evidence: [],
        lastUpdated: new Date().toISOString(),
      }))
    );

    // Calculate initial summary
    const initialSummary: AuditSummary = {
      totalRequirements: initialAnswers.length,
      assessedRequirements: 0,
      compliantCount: 0,
      partiallyCompliantCount: 0,
      nonCompliantCount: 0,
      notApplicableCount: 0,
      overallComplianceScore: 0,
      criticalGaps: [],
      keyFindings: [],
    };

    const audit = await SystemAudit.create({
      systemId,
      systemName,
      systemDescription,
      systemType,
      systemUrl,
      organizationName,
      userId: req.user.id,
      version: 1,
      riskClass,
      scanResultId,
      answers: initialAnswers,
      actionItems: [],
      summary: initialSummary,
      status: 'draft',
      completionPercentage: 0,
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      audit: {
        id: audit.id,
        systemId: audit.systemId,
        systemName: audit.systemName,
        version: audit.version,
        status: audit.status,
        riskClass: audit.riskClass,
        completionPercentage: audit.completionPercentage,
        summary: audit.summary,
        createdAt: audit.createdAt,
      },
    });
  } catch (error) {
    console.error('Create audit error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Erstellen des Audits' });
  }
};

// Create a new version of an existing audit (Re-Assessment)
export const createAuditVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { id } = req.params;
    const previousAudit = await SystemAudit.findByPk(id);

    if (!previousAudit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (previousAudit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Get the latest version for this system
    const latestVersion = await SystemAudit.findOne({
      where: { systemId: previousAudit.systemId },
      order: [['version', 'DESC']],
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // Copy previous answers as starting point
    const copiedAnswers: RequirementAnswer[] = previousAudit.answers.map(answer => ({
      ...answer,
      lastUpdated: new Date().toISOString(),
    }));

    // Create new audit version
    const newAudit = await SystemAudit.create({
      systemId: previousAudit.systemId,
      systemName: previousAudit.systemName,
      systemDescription: previousAudit.systemDescription,
      systemType: previousAudit.systemType,
      systemUrl: previousAudit.systemUrl,
      organizationName: previousAudit.organizationName,
      userId: req.user.id,
      version: newVersion,
      previousVersionId: previousAudit.id,
      riskClass: previousAudit.riskClass,
      answers: copiedAnswers,
      actionItems: [], // Start fresh with action items
      summary: previousAudit.summary,
      status: 'in_progress',
      completionPercentage: 0,
      startedAt: new Date(),
    });

    // Archive previous version
    await previousAudit.update({ status: 'archived' });

    res.status(201).json({
      success: true,
      audit: {
        id: newAudit.id,
        systemId: newAudit.systemId,
        systemName: newAudit.systemName,
        version: newAudit.version,
        previousVersionId: newAudit.previousVersionId,
        status: newAudit.status,
        riskClass: newAudit.riskClass,
        createdAt: newAudit.createdAt,
      },
      message: `Neue Audit-Version ${newVersion} erstellt`,
    });
  } catch (error) {
    console.error('Create audit version error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Erstellen der neuen Version' });
  }
};

// Get audit by ID
export const getAuditById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { id } = req.params;
    const audit = await SystemAudit.findByPk(id);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Get requirements for context
    const requirements = getRequirementsForRiskClass(audit.riskClass);

    res.json({
      success: true,
      audit,
      requirements,
    });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Laden des Audits' });
  }
};

// Get audit history for a system
export const getAuditHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { systemId } = req.params;

    const audits = await SystemAudit.findAll({
      where: { systemId, userId: req.user.id },
      order: [['version', 'DESC']],
      attributes: [
        'id', 'systemId', 'systemName', 'version', 'status', 'riskClass',
        'completionPercentage', 'startedAt', 'completedAt', 'reviewedAt',
        'reviewedBy', 'summary', 'createdAt', 'updatedAt',
      ],
    });

    res.json({
      success: true,
      systemId,
      auditCount: audits.length,
      audits,
    });
  } catch (error) {
    console.error('Get audit history error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Audit-Historie' });
  }
};

// Get all audits for the current user
export const getUserAudits = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: Record<string, unknown> = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { rows: audits, count: total } = await SystemAudit.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [['updatedAt', 'DESC']],
      attributes: [
        'id', 'systemId', 'systemName', 'systemType', 'version', 'status',
        'riskClass', 'completionPercentage', 'startedAt', 'completedAt',
        'summary', 'createdAt', 'updatedAt',
      ],
    });

    res.json({
      success: true,
      audits,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get user audits error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Audits' });
  }
};

// Update audit answer
export const updateAuditAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { id } = req.params;
    const { requirementId, status, score, notes } = req.body;

    const audit = await SystemAudit.findByPk(id);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Update the specific answer
    const updatedAnswers = audit.answers.map(answer => {
      if (answer.requirementId === requirementId) {
        return {
          ...answer,
          status: status || answer.status,
          score: score !== undefined ? score : answer.score,
          notes: notes !== undefined ? notes : answer.notes,
          lastUpdated: new Date().toISOString(),
          updatedBy: req.user?.id?.toString(),
        };
      }
      return answer;
    });

    // Recalculate summary
    const summary = calculateAuditSummary(updatedAnswers);
    const completionPercentage = Math.round(
      (summary.assessedRequirements / summary.totalRequirements) * 100
    );

    // Determine new status
    let newStatus: AuditStatus = audit.status;
    if (audit.status === 'draft' && completionPercentage > 0) {
      newStatus = 'in_progress';
    }

    await audit.update({
      answers: updatedAnswers,
      summary,
      completionPercentage,
      status: newStatus,
    });

    res.json({
      success: true,
      answer: updatedAnswers.find(a => a.requirementId === requirementId),
      summary,
      completionPercentage,
      status: newStatus,
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Aktualisieren der Antwort' });
  }
};

// Complete audit
export const completeAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { id } = req.params;
    const { executiveSummary, auditNotes, nextReviewDate } = req.body;

    const audit = await SystemAudit.findByPk(id);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    // Generate action items based on non-compliant answers
    const actionItems = generateActionItems(audit.answers, audit.riskClass);

    // Determine final status based on compliance
    const hasNonCompliant = audit.answers.some(a => a.status === 'non_compliant');
    const hasCriticalGaps = audit.summary.criticalGaps.length > 0;
    const finalStatus: AuditStatus = hasNonCompliant || hasCriticalGaps
      ? 'action_required'
      : 'completed';

    await audit.update({
      status: finalStatus,
      completedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: req.user.id.toString(),
      executiveSummary,
      auditNotes,
      nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
      actionItems,
      completionPercentage: 100,
    });

    res.json({
      success: true,
      audit: {
        id: audit.id,
        status: finalStatus,
        completedAt: audit.completedAt,
        actionItems,
        summary: audit.summary,
      },
      message: finalStatus === 'action_required'
        ? 'Audit abgeschlossen - Maßnahmen erforderlich'
        : 'Audit erfolgreich abgeschlossen',
    });
  } catch (error) {
    console.error('Complete audit error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Abschließen des Audits' });
  }
};

// Generate action items from non-compliant answers
function generateActionItems(answers: RequirementAnswer[], riskClass: string): ActionItem[] {
  const actionItems: ActionItem[] = [];
  const requirements = getRequirementsForRiskClass(riskClass as RiskClass);

  answers.forEach(answer => {
    if (answer.status === 'non_compliant' || answer.status === 'partially_compliant') {
      // Find requirement details
      let requirementInfo: { title: string; priority: string } | undefined;
      for (const cat of requirements) {
        const req = cat.requirements.find(r => r.id === answer.requirementId);
        if (req) {
          requirementInfo = { title: req.title, priority: req.priority };
          break;
        }
      }

      if (requirementInfo) {
        actionItems.push({
          id: uuidv4(),
          requirementId: answer.requirementId,
          title: `Behebung: ${requirementInfo.title}`,
          description: answer.status === 'non_compliant'
            ? `Anforderung ${answer.requirementId} ist nicht erfüllt und muss vollständig umgesetzt werden.`
            : `Anforderung ${answer.requirementId} ist nur teilweise erfüllt. Vervollständigen Sie die Umsetzung.`,
          priority: requirementInfo.priority as ActionItem['priority'],
          status: 'open',
          notes: answer.notes,
        });
      }
    }
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actionItems;
}

// Calculate audit summary from answers
function calculateAuditSummary(answers: RequirementAnswer[]): AuditSummary {
  const totalRequirements = answers.length;
  const assessedRequirements = answers.filter(a => a.status !== 'not_assessed').length;
  const compliantCount = answers.filter(a => a.status === 'compliant').length;
  const partiallyCompliantCount = answers.filter(a => a.status === 'partially_compliant').length;
  const nonCompliantCount = answers.filter(a => a.status === 'non_compliant').length;
  const notApplicableCount = answers.filter(a => a.status === 'not_applicable').length;

  // Calculate overall compliance score
  const applicableCount = totalRequirements - notApplicableCount;
  const overallComplianceScore = applicableCount > 0
    ? Math.round(
        ((compliantCount * 100 + partiallyCompliantCount * 50) / applicableCount)
      )
    : 0;

  // Identify critical gaps (non-compliant critical/high priority requirements)
  const criticalGaps: string[] = [];
  answers.forEach(answer => {
    if (answer.status === 'non_compliant') {
      criticalGaps.push(answer.requirementId);
    }
  });

  // Generate key findings
  const keyFindings: string[] = [];
  if (nonCompliantCount > 0) {
    keyFindings.push(`${nonCompliantCount} Anforderungen sind nicht erfüllt`);
  }
  if (partiallyCompliantCount > 0) {
    keyFindings.push(`${partiallyCompliantCount} Anforderungen sind nur teilweise erfüllt`);
  }
  if (compliantCount === applicableCount && applicableCount > 0) {
    keyFindings.push('Alle anwendbaren Anforderungen sind vollständig erfüllt');
  }

  return {
    totalRequirements,
    assessedRequirements,
    compliantCount,
    partiallyCompliantCount,
    nonCompliantCount,
    notApplicableCount,
    overallComplianceScore,
    criticalGaps,
    keyFindings,
  };
}

// Export action plan as Markdown
export const exportActionPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentifizierung erforderlich' });
      return;
    }

    const { id } = req.params;
    const audit = await SystemAudit.findByPk(id);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit nicht gefunden' });
      return;
    }

    if (audit.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const markdown = generateActionPlanMarkdown(audit);

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="maßnahmenkatalog-${audit.systemName}-v${audit.version}.md"`);
    res.send(markdown);
  } catch (error) {
    console.error('Export action plan error:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Exportieren des Maßnahmenkatalogs' });
  }
};

// Generate Markdown for action plan
function generateActionPlanMarkdown(audit: SystemAudit): string {
  const date = new Date().toLocaleDateString('de-DE');

  let md = `# Maßnahmenkatalog EU AI Act Calmpliance\n\n`;
  md += `**System:** ${audit.systemName}\n`;
  md += `**Version:** ${audit.version}\n`;
  md += `**Risikoklasse:** ${audit.riskClass}\n`;
  md += `**Status:** ${audit.status}\n`;
  md += `**Erstellt am:** ${date}\n`;
  md += `**Compliance-Score:** ${audit.summary.overallComplianceScore}%\n\n`;

  md += `---\n\n`;

  md += `## Zusammenfassung\n\n`;
  md += `| Metrik | Wert |\n`;
  md += `|--------|------|\n`;
  md += `| Gesamte Anforderungen | ${audit.summary.totalRequirements} |\n`;
  md += `| Bewertet | ${audit.summary.assessedRequirements} |\n`;
  md += `| Erfüllt | ${audit.summary.compliantCount} |\n`;
  md += `| Teilweise erfüllt | ${audit.summary.partiallyCompliantCount} |\n`;
  md += `| Nicht erfüllt | ${audit.summary.nonCompliantCount} |\n`;
  md += `| Nicht anwendbar | ${audit.summary.notApplicableCount} |\n\n`;

  if (audit.executiveSummary) {
    md += `### Executive Summary\n\n${audit.executiveSummary}\n\n`;
  }

  md += `## Maßnahmen\n\n`;

  if (audit.actionItems.length === 0) {
    md += `Keine Maßnahmen erforderlich.\n\n`;
  } else {
    const priorities = ['critical', 'high', 'medium', 'low'];
    const priorityLabels: Record<string, string> = {
      critical: '🔴 Kritisch',
      high: '🟠 Hoch',
      medium: '🟡 Mittel',
      low: '🟢 Niedrig',
    };

    priorities.forEach(priority => {
      const items = audit.actionItems.filter(item => item.priority === priority);
      if (items.length > 0) {
        md += `### ${priorityLabels[priority]}\n\n`;
        items.forEach((item, idx) => {
          md += `#### ${idx + 1}. ${item.title}\n\n`;
          md += `- **Anforderung:** ${item.requirementId}\n`;
          md += `- **Status:** ${item.status}\n`;
          md += `- **Beschreibung:** ${item.description}\n`;
          if (item.dueDate) {
            md += `- **Fällig:** ${new Date(item.dueDate).toLocaleDateString('de-DE')}\n`;
          }
          if (item.notes) {
            md += `- **Notizen:** ${item.notes}\n`;
          }
          md += `\n`;
        });
      }
    });
  }

  md += `---\n\n`;
  md += `*Generiert von EU AI Act Audit Tool*\n`;

  return md;
}
