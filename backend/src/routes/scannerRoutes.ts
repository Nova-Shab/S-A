import { Router } from 'express';
import { body } from 'express-validator';
import {
  performScan,
  getScanResult,
  getScanHistory,
  deleteScan,
  generateReport,
  getScannerStatus,
} from '../controllers/scannerController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validation rules for scan request
const scanValidation = [
  body('inputType')
    .isIn(['url', 'description'])
    .withMessage('inputType muss "url" oder "description" sein'),
  body('inputValue')
    .trim()
    .notEmpty()
    .withMessage('inputValue ist erforderlich')
    .isLength({ min: 10 })
    .withMessage('inputValue muss mindestens 10 Zeichen lang sein'),
  body('systemName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('systemName darf maximal 200 Zeichen lang sein'),
];

// Public routes (no auth required for basic scanning)
router.get('/status', getScannerStatus);
router.post('/analyze', scanValidation, performScan);
router.get('/result/:id', getScanResult);
router.get('/report/:id', generateReport);

// Protected routes (require authentication)
router.get('/history', authenticate, getScanHistory);
router.delete('/:id', authenticate, deleteScan);

export default router;
