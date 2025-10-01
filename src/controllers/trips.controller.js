import { store } from '../store/jsonStore.js';
import TripModel from '../models/trip.model.js';
import { conditionalJson } from '../utils/httpCache.js';
import { shapePayload } from '../utils/responseShape.js';
import fs from 'fs';
import path from 'path';

const tripModel = new TripModel(store);

export function listTrips(req, res) {
  const { date, busId, routeId, sort, page, limit } = req.query;
  const all = tripModel.list({ filter: { date, busId, routeId }, sort: sort || 'startTime' });
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || all.length));
  const start = (p - 1) * l;
  const slice = all.slice(start, start + l);
  res.set('X-Total-Count', String(all.length));
  // Responses may vary by Authorization and Accept headers
  res.set('Vary', 'Authorization, Accept');
  // Add Link header when pagination is used
  if (req.query.page || req.query.limit) {
    const base = req.path;
    const nextPage = p + 1;
    const prevPage = Math.max(1, p - 1);
    const links = [];
    if (start + l < all.length) links.push(`<${base}?page=${nextPage}&limit=${l}>; rel="next"`);
    if (p > 1) links.push(`<${base}?page=${prevPage}&limit=${l}>; rel="prev"`);
    if (links.length) res.set('Link', links.join(', '));
  }
  // prefer per-resource updatedAt timestamps when present (use latest), otherwise fallback to file mtime
  let lastModified = null;
  const timestamps = slice.map(s => s && s.updatedAt).filter(Boolean).map(d => new Date(d));
  if (timestamps.length) {
    lastModified = new Date(Math.max(...timestamps.map(d => d.getTime())));
  } else {
    try {
      const dataFile = path.join(store.basePath, 'trips.json');
      const st = fs.statSync(dataFile);
      lastModified = st.mtime;
    } catch (e) {
      // ignore when trips file is not present
      // intentionally left blank
    }
  }
  const shaped = shapePayload(slice, req);
  return conditionalJson(req, res, shaped, lastModified);
}

export function getTrip(req, res) {
  const trip = tripModel.getById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  let lastModified = null;
  if (trip && trip.updatedAt) lastModified = new Date(trip.updatedAt);
  else {
    try {
      const dataFile = path.join(store.basePath, 'trips.json');
      const st = fs.statSync(dataFile);
      lastModified = st.mtime;
    } catch (e) {
      // ignore when trips file is not available on disk
    }
  }
  res.set('Vary', 'Authorization, Accept');
  const shaped = shapePayload(trip, req);
  return conditionalJson(req, res, shaped, lastModified);
}

export function createTrip(req, res) {
  const { busId, routeId, startTime, endTime, status } = req.body;
  if (!busId || !routeId || !startTime || !endTime) {
    return res.status(400).json({ message: 'busId, routeId, startTime, endTime are required' });
  }
  const trip = tripModel.create({ busId: Number(busId), routeId: Number(routeId), startTime, endTime, status: status || 'scheduled' });
  // Set Location header to created resource
  res.set('Location', `/trips/${trip.id}`);
  return res.status(201).json(trip);
}

export function updateTrip(req, res) {
  const updated = tripModel.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Trip not found' });
  res.set('Vary', 'Authorization, Accept');
  const shaped = shapePayload(updated, req);
  return res.json(shaped);
}

export function deleteTrip(req, res) {
  const ok = tripModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Trip not found' });
  return res.status(204).send();
}


