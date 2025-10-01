import { appendLocation } from '../store/locationStore.js';
import JsonStore, { store } from '../store/jsonStore.js';
import { broadcastBusUpdate } from '../utils/sse.js';

// use shared store instance

export function ingestGps(req, res) {
  const { busId, timestamp, lat, lng, speed, heading, battery } = req.body;
  if (!busId || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: true, code: 400, message: 'busId, lat, lng are required' });
  }

  const event = {
    deviceId: `bus-${busId}`,
    busId: Number(busId),
    timestamp: timestamp || new Date().toISOString(),
    lat,
    lng,
    speed: speed || null,
    heading: heading || null,
    battery: battery || null,
  };

  try {
    // Append to daily NDJSON store for history
    appendLocation(event);

    // Update in-memory JsonStore buses gps and locations cache
    const busIdx = store.buses.findIndex(b => String(b.id) === String(busId));
    if (busIdx !== -1) {
      const now = new Date().toISOString();
      store.buses[busIdx].gps = { lat: event.lat, lng: event.lng, speed: event.speed, heading: event.heading };
      store.buses[busIdx].updatedAt = now;
      // persist to buses.json
      store.persist();
      // update store.locations cache (keep last 100)
      const key = String(store.buses[busIdx].id);
      if (!store.locations[key]) store.locations[key] = [];
      store.locations[key].push({ lat: event.lat, lng: event.lng, time: now });
      if (store.locations[key].length > 100) store.locations[key] = store.locations[key].slice(-100);
      store.persist();

      // broadcast SSE update so connected clients see this immediately
      broadcastBusUpdate(store.buses[busIdx]);
    }
  } catch (e) {
    return res.status(500).json({ error: true, code: 500, message: 'Failed to persist location' });
  }

  return res.status(202).json({ accepted: true });
}
