import { computeEtag } from './httpCache.js';

// clients is a Set of { res, filter } objects where filter may be null or { id: <busId> }
const clients = new Set();

function writeSse(res, event, id, data) {
  res.write(`event: ${event}\n`);
  if (id) res.write(`id: ${id}\n`);
  res.write(`data: ${data}\n\n`);
}

export function addSseClient(res, filter = null) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('event: ready\n');
  res.write('data: {"status":"ok"}\n\n');
  const client = { res, filter };
  clients.add(client);
  res.on('close', () => {
    clients.delete(client);
  });
}

export function broadcast(event, data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const etag = computeEtag(payload);
  for (const client of [...clients]) {
    const { res, filter } = client;
    try {
      // If the client provided a filter with an id, only send matching bus updates
      if (filter && filter.id) {
        // data is expected to be an object with id when broadcasting bus updates
        let obj;
        try { obj = typeof data === 'string' ? JSON.parse(data) : data; } catch { obj = null; }
        if (!obj || String(obj.id) !== String(filter.id)) continue;
      }
      writeSse(res, event, etag, payload);
    } catch {
      clients.delete(client);
    }
  }
}

export function broadcastBusUpdate(bus) {
  broadcast('bus_update', { id: bus.id, gps: bus.gps, status: bus.status, routeId: bus.routeId });
}


