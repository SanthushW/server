import JsonStore from '../store/jsonStore.js';
import RouteModel from '../models/route.model.js';
import { conditionalJson } from '../utils/httpCache.js';

const store = new JsonStore();
const routesModel = new RouteModel(store);

export function listRoutes(req, res) {
  const { name, origin, destination, sort, page, limit } = req.query;
  const all = routesModel.list({ filter: { name, origin, destination }, sort: sort || 'id' });
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || all.length));
  const start = (p - 1) * l;
  const slice = all.slice(start, start + l);
  res.set('X-Total-Count', String(all.length));
  return conditionalJson(req, res, slice);
}

export function getRoute(req, res) {
  const route = routesModel.getById(req.params.id);
  if (!route) return res.status(404).json({ message: 'Route not found' });
  return conditionalJson(req, res, route);
}

export function createRoute(req, res) {
  const { name, origin, destination, distanceKm } = req.body;
  if (!name || !origin || !destination) {
    return res.status(400).json({ message: 'name, origin, destination are required' });
  }
  const route = routesModel.create({ name, origin, destination, distanceKm: Number(distanceKm) || 0 });
  return res.status(201).json(route);
}

export function updateRoute(req, res) {
  const updated = routesModel.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Route not found' });
  return res.json(updated);
}

export function deleteRoute(req, res) {
  const ok = routesModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Route not found' });
  return res.status(204).send();
}


