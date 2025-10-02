import fetch from 'node-fetch';

async function main() {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: 'Admin01', password: 'admin123' }),
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
}

main().catch(err => { console.error(err); process.exit(1); });
