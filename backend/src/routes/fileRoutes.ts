import { Router } from 'express';
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} from '../controllers/fileController';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('file'), uploadFile);
router.get('/audit/:auditId', getFiles);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

export default router;
