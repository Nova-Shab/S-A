import sequelize from '../database/connection';
import User from './User';
import Audit from './Audit';
import AuditAnswer from './AuditAnswer';
import Comment from './Comment';
import File from './File';
import AuditHistory from './AuditHistory';
import AuditShare from './AuditShare';
import DemoLead from './DemoLead';
import ScanResult from './ScanResult';
import SystemAudit from './SystemAudit';
import AuditVersion from './AuditVersion';
import ActionItem from './ActionItem';
import AuditDocument from './AuditDocument';

// Export all models
export {
  User,
  Audit,
  AuditAnswer,
  Comment,
  File,
  AuditHistory,
  AuditShare,
  DemoLead,
  ScanResult,
  SystemAudit,
  AuditVersion,
  ActionItem,
  AuditDocument,
};

// Sync database
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Always use alter to ensure schema updates are applied (adds new columns without data loss)
    await sequelize.sync({ force, alter: !force });
    console.log(`✅ Database synchronized ${force ? '(FORCE - all data deleted!)' : '(with ALTER for schema updates)'}`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
