import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export type RiskLevel = 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK' | 'UNKNOWN';

export interface ScanFinding {
  category: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  recommendation: string;
  articleReference?: string;
}

export interface ScanAnalysis {
  riskLevel: RiskLevel;
  riskScore: number;
  findings: ScanFinding[];
  summary: string;
  detectedFeatures: string[];
  complianceGaps: string[];
  nextSteps: string[];
}

interface ScanResultAttributes {
  id: number;
  userId?: number;
  inputType: 'url' | 'description';
  inputValue: string;
  systemName?: string;
  analysis: ScanAnalysis;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ScanResultCreationAttributes extends Optional<ScanResultAttributes,
  'id' | 'userId' | 'systemName' | 'errorMessage' | 'createdAt' | 'updatedAt'
> {}

class ScanResult extends Model<ScanResultAttributes, ScanResultCreationAttributes> implements ScanResultAttributes {
  public id!: number;
  public userId?: number;
  public inputType!: 'url' | 'description';
  public inputValue!: string;
  public systemName?: string;
  public analysis!: ScanAnalysis;
  public status!: 'pending' | 'completed' | 'failed';
  public errorMessage?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ScanResult.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    inputType: {
      type: DataTypes.ENUM('url', 'description'),
      allowNull: false,
    },
    inputValue: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    systemName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    analysis: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'scan_results',
  }
);

export default ScanResult;
