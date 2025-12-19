import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import User from './User';
import Audit from './Audit';

interface CommentAttributes {
  id: number;
  auditId: number;
  userId: number;
  requirementId?: string;
  parentId?: number;
  content: string;
  isResolved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'requirementId' | 'parentId' | 'isResolved' | 'createdAt' | 'updatedAt'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public auditId!: number;
  public userId!: number;
  public requirementId?: string;
  public parentId?: number;
  public content!: string;
  public isResolved!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
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
      comment: 'If comment is specific to a requirement',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
      comment: 'For threaded comments/replies',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'comments',
  }
);

// Associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Comment.belongsTo(Audit, { foreignKey: 'auditId', as: 'audit' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });

Audit.hasMany(Comment, { foreignKey: 'auditId', as: 'comments' });

export default Comment;
