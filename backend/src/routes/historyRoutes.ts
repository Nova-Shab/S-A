import { Router } from 'express';
import { getHistory, getActivitySummary } from '../controllers/historyController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/audit/:auditId', getHistory);
router.get('/audit/:auditId/summary', getActivitySummary);

export default router;
