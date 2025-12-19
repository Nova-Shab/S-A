import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleResolved,
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createComment);
router.get('/audit/:auditId', getComments);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.patch('/:id/resolve', toggleResolved);

export default router;
