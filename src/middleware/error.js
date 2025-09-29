import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// 404 handler - always returns a minimal public message
export function notFoundHandler(req, res, _next) {
  return res.status(404).json({ error: true, code: 404, message: 'Not Found' });
}

// Central error handler - log details internally but avoid leaking sensitive
// information to clients. For 5xx errors return a generic message in
// production. For 4xx errors (client errors) return the provided message.
export function errorHandler(err, req, res, _next) {
  const status = Number(err.status) || 500;

  // Log full error details for diagnostics (never return stack to clients)
  logger.error({
    message: err.message || 'Unhandled error',
    status,
    stack: err.stack,
    details: err.details || null,
    path: req.originalUrl,
    method: req.method,
  });

  // Build public-facing error payload
  const isServerError = status >= 500;
  const publicMessage = (() => {
    if (isServerError) {
      // In non-development environments, avoid exposing internals
      if (process.env.NODE_ENV === 'development') return err.message || 'Internal Server Error';
      return 'Internal Server Error';
    }
    return err.message || 'Bad Request';
  })();

  const payload = { error: true, code: status, message: publicMessage };

  // For validation-like errors include limited details when available and safe
  if (!isServerError && err.details) {
    // Only include sanitized details (message and path) to help clients fix input
    payload.details = Array.isArray(err.details)
      ? err.details.map(d => ({ message: d.message, path: d.path }))
      : err.details;
  }

  return res.status(status).json(payload);
}


