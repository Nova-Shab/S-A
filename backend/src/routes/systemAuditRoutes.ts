import { Router } from 'express';
import {
  getRequirements,
  createSystemAudit,
  createAuditVersion,
  getAuditById,
  getAuditHistory,
  getUserAudits,
  updateAuditAnswer,
  completeAudit,
  exportActionPlan,
} from '../controllers/systemAuditController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public: Get requirements catalog
router.get('/requirements', getRequirements);

// Protected routes (require authentication)
router.use(authenticate);

// Audit CRUD
router.post('/', createSystemAudit);
router.get('/', getUserAudits);
router.get('/:id', getAuditById);
router.post('/:id/new-version', createAuditVersion);

// Audit answers
router.patch('/:id/answer', updateAuditAnswer);

// Audit completion
router.post('/:id/complete', completeAudit);

// Export
router.get('/:id/export', exportActionPlan);

// Audit history for a system
router.get('/history/:systemId', getAuditHistory);

export default router;
