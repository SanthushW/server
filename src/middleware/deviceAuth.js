import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '../../data');
const devicesPath = path.join(base, 'devices.json');

function loadDevices() {
  try {
    if (!fs.existsSync(devicesPath)) return [];
    const raw = fs.readFileSync(devicesPath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

export function deviceAuth(req, res, next) {
  // Expect header: Authorization: Device deviceId:secret
  const header = req.headers.authorization || '';
  if (!header.startsWith('Device ')) return res.status(401).json({ error: true, code: 401, message: 'Missing device authorization' });
  const token = header.substring(7).trim();
  const parts = token.split(':');
  if (parts.length !== 2) return res.status(401).json({ error: true, code: 401, message: 'Invalid device authorization format' });
  const [deviceId, secret] = parts;
  const devices = loadDevices();
  const device = devices.find(d => d.deviceId === deviceId && d.secret === secret && d.enabled);
  if (!device) return res.status(401).json({ error: true, code: 401, message: 'Invalid device credentials' });
  // attach device info to request
  req.device = { id: device.deviceId, description: device.description };
  return next();
}
