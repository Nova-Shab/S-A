import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Audit from '../models/Audit';
import AuditShare from '../models/AuditShare';
import AuditHistory from '../models/AuditHistory';
import User from '../models/User';

/**
 * Create a comment
 */
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auditId, requirementId, parentId, content } = req.body;

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

    // Create comment
    const comment = await Comment.create({
      auditId,
      userId: req.user.id,
      requirementId,
      parentId,
      content,
      isResolved: false,
    });

    // Log comment
    await AuditHistory.create({
      auditId,
      userId: req.user.id,
      action: 'comment_added',
      entityType: 'comment',
      entityId: comment.id,
      changes: {
        description: parentId ? 'Reply added' : 'Comment added',
        requirementId,
      },
      ipAddress: req.ip,
    });

    // Fetch comment with author info
    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithAuthor,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get comments for an audit
 */
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auditId } = req.params;
    const { requirementId } = req.query;

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
    if (requirementId) {
      whereClause.requirementId = requirementId;
    }

    // Get top-level comments (no parent)
    const comments = await Comment.findAll({
      where: {
        ...whereClause,
        parentId: null,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update comment
 */
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { content, isResolved } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Only author can update
    if (comment.userId !== req.user.id) {
      res.status(403).json({ error: 'Only the author can update this comment' });
      return;
    }

    if (content) comment.content = content;
    if (isResolved !== undefined) comment.isResolved = isResolved;

    await comment.save();

    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete comment
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Only author can delete
    if (comment.userId !== req.user.id) {
      res.status(403).json({ error: 'Only the author can delete this comment' });
      return;
    }

    await comment.destroy();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Toggle comment resolved status
 */
export const toggleResolved = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Check audit access
    const audit = await Audit.findByPk(comment.auditId);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    comment.isResolved = !comment.isResolved;
    await comment.save();

    res.status(200).json({
      message: comment.isResolved ? 'Comment marked as resolved' : 'Comment marked as unresolved',
      comment,
    });
  } catch (error) {
    console.error('Toggle resolved error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
