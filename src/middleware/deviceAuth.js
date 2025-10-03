import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '../../data');
const devicesPath = path.join(base, 'devices.json');

function loadDevices(migrate = true) {
  try {
    if (!fs.existsSync(devicesPath)) return [];
    const raw = fs.readFileSync(devicesPath, 'utf8');
    const devices = JSON.parse(raw || '[]');

    // Migrate plaintext secrets to bcrypt hashes (one-time, automatic)
    if (migrate) {
      let changed = false;
      for (const d of devices) {
        if (d.secret && typeof d.secret === 'string' && !d.secret.startsWith('$2')) {
          try {
            d.secret = bcrypt.hashSync(d.secret, 10);
            changed = true;
          } catch (e) {
            // ignore hashing errors and keep original secret
          }
        }
      }
      if (changed) {
        try {
          fs.writeFileSync(devicesPath, JSON.stringify(devices, null, 2), 'utf8');
        } catch (e) {
          // if we cannot persist, continue with in-memory hashed secrets
        }
      }
    }

    return devices;
  } catch (e) {
    return [];
  }
}

export function deviceAuth(req, res, next) {
  const header = req.headers.authorization || '';

  // 1) Bearer JWT flow: Authorization: Bearer <token>
  if (header.startsWith('Bearer ')) {
    const token = header.substring(7).trim();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      // Expect payload to contain deviceId
      if (!payload || !payload.deviceId) return res.status(401).json({ error: true, code: 401, message: 'Invalid device token' });
      req.device = { id: payload.deviceId };
      return next();
    } catch (e) {
      return res.status(401).json({ error: true, code: 401, message: 'Invalid or expired token' });
    }
  }

  // 2) Legacy Device header flow: Authorization: Device deviceId:secret
  if (!header.startsWith('Device ')) return res.status(401).json({ error: true, code: 401, message: 'Missing device authorization' });
  const token = header.substring(7).trim();
  const parts = token.split(':');
  if (parts.length !== 2) return res.status(401).json({ error: true, code: 401, message: 'Invalid device authorization format' });
  const [deviceId, secret] = parts;
  const devices = loadDevices(true);
  const device = devices.find(d => d.deviceId === deviceId && d.enabled);
  if (!device) return res.status(401).json({ error: true, code: 401, message: 'Invalid device credentials' });

  // Compare secret using bcrypt (migrated values are hashed)
  try {
    const ok = bcrypt.compareSync(secret, device.secret);
    if (!ok) return res.status(401).json({ error: true, code: 401, message: 'Invalid device credentials' });
  } catch (e) {
    return res.status(401).json({ error: true, code: 401, message: 'Invalid device credentials' });
  }

  req.device = { id: device.deviceId, description: device.description };
  return next();
}
