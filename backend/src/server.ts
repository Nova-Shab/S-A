import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import auditRoutes from './routes/auditRoutes';
import commentRoutes from './routes/commentRoutes';
import fileRoutes from './routes/fileRoutes';
import historyRoutes from './routes/historyRoutes';
import demoRoutes from './routes/demoRoutes';
import scannerRoutes from './routes/scannerRoutes';
import systemAuditRoutes from './routes/systemAuditRoutes';
import documentAnalysisRoutes from './routes/documentAnalysisRoutes';
import chatRoutes from './routes/chatRoutes';

// Import database
import { syncDatabase } from './models';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/system-audits', systemAuditRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/documents', documentAnalysisRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const startServer = async () => {
  try {
    // Sync database
    await syncDatabase(false);

    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  🚀 EU AI Act Audit Tool - Backend Server');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  ✅ Server running on: http://localhost:${PORT}`);
      console.log(`  ✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ✅ Database: Connected (SQLite)`);
      console.log('');
      console.log('  Available endpoints:');
      console.log(`    → http://localhost:${PORT}/api/health`);
      console.log(`    → http://localhost:${PORT}/api/auth/*`);
      console.log(`    → http://localhost:${PORT}/api/audits/*`);
      console.log(`    → http://localhost:${PORT}/api/system-audits/*`);
      console.log(`    → http://localhost:${PORT}/api/scanner/*`);
      console.log(`    → http://localhost:${PORT}/api/documents/*`);
      console.log(`    → http://localhost:${PORT}/api/chat/*`);
      console.log(`    → http://localhost:${PORT}/api/demo/*`);
      console.log('');
      console.log(`  Demo Mode: ${process.env.DEMO_ENABLED !== 'false' ? 'ENABLED' : 'DISABLED'}`);
      console.log(`  Auto-Grant: ${process.env.DEMO_AUTO_GRANT === 'true' ? 'YES' : 'NO'}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
