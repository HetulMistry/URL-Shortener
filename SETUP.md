# Setup Guide

Complete setup instructions for the URL Shortener application.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- PostgreSQL 12+ ([Download](https://www.postgresql.org/))
- Redis 6+ ([Download](https://redis.io/)) - Optional but recommended
- Git

## Backend Setup

### 1. Database Setup

#### PostgreSQL

```bash
# Create database and user
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE url_shortener;
CREATE USER url_shortener_user WITH PASSWORD 'secure_password';
ALTER ROLE url_shortener_user SET client_encoding TO 'utf8';
ALTER ROLE url_shortener_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE url_shortener_user SET default_transaction_deferrable TO on;
ALTER ROLE url_shortener_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE url_shortener TO url_shortener_user;
\q
```

Or with Docker:

```bash
docker run --name postgres-url-shortener \
  -e POSTGRES_USER=url_shortener_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=url_shortener \
  -p 5432:5432 \
  -d postgres:16
```

#### Redis (Optional)

```bash
# Local installation
# macOS
brew install redis

# Ubuntu
sudo apt-get install redis-server

# Docker
docker run --name redis-url-shortener \
  -p 6379:6379 \
  -d redis:7-alpine
```

Or use Upstash Redis (managed):

```txt
Sign up at https://upstash.com/
Create a Redis database
Copy the connection URL
```

### 2. Backend Installation

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 3. Environment Configuration

Edit `backend/.env`:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://url_shortener_user:secure_password@localhost:5432/url_shortener

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRY=7d

# Redis (optional, remove if not using)
REDIS_URL=redis://localhost:6379

# Application URL
APP_BASE_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 4. Database Migrations

```bash
# Run Prisma migrations
npx prisma migrate deploy

# (Optional) Generate Prisma client
npx prisma generate

# (Optional) Seed database (if seed script exists)
# npx prisma db seed
```

### 5. Start Backend

```bash
# Development server (with auto-reload)
npm run dev

# Production server
npm start

# Run with specific Node options
node --max-old-space-size=4096 index.js
```

Expected output:

```txt
[Backend] Server running on port 3000
[Backend] Database: Connected
[Backend] Redis: Connected (or skipped)
```

### 6. Verify Backend

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-06-11T10:00:00.000Z",
  "uptime": 0.5,
  "checks": {
    "database": "connected"
  }
}

# View API docs
open http://localhost:3000/api-docs
```

## Frontend Setup

### 1. Installation

```bash
cd frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_URL=http://localhost:3000
```

Or copy from example:

```bash
cp .env.example .env
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

Output will be in `dist/` directory.

## Complete Docker Setup

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: url_shortener_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: url_shortener
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://url_shortener_user:secure_password@postgres:5432/url_shortener
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-secret-key
      APP_BASE_URL: http://localhost:3000
    depends_on:
      - postgres
      - redis
    command: npm run dev

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
      VITE_APP_URL: http://localhost:3000
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up
```

## Verification Checklist

After setup, verify everything works:

### Backend

- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Database connected
- [ ] Redis connected (if configured)
- [ ] Can view Swagger API docs

### Frontend

- [ ] Dev server starts
- [ ] Can load at [http://localhost:5173](http://localhost:5173)
- [ ] Can see login page
- [ ] Can register new account
- [ ] Can login with credentials

### Integration

- [ ] Frontend can communicate with backend
- [ ] Can create shortened URL
- [ ] Can view URL list
- [ ] Can view analytics
- [ ] Can generate QR code

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Frontend Tests (Optional)

```bash
cd frontend

# Run tests
npm run test

# Coverage
npm run test:coverage
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
psql -U url_shortener_user -d url_shortener -h localhost

# Check DATABASE_URL
echo $DATABASE_URL

# Run migrations
npx prisma migrate deploy
```

### Redis Connection Error

```bash
# Verify Redis is running
redis-cli ping
# Should return: PONG

# Check REDIS_URL in .env
echo $REDIS_URL

# For Upstash, verify URL format
# Should be: redis://default:password@host:port
```

### Frontend Can't Connect to Backend

```bash
# Verify backend is running
curl http://localhost:3000/api/v1/health

# Check VITE_API_URL in .env
echo $VITE_API_URL

# Clear browser cache
# Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
```

### Node Out of Memory

```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## Next Steps

1. **Create test account**
   - Go to [http://localhost:5173](http://localhost:5173)
   - Click "Sign up"
   - Create account with test email

2. **Test URL shortening**
   - Create a short URL
   - Copy the short code
   - Share and verify redirection works

3. **Check analytics**
   - View dashboard
   - Check URL details page
   - Verify charts display correctly

4. **Review code**
   - Check backend code organization
   - Review frontend component structure
   - Understand data flow

5. **Customization**
   - Update branding/colors
   - Modify validation rules
   - Add custom features

## Getting Help

### Documentation

- Backend: See `backend/README.md`
- Frontend: See `frontend/README.md`
- API: Visit `/api-docs` when backend is running
- Deployment: See `DEPLOYMENT.md`

### Common Issues

- Check logs: `tail -f logs/error.log`
- Database issues: `psql --version`
- Node issues: `node --version`
- npm issues: `npm --version`

### Useful Commands

```bash
# Backend
npm run dev              # Start development server
npm test               # Run tests
npm run lint           # Run linter
npm run migrate        # Run database migrations

# Frontend
npm run dev            # Start dev server
npm run build          # Build for production
npm run lint           # Run linter
npm run preview        # Preview production build

# Database
npx prisma studio     # Open database UI
npx prisma migrate    # Database migrations
```
