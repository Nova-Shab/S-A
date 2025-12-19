import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import Audit from './Audit';
import User from './User';

interface AuditAnswerAttributes {
  id: number;
  auditId: number;
  requirementId: string;
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
  notes: string;
  lastModifiedBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditAnswerCreationAttributes extends Optional<AuditAnswerAttributes, 'id' | 'notes' | 'createdAt' | 'updatedAt'> {}

class AuditAnswer extends Model<AuditAnswerAttributes, AuditAnswerCreationAttributes> implements AuditAnswerAttributes {
  public id!: number;
  public auditId!: number;
  public requirementId!: string;
  public status!: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
  public notes!: string;
  public lastModifiedBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuditAnswer.init(
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
    requirementId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('compliant', 'partially_compliant', 'non_compliant', 'not_applicable'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    lastModifiedBy: {
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
    tableName: 'audit_answers',
    indexes: [
      {
        unique: true,
        fields: ['auditId', 'requirementId'],
      },
    ],
  }
);

// Associations
AuditAnswer.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });
AuditAnswer.belongsTo(User, { foreignKey: 'lastModifiedBy', as: 'modifier' });
Audit.hasMany(AuditAnswer, { foreignKey: 'auditId', as: 'answers' });

export default AuditAnswer;
