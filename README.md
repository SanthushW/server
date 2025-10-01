# Real-Time Bus Tracking API

RESTful API for the National Transport Commission of Sri Lanka.

## Run locally

```
npm i
copy .env.example .env
npm run dev
```

## Endpoints

- Auth: `POST /auth/register`, `POST /auth/login`
- Routes: `GET /routes`, `GET /routes/:id`, `POST /routes`, `PUT /routes/:id`, `DELETE /routes/:id`
- Buses: `GET /buses`, `GET /buses/:id`, `POST /buses`, `PUT /buses/:id`, `DELETE /buses/:id`
- Trips: `GET /trips`, `GET /trips/:id`, `POST /trips`, `PUT /trips/:id`, `DELETE /trips/:id`
- Health: `GET /health`
- Swagger docs: `/docs`
 - Realtime: `GET /realtime/sse` (Server-Sent Events stream for bus updates)
 - Bus locations: `GET /buses/:id/locations` (recent GPS history)

## Deployment

Set `PORT` and `JWT_SECRET` env vars. For Render/Heroku/Railway, set start command to `npm start`.

## Roles & Auth

- Use `POST /auth/register` to create users with optional `role` of `operator` or `admin`.
- Write operations require JWT and roles:
  - `operator` or `admin`: create/update buses and trips
  - `admin`: create/update/delete routes, delete buses and trips

## Realtime

Subscribe to `GET /realtime/sse` for events:
- `bus_update`: `{ id, gps, status, routeId }`

## Pagination

List endpoints accept `page` and `limit` query params and return `X-Total-Count` header.

Examples:

- Get first page of buses (10 per page), filter by route and sort by plate:

  GET /buses?route=1&page=1&limit=10&sort=plate

- Response headers include:
  - `X-Total-Count`: total items across all pages
  - `ETag`: resource version token for conditional GETs
  - `Cache-Control`: e.g., `public, max-age=60`

Conditional GET (304):

- Client can send `If-None-Match: <ETag>` to receive `304 Not Modified` when resource hasn't changed.

Headers usage:

- `Accept: application/json` — request JSON responses.
- `Content-Type: application/json` — required for POST/PUT bodies.
- `Authorization: Bearer <JWT>` — required for protected endpoints.
- `Cache-Control` and `ETag` — server provides `ETag` on GET; clients should use `If-None-Match` for conditional requests.


npm run dev

# set a strong secret and run the server
$env:JWT_SECRET = '2c9f5e8b3a4d6f7a9b1c0e2d6f8a4b3c'
node server.js


curl.exe -N http://localhost:3000/realtime/sse

npm run stimulate