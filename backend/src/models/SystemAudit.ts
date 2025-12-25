import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import User from './User';

// Types for the comprehensive EU AI Act audit system

export type AuditStatus =
  | 'draft'           // Audit gestartet, nicht abgeschlossen
  | 'in_progress'     // Audit läuft
  | 'pending_review'  // Wartet auf Review
  | 'completed'       // Abgeschlossen
  | 'action_required' // Maßnahmen erforderlich
  | 'remediated'      // Maßnahmen umgesetzt
  | 'archived';       // Archiviert

export type RiskClassification = 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';

export interface RequirementAnswer {
  requirementId: string;
  status: 'not_assessed' | 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
  score: number; // 0-100
  notes: string;
  evidence: EvidenceDocument[];
  aiValidation?: AIValidationResult;
  lastUpdated: string;
  updatedBy?: string;
}

export interface EvidenceDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  filePath: string;
  aiAnalysis?: DocumentAIAnalysis;
}

export interface DocumentAIAnalysis {
  analyzedAt: string;
  model: string;
  completenessScore: number; // 0-100
  relevanceScore: number; // 0-100
  findings: string[];
  gaps: string[];
  recommendations: string[];
  overallAssessment: 'adequate' | 'needs_improvement' | 'insufficient';
}

export interface AIValidationResult {
  validatedAt: string;
  model: string;
  isValid: boolean;
  confidenceScore: number;
  issues: string[];
  suggestions: string[];
}

export interface ActionItem {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
  dueDate?: string;
  assignedTo?: string;
  completedAt?: string;
  completedBy?: string;
  notes: string;
}

export interface AuditSummary {
  totalRequirements: number;
  assessedRequirements: number;
  compliantCount: number;
  partiallyCompliantCount: number;
  nonCompliantCount: number;
  notApplicableCount: number;
  overallComplianceScore: number;
  criticalGaps: string[];
  keyFindings: string[];
}

// Main SystemAudit model attributes
interface SystemAuditAttributes {
  id: number;
  // System identification
  systemId: string; // Unique identifier for the AI system being audited
  systemName: string;
  systemDescription: string;
  systemType: string; // e.g., "Chatbot", "Recommendation Engine", "HR Tool"
  systemUrl?: string;
  organizationName?: string;

  // Audit metadata
  userId: number; // Who created/owns this audit
  version: number; // Version number (1, 2, 3, ...)
  previousVersionId?: number; // Link to previous audit version

  // Risk classification (from initial scan or manual)
  riskClass: RiskClassification;
  scanResultId?: number; // Link to initial scan if applicable

  // Audit content
  answers: RequirementAnswer[];
  actionItems: ActionItem[];
  summary: AuditSummary;

  // Status tracking
  status: AuditStatus;
  completionPercentage: number;

  // Audit lifecycle
  startedAt: Date;
  completedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;

  // Compliance tracking
  nextReviewDate?: Date;
  complianceDeadline?: Date;

  // Notes and comments
  auditNotes?: string;
  executiveSummary?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

interface SystemAuditCreationAttributes extends Optional<SystemAuditAttributes,
  'id' | 'version' | 'previousVersionId' | 'scanResultId' | 'answers' | 'actionItems' |
  'summary' | 'status' | 'completionPercentage' | 'completedAt' | 'reviewedAt' |
  'reviewedBy' | 'nextReviewDate' | 'complianceDeadline' | 'auditNotes' |
  'executiveSummary' | 'createdAt' | 'updatedAt' | 'systemUrl' | 'organizationName'
> {}

class SystemAudit extends Model<SystemAuditAttributes, SystemAuditCreationAttributes> implements SystemAuditAttributes {
  public id!: number;
  public systemId!: string;
  public systemName!: string;
  public systemDescription!: string;
  public systemType!: string;
  public systemUrl?: string;
  public organizationName?: string;

  public userId!: number;
  public version!: number;
  public previousVersionId?: number;

  public riskClass!: RiskClassification;
  public scanResultId?: number;

  public answers!: RequirementAnswer[];
  public actionItems!: ActionItem[];
  public summary!: AuditSummary;

  public status!: AuditStatus;
  public completionPercentage!: number;

  public startedAt!: Date;
  public completedAt?: Date;
  public reviewedAt?: Date;
  public reviewedBy?: string;

  public nextReviewDate?: Date;
  public complianceDeadline?: Date;

  public auditNotes?: string;
  public executiveSummary?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SystemAudit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    systemId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Unique identifier for the AI system being audited',
    },
    systemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    systemDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    systemType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    systemUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    previousVersionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'system_audits',
        key: 'id',
      },
    },
    riskClass: {
      type: DataTypes.ENUM('PROHIBITED', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK'),
      allowNull: false,
    },
    scanResultId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'scan_results',
        key: 'id',
      },
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    actionItems: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    summary: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        totalRequirements: 0,
        assessedRequirements: 0,
        compliantCount: 0,
        partiallyCompliantCount: 0,
        nonCompliantCount: 0,
        notApplicableCount: 0,
        overallComplianceScore: 0,
        criticalGaps: [],
        keyFindings: [],
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_progress', 'pending_review', 'completed', 'action_required', 'remediated', 'archived'),
      defaultValue: 'draft',
    },
    completionPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    complianceDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    auditNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    executiveSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'system_audits',
    indexes: [
      { fields: ['systemId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['riskClass'] },
      { fields: ['systemId', 'version'], unique: true },
    ],
  }
);

// Associations
SystemAudit.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(SystemAudit, { foreignKey: 'userId', as: 'systemAudits' });

// Self-referential for version history
SystemAudit.belongsTo(SystemAudit, { foreignKey: 'previousVersionId', as: 'previousVersion' });
SystemAudit.hasOne(SystemAudit, { foreignKey: 'previousVersionId', as: 'nextVersion' });

export default SystemAudit;
