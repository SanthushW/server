import { computeEtag } from './httpCache.js';

const clients = new Set();

export function addSseClient(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(`event: ready\n`);
  res.write(`data: {"status":"ok"}\n\n`);
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

export function broadcast(event, data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const etag = computeEtag(payload);
  for (const res of clients) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`id: ${etag}\n`);
      res.write(`data: ${payload}\n\n`);
    } catch {
      clients.delete(res);
    }
  }
}

export function broadcastBusUpdate(bus) {
  broadcast('bus_update', { id: bus.id, gps: bus.gps, status: bus.status, routeId: bus.routeId });
}


