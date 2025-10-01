import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import { errorHandler, notFoundHandler } from './src/middleware/error.js';
import authRoutes from './src/routes/auth.routes.js';
import routeRoutes from './src/routes/routes.routes.js';
import busRoutes from './src/routes/buses.routes.js';
import tripRoutes from './src/routes/trips.routes.js';
import healthRoutes from './src/routes/health.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/swagger.js';
import realtimeRoutes from './src/routes/realtime.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import ingestRoutes from './src/routes/ingest.routes.js';
import { auditWrites } from './src/middleware/audit.js';

const app = express();

app.use(helmet());
app.use(cors());
app.set('etag', 'strong');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(auditWrites);

// Security: ensure a non-default JWT secret is provided in non-test environments
const jwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV !== 'test') {
  if (!jwtSecret || jwtSecret === 'dev_secret' || jwtSecret.trim().length < 16) {
    // eslint-disable-next-line no-console
    console.error('FATAL: JWT_SECRET is not set to a strong value. Set JWT_SECRET in environment (min 16 chars).');
    // fail-fast to avoid running with weak secrets in production
    process.exit(1);
  }
}

app.use('/auth', authRoutes);
app.use('/routes', routeRoutes);
app.use('/buses', busRoutes);
app.use('/trips', tripRoutes);
app.use('/health', healthRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/realtime', realtimeRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/ingest', ingestRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;


