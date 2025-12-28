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
  saveCompleteAudit,
  createAuditVersion,
  getAuditVersions,
  getAuditVersion,
  updateActionItems,
  getActionItems,
  getAuditHistoryLog,
  findAuditBySystemName,
  checkActiveAuditForSystem,
} from '../controllers/auditController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Audit CRUD
router.post('/', createAudit);
router.get('/', getAudits);
router.get('/find-by-system', findAuditBySystemName); // Muss vor /:id sein!
router.get('/check-active/:systemId', checkActiveAuditForSystem); // Check active audit for system
router.get('/:id', getAudit);
router.put('/:id', updateAudit);
router.delete('/:id', deleteAudit);

// Audit answers
router.put('/:id/answers', updateAuditAnswer);

// Save complete audit state (answers + action items)
router.put('/:id/save', saveCompleteAudit);

// Action items
router.get('/:id/action-items', getActionItems);
router.put('/:id/action-items', updateActionItems);

// Audit versions (snapshots for traceability)
router.post('/:id/versions', createAuditVersion);
router.get('/:id/versions', getAuditVersions);
router.get('/:id/versions/:versionId', getAuditVersion);

// Audit history (change log)
router.get('/:id/history', getAuditHistoryLog);

// Sharing
router.post('/:id/share', shareAudit);
router.get('/:id/shares', getAuditShares);
router.delete('/:id/shares/:shareId', removeShare);

export default router;
