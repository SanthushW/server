import JsonStore from '../store/jsonStore.js';
import BusModel from '../models/bus.model.js';
import { conditionalJson } from '../utils/httpCache.js';
import { broadcastBusUpdate } from '../utils/sse.js';
import { Joi, validateBody } from '../middleware/validate.js';

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
  return conditionalJson(req, res, slice);
}

export function getBus(req, res) {
  const bus = busModel.getById(req.params.id);
  if (!bus) return res.status(404).json({ message: 'Bus not found' });
  return conditionalJson(req, res, bus);
}

export function createBus(req, res) {
  const { routeId, plate, status, gps } = req.body;
  const bus = busModel.create({ routeId: Number(routeId), plate, status: status || 'inactive', gps: gps || null });
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
  return res.json(updated);
}

export function deleteBus(req, res) {
  const ok = busModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Bus not found' });
  return res.status(204).send();
}

export function getBusLocations(req, res) {
  const id = String(req.params.id);
  const history = store.locations[id] || [];
  return conditionalJson(req, res, history);
}


