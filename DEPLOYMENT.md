# Deployment Guide

This guide covers deploying the URL Shortener application to production.

## Backend Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance (optional but recommended)
- Heroku CLI or Docker runtime

### Environment Variables

Create a `.env` file with:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/url_shortener
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRY=7d
REDIS_URL=redis://user:password@host:6379
APP_BASE_URL=https://yourdomain.com
LOG_LEVEL=warn
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://frontend-domain.com
```

### Deployment Steps

#### Option 1: Heroku

```bash
# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<your-secret>
heroku config:set DATABASE_URL=<postgres-url>
heroku config:set REDIS_URL=<redis-url>

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### Option 2: Docker

```bash
# Build image
docker build -t url-shortener-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e JWT_SECRET=... \
  url-shortener-backend
```

#### Option 3: Self-Hosted (Linux/Ubuntu)

```bash
# SSH into server
ssh user@server-ip

# Clone repository
git clone <repo-url>
cd URL-Shortener/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add environment variables

# Setup systemd service
sudo nano /etc/systemd/system/url-shortener.service
```

Add this content:

```ini
[Unit]
Description=URL Shortener Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/url-shortener/backend
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
# Enable and start
sudo systemctl enable url-shortener
sudo systemctl start url-shortener

# Check status
sudo systemctl status url-shortener
```

### Database Setup

```bash
# Run migrations
npm run migrate

# (Optional) Seed database
npm run seed
```

### Verify Deployment

```bash
# Check health
curl https://your-backend-url/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-06-11T10:00:00Z",
  "uptime": 3600
}
```

## Frontend Deployment

### Prerequisites (Frontend)

- Node.js 18+
- npm or yarn

### Build

```bash
cd frontend

# Install dependencies
npm install

# Create .env.production
VITE_API_URL=https://your-backend-url/api/v1
VITE_APP_URL=https://your-backend-url

# Build
npm run build
```

### Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in dashboard
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### Option 4: GitHub Pages

**1. Update `vite.config.ts`:**

```typescript
export default defineConfig({
  base: "/url-shortener/",
  // ... rest of config
});
```

**2. Create GitHub Action:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Option 5: Self-Hosted (Nginx)

```bash
# Build
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/url-shortener/

# Create Nginx config
sudo nano /etc/nginx/sites-available/url-shortener
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html/url-shortener;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend-server:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/url-shortener /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring & Logging

### Backend Logs

```bash
# Systemd logs
sudo journalctl -u url-shortener -f

# Docker logs
docker logs -f <container-id>

# File logs
tail -f logs/error.log
tail -f logs/access.log
```

### Performance Monitoring

Set up monitoring tools:

- **New Relic**: Node.js APM
- **Datadog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **Grafana**: Metrics visualization

### Health Checks

Configure health checks to:

```bash
# Check backend health every 30 seconds
curl -f https://your-backend-url/api/v1/health || restart_service
```

## Database Backups

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20250611.sql

# Automated backup (cron)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

## Scaling

### Horizontal Scaling (Multiple Instances)

1. Use load balancer (Nginx, HAProxy, AWS ELB)
2. Deploy backend to multiple servers
3. Use shared database and Redis

```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Optimization

- Add indexes for frequently queried fields
- Use read replicas for analytics queries
- Implement connection pooling
- Archive old analytics data

## Troubleshooting

### Backend won't start

```bash
# Check logs
tail -f logs/error.log

# Verify environment variables
env | grep -E "^(DATABASE_URL|JWT_SECRET|REDIS_URL)"

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

### High memory usage

```bash
# Check Node.js process
ps aux | grep node

# Enable heap snapshots
node --max-old-space-size=4096 index.js
```

### Slow queries

```bash
# Enable query logging in PostgreSQL
ALTER DATABASE url_shortener SET log_min_duration_statement = 1000;
```

## Performance Checklist

- [ ] Enable gzip compression
- [ ] Setup CDN for static assets
- [ ] Enable database caching
- [ ] Configure Redis properly
- [ ] Setup proper logging
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Setup health checks
- [ ] Test failover procedures
- [ ] Load test the application
- [ ] Security audit

## Post-Deployment

1. **Verify all features work**
   - User registration
   - URL creation
   - Analytics tracking
   - QR code generation
   - CSV export

2. **Security checks**
   - Enable HTTPS
   - Setup CORS properly
   - Verify rate limiting
   - Check JWT secret strength

3. **Performance tuning**
   - Monitor response times
   - Check error rates
   - Verify caching
   - Load test

4. **Setup monitoring**
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - Uptime monitoring
   - Alert configuration
