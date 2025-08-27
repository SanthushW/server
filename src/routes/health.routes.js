import { Router } from 'express';
import JsonStore from '../store/jsonStore.js';

const router = Router();

router.get('/', (req, res) => {
  const store = new JsonStore();
  return res.json({ status: 'running', uptime: process.uptime(), counts: { routes: store.routes.length, buses: store.buses.length, trips: store.trips.length } });
});

export default router;


