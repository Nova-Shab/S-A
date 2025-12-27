import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import ActionItem from '../models/ActionItem';
import Audit from '../models/Audit';
import AuditShare from '../models/AuditShare';
import AuditHistory from '../models/AuditHistory';
import User from '../models/User';

/**
 * Get all actions for the current user across all audits
 * For the Maßnahmenübersicht dashboard
 */
export const getAllActions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      status,
      severity,
      responsible,
      systemId,
      dueWithinDays,
      overdue,
      page = 1,
      limit = 50,
      sortBy = 'targetDate',
      sortOrder = 'ASC',
    } = req.query;

    // Get all audits the user has access to
    const ownedAudits = await Audit.findAll({
      where: { userId: req.user.id },
      attributes: ['id'],
    });

    const sharedAuditIds = await AuditShare.findAll({
      where: { userId: req.user.id },
      attributes: ['auditId'],
    });

    const accessibleAuditIds = [
      ...ownedAudits.map(a => a.id),
      ...sharedAuditIds.map(s => s.auditId),
    ];

    if (accessibleAuditIds.length === 0) {
      res.status(200).json({
        actions: [],
        stats: {
          total: 0,
          open: 0,
          inProgress: 0,
          completed: 0,
          deferred: 0,
          overdue: 0,
          dueThisWeek: 0,
          bySeverity: { hoch: 0, mittel: 0, niedrig: 0 },
        },
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
      });
      return;
    }

    // Build where clause for action items
    const whereClause: any = {
      auditId: { [Op.in]: accessibleAuditIds },
    };

    if (status) {
      whereClause.status = status;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    if (responsible) {
      whereClause.responsible = { [Op.like]: `%${responsible}%` };
    }

    if (systemId) {
      whereClause.auditId = Number(systemId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (overdue === 'true') {
      whereClause.targetDate = {
        [Op.and]: [
          { [Op.ne]: null },
          { [Op.lt]: today.toISOString().split('T')[0] },
        ],
      };
      whereClause.status = { [Op.notIn]: ['completed', 'deferred'] };
    }

    if (dueWithinDays) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + Number(dueWithinDays));
      whereClause.targetDate = {
        [Op.and]: [
          { [Op.ne]: null },
          { [Op.gte]: today.toISOString().split('T')[0] },
          { [Op.lte]: futureDate.toISOString().split('T')[0] },
        ],
      };
    }

    // Validate sort options
    const validSortFields = ['targetDate', 'severity', 'status', 'createdAt', 'updatedAt'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sortBy as string) ? sortBy : 'targetDate';
    const safeSortOrder = validSortOrders.includes((sortOrder as string).toUpperCase())
      ? (sortOrder as string).toUpperCase()
      : 'ASC';

    // Fetch action items with audit info
    const { count, rows: actions } = await ActionItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Audit,
          as: 'audit',
          attributes: ['id', 'title', 'systemInfo', 'riskClass', 'status'],
        },
        {
          model: User,
          as: 'modifier',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [[safeSortBy as string, safeSortOrder]],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    // Calculate statistics for all accessible actions (unfiltered)
    const allActions = await ActionItem.findAll({
      where: { auditId: { [Op.in]: accessibleAuditIds } },
      attributes: ['status', 'severity', 'targetDate'],
    });

    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const stats = {
      total: allActions.length,
      open: allActions.filter(a => a.status === 'open').length,
      inProgress: allActions.filter(a => a.status === 'in_progress').length,
      completed: allActions.filter(a => a.status === 'completed').length,
      deferred: allActions.filter(a => a.status === 'deferred').length,
      overdue: allActions.filter(a => {
        if (!a.targetDate || a.status === 'completed' || a.status === 'deferred') return false;
        const dueDate = new Date(a.targetDate);
        return dueDate < today;
      }).length,
      dueThisWeek: allActions.filter(a => {
        if (!a.targetDate || a.status === 'completed' || a.status === 'deferred') return false;
        const dueDate = new Date(a.targetDate);
        return dueDate >= today && dueDate <= oneWeekFromNow;
      }).length,
      bySeverity: {
        hoch: allActions.filter(a => a.severity === 'hoch').length,
        mittel: allActions.filter(a => a.severity === 'mittel').length,
        niedrig: allActions.filter(a => a.severity === 'niedrig').length,
      },
    };

    // Transform actions for response
    const transformedActions = actions.map(action => {
      const audit = (action as any).audit;
      const systemInfo = audit?.systemInfo as any;

      return {
        id: action.id,
        auditId: action.auditId,
        requirementId: action.requirementId,
        category: action.category,
        requirementTitle: action.requirementTitle,
        severity: action.severity,
        recommendedAction: action.recommendedAction,
        responsible: action.responsible,
        targetDate: action.targetDate,
        status: action.status,
        notes: action.notes,
        createdAt: action.createdAt,
        updatedAt: action.updatedAt,
        // Enriched with audit/system info
        systemName: systemInfo?.systemName || audit?.title || 'Unbenannt',
        systemRiskClass: audit?.riskClass,
        auditStatus: audit?.status,
        isOverdue: action.targetDate &&
          new Date(action.targetDate) < today &&
          action.status !== 'completed' &&
          action.status !== 'deferred',
        lastModifiedBy: (action as any).modifier,
      };
    });

    res.status(200).json({
      actions: transformedActions,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all actions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single action by ID
 */
export const getAction = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const action = await ActionItem.findByPk(id, {
      include: [
        {
          model: Audit,
          as: 'audit',
          attributes: ['id', 'title', 'systemInfo', 'riskClass', 'status', 'userId'],
        },
        {
          model: User,
          as: 'modifier',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!action) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    const audit = (action as any).audit;

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get action history
    const history = await AuditHistory.findAll({
      where: {
        auditId: action.auditId,
        entityType: 'action_item',
        entityId: action.id,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const systemInfo = audit.systemInfo as any;

    res.status(200).json({
      action: {
        ...action.toJSON(),
        systemName: systemInfo?.systemName || audit.title || 'Unbenannt',
        systemRiskClass: audit.riskClass,
        auditStatus: audit.status,
        history,
      },
      permission: isOwner ? 'admin' : share?.permission,
    });
  } catch (error) {
    console.error('Get action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a single action
 */
export const updateAction = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, responsible, targetDate, notes } = req.body;

    const action = await ActionItem.findByPk(id, {
      include: [
        {
          model: Audit,
          as: 'audit',
          attributes: ['id', 'userId'],
        },
      ],
    });

    if (!action) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    const audit = (action as any).audit;

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Track changes
    const changes: any = {};
    if (status && status !== action.status) {
      changes.status = { old: action.status, new: status };
      action.status = status;
    }
    if (responsible && responsible !== action.responsible) {
      changes.responsible = { old: action.responsible, new: responsible };
      action.responsible = responsible;
    }
    if (targetDate !== undefined && targetDate !== action.targetDate) {
      changes.targetDate = { old: action.targetDate, new: targetDate };
      action.targetDate = targetDate;
    }
    if (notes !== undefined && notes !== action.notes) {
      changes.notes = { old: action.notes, new: notes };
      action.notes = notes;
    }

    action.lastModifiedBy = req.user.id;
    await action.save();

    // Log change
    if (Object.keys(changes).length > 0) {
      await AuditHistory.create({
        auditId: action.auditId,
        userId: req.user.id,
        action: 'updated',
        entityType: 'action_item',
        entityId: action.id,
        changes: {
          description: `Action "${action.requirementTitle}" updated`,
          fields: changes,
        },
        ipAddress: req.ip,
      });
    }

    res.status(200).json({
      message: 'Action updated successfully',
      action,
    });
  } catch (error) {
    console.error('Update action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get unique responsible persons for filter dropdown
 */
export const getResponsiblePersons = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get accessible audit IDs
    const ownedAudits = await Audit.findAll({
      where: { userId: req.user.id },
      attributes: ['id'],
    });

    const sharedAuditIds = await AuditShare.findAll({
      where: { userId: req.user.id },
      attributes: ['auditId'],
    });

    const accessibleAuditIds = [
      ...ownedAudits.map(a => a.id),
      ...sharedAuditIds.map(s => s.auditId),
    ];

    if (accessibleAuditIds.length === 0) {
      res.status(200).json({ responsiblePersons: [] });
      return;
    }

    const actions = await ActionItem.findAll({
      where: { auditId: { [Op.in]: accessibleAuditIds } },
      attributes: [[fn('DISTINCT', col('responsible')), 'responsible']],
    });

    const responsiblePersons = actions
      .map(a => a.responsible)
      .filter((r): r is string => !!r && r.trim() !== '');

    res.status(200).json({ responsiblePersons });
  } catch (error) {
    console.error('Get responsible persons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get systems list for filter dropdown
 */
export const getSystemsForFilter = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get accessible audits
    const ownedAudits = await Audit.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'title', 'systemInfo'],
    });

    const sharedAuditIds = await AuditShare.findAll({
      where: { userId: req.user.id },
      attributes: ['auditId'],
    });

    const sharedAudits = await Audit.findAll({
      where: { id: { [Op.in]: sharedAuditIds.map(s => s.auditId) } },
      attributes: ['id', 'title', 'systemInfo'],
    });

    const allAudits = [...ownedAudits, ...sharedAudits];

    const systems = allAudits.map(audit => {
      const systemInfo = audit.systemInfo as any;
      return {
        id: audit.id,
        name: systemInfo?.systemName || audit.title || `Audit #${audit.id}`,
      };
    });

    res.status(200).json({ systems });
  } catch (error) {
    console.error('Get systems for filter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get action statistics over time for charts
 */
export const getActionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get accessible audit IDs
    const ownedAudits = await Audit.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'title', 'systemInfo'],
    });

    const sharedAuditIds = await AuditShare.findAll({
      where: { userId: req.user.id },
      attributes: ['auditId'],
    });

    const accessibleAuditIds = [
      ...ownedAudits.map(a => a.id),
      ...sharedAuditIds.map(s => s.auditId),
    ];

    if (accessibleAuditIds.length === 0) {
      res.status(200).json({
        byStatus: [],
        bySystem: [],
        timeline: [],
      });
      return;
    }

    const allActions = await ActionItem.findAll({
      where: { auditId: { [Op.in]: accessibleAuditIds } },
      include: [
        {
          model: Audit,
          as: 'audit',
          attributes: ['id', 'title', 'systemInfo'],
        },
      ],
    });

    // Status distribution
    const byStatus = [
      { status: 'open', count: allActions.filter(a => a.status === 'open').length, label: 'Offen' },
      { status: 'in_progress', count: allActions.filter(a => a.status === 'in_progress').length, label: 'In Bearbeitung' },
      { status: 'completed', count: allActions.filter(a => a.status === 'completed').length, label: 'Abgeschlossen' },
      { status: 'deferred', count: allActions.filter(a => a.status === 'deferred').length, label: 'Zurückgestellt' },
    ];

    // By system
    const systemMap = new Map<number, { name: string; count: number; completed: number }>();
    for (const action of allActions) {
      const audit = (action as any).audit;
      const systemInfo = audit?.systemInfo as any;
      const systemName = systemInfo?.systemName || audit?.title || 'Unbekannt';

      if (!systemMap.has(action.auditId)) {
        systemMap.set(action.auditId, { name: systemName, count: 0, completed: 0 });
      }
      const sys = systemMap.get(action.auditId)!;
      sys.count++;
      if (action.status === 'completed') sys.completed++;
    }
    const bySystem = Array.from(systemMap.entries()).map(([id, data]) => ({
      systemId: id,
      systemName: data.name,
      total: data.count,
      completed: data.completed,
      pending: data.count - data.completed,
    }));

    // Timeline - group by target date (next 12 weeks)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeline: { weekStart: string; due: number; completed: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const dueThisWeek = allActions.filter(a => {
        if (!a.targetDate) return false;
        const dueDate = new Date(a.targetDate);
        return dueDate >= weekStart && dueDate <= weekEnd;
      });

      timeline.push({
        weekStart: weekStart.toISOString().split('T')[0],
        due: dueThisWeek.filter(a => a.status !== 'completed').length,
        completed: dueThisWeek.filter(a => a.status === 'completed').length,
      });
    }

    res.status(200).json({
      byStatus,
      bySystem,
      timeline,
    });
  } catch (error) {
    console.error('Get action stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
