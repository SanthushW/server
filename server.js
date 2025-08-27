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
import { auditWrites } from './src/middleware/audit.js';

const app = express();

app.use(helmet());
app.use(cors());
app.set('etag', 'strong');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(auditWrites);

app.use('/auth', authRoutes);
app.use('/routes', routeRoutes);
app.use('/buses', busRoutes);
app.use('/trips', tripRoutes);
app.use('/health', healthRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/realtime', realtimeRoutes);
app.use('/analytics', analyticsRoutes);

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


