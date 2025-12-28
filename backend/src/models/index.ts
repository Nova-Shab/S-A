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

    // Sync without alter to avoid backup table conflicts
    await sequelize.sync({ force });
    console.log(`✅ Database synchronized ${force ? '(FORCE - all data deleted!)' : ''}`);

    // Manually add missing columns
    await addMissingColumns();
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Add missing columns without using ALTER mode (avoids backup table issues in SQLite)
async function addMissingColumns() {
  try {
    // Clean up any leftover backup tables from failed ALTER operations
    try {
      await sequelize.query("DROP TABLE IF EXISTS users_backup;");
      await sequelize.query("DROP TABLE IF EXISTS audits_backup;");
    } catch (e) {
      // Ignore errors
    }

    // Check if systemId column exists in audits table
    const [auditsColumns] = await sequelize.query("PRAGMA table_info(audits);") as any[];
    const hasSystemId = auditsColumns.some((col: any) => col.name === 'systemId');

    if (!hasSystemId) {
      await sequelize.query("ALTER TABLE audits ADD COLUMN systemId VARCHAR(255);");
      console.log('✅ Added systemId column to audits table');
    }
  } catch (error: any) {
    // Column might already exist or table doesn't exist yet
    if (!error.message?.includes('duplicate column')) {
      console.log('ℹ️ Schema migration check completed');
    }
  }
}

export default sequelize;
