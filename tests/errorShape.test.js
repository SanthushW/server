import request from 'supertest';
import app from '../server.js';
import { errorHandler } from '../src/middleware/error.js';

describe('Public error shape', () => {
  test('404 returns standardized public shape', async () => {
    const res = await request(app).get('/this-route-does-not-exist').expect(404);
    expect(res.body).toHaveProperty('error', true);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    // message should be the generic Not Found text defined by middleware
    expect(res.body.message).toBe('Not Found');
  });

  test('400 error includes sanitized details for client errors', () => {
    const err = new Error('Invalid input');
    err.status = 400;
    err.details = [{ message: 'name is required', path: ['body', 'name'], extra: 'ignore' }];

    const req = { originalUrl: '/test', method: 'POST' };
    const res = (() => {
      const r = { statusCalls: [], jsonCalls: [] };
      r.status = (s) => { r.statusCalls.push(s); return r; };
      r.json = (p) => { r.jsonCalls.push(p); return r; };
      return r;
    })();

    errorHandler(err, req, res, () => {});

    expect(res.statusCalls[0]).toBe(400);
    expect(res.jsonCalls.length).toBeGreaterThanOrEqual(1);
    const payload = res.jsonCalls[0];
    expect(payload).toHaveProperty('error', true);
    expect(payload).toHaveProperty('code', 400);
    expect(payload).toHaveProperty('message', 'Invalid input');
    expect(payload).toHaveProperty('details');
    expect(Array.isArray(payload.details)).toBe(true);
    expect(payload.details[0]).toEqual({ message: 'name is required', path: ['body', 'name'] });
  });

  test('500 server errors return generic message and no details', () => {
    const err = new Error('Something exploded internally');
    err.status = 500;
    err.details = [{ secret: 'should not leak' }];

    const req = { originalUrl: '/test', method: 'GET' };
    const res = (() => {
      const r = { statusCalls: [], jsonCalls: [] };
      r.status = (s) => { r.statusCalls.push(s); return r; };
      r.json = (p) => { r.jsonCalls.push(p); return r; };
      return r;
    })();

    errorHandler(err, req, res, () => {});

    expect(res.statusCalls[0]).toBe(500);
    expect(res.jsonCalls.length).toBeGreaterThanOrEqual(1);
    const payload = res.jsonCalls[0];
    expect(payload).toHaveProperty('error', true);
    expect(payload).toHaveProperty('code', 500);
    // In test environment we still expect a non-leaking generic message
    expect(typeof payload.message).toBe('string');
    expect(payload.message).toBe('Internal Server Error');
    // details should not be present for server errors
    expect(payload.details).toBeUndefined();
  });
});
