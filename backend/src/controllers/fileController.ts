import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import File from '../models/File';
import Audit from '../models/Audit';
import AuditShare from '../models/AuditShare';
import AuditHistory from '../models/AuditHistory';

/**
 * Upload file
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { auditId, requirementId, description } = req.body;

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

    if (!isOwner && share?.permission !== 'editor' && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Create file record
    const file = await File.create({
      auditId,
      userId: req.user.id,
      requirementId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      description,
    });

    // Log file upload
    await AuditHistory.create({
      auditId,
      userId: req.user.id,
      action: 'file_uploaded',
      entityType: 'file',
      entityId: file.id,
      changes: {
        description: `File "${req.file.originalname}" uploaded`,
        requirementId,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file,
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get files for an audit
 */
export const getFiles = async (req: Request, res: Response): Promise<void> => {
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

    const files = await File.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Download file
 */
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const file = await File.findByPk(id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Check audit access
    const audit = await Audit.findByPk(file.auditId);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    if (!isOwner && !share) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(file.path)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    // Send file
    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete file
 */
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const file = await File.findByPk(id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Check audit access
    const audit = await Audit.findByPk(file.auditId);
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    const isOwner = audit.userId === req.user.id;
    const share = await AuditShare.findOne({
      where: { auditId: audit.id, userId: req.user.id },
    });

    // Only uploader, owner, or admin can delete
    if (file.userId !== req.user.id && !isOwner && share?.permission !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete database record
    await file.destroy();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
