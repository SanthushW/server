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
  // shallow copy so we don't mutate the caller's object
  const e = Object.assign({}, event);
  // normalize ids to strings for consistent lookup
  if (e.busId !== undefined && e.busId !== null) e.busId = String(e.busId);
  if (e.deviceId !== undefined && e.deviceId !== null) e.deviceId = String(e.deviceId);

  // ensure timestamp exists and is a number/ISO string
  const ts = e.timestamp || e.time || e.ts || Date.now();
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) {
    // fallback to now
    e.timestamp = Date.now();
  } else {
    // store as ISO so files are easier to read
    e.timestamp = d.toISOString();
  }

  const filename = path.join(base, `locations-${new Date(e.timestamp).toISOString().slice(0,10)}.ndjson`);
  const line = JSON.stringify(e) + '\n';
  fs.appendFileSync(filename, line);
}

// Simple read by date range (naive, reads files per-day)
export function readLocations({ from, to, deviceId, busId } = {}) {
  ensureBase();
  const results = [];

  // accept either busId or deviceId as the filter; prefer busId if provided
  const filterId = (busId || deviceId) !== undefined && (busId || deviceId) !== null
    ? String(busId || deviceId)
    : null;

  // normalize date range: if missing, provide reasonable defaults
  const start = from ? new Date(from) : new Date(0);
  const end = to ? new Date(to) : new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    // invalid date inputs -> return empty
    return results;
  }

  // iterate days inclusive
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const filename = path.join(base, `locations-${d.toISOString().slice(0,10)}.ndjson`);
    if (!fs.existsSync(filename)) continue;
    const raw = fs.readFileSync(filename, 'utf8');
    raw.split('\n').forEach(line => {
      if (!line) return;
      try {
        const obj = JSON.parse(line);

        // normalize ids to strings before comparison
        if (filterId) {
          const objId = (obj.busId !== undefined && obj.busId !== null)
            ? String(obj.busId)
            : (obj.deviceId !== undefined && obj.deviceId !== null) ? String(obj.deviceId) : null;
          if (!objId || objId !== filterId) return;
        }

        const t = new Date(obj.timestamp || obj.time || obj.ts);
        if (Number.isNaN(t.getTime())) return; // ignore malformed timestamp lines
        if (t >= start && t <= end) results.push(obj);
      } catch (e) { /* ignore malformed lines */ }
    });
  }
  return results;
}
