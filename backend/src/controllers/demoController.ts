import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import DemoLead from '../models/DemoLead';
import jwt from 'jsonwebtoken';

const DEMO_JWT_SECRET = process.env.DEMO_JWT_SECRET || process.env.JWT_SECRET || 'demo-secret-key';
const DEMO_TOKEN_EXPIRY = process.env.DEMO_TOKEN_EXPIRY || '7d';
const DEMO_AUTO_GRANT = process.env.DEMO_AUTO_GRANT === 'true';
const DEMO_ENABLED = process.env.DEMO_ENABLED !== 'false'; // Default to true

interface DemoTokenPayload {
  leadId: number;
  email: string;
  type: 'demo';
}

// Generate JWT for demo access
const generateDemoJwt = (lead: DemoLead): string => {
  const payload: DemoTokenPayload = {
    leadId: lead.id,
    email: lead.email,
    type: 'demo',
  };
  return jwt.sign(payload, DEMO_JWT_SECRET, { expiresIn: DEMO_TOKEN_EXPIRY } as jwt.SignOptions);
};

// Verify demo JWT
export const verifyDemoJwt = (token: string): DemoTokenPayload => {
  return jwt.verify(token, DEMO_JWT_SECRET) as DemoTokenPayload;
};

// Check if demo mode is enabled
export const getDemoStatus = async (req: Request, res: Response): Promise<void> => {
  res.json({
    enabled: DEMO_ENABLED,
    autoGrant: DEMO_AUTO_GRANT,
  });
};

// Submit demo access request
export const requestDemoAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if demo is enabled
    if (!DEMO_ENABLED) {
      res.status(403).json({
        error: 'Demo-Zugang ist derzeit deaktiviert.',
      });
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validierungsfehler',
        details: errors.array(),
      });
      return;
    }

    const { firstName, lastName, email, company, role, phone, privacyAccepted } = req.body;

    // Check privacy acceptance
    if (!privacyAccepted) {
      res.status(400).json({
        error: 'Die Datenschutzerklärung muss akzeptiert werden.',
      });
      return;
    }

    // Check if email already exists
    const existingLead = await DemoLead.findOne({ where: { email } });

    if (existingLead) {
      // If lead exists and demo is still valid, return existing token
      if (existingLead.isDemoValid()) {
        const demoJwt = generateDemoJwt(existingLead);
        res.json({
          success: true,
          message: 'Sie haben bereits Demo-Zugang. Willkommen zurück!',
          demoToken: demoJwt,
          expiresAt: existingLead.demoExpiresAt,
        });
        return;
      }

      // Reactivate expired demo
      existingLead.isActive = true;
      existingLead.demoGrantedAt = new Date();
      existingLead.demoExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      existingLead.demoToken = DemoLead.generateDemoToken();
      await existingLead.save();

      const demoJwt = generateDemoJwt(existingLead);
      res.json({
        success: true,
        message: 'Ihr Demo-Zugang wurde reaktiviert!',
        demoToken: demoJwt,
        expiresAt: existingLead.demoExpiresAt,
      });
      return;
    }

    // Create new lead
    const demoToken = DemoLead.generateDemoToken();
    const demoGrantedAt = DEMO_AUTO_GRANT ? new Date() : undefined;
    const demoExpiresAt = DEMO_AUTO_GRANT
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : undefined;

    const lead = await DemoLead.create({
      firstName,
      lastName,
      email,
      company,
      role,
      phone,
      privacyAccepted,
      demoToken,
      demoGrantedAt,
      demoExpiresAt,
      source: 'demo-form',
    });

    if (DEMO_AUTO_GRANT) {
      const demoJwt = generateDemoJwt(lead);
      res.status(201).json({
        success: true,
        message: 'Demo-Zugang erfolgreich freigeschaltet!',
        demoToken: demoJwt,
        expiresAt: lead.demoExpiresAt,
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt. Wir werden Sie in Kürze kontaktieren.',
        pending: true,
      });
    }
  } catch (error) {
    console.error('Demo access request error:', error);
    res.status(500).json({
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    });
  }
};

// Verify demo token and return access status
export const verifyDemoAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        valid: false,
        error: 'Kein Demo-Token vorhanden.',
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyDemoJwt(token);

      // Verify lead exists and is active
      const lead = await DemoLead.findByPk(decoded.leadId);

      if (!lead || !lead.isDemoValid()) {
        res.status(401).json({
          valid: false,
          error: 'Demo-Zugang abgelaufen oder ungültig.',
        });
        return;
      }

      res.json({
        valid: true,
        lead: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          company: lead.company,
          expiresAt: lead.demoExpiresAt,
        },
      });
    } catch {
      res.status(401).json({
        valid: false,
        error: 'Ungültiger Demo-Token.',
      });
    }
  } catch (error) {
    console.error('Demo verification error:', error);
    res.status(500).json({
      valid: false,
      error: 'Verifizierungsfehler.',
    });
  }
};

// Admin: Get all demo leads
export const getAllLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: Record<string, unknown> = {};
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const { rows: leads, count: total } = await DemoLead.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      leads,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Leads.' });
  }
};

// Admin: Grant demo access manually
export const grantDemoAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { durationDays = 7 } = req.body;

    const lead = await DemoLead.findByPk(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead nicht gefunden.' });
      return;
    }

    lead.demoGrantedAt = new Date();
    lead.demoExpiresAt = new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000);
    lead.isActive = true;
    await lead.save();

    res.json({
      success: true,
      message: 'Demo-Zugang wurde freigeschaltet.',
      lead,
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({ error: 'Fehler beim Freischalten.' });
  }
};

// Admin: Revoke demo access
export const revokeDemoAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lead = await DemoLead.findByPk(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead nicht gefunden.' });
      return;
    }

    lead.isActive = false;
    await lead.save();

    res.json({
      success: true,
      message: 'Demo-Zugang wurde widerrufen.',
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Fehler beim Widerrufen.' });
  }
};
