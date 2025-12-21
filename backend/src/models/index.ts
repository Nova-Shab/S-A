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
};

// Sync database
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await sequelize.sync({ force, alter: !force && process.env.NODE_ENV === 'development' });
    console.log(`✅ Database synchronized ${force ? '(FORCE - all data deleted!)' : ''}`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
