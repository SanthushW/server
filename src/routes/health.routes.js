import { Router } from 'express';
import JsonStore from '../store/jsonStore.js';
import { shapePayload } from '../utils/responseShape.js';

const router = Router();

router.get('/', (req, res) => {
  const store = new JsonStore();
  const payload = { status: 'running', uptime: process.uptime(), counts: { routes: store.routes.length, buses: store.buses.length, trips: store.trips.length } };
  return res.json(shapePayload(payload, req));
});

export default router;


