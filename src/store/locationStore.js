import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '../../data');
const LOCATION_FILE = 'location.json';

function ensureBase() {
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
}

// Persist latest location per bus into a single JSON file (overwrite)
export function appendLocation(event) {
  ensureBase();
  const file = path.join(base, LOCATION_FILE);
  let map = {};
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      map = raw ? JSON.parse(raw) : {};
    }
  } catch (e) {
    map = {};
  }

  const key = String(event.busId || event.deviceId || 'unknown');
  // normalize stored record
  const rec = {
    busId: Number(event.busId) || null,
    timestamp: event.timestamp || new Date().toISOString(),
    lat: event.lat,
    lng: event.lng,
    speed: event.speed || null,
    heading: event.heading || null,
    battery: event.battery || null,
  };
  map[key] = rec;

  fs.writeFileSync(file, JSON.stringify(map, null, 2), 'utf8');
}

// Read latest locations. If deviceId (or busId) provided, return array with that one item (if available).
export function readLocations({ from, to, deviceId } = {}) {
  ensureBase();
  const file = path.join(base, LOCATION_FILE);
  try {
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, 'utf8');
    const map = raw ? JSON.parse(raw) : {};
    const arr = Object.values(map || {});
    if (deviceId) {
      return arr.filter(r => String(r.busId) === String(deviceId));
    }
    return arr;
  } catch (e) {
    return [];
  }
}
