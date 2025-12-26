import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Audit from '../models/Audit';
import AuditAnswer from '../models/AuditAnswer';
import AuditShare from '../models/AuditShare';
import AuditHistory from '../models/AuditHistory';
import AuditVersion from '../models/AuditVersion';
import ActionItem from '../models/ActionItem';
import AuditDocument from '../models/AuditDocument';
import User from '../models/User';
import Comment from '../models/Comment';
import File from '../models/File';

/**
 * Create a new audit
 */
export const createAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, description, systemInfo, riskClass } = req.body;

    const audit = await Audit.create({
      userId: req.user.id,
      title,
      description,
      systemInfo,
      riskClass,
      status: 'draft',
      completionPercentage: 0,
    });

    // Log audit creation
    await AuditHistory.create({
      auditId: audit.id,
      userId: req.user.id,
      action: 'created',
      changes: {
        description: `Audit "${title}" created`,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Audit created successfully',
      audit,
    });
  } catch (error) {
    console.error('Create audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all audits for current user (owned + shared)
 */
export const getAudits = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, search, page = 1, limit = 10 } = req.query;

    // Build where clause
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Get audits owned by user
    const ownedAudits = await Audit.findAll({
      where: {
        userId: req.user.id,
        ...whereClause,
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['updatedAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    // Get audits shared with user
    const sharedAuditIds = await AuditShare.findAll({
      where: { userId: req.user.id },
      attributes: ['auditId', 'permission'],
    });

    const sharedAudits = await Audit.findAll({
      where: {
        id: { [Op.in]: sharedAuditIds.map(s => s.auditId) },
        ...whereClause,
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    // Combine and add permission info
    const auditsWithPermissions = [
      ...ownedAudits.map(a => ({
        ...a.toJSON(),
        permission: 'admin',
        isOwner: true,
      })),
      ...sharedAudits.map(a => {
        const share = sharedAuditIds.find(s => s.auditId === a.id);
        return {
          ...a.toJSON(),
          permission: share?.permission || 'viewer',
          isOwner: false,
        };
      }),
    ];

    res.status(200).json({
      audits: auditsWithPermissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: auditsWithPermissions.length,
      },
    });
  } catch (error) {
    console.error('Get audits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single audit by ID
 */
export const getAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const audit = await Audit.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: AuditAnswer,
          as: 'answers',
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
        {
          model: File,
          as: 'files',
        },
      ],
    });

    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: {
        auditId: audit.id,
        userId: req.user.id,
      },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json({
      audit: {
        ...audit.toJSON(),
        permission: isOwner ? 'admin' : share?.permission,
        isOwner,
      },
    });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update audit
 */
export const updateAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, systemInfo, riskClass, status } = req.body;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: {
        auditId: audit.id,
        userId: req.user.id,
      },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Track changes
    const changes: any = {};
    if (title && title !== audit.title) changes.title = { old: audit.title, new: title };
    if (status && status !== audit.status) changes.status = { old: audit.status, new: status };

    // Update fields
    if (title) audit.title = title;
    if (description !== undefined) audit.description = description;
    if (systemInfo) audit.systemInfo = systemInfo;
    if (riskClass) audit.riskClass = riskClass;
    if (status) audit.status = status;

    await audit.save();

    // Log changes
    if (Object.keys(changes).length > 0) {
      await AuditHistory.create({
        auditId: audit.id,
        userId: req.user.id,
        action: 'updated',
        changes: { fields: changes },
        ipAddress: req.ip,
      });
    }

    res.status(200).json({
      message: 'Audit updated successfully',
      audit,
    });
  } catch (error) {
    console.error('Update audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete audit
 */
export const deleteAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Only owner can delete
    if (audit.userId !== req.user.id) {
      res.status(403).json({ error: 'Only the owner can delete this audit' });
      return;
    }

    await audit.destroy();

    res.status(200).json({ message: 'Audit deleted successfully' });
  } catch (error) {
    console.error('Delete audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update audit answer
 */
export const updateAuditAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { requirementId, status, notes } = req.body;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Upsert answer
    const [answer, created] = await AuditAnswer.upsert({
      auditId: Number(id),
      requirementId,
      status,
      notes: notes || '',
      lastModifiedBy: req.user.id,
    });

    // Update completion percentage
    const totalAnswers = await AuditAnswer.count({ where: { auditId: id } });
    const completedAnswers = await AuditAnswer.count({
      where: {
        auditId: id,
        status: { [Op.in]: ['compliant', 'partially_compliant', 'not_applicable'] },
      },
    });

    audit.completionPercentage = Math.round((completedAnswers / totalAnswers) * 100) || 0;
    await audit.save();

    // Log change
    await AuditHistory.create({
      auditId: audit.id,
      userId: req.user.id,
      action: 'requirement_updated',
      entityType: 'requirement',
      entityId: answer.id,
      changes: {
        requirementId,
        status,
        description: created ? 'Requirement answered' : 'Requirement updated',
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: 'Answer saved successfully',
      answer,
      completionPercentage: audit.completionPercentage,
    });
  } catch (error) {
    console.error('Update audit answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Share audit with another user
 */
export const shareAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { userEmail, permission } = req.body;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check if user has admin permission
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Only owner or admins can share audits' });
      return;
    }

    // Find user to share with
    const targetUser = await User.findOne({ where: { email: userEmail } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Can't share with yourself
    if (targetUser.id === req.user.id) {
      res.status(400).json({ error: 'Cannot share with yourself' });
      return;
    }

    // Create or update share
    const [auditShare, created] = await AuditShare.upsert({
      auditId: audit.id,
      userId: targetUser.id,
      sharedBy: req.user.id,
      permission: permission || 'viewer',
    });

    // Log sharing
    await AuditHistory.create({
      auditId: audit.id,
      userId: req.user.id,
      action: 'shared',
      changes: {
        description: `Shared with ${targetUser.email} as ${permission}`,
        targetUserId: targetUser.id,
        permission,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: created ? 'Audit shared successfully' : 'Share permissions updated',
      share: auditShare,
    });
  } catch (error) {
    console.error('Share audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get audit sharing info
 */
export const getAuditShares = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    if (!isOwner) {
      res.status(403).json({ error: 'Only owner can view sharing settings' });
      return;
    }

    const shares = await AuditShare.findAll({
      where: { auditId: id },
      include: [
        {
          model: User,
          as: 'sharedWith',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(200).json({ shares });
  } catch (error) {
    console.error('Get audit shares error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove share
 */
export const removeShare = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id, shareId } = req.params;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    if (!isOwner) {
      res.status(403).json({ error: 'Only owner can remove shares' });
      return;
    }

    const share = await AuditShare.findByPk(shareId);
    if (!share || share.auditId !== Number(id)) {
      res.status(404).json({ error: 'Share not found' });
      return;
    }

    await share.destroy();

    res.status(200).json({ message: 'Share removed successfully' });
  } catch (error) {
    console.error('Remove share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Save complete audit state (answers + action items)
 */
export const saveCompleteAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { answers, actionItems, status } = req.body;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Save answers
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await AuditAnswer.upsert({
          auditId: Number(id),
          requirementId: answer.requirementId,
          status: answer.status,
          notes: answer.notes || '',
          lastModifiedBy: req.user.id,
        });
      }
    }

    // Save action items
    if (actionItems && Array.isArray(actionItems)) {
      // Delete existing action items and recreate
      await ActionItem.destroy({ where: { auditId: id } });

      for (const item of actionItems) {
        await ActionItem.create({
          auditId: Number(id),
          requirementId: item.requirementId || item.id,
          category: item.category,
          requirementTitle: item.requirementTitle,
          severity: item.severity,
          recommendedAction: item.recommendedAction,
          responsible: item.responsible,
          targetDate: item.targetDate,
          status: item.status || 'open',
          notes: item.notes,
          lastModifiedBy: req.user.id,
        });
      }
    }

    // Update audit status
    if (status) {
      audit.status = status;
    }

    // Calculate completion percentage
    const totalAnswers = await AuditAnswer.count({ where: { auditId: id } });
    const completedAnswers = await AuditAnswer.count({
      where: {
        auditId: id,
        status: { [Op.ne]: 'non_compliant' },
      },
    });

    audit.completionPercentage = totalAnswers > 0
      ? Math.round((completedAnswers / totalAnswers) * 100)
      : 0;

    await audit.save();

    // Log change
    await AuditHistory.create({
      auditId: audit.id,
      userId: req.user.id,
      action: 'updated',
      changes: {
        description: 'Complete audit state saved',
        answersCount: answers?.length || 0,
        actionItemsCount: actionItems?.length || 0,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: 'Audit saved successfully',
      audit,
      completionPercentage: audit.completionPercentage,
    });
  } catch (error) {
    console.error('Save complete audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create an audit version (snapshot)
 */
export const createAuditVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { notes } = req.body;

    const audit = await Audit.findByPk(id, {
      include: [
        { model: AuditAnswer, as: 'answers' },
        { model: ActionItem, as: 'actionItems' },
        { model: AuditDocument, as: 'documents' },
      ],
    });

    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Get the next version number
    const lastVersion = await AuditVersion.findOne({
      where: { auditId: id },
      order: [['version', 'DESC']],
    });
    const nextVersion = (lastVersion?.version || 0) + 1;

    // Calculate summary
    const answers = (audit as any).answers || [];
    const actionItems = (audit as any).actionItems || [];
    const documents = (audit as any).documents || [];

    const summary = {
      totalRequirements: answers.length,
      compliant: answers.filter((a: any) => a.status === 'compliant').length,
      partiallyCompliant: answers.filter((a: any) => a.status === 'partially_compliant').length,
      nonCompliant: answers.filter((a: any) => a.status === 'non_compliant').length,
      notApplicable: answers.filter((a: any) => a.status === 'not_applicable').length,
      totalActions: actionItems.length,
      highPriority: actionItems.filter((a: any) => a.severity === 'hoch').length,
      mediumPriority: actionItems.filter((a: any) => a.severity === 'mittel').length,
      lowPriority: actionItems.filter((a: any) => a.severity === 'niedrig').length,
    };

    // Create version snapshot
    const version = await AuditVersion.create({
      auditId: Number(id),
      userId: req.user.id,
      version: nextVersion,
      status: audit.status,
      riskClass: audit.riskClass,
      completionPercentage: audit.completionPercentage,
      snapshot: {
        systemInfo: audit.systemInfo,
        answers: answers.map((a: any) => a.toJSON ? a.toJSON() : a),
        actionItems: actionItems.map((a: any) => a.toJSON ? a.toJSON() : a),
        documents: documents.map((d: any) => d.toJSON ? d.toJSON() : d),
        summary,
      },
      notes,
    });

    // Log version creation
    await AuditHistory.create({
      auditId: audit.id,
      userId: req.user.id,
      action: 'status_changed',
      changes: {
        description: `Version ${nextVersion} created`,
        version: nextVersion,
        completionPercentage: audit.completionPercentage,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Audit version created successfully',
      version,
    });
  } catch (error) {
    console.error('Create audit version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all audit versions
 */
export const getAuditVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const versions = await AuditVersion.findAll({
      where: { auditId: id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['version', 'DESC']],
    });

    res.status(200).json({ versions });
  } catch (error) {
    console.error('Get audit versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get specific audit version
 */
export const getAuditVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id, versionId } = req.params;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const version = await AuditVersion.findOne({
      where: { id: versionId, auditId: id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    res.status(200).json({ version });
  } catch (error) {
    console.error('Get audit version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update action items
 */
export const updateActionItems = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { actionItems } = req.body;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Delete existing and recreate
    await ActionItem.destroy({ where: { auditId: id } });

    const createdItems = [];
    for (const item of actionItems) {
      const created = await ActionItem.create({
        auditId: Number(id),
        requirementId: item.requirementId || item.id,
        category: item.category,
        requirementTitle: item.requirementTitle,
        severity: item.severity,
        recommendedAction: item.recommendedAction,
        responsible: item.responsible,
        targetDate: item.targetDate,
        status: item.status || 'open',
        notes: item.notes,
        lastModifiedBy: req.user.id,
      });
      createdItems.push(created);
    }

    // Log change
    await AuditHistory.create({
      auditId: audit.id,
      userId: req.user.id,
      action: 'updated',
      changes: {
        description: `Action items updated (${createdItems.length} items)`,
        actionItemsCount: createdItems.length,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: 'Action items updated successfully',
      actionItems: createdItems,
    });
  } catch (error) {
    console.error('Update action items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get audit action items
 */
export const getActionItems = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const actionItems = await ActionItem.findAll({
      where: { auditId: id },
      order: [['severity', 'ASC'], ['category', 'ASC']],
    });

    res.status(200).json({ actionItems });
  } catch (error) {
    console.error('Get action items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get audit history (change log)
 */
export const getAuditHistoryLog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    // Check permissions
    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { count, rows: history } = await AuditHistory.findAndCountAll({
      where: { auditId: id },
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

    res.status(200).json({
      history,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get audit history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
