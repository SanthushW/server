import request from 'supertest';
import app from '../server.js';

let token;
const username = `op_${Date.now()}`;

describe('Auth', () => {
  test('register and login', async () => {
    await request(app).post('/auth/register').send({ username, password: 'pass1234', role: 'operator' }).expect(201);
    const res = await request(app).post('/auth/login').send({ username, password: 'pass1234' }).expect(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });
});

describe('Routes', () => {
  test('get all routes', async () => {
    const res = await request(app).get('/routes').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Buses', () => {
  test('get all buses', async () => {
    const res = await request(app).get('/buses').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(25);
  });

  test('filter buses by route', async () => {
    const res = await request(app).get('/buses?route=1').expect(200);
    expect(res.body.every(b => String(b.routeId) === '1')).toBe(true);
  });
});

describe('Trips', () => {
  test('add a trip', async () => {
    const payload = {
      busId: 101,
      routeId: 1,
      startTime: '2025-08-21T06:00:00.000Z',
      endTime: '2025-08-21T09:00:00.000Z',
    };
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);
    expect(res.body.id).toBeDefined();
  });
});


