import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import User from './User';
import Audit from './Audit';

interface FileAttributes {
  id: number;
  auditId: number;
  userId: number;
  requirementId?: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'requirementId' | 'description' | 'createdAt' | 'updatedAt'> {}

class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: number;
  public auditId!: number;
  public userId!: number;
  public requirementId?: string;
  public filename!: string;
  public originalName!: string;
  public mimetype!: string;
  public size!: number;
  public path!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

File.init(
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
    requirementId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'If file is evidence for a specific requirement',
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stored filename (hashed)',
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Original uploaded filename',
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'File size in bytes',
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Relative path to file',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'files',
  }
);

// Associations
File.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });
File.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });

Audit.hasMany(File, { foreignKey: 'auditId', as: 'files' });

export default File;
