import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '../../data');
const auditPath = path.join(base, 'audit.log');

export function auditWrites(req, res, next) {
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!isWrite) return next();

  const start = Date.now();
  res.on('finish', () => {
    const entry = {
      time: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      user: req.user || null,
      ip: req.ip,
      durationMs: Date.now() - start,
    };
    // ensure directory exists
    try {
      if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Audit directory create failed', e && e.message);
      return;
    }
    fs.appendFile(auditPath, JSON.stringify(entry) + '\n', (err) => {
      if (err) {
        // log and continue; don't throw
        // eslint-disable-next-line no-console
        console.error('Failed to write audit log', err && err.message);
      }
    });
  });
  return next();
}







