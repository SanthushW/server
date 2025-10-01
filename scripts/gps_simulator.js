#!/usr/bin/env node
/*
  Simple GPS simulator: POSTs to http://localhost:3000/ingest/gps every interval
  Usage: node scripts/gps_simulator.js [busId] [intervalMs]
  Example: node scripts/gps_simulator.js 101 2000
*/
import http from 'http';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
// Accept busId as single number or comma-separated list, e.g. "101,102,103"
const busArg = args[0] || '101';
const busIds = busArg.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
const intervalMs = Number(args[1] || 2000);

function loadInitialCoords(id) {
  try {
    const data = fs.readFileSync(path.resolve(process.cwd(), 'data', 'buses.json'), 'utf8');
    const buses = JSON.parse(data || '[]');
    const b = buses.find(x => Number(x.id) === Number(id));
    if (b && b.gps && typeof b.gps.lat === 'number' && typeof b.gps.lng === 'number') return { lat: b.gps.lat, lng: b.gps.lng };
  } catch (e) {
    // ignore
  }
  // fallback to Colombo-ish coords
  return { lat: 6.9271, lng: 79.8612 };
}

// Maintain coords per bus
const coordsMap = {};
for (const id of busIds) coordsMap[id] = loadInitialCoords(id);

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

console.log(`Starting GPS simulator for buses [${busIds.join(',')}] (interval ${intervalMs}ms). Ctrl+C to stop.`);

const timer = setInterval(() => {
  for (const id of busIds) {
    const coords = coordsMap[id];
    coords.lat += randomDelta();
    coords.lng += randomDelta();
    const payload = {
      busId: id,
      timestamp: new Date().toISOString(),
      lat: Number(coords.lat.toFixed(6)),
      lng: Number(coords.lng.toFixed(6)),
      speed: Math.round(30 + Math.random() * 40),
    };
    postLocation(payload);
  }
}, intervalMs);

process.on('SIGINT', () => {
  console.log('\nSimulator stopped.');
  clearInterval(timer);
  process.exit(0);
});
