import JsonStore from '../store/jsonStore.js';
import TripModel from '../models/trip.model.js';
import { conditionalJson } from '../utils/httpCache.js';

const store = new JsonStore();
const tripModel = new TripModel(store);

export function listTrips(req, res) {
  const { date, busId, routeId, sort, page, limit } = req.query;
  const all = tripModel.list({ filter: { date, busId, routeId }, sort: sort || 'startTime' });
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || all.length));
  const start = (p - 1) * l;
  const slice = all.slice(start, start + l);
  res.set('X-Total-Count', String(all.length));
  return conditionalJson(req, res, slice);
}

export function getTrip(req, res) {
  const trip = tripModel.getById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  return conditionalJson(req, res, trip);
}

export function createTrip(req, res) {
  const { busId, routeId, startTime, endTime, status } = req.body;
  if (!busId || !routeId || !startTime || !endTime) {
    return res.status(400).json({ message: 'busId, routeId, startTime, endTime are required' });
  }
  const trip = tripModel.create({ busId: Number(busId), routeId: Number(routeId), startTime, endTime, status: status || 'scheduled' });
  return res.status(201).json(trip);
}

export function updateTrip(req, res) {
  const updated = tripModel.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Trip not found' });
  return res.json(updated);
}

export function deleteTrip(req, res) {
  const ok = tripModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Trip not found' });
  return res.status(204).send();
}


