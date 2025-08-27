export default class BusModel {
  constructor(store) {
    this.store = store;
  }

  list({ filter = {}, sort = 'id' } = {}) {
    let buses = [...this.store.buses];
    if (filter.route) {
      buses = buses.filter(b => String(b.routeId) === String(filter.route));
    }
    if (filter.status) {
      buses = buses.filter(b => b.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      buses = buses.filter(b => String(b.id).includes(q) || (b.plate || '').toLowerCase().includes(q));
    }
    buses.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return buses;
  }

  getById(id) {
    return this.store.buses.find(b => String(b.id) === String(id));
  }

  create(data) {
    const id = this.store.nextId('bus');
    const bus = { id, gps: null, status: 'inactive', ...data };
    this.store.buses.push(bus);
    this.store.persist();
    return bus;
  }

  update(id, data) {
    const idx = this.store.buses.findIndex(b => String(b.id) === String(id));
    if (idx === -1) return null;
    this.store.buses[idx] = { ...this.store.buses[idx], ...data };
    this.store.persist();
    return this.store.buses[idx];
  }

  remove(id) {
    const idx = this.store.buses.findIndex(b => String(b.id) === String(id));
    if (idx === -1) return false;
    this.store.buses.splice(idx, 1);
    this.store.persist();
    return true;
  }
}


