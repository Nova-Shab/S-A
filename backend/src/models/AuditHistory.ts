import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import User from './User';
import Audit from './Audit';

interface AuditHistoryAttributes {
  id: number;
  auditId: number;
  userId: number;
  action: 'created' | 'updated' | 'status_changed' | 'shared' | 'comment_added' | 'file_uploaded' | 'requirement_updated';
  entityType?: string;
  entityId?: number;
  changes: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    description?: string;
    [key: string]: any;
  };
  ipAddress?: string;
  createdAt?: Date;
}

interface AuditHistoryCreationAttributes extends Optional<AuditHistoryAttributes, 'id' | 'entityType' | 'entityId' | 'ipAddress' | 'createdAt'> {}

class AuditHistory extends Model<AuditHistoryAttributes, AuditHistoryCreationAttributes> implements AuditHistoryAttributes {
  public id!: number;
  public auditId!: number;
  public userId!: number;
  public action!: 'created' | 'updated' | 'status_changed' | 'shared' | 'comment_added' | 'file_uploaded' | 'requirement_updated';
  public entityType?: string;
  public entityId?: number;
  public changes!: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    description?: string;
    [key: string]: any;
  };
  public ipAddress?: string;

  public readonly createdAt!: Date;
}

AuditHistory.init(
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
    action: {
      type: DataTypes.ENUM('created', 'updated', 'status_changed', 'shared', 'comment_added', 'file_uploaded', 'requirement_updated'),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of entity that was changed (e.g., "requirement", "comment")',
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the changed entity',
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'JSON object describing what changed',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_history',
    updatedAt: false,
  }
);

// Associations
AuditHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditHistory.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });

Audit.hasMany(AuditHistory, { foreignKey: 'auditId', as: 'history' });

export default AuditHistory;
