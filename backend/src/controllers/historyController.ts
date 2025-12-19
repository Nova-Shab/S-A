import { Request, Response } from 'express';
import AuditHistory from '../models/AuditHistory';
import Audit from '../models/Audit';
import AuditShare from '../models/AuditShare';
import User from '../models/User';

/**
 * Get history for an audit
 */
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auditId } = req.params;
    const { action, page = 1, limit = 50 } = req.query;

    // Check audit access
    const audit = await Audit.findByPk(auditId);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Build where clause
    const whereClause: any = { auditId };
    if (action) {
      whereClause.action = action;
    }

    const history = await AuditHistory.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    const total = await AuditHistory.count({ where: whereClause });

    res.status(200).json({
      history,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get activity summary for an audit
 */
export const getActivitySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auditId } = req.params;

    // Check audit access
    const audit = await Audit.findByPk(auditId);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get activity counts by action type
    const activitySummary = await AuditHistory.findAll({
      where: { auditId },
      attributes: [
        'action',
        [AuditHistory.sequelize!.fn('COUNT', AuditHistory.sequelize!.col('id')), 'count'],
      ],
      group: ['action'],
    });

    // Get recent contributors
    const contributors = await AuditHistory.findAll({
      where: { auditId },
      attributes: [
        'userId',
        [AuditHistory.sequelize!.fn('COUNT', AuditHistory.sequelize!.col('id')), 'actionCount'],
        [AuditHistory.sequelize!.fn('MAX', AuditHistory.sequelize!.col('createdAt')), 'lastActivity'],
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      group: ['userId'],
      order: [[AuditHistory.sequelize!.fn('MAX', AuditHistory.sequelize!.col('createdAt')), 'DESC']],
      limit: 10,
    });

    res.status(200).json({
      summary: activitySummary,
      contributors,
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
