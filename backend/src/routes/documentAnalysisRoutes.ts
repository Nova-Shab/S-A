import { Router } from 'express';
import {
  upload,
  uploadAndAnalyzeDocument,
  reanalyzeDocument,
  deleteDocument,
  checkAnalysisAvailability,
} from '../controllers/documentAnalysisController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Check if AI analysis is available (public endpoint)
router.get('/availability', checkAnalysisAvailability);

// Protected routes (require authentication)
router.use(authenticate);

// Upload and analyze document
router.post('/upload', upload.single('document'), uploadAndAnalyzeDocument);

// Re-analyze existing document
router.post('/reanalyze/:auditId/:requirementId/:documentId', reanalyzeDocument);

// Delete document
router.delete('/:auditId/:requirementId/:documentId', deleteDocument);

export default router;
