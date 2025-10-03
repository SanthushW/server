import http from 'http';
import fs from 'fs';
import path from 'path';

// Default busId and interval; can be overridden by CLI args or env
const args = process.argv.slice(2);
// args: [busId] [intervalMs] optionally
const busId = args[0] ? Number(args[0]) : (process.env.SIM_BUS_ID ? Number(process.env.SIM_BUS_ID) : 101);
const intervalMs = args[1] ? Number(args[1]) : (process.env.SIM_INTERVAL_MS ? Number(process.env.SIM_INTERVAL_MS) : 10000);

// Device auth: prefer env vars, or use defaults matching data/devices.json
const deviceId = process.env.DEVICE_ID || `device-${busId}`;
const deviceSecret = process.env.DEVICE_SECRET || `dev_secret_device_${busId}`;

function loadInitialCoords(id) {
  try {
    const data = fs.readFileSync(path.resolve(process.cwd(), 'data', 'buses.json'), 'utf8');
    const buses = JSON.parse(data || '[]');
    const b = buses.find(x => Number(x.id) === Number(id));
    if (b && b.gps && typeof b.gps.lat === 'number' && typeof b.gps.lng === 'number')
      return { lat: b.gps.lat, lng: b.gps.lng };
  } catch (e) {
    // ignore
  }
  // fallback to Colombo-ish coords
  return { lat: 6.9271, lng: 79.8612 };
}

// Maintain coords for bus 101
const coords = loadInitialCoords(busId);

function randomDelta() {
  // small jitter ~ up to 0.0005 degrees (~50m)
  return (Math.random() - 0.5) * 0.001;
}

function postLocation(payload) {
  const data = JSON.stringify(payload);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/ingest/gps',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      // Device Authorization header: "Device deviceId:secret"
      'Authorization': `Device ${deviceId}:${deviceSecret}`,
    },
  };

  const req = http.request(options, (res) => {
    let out = '';
    res.setEncoding('utf8');
    res.on('data', chunk => out += chunk);
    res.on('end', () => {
      console.log(new Date().toISOString(), 'POST', payload.busId, '->', res.statusCode, out);
    });
  });
  req.on('error', (err) => {
    console.error('Request error:', err && err.message);
  });
  req.write(data);
  req.end();
}

console.log(`Starting GPS simulator for bus ${busId} (interval ${intervalMs / 1000}s). Ctrl+C to stop.`);

const timer = setInterval(() => {
  coords.lat += randomDelta();
  coords.lng += randomDelta();
  const payload = {
    busId,
    timestamp: new Date().toISOString(),
    lat: Number(coords.lat.toFixed(6)),
    lng: Number(coords.lng.toFixed(6)),
    speed: Math.round(30 + Math.random() * 40),
  };
  postLocation(payload);
}, intervalMs);

process.on('SIGINT', () => {
  console.log('\nSimulator stopped.');
  clearInterval(timer);
  process.exit(0);
});
