import dayjs from 'dayjs';

export default class TripModel {
  constructor(store) {
    this.store = store;
  }

  list({ filter = {}, sort = 'startTime' } = {}) {
    let trips = [...this.store.trips];
    if (filter.date) {
      const target = dayjs(filter.date).format('YYYY-MM-DD');
      trips = trips.filter(t => dayjs(t.startTime).format('YYYY-MM-DD') === target);
    }
    if (filter.busId) {
      trips = trips.filter(t => String(t.busId) === String(filter.busId));
    }
    if (filter.routeId) {
      trips = trips.filter(t => String(t.routeId) === String(filter.routeId));
    }
    trips.sort((a, b) => new Date(a[sort]) - new Date(b[sort]));
    return trips;
  }

  getById(id) {
    return this.store.trips.find(t => String(t.id) === String(id));
  }

  create(data) {
    const id = this.store.nextId('trip');
    const trip = { id, status: 'scheduled', ...data };
    this.store.trips.push(trip);
    this.store.persist();
    return trip;
  }

  update(id, data) {
    const idx = this.store.trips.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return null;
    this.store.trips[idx] = { ...this.store.trips[idx], ...data };
    this.store.persist();
    return this.store.trips[idx];
  }

  remove(id) {
    const idx = this.store.trips.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return false;
    this.store.trips.splice(idx, 1);
    this.store.persist();
    return true;
  }
}


