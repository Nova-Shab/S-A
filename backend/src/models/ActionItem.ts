import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import Audit from './Audit';
import User from './User';

interface ActionItemAttributes {
  id: number;
  auditId: number;
  requirementId: string;
  category: string;
  requirementTitle: string;
  severity: 'hoch' | 'mittel' | 'niedrig';
  recommendedAction: string;
  responsible: string;
  targetDate?: string;
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
  notes?: string;
  lastModifiedBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ActionItemCreationAttributes extends Optional<ActionItemAttributes, 'id' | 'targetDate' | 'notes' | 'status' | 'createdAt' | 'updatedAt'> {}

class ActionItem extends Model<ActionItemAttributes, ActionItemCreationAttributes> implements ActionItemAttributes {
  public id!: number;
  public auditId!: number;
  public requirementId!: string;
  public category!: string;
  public requirementTitle!: string;
  public severity!: 'hoch' | 'mittel' | 'niedrig';
  public recommendedAction!: string;
  public responsible!: string;
  public targetDate?: string;
  public status!: 'open' | 'in_progress' | 'completed' | 'deferred';
  public notes?: string;
  public lastModifiedBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ActionItem.init(
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requirementTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('hoch', 'mittel', 'niedrig'),
      allowNull: false,
    },
    recommendedAction: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    responsible: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed', 'deferred'),
      defaultValue: 'open',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'action_items',
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
ActionItem.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });
ActionItem.belongsTo(User, { foreignKey: 'lastModifiedBy', as: 'modifier' });
Audit.hasMany(ActionItem, { foreignKey: 'auditId', as: 'actionItems' });

export default ActionItem;
