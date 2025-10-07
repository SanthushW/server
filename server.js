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

// Simple welcome page at root
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Real-Time Bus Tracking System</title>
        <style>
          :root { color-scheme: light dark; }
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; margin: 0; padding: 2rem; line-height: 1.5; }
          .container { max-width: 900px; margin: 0 auto; }
          h1 { margin-top: 0; }
          .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
          a.card { display: block; padding: 12px 14px; border: 1px solid #8883; border-radius: 8px; text-decoration: none; }
          .muted { opacity: .8; font-size: .95rem; }
          code { background: #8881; padding: .1rem .3rem; border-radius: 4px; }
          footer { margin-top: 2rem; font-size: .9rem; opacity: .8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Real-Time Bus Tracking System</h1>
          <p class="muted">Hosted on Railway. Explore the API using the links below.</p>

          <h2>Quick Links</h2>
          <div class="grid">
            <a class="card" href="/docs"><strong>API Docs (Swagger)</strong><br/><span class="muted">Interactive OpenAPI UI</span></a>
            <a class="card" href="/health"><strong>Health</strong><br/><span class="muted">GET /health</span></a>
            <a class="card" href="/buses"><strong>Buses</strong><br/><span class="muted">GET /buses</span></a>
            <a class="card" href="/routes"><strong>Routes</strong><br/><span class="muted">GET /routes</span></a>
            <a class="card" href="/trips"><strong>Trips</strong><br/><span class="muted">GET /trips</span></a>
          </div>

          <h2>Auth</h2>
          <p class="muted">Use <code>POST /auth/register</code> and <code>POST /auth/login</code> in <a href="/docs">Swagger</a> or Postman.</p>

          <h2>Realtime</h2>
          <p class="muted">Connect to <code>GET /realtime/stream</code> (SSE). Try it in a client or curl:</p>
          <pre><code>curl -N ${req.protocol}://${req.get('host')}/realtime/stream</code></pre>

          <footer>© ${new Date().getFullYear()} Bus Tracking API</footer>
        </div>
      </body>
    </html>
  `);
});

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


