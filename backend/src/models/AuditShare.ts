import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import User from './User';
import Audit from './Audit';

interface AuditShareAttributes {
  id: number;
  auditId: number;
  userId: number;
  sharedBy: number;
  permission: 'viewer' | 'editor' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditShareCreationAttributes extends Optional<AuditShareAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AuditShare extends Model<AuditShareAttributes, AuditShareCreationAttributes> implements AuditShareAttributes {
  public id!: number;
  public auditId!: number;
  public userId!: number;
  public sharedBy!: number;
  public permission!: 'viewer' | 'editor' | 'admin';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuditShare.init(
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
      comment: 'User with whom the audit is shared',
    },
    sharedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'User who shared the audit',
    },
    permission: {
      type: DataTypes.ENUM('viewer', 'editor', 'admin'),
      allowNull: false,
      defaultValue: 'viewer',
      comment: 'viewer: read-only, editor: can edit, admin: can edit and manage sharing',
    },
  },
  {
    sequelize,
    tableName: 'audit_shares',
    indexes: [
      {
        unique: true,
        fields: ['auditId', 'userId'],
      },
    ],
  }
);

// Associations
AuditShare.belongsTo(User, { foreignKey: 'userId', as: 'sharedWith' });
AuditShare.belongsTo(User, { foreignKey: 'sharedBy', as: 'sharer' });
AuditShare.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });

Audit.hasMany(AuditShare, { foreignKey: 'auditId', as: 'shares' });

export default AuditShare;
