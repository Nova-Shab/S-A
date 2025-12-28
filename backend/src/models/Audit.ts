import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import User from './User';

interface AuditAttributes {
  id: number;
  userId: number;
  systemId?: string; // Reference to frontend System registry
  title: string;
  description?: string;
  systemInfo: {
    domain: string;
    useCase: string;
    impactLevel: 'low' | 'medium' | 'high';
    biometricOrSurveillance: boolean;
    euImpact: boolean;
  };
  riskClass: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  completionPercentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditCreationAttributes extends Optional<AuditAttributes, 'id' | 'description' | 'systemId' | 'status' | 'completionPercentage' | 'createdAt' | 'updatedAt'> {}

class Audit extends Model<AuditAttributes, AuditCreationAttributes> implements AuditAttributes {
  public id!: number;
  public userId!: number;
  public systemId?: string;
  public title!: string;
  public description?: string;
  public systemInfo!: {
    domain: string;
    useCase: string;
    impactLevel: 'low' | 'medium' | 'high';
    biometricOrSurveillance: boolean;
    euImpact: boolean;
  };
  public riskClass!: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
  public status!: 'draft' | 'in_progress' | 'completed' | 'archived';
  public completionPercentage!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Audit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    systemId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to frontend System registry (localStorage)',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    systemInfo: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    riskClass: {
      type: DataTypes.ENUM('PROHIBITED', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'archived'),
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
  },
  {
    sequelize,
    tableName: 'audits',
  }
);

// Associations
Audit.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Audit, { foreignKey: 'userId', as: 'audits' });

export default Audit;
