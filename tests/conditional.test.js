import request from 'supertest';
import app from '../server.js';

describe('Conditional GETs', () => {
  test('ETag If-None-Match returns 304', async () => {
    const res1 = await request(app).get('/routes').expect(200);
    const etag = res1.headers['etag'];
    expect(etag).toBeDefined();

    await request(app).get('/routes').set('If-None-Match', etag).expect(304);
  });

  test('Last-Modified If-Modified-Since returns 304', async () => {
    const res1 = await request(app).get('/routes').expect(200);
    const last = res1.headers['last-modified'];
    expect(last).toBeDefined();

    await request(app).get('/routes').set('If-Modified-Since', last).expect(304);
  });
});
