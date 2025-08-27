import JsonStore from '../store/jsonStore.js';

const store = new JsonStore();

export function overview(req, res) {
  const activeBuses = store.buses.filter(b => b.status === 'active').length;
  const byRoute = {};
  for (const bus of store.buses) {
    byRoute[bus.routeId] = byRoute[bus.routeId] || { total: 0, active: 0 };
    byRoute[bus.routeId].total += 1;
    if (bus.status === 'active') byRoute[bus.routeId].active += 1;
  }
  const latestPositions = {};
  for (const [busId, points] of Object.entries(store.locations)) {
    if (points.length > 0) latestPositions[busId] = points[points.length - 1];
  }
  return res.json({
    counts: {
      routes: store.routes.length,
      buses: store.buses.length,
      trips: store.trips.length,
      activeBuses,
    },
    busesByRoute: byRoute,
    latestPositions,
  });
}

export function routeDetail(req, res) {
  const routeId = Number(req.params.id);
  const route = store.routes.find(r => r.id === routeId);
  if (!route) return res.status(404).json({ message: 'Route not found' });
  const buses = store.buses.filter(b => b.routeId === routeId);
  const trips = store.trips.filter(t => t.routeId === routeId);
  const busesWithLast = buses.map(b => ({
    id: b.id,
    plate: b.plate,
    status: b.status,
    gps: b.gps || null,
    lastSeen: (store.locations[String(b.id)] || []).slice(-1)[0] || null,
  }));
  return res.json({ route, busCounts: { total: buses.length, active: buses.filter(b => b.status === 'active').length }, tripCount: trips.length, buses: busesWithLast });
}







