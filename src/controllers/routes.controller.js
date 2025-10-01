import JsonStore, { store } from '../store/jsonStore.js';
import RouteModel from '../models/route.model.js';
import { conditionalJson } from '../utils/httpCache.js';
import { shapePayload } from '../utils/responseShape.js';
import fs from 'fs';
import path from 'path';

const routesModel = new RouteModel(store);

export function listRoutes(req, res) {
  const { name, origin, destination, sort, page, limit } = req.query;
  const all = routesModel.list({ filter: { name, origin, destination }, sort: sort || 'id' });
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
  let lastModified = null;
  const timestamps = slice.map(s => s && s.updatedAt).filter(Boolean).map(d => new Date(d));
  if (timestamps.length) {
    lastModified = new Date(Math.max(...timestamps.map(d => d.getTime())));
  } else {
    try {
      const dataFile = path.join(store.basePath, 'routes.json');
      const st = fs.statSync(dataFile);
      lastModified = st.mtime;
    } catch (e) {
      // ignore when file missing
    }
  }
  const shaped = shapePayload(slice, req);
  return conditionalJson(req, res, shaped, lastModified);
}

export function getRoute(req, res) {
  const route = routesModel.getById(req.params.id);
  if (!route) return res.status(404).json({ message: 'Route not found' });
  let lastModified = null;
  if (route && route.updatedAt) lastModified = new Date(route.updatedAt);
  else {
    try {
      const dataFile = path.join(store.basePath, 'routes.json');
      const st = fs.statSync(dataFile);
      lastModified = st.mtime;
    } catch (e) {
      // ignore
    }
  }
  res.set('Vary', 'Authorization, Accept');
  const shaped = shapePayload(route, req);
  return conditionalJson(req, res, shaped, lastModified);
}

export function createRoute(req, res) {
  const { name, origin, destination, distanceKm } = req.body;
  if (!name || !origin || !destination) {
    return res.status(400).json({ message: 'name, origin, destination are required' });
  }
  const route = routesModel.create({ name, origin, destination, distanceKm: Number(distanceKm) || 0 });
  res.set('Location', `/routes/${route.id}`);
  return res.status(201).json(route);
}

export function updateRoute(req, res) {
  const updated = routesModel.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Route not found' });
  res.set('Vary', 'Authorization, Accept');
  const shaped = shapePayload(updated, req);
  return res.json(shaped);
}

export function deleteRoute(req, res) {
  const ok = routesModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Route not found' });
  return res.status(204).send();
}


