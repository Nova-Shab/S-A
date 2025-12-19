import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDemoStatus,
  requestDemoAccess,
  verifyDemoAccess,
  getAllLeads,
  grantDemoAccess,
  revokeDemoAccess,
} from '../controllers/demoController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Validation rules for demo request
const demoRequestValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Vorname ist erforderlich')
    .isLength({ min: 1, max: 100 })
    .withMessage('Vorname muss zwischen 1 und 100 Zeichen lang sein'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Nachname ist erforderlich')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nachname muss zwischen 1 und 100 Zeichen lang sein'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('E-Mail ist erforderlich')
    .isEmail()
    .withMessage('Ungültige E-Mail-Adresse')
    .normalizeEmail(),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Unternehmen ist erforderlich'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Rolle ist erforderlich'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Ungültige Telefonnummer'),
  body('privacyAccepted')
    .isBoolean()
    .withMessage('Datenschutzerklärung muss bestätigt werden')
    .custom((value) => value === true)
    .withMessage('Datenschutzerklärung muss akzeptiert werden'),
];

// Public routes
router.get('/status', getDemoStatus);
router.post('/request', demoRequestValidation, requestDemoAccess);
router.get('/verify', verifyDemoAccess);

// Admin routes (require authentication and admin role)
router.get('/leads', authenticate, authorize('admin'), getAllLeads);
router.post('/leads/:id/grant', authenticate, authorize('admin'), grantDemoAccess);
router.post('/leads/:id/revoke', authenticate, authorize('admin'), revokeDemoAccess);

export default router;
