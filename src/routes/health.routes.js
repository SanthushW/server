import { Router } from 'express';
import { store } from '../store/jsonStore.js';
import { shapePayload } from '../utils/responseShape.js';

const router = Router();

router.get('/', (req, res) => {
  // use shared store instance
  const payload = { status: 'running', uptime: process.uptime(), counts: { routes: store.routes.length, buses: store.buses.length, trips: store.trips.length } };
  return res.json(shapePayload(payload, req));
});

export default router;


