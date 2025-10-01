import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '../../data');

function ensureBase() {
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
}

export function appendLocation(event) {
  ensureBase();
  const d = new Date(event.timestamp || Date.now());
  const filename = path.join(base, `locations-${d.toISOString().slice(0,10)}.ndjson`);
  const line = JSON.stringify(event) + '\n';
  fs.appendFileSync(filename, line);
}

// Simple read by date range (naive, reads files per-day)
export function readLocations({ from, to, deviceId }) {
  ensureBase();
  const results = [];
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const filename = path.join(base, `locations-${d.toISOString().slice(0,10)}.ndjson`);
    if (!fs.existsSync(filename)) continue;
    const raw = fs.readFileSync(filename, 'utf8');
    raw.split('\n').forEach(line => {
      if (!line) return;
      try {
        const obj = JSON.parse(line);
        if (deviceId && obj.deviceId !== deviceId) return;
        const t = new Date(obj.timestamp || obj.time || obj.ts);
        if (t >= start && t <= end) results.push(obj);
      } catch (e) { /* ignore malformed lines */ }
    });
  }
  return results;
}
