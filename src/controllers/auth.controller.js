import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import JsonStore from '../store/jsonStore.js';

const store = new JsonStore();

export async function register(req, res) {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }
  const exists = store.users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { username, password: hashed, role: role || 'operator' };
  store.users.push(user);
  store.persist();
  const token = jwt.sign(
    { id: username, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '2h' }
  );
  return res.status(201).json({
    message: 'Registered successfully',
    token,
    user: { id: username, username, role: user.role },
  });
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }
  const user = store.users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: username, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '2h' });
  return res.json({ token, user: { id: username, username, role: user.role } });
}

export async function me(req, res) {
  // req.user is set by auth middleware when token is valid
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const user = store.users.find(u => u.username === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Disable caching to avoid 304 responses and ensure body is sent
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  // Set a varying ETag so clients don't get 304 with empty body
  res.set('ETag', `${user.username}-${Date.now()}`);
  return res.status(200).json({ user: { id: user.username, username: user.username, role: user.role } });
}


