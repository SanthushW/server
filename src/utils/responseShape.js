// Utility to shape responses based on user role and client preferences (compact/mobile)
export function determineResponseMode(req) {
  const q = req.query || {};
  const accept = (req.headers && req.headers.accept) || '';
  const compactQuery = (q.compact === 'true') || (q.mobile === 'true');
  const compactAccept = /compact|vnd\.|application\/x-compact\+json/i.test(accept);
  return { compact: compactQuery || compactAccept };
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  }
  return out;
}

function shapeBus(bus, role, compact) {
  if (!bus || typeof bus !== 'object') return bus;
  if (role === 'admin') return bus;
  if (role === 'operator') {
    if (compact) return pick(bus, ['id', 'routeId', 'status', 'gps']);
    return bus;
  }
  // passenger / public
  if (compact) return pick(bus, ['id', 'status', 'gps']);
  return pick(bus, ['id', 'routeId', 'status', 'gps', 'plate']);
}

function shapeTrip(trip, role, compact) {
  if (!trip || typeof trip !== 'object') return trip;
  if (role === 'admin' || role === 'operator') return trip;
  // passenger / public
  if (compact) return pick(trip, ['id', 'startTime', 'status']);
  return pick(trip, ['id', 'busId', 'routeId', 'startTime', 'endTime', 'status']);
}

function shapeRoute(route, role, compact) {
  if (!route || typeof route !== 'object') return route;
  if (role === 'admin' || role === 'operator') return route;
  if (compact) return pick(route, ['id', 'name']);
  return pick(route, ['id', 'name', 'origin', 'destination']);
}

function guessAndShape(item, role, compact) {
  if (!item || typeof item !== 'object') return item;
  if ('plate' in item || 'routeId' in item && 'plate' in item) return shapeBus(item, role, compact);
  if ('startTime' in item || 'endTime' in item) return shapeTrip(item, role, compact);
  if ('origin' in item || 'destination' in item) return shapeRoute(item, role, compact);
  // fallback: remove internal fields for non-admins
  if (role === 'admin') return item;
  const allowed = Object.keys(item).filter(k => !k.toLowerCase().includes('updated') && !k.toLowerCase().includes('internal'));
  return pick(item, allowed);
}

export function shapePayload(payload, req) {
  const role = (req && req.user && req.user.role) ? req.user.role : 'passenger';
  const { compact } = determineResponseMode(req || {});
  if (Array.isArray(payload)) return payload.map(p => guessAndShape(p, role, compact));
  return guessAndShape(payload, role, compact);
}
