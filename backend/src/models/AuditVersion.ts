import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import Audit from './Audit';
import User from './User';

interface AuditVersionAttributes {
  id: number;
  auditId: number;
  userId: number;
  version: number;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  riskClass: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
  completionPercentage: number;
  snapshot: {
    systemInfo: any;
    answers: any[];
    actionItems: any[];
    documents: any[];
    summary?: {
      totalRequirements: number;
      compliant: number;
      partiallyCompliant: number;
      nonCompliant: number;
      notApplicable: number;
      totalActions: number;
      highPriority: number;
      mediumPriority: number;
      lowPriority: number;
    };
  };
  notes?: string;
  createdAt?: Date;
}

interface AuditVersionCreationAttributes extends Optional<AuditVersionAttributes, 'id' | 'notes' | 'createdAt'> {}

class AuditVersion extends Model<AuditVersionAttributes, AuditVersionCreationAttributes> implements AuditVersionAttributes {
  public id!: number;
  public auditId!: number;
  public userId!: number;
  public version!: number;
  public status!: 'draft' | 'in_progress' | 'completed' | 'archived';
  public riskClass!: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
  public completionPercentage!: number;
  public snapshot!: {
    systemInfo: any;
    answers: any[];
    actionItems: any[];
    documents: any[];
    summary?: {
      totalRequirements: number;
      compliant: number;
      partiallyCompliant: number;
      nonCompliant: number;
      notApplicable: number;
      totalActions: number;
      highPriority: number;
      mediumPriority: number;
      lowPriority: number;
    };
  };
  public notes?: string;

  public readonly createdAt!: Date;
}

AuditVersion.init(
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
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'archived'),
      allowNull: false,
    },
    riskClass: {
      type: DataTypes.ENUM('PROHIBITED', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK'),
      allowNull: false,
    },
    completionPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Complete snapshot of audit state at time of version creation',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional notes for this version',
    },
  },
  {
    sequelize,
    tableName: 'audit_versions',
    updatedAt: false,
    indexes: [
      {
        fields: ['auditId', 'version'],
        unique: true,
      },
    ],
  }
);

// Associations
AuditVersion.belongsTo(User, { foreignKey: 'userId', as: 'creator' });
AuditVersion.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });
Audit.hasMany(AuditVersion, { foreignKey: 'auditId', as: 'versions' });

export default AuditVersion;
