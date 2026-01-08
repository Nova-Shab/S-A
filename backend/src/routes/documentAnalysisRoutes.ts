import { Router } from 'express';
import {
  upload,
  uploadAndAnalyzeDocument,
  analyzeDocumentOnly,
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

// Simple analyze-only endpoint (doesn't require auditId, just analyzes and returns results)
router.post('/upload', upload.single('document'), analyzeDocumentOnly);

// Upload and analyze document (with database storage - requires auditId)
router.post('/upload-with-audit', upload.single('document'), uploadAndAnalyzeDocument);

// Re-analyze existing document
router.post('/reanalyze/:auditId/:requirementId/:documentId', reanalyzeDocument);

// Delete document
router.delete('/:auditId/:requirementId/:documentId', deleteDocument);

export default router;
