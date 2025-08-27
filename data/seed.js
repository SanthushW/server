import fs from 'fs';
import path from 'path';

const base = path.resolve('./data');
const routes = JSON.parse(fs.readFileSync(path.join(base, 'routes.json')));
const buses = JSON.parse(fs.readFileSync(path.join(base, 'buses.json')));

function generateWeekTrips() {
  const trips = [];
  const start = new Date('2025-08-18T00:00:00.000Z');
  for (let d = 0; d < 7; d += 1) {
    const day = new Date(start.getTime() + d * 24 * 60 * 60 * 1000);
    buses.slice(0, 10).forEach((bus, i) => {
      const startTime = new Date(day.getTime() + (6 + i) * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
      trips.push({
        id: 6000 + trips.length,
        busId: bus.id,
        routeId: bus.routeId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'scheduled',
      });
    });
  }
  return trips;
}

const trips = generateWeekTrips();
fs.writeFileSync(path.join(base, 'trips.json'), JSON.stringify(trips, null, 2));
console.log(`Generated ${trips.length} trips for a week.`);


