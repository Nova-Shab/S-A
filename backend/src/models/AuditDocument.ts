import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import Audit from './Audit';
import AuditAnswer from './AuditAnswer';
import User from './User';

interface DocumentAIAnalysis {
  relevanceScore: number;
  completenessScore: number;
  status: 'analyzing' | 'completed' | 'failed';
  findings: string[];
  gaps: string[];
  recommendations: string[];
  analyzedAt: string;
  summary?: string;
}

interface AuditDocumentAttributes {
  id: number;
  auditId: number;
  answerId?: number;
  requirementId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  aiAnalysis?: DocumentAIAnalysis;
  uploadedBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditDocumentCreationAttributes extends Optional<AuditDocumentAttributes, 'id' | 'answerId' | 'aiAnalysis' | 'createdAt' | 'updatedAt'> {}

class AuditDocument extends Model<AuditDocumentAttributes, AuditDocumentCreationAttributes> implements AuditDocumentAttributes {
  public id!: number;
  public auditId!: number;
  public answerId?: number;
  public requirementId!: string;
  public fileName!: string;
  public originalName!: string;
  public mimeType!: string;
  public fileSize!: number;
  public filePath!: string;
  public aiAnalysis?: DocumentAIAnalysis;
  public uploadedBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuditDocument.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    auditId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'audits',
        key: 'id',
      },
    },
    answerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'audit_answers',
        key: 'id',
      },
    },
    requirementId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stored file name (UUID)',
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Original file name from upload',
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aiAnalysis: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'AI analysis results for the document',
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'audit_documents',
    indexes: [
      {
        fields: ['auditId'],
      },
      {
        fields: ['auditId', 'requirementId'],
      },
    ],
  }
);

// Associations
AuditDocument.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });
AuditDocument.belongsTo(AuditAnswer, { foreignKey: 'answerId', as: 'answer' });
AuditDocument.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

Audit.hasMany(AuditDocument, { foreignKey: 'auditId', as: 'documents' });
AuditAnswer.hasMany(AuditDocument, { foreignKey: 'answerId', as: 'documents' });

export default AuditDocument;
