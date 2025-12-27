import { Router } from 'express';
import {
  getAllActions,
  getAction,
  updateAction,
  getResponsiblePersons,
  getSystemsForFilter,
  getActionStats,
} from '../controllers/actionsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Actions Overview Dashboard endpoints
router.get('/', getAllActions);
router.get('/stats', getActionStats);
router.get('/filters/responsible', getResponsiblePersons);
router.get('/filters/systems', getSystemsForFilter);
router.get('/:id', getAction);
router.put('/:id', updateAction);

export default router;
