import JsonStore from '../store/jsonStore.js';
import BusModel from '../models/bus.model.js';
import { conditionalJson } from '../utils/httpCache.js';
import { broadcastBusUpdate } from '../utils/sse.js';
// validate not used in this controller; keep imports local to routes where needed
import fs from 'fs';
import path from 'path';
import { shapePayload } from '../utils/responseShape.js';

const store = new JsonStore();
const busModel = new BusModel(store);

export function listBuses(req, res) {
  const { route, status, search, sort, page, limit } = req.query;
  const all = busModel.list({ filter: { route, status, search }, sort: sort || 'id' });
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || all.length));
  const start = (p - 1) * l;
  const slice = all.slice(start, start + l);
  res.set('X-Total-Count', String(all.length));
  // Add simple Link header for pagination if page/limit provided
  if (req.query.page || req.query.limit) {
    const base = req.path;
    const nextPage = p + 1;
    const prevPage = Math.max(1, p - 1);
    const links = [];
    if (start + l < all.length) links.push(`<${base}?page=${nextPage}&limit=${l}>; rel="next"`);
    if (p > 1) links.push(`<${base}?page=${prevPage}&limit=${l}>; rel="prev"`);
    if (links.length) res.set('Link', links.join(', '));
  }
  // Responses may vary by Authorization and Accept headers
  res.set('Vary', 'Authorization, Accept');
  let lastModified = null;
  const timestamps = slice.map(s => s && s.updatedAt).filter(Boolean).map(d => new Date(d));
  if (timestamps.length) {
    lastModified = new Date(Math.max(...timestamps.map(d => d.getTime())));
  } else {
    try {
      const dataFile = path.join(store.basePath, 'buses.json');
      const st = fs.statSync(dataFile);
      lastModified = st.mtime;
    } catch (e) {
      // fallback to no lastModified when file not available
      // console.debug could be enabled in verbose mode
    }
  }
  const shaped = shapePayload(slice, req);
  return conditionalJson(req, res, shaped, lastModified);
}

export function getBus(req, res) {
  const bus = busModel.getById(req.params.id);
  if (!bus) return res.status(404).json({ message: 'Bus not found' });
  let lastModified = null;
  if (bus && bus.updatedAt) lastModified = new Date(bus.updatedAt);
  else {
    try {
      const dataFile = path.join(store.basePath, 'buses.json');
      const st = fs.statSync(dataFile);
      lastModified = st.mtime;
    } catch (e) {
      // ignore — no reliable mtime available
    }
  }
  res.set('Vary', 'Authorization, Accept');
  const shaped = shapePayload(bus, req);
  return conditionalJson(req, res, shaped, lastModified);
}

export function createBus(req, res) {
  const { routeId, plate, status, gps } = req.body;
  const bus = busModel.create({ routeId: Number(routeId), plate, status: status || 'inactive', gps: gps || null });
  res.set('Location', `/buses/${bus.id}`);
  return res.status(201).json(bus);
}

export function updateBus(req, res) {
  const updated = busModel.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Bus not found' });
  if (updated.gps) {
    const now = new Date().toISOString();
    const key = String(updated.id);
    if (!store.locations[key]) store.locations[key] = [];
    store.locations[key].push({ ...updated.gps, time: now });
    // keep only latest 100 points per bus
    if (store.locations[key].length > 100) {
      store.locations[key] = store.locations[key].slice(-100);
    }
    store.persist();
    broadcastBusUpdate(updated);
  }
  res.set('Vary', 'Authorization, Accept');
  const shaped = shapePayload(updated, req);
  return res.json(shaped);
}

export function deleteBus(req, res) {
  const ok = busModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Bus not found' });
  return res.status(204).send();
}

export function getBusLocations(req, res) {
  const id = String(req.params.id);
  const history = store.locations[id] || [];
  let lastModified = null;
  // history is stored in store.locations and doesn't carry per-item updatedAt; fall back to file mtime
  try {
    const dataFile = path.join(store.basePath, 'locations.json');
    const st = fs.statSync(dataFile);
    lastModified = st.mtime;
  } catch (e) {
    // ignore when locations file missing
  }
  res.set('Vary', 'Authorization, Accept');
  // locations are sensitive: operators and admins see full history; passengers get compact points
  const shaped = shapePayload(history, req);
  return conditionalJson(req, res, shaped, lastModified);
}


