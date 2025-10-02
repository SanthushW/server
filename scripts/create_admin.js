import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const [,, username, password, role = 'admin'] = process.argv;
if (!username || !password) {
  console.error('Usage: node scripts/create_admin.js <username> <password> [role]');
  process.exit(1);
}

const file = path.resolve('data', 'users.json');
if (!fs.existsSync(file)) {
  console.error('users.json not found at', file);
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
let users;
try {
  users = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse users.json:', e.message);
  process.exit(1);
}

const hashed = bcrypt.hashSync(password, 10);
const idx = users.findIndex(u => u.username === username);
if (idx !== -1) {
  users[idx].password = hashed;
  users[idx].role = role;
  console.log(`Updated user ${username} with role ${role}`);
} else {
  users.push({ username, password: hashed, role });
  console.log(`Created user ${username} with role ${role}`);
}

fs.writeFileSync(file, JSON.stringify(users, null, 2) + '\n');
console.log('users.json updated successfully');
