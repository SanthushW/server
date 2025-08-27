import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Resource not found' });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;
  logger.error({ message: err.message, stack: err.stack });
  res.status(status).json({ message, details });
}


