import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';

const secret = process.env.JWT_SECRET || 'dev_secret';

describe('Admin user management', () => {
  test('admin can create a new operator', async () => {
    const username = `op_test_${Date.now()}`;
    const token = jwt.sign({ id: 'Admin', role: 'admin' }, secret, { expiresIn: '1h' });
    const res = await request(app)
      .post('/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username, password: 'p@ssword1', role: 'operator' })
      .expect(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({ username, role: 'operator' });
  });

  test('non-admin cannot create users (403)', async () => {
    const token = jwt.sign({ id: 'someUser', role: 'operator' }, secret, { expiresIn: '1h' });
    await request(app)
      .post('/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `nope_${Date.now()}`, password: 'p@ssword1', role: 'viewer' })
      .expect(403);
  });

  test('admin cannot create user with invalid role (400)', async () => {
    const token = jwt.sign({ id: 'Admin', role: 'admin' }, secret, { expiresIn: '1h' });
    await request(app)
      .post('/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `badrole_${Date.now()}`, password: 'p@ssword1', role: 'superuser' })
      .expect(400);
  });
});
