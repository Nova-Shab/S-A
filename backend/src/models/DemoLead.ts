import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import crypto from 'crypto';

interface DemoLeadAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
  privacyAccepted: boolean;
  demoToken: string;
  demoGrantedAt?: Date;
  demoExpiresAt?: Date;
  isActive: boolean;
  source: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DemoLeadCreationAttributes extends Optional<DemoLeadAttributes,
  'id' | 'phone' | 'demoToken' | 'demoGrantedAt' | 'demoExpiresAt' | 'isActive' | 'notes' | 'createdAt' | 'updatedAt'
> {}

class DemoLead extends Model<DemoLeadAttributes, DemoLeadCreationAttributes> implements DemoLeadAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public company!: string;
  public role!: string;
  public phone?: string;
  public privacyAccepted!: boolean;
  public demoToken!: string;
  public demoGrantedAt?: Date;
  public demoExpiresAt?: Date;
  public isActive!: boolean;
  public source!: string;
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Get full name
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Check if demo access is valid
  public isDemoValid(): boolean {
    if (!this.isActive) return false;
    if (!this.demoGrantedAt) return false;
    if (this.demoExpiresAt && new Date() > this.demoExpiresAt) return false;
    return true;
  }

  // Generate a new demo token
  public static generateDemoToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

DemoLead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    privacyAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    demoToken: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    demoGrantedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    demoExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'demo-form',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'demo_leads',
    hooks: {
      beforeCreate: async (lead: DemoLead) => {
        // Generate demo token if not provided
        if (!lead.demoToken) {
          lead.demoToken = DemoLead.generateDemoToken();
        }
      },
    },
  }
);

export default DemoLead;
