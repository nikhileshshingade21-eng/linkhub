/**
 * LinkHub API Server
 */
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { env } from './src/shared/config/env.js';
import { errorHandler } from './src/shared/middleware/errorHandler.js';

// Module routes
import authRoutes from './src/modules/auth/auth.routes.js';
import usersRoutes from './src/modules/users/users.routes.js';
import squadsRoutes from './src/modules/squads/squads.routes.js';
import opportunitiesRoutes from './src/modules/opportunities/opportunities.routes.js';

// Load env
dotenv.config();

const app: express.Application = express();

// ---- Security & parsing middleware ----
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Rate limiting ----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Too many auth attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/squads', squadsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);

// ---- Health check ----
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LinkHub API is running',
    timestamp: new Date().toISOString(),
  });
});

// ---- Error handler (must be last) ----
app.use(errorHandler);

// ---- 404 handler ----
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

export default app;
