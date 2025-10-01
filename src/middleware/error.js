import winston from 'winston';

// Redact sensitive fields from log objects
const redactSensitive = winston.format((info) => {
  const redact = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    const fieldsToRedact = ['secret', 'password', 'token', 'accessToken', 'refreshToken'];
    for (const key of Object.keys(copy)) {
      try {
        if (fieldsToRedact.includes(key)) {
          copy[key] = '[REDACTED]';
        } else if (typeof copy[key] === 'string' && /^(eyJ|[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,})$/.test(copy[key])) {
          // Likely a JWT-like string, redact
          copy[key] = '[REDACTED_TOKEN]';
        } else if (typeof copy[key] === 'object') {
          copy[key] = redact(copy[key]);
        }
      } catch (e) {
        // ignore and continue
      }
    }
    return copy;
  };

  if (info.details) info.details = redact(info.details);
  if (info.meta) info.meta = redact(info.meta);
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    redactSensitive(),
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


