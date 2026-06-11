# URL Shortener

Production-ready URL shortener backend with authentication, custom aliases,
Redis-backed redirect caching, analytics, QR code generation, CSV export,
health monitoring, Swagger documentation, and automated test coverage gates.

## Project Overview

This repository contains an Express and PostgreSQL backend intended to be ready
for frontend integration and portfolio review. The API supports authenticated
URL management, public redirects, analytics reporting, expiration controls,
rate limiting, structured logging, request correlation IDs, and deployment
health checks.

## Features

- User registration, login, logout, and current-user lookup with JWT auth.
- Authenticated URL CRUD with ownership checks.
- Generated short codes and validated custom aliases.
- Expiring URLs with 410 responses after expiration.
- Public redirect engine with Redis cache reads/writes.
- Search and pagination for authenticated URL lists.
- Click analytics with total clicks, unique visitors, daily aggregation,
  browser stats, recent visits, and top referrers.
- Analytics CSV export and QR code generation.
- Rate limiting for auth and URL creation.
- Helmet security headers, CORS allow-listing, Zod validation, and sanitized
  error responses.
- Monitoring-friendly health endpoint with dependency status.
- Swagger/OpenAPI documentation at `/api/v1/docs`.
- Vitest coverage thresholds enforced at PRD levels.

## Architecture

```text
Client / Frontend
  |
  v
Express API
  |
  +--> Auth, validation, rate limiting, request IDs, logging
  |
  +--> URL services
  |      |
  |      +--> PostgreSQL via Prisma
  |      +--> Upstash Redis REST cache
  |
  +--> Analytics services
         |
         +--> PostgreSQL analytics table
```

### Authentication Flow

```text
Client credentials
  -> Auth route
  -> Zod validation
  -> Auth service
  -> bcrypt password verification
  -> JWT issued
  -> Protected routes validate Bearer token
```

### Redirect Flow

```text
GET /:shortCode
  -> Redis cache lookup
  -> PostgreSQL fallback on cache miss
  -> Expiration check
  -> Cache populate
  -> Click + analytics write
  -> 302 redirect
```

### Cache Flow

```text
Read redirect
  -> get url:{shortCode} from Upstash
  -> cache hit returns original URL
  -> cache miss reads PostgreSQL and stores serialized URL

Update/delete URL
  -> invalidate shortCode and customAlias cache keys
```

### Analytics Flow

```text
Redirect request
  -> capture IP, user agent, Referer/Referrer header
  -> normalize referrer host
  -> increment URL clicks and create analytics row in one transaction
  -> analytics endpoint aggregates counts in PostgreSQL
```

## Tech Stack

- Node.js and Express 5
- PostgreSQL with Prisma
- Upstash Redis REST API
- JWT, bcrypt, Zod, Helmet, CORS
- Winston and Morgan for structured logging
- Swagger UI and swagger-jsdoc
- Vitest, Supertest, and V8 coverage

## Folder Structure

```text
backend/
  app.js                     Express app factory and route registration
  index.js                   Server startup and graceful shutdown
  config/                    Env validation, Prisma client, Redis, Swagger
  constants/                 Shared constants
  controllers/               Thin HTTP controllers
  middlewares/               Auth, validation, ownership, logging, rate limits
  prisma/                    Schema and migrations
  routes/                    Versioned API routes and OpenAPI comments
  services/                  Business logic and integrations
  tests/                     Unit and integration tests
  utils/                     Shared helpers and response/error utilities
  validation/                Zod request schemas
frontend/                    Frontend workspace scaffold
```

## Environment Variables

Create `backend/.env` or environment-specific files such as
`backend/.env.production.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development`, `test`, or `production`. |
| `PORT` | Yes | Express server port. |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma. |
| `JWT_SECRET` | Yes | JWT signing secret, minimum 8 characters. |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST endpoint. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token. |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins. |
| `APP_BASE_URL` | Recommended | Public base URL used for generated short links and QR codes. |

Development and test environments default `ALLOWED_ORIGINS` and `APP_BASE_URL`
when omitted. Production should set all values explicitly.

## Installation

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

## Development

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:3000` by default. Swagger docs are available
at `http://localhost:3000/api/v1/docs`.

## Testing

```bash
cd backend
npm test
npm run test:coverage
```

Coverage thresholds are enforced in `backend/vitest.config.js`:

| Metric | Threshold |
| --- | ---: |
| Lines | 80% |
| Functions | 80% |
| Branches | 70% |
| Statements | 80% |

## API Documentation

OpenAPI documentation is generated from route annotations and served by Swagger
UI at `/api/v1/docs`.

Primary route groups:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/urls`
- `GET /api/v1/urls`
- `GET /api/v1/urls/:id`
- `PATCH /api/v1/urls/:id`
- `DELETE /api/v1/urls/:id`
- `GET /api/v1/urls/:id/analytics`
- `GET /api/v1/urls/:id/export`
- `GET /api/v1/urls/:id/qr`
- `GET /:shortCode`
- `GET /health`

## Caching Strategy

Redirect lookups use Upstash Redis with keys built from the normalized short
code. Cache entries store only the URL fields needed for redirects and expire
using the configured TTL constant. URL updates and deletes invalidate both the
current short code and custom alias keys. Cache failures are logged and treated
as non-fatal so redirects can continue from PostgreSQL.

Upstash Redis is used through its REST client. The client does not hold a
persistent TCP socket in this application, so graceful shutdown does not need a
Redis disconnect step. Prisma is explicitly disconnected and Winston transports
are flushed during shutdown.

## Analytics System

Each successful redirect increments the URL click counter and inserts an
analytics record inside a Prisma transaction. Analytics capture IP address,
user agent, normalized referrer domain, URL id, and timestamp.

The analytics endpoint returns:

```json
{
  "success": true,
  "data": {
    "totalClicks": 100,
    "uniqueVisitors": 45,
    "clicksPerDay": [{ "date": "2026-05-31", "clicks": 17 }],
    "browserStats": { "Chrome": 80, "Firefox": 15, "Safari": 5 },
    "topReferrers": [{ "source": "google.com", "count": 40 }],
    "recentVisits": []
  }
}
```

Top referrers are normalized to domains, malformed values are ignored, and
aggregation is performed in PostgreSQL.

## Deployment

1. Set production environment variables.
2. Run `npx prisma migrate deploy`.
3. Start with `npm start`.
4. Configure the platform health check to call `/health`.
5. Ensure `ALLOWED_ORIGINS` contains the deployed frontend origin.
6. Set `APP_BASE_URL` to the public backend URL used for short links.
7. Ship or persist `backend/logs` if file logs are required in production.

The health endpoint returns:

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 1234
}
```

Status mapping:

- `healthy` -> HTTP 200
- `degraded` -> HTTP 503
- `unhealthy` -> HTTP 503

## Database Migration Notes

Existing migrations create users, URLs, analytics, and referrer tracking. The
latest migration adds a composite analytics index for per-URL referrer
aggregation:

```text
backend/prisma/migrations/20260601000000_add_analytics_url_referrer_index
```

Run migrations before deploying code that serves analytics traffic.

## Future Improvements

- Add frontend integration against the documented API contracts.
- Add refresh tokens or token revocation if product requirements move beyond
  stateless JWT logout.
- Move analytics writes to an asynchronous queue if redirect throughput grows
  beyond the current transactional model.
