import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class JsonStore {
  constructor(basePath = path.resolve(__dirname, '../../data')) {
    this.basePath = basePath;
    this.routes = this.readJson('routes.json');
    this.buses = this.readJson('buses.json');
    this.trips = this.readJson('trips.json');
    this.users = this.readJson('users.json');
    this.locations = this.readJson('locations.json', {});
    this.metaPath = path.join(this.basePath, '_meta.json');
    this.meta = this.readJson('_meta.json', { route: 100, bus: 1000, trip: 5000 });
  }

  readJson(file, fallback = []) {
    const full = path.join(this.basePath, file);
    if (!fs.existsSync(full)) {
      return Array.isArray(fallback) ? [...fallback] : { ...fallback };
    }
    const raw = fs.readFileSync(full, 'utf-8');
    try {
      return JSON.parse(raw || (Array.isArray(fallback) ? '[]' : '{}'));
    } catch {
      return Array.isArray(fallback) ? [...fallback] : { ...fallback };
    }
  }

  persist() {
    fs.writeFileSync(path.join(this.basePath, 'routes.json'), JSON.stringify(this.routes, null, 2));
    fs.writeFileSync(path.join(this.basePath, 'buses.json'), JSON.stringify(this.buses, null, 2));
    fs.writeFileSync(path.join(this.basePath, 'trips.json'), JSON.stringify(this.trips, null, 2));
    fs.writeFileSync(path.join(this.basePath, 'users.json'), JSON.stringify(this.users, null, 2));
    fs.writeFileSync(path.join(this.basePath, 'locations.json'), JSON.stringify(this.locations, null, 2));
    fs.writeFileSync(this.metaPath, JSON.stringify(this.meta, null, 2));
  }

  nextId(type) {
    this.meta[type] = (this.meta[type] || 0) + 1;
    this.persist();
    return this.meta[type];
  }
}


