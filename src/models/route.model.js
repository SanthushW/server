export default class RouteModel {
  constructor(store) {
    this.store = store;
  }

  list({ filter = {}, sort = 'id' } = {}) {
    let routes = [...this.store.routes];
    if (filter.name) {
      const q = filter.name.toLowerCase();
      routes = routes.filter(r => r.name.toLowerCase().includes(q));
    }
    if (filter.origin) {
      const q = filter.origin.toLowerCase();
      routes = routes.filter(r => r.origin.toLowerCase().includes(q));
    }
    if (filter.destination) {
      const q = filter.destination.toLowerCase();
      routes = routes.filter(r => r.destination.toLowerCase().includes(q));
    }
    routes.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return routes;
  }

  getById(id) {
    return this.store.routes.find(r => String(r.id) === String(id));
  }

  create(data) {
    const id = this.store.nextId('route');
    const route = { id, ...data };
    this.store.routes.push(route);
    this.store.persist();
    return route;
  }

  update(id, data) {
    const idx = this.store.routes.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return null;
    this.store.routes[idx] = { ...this.store.routes[idx], ...data };
    this.store.persist();
    return this.store.routes[idx];
  }

  remove(id) {
    const idx = this.store.routes.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return false;
    this.store.routes.splice(idx, 1);
    this.store.persist();
    return true;
  }
}


