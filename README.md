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


