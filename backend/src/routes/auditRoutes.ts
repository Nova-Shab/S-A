import { Router } from 'express';
import {
  createAudit,
  getAudits,
  getAudit,
  updateAudit,
  deleteAudit,
  updateAuditAnswer,
  shareAudit,
  getAuditShares,
  removeShare,
} from '../controllers/auditController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Audit CRUD
router.post('/', createAudit);
router.get('/', getAudits);
router.get('/:id', getAudit);
router.put('/:id', updateAudit);
router.delete('/:id', deleteAudit);

// Audit answers
router.put('/:id/answers', updateAuditAnswer);

// Sharing
router.post('/:id/share', shareAudit);
router.get('/:id/shares', getAuditShares);
router.delete('/:id/shares/:shareId', removeShare);

export default router;
