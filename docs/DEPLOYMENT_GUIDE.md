# Wine Pokédx Deployment Guide

Complete guide for deploying Wine Pokédx to production environments.

## 🚀 Quick Deploy

### Vercel (Recommended)

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wine-pokedx/app)

**Manual Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
cd apps/wine-pokedex
vercel --prod

# Configure environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

---

## 📋 Prerequisites

### System Requirements

**Development:**
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- Redis 6+ (for caching)
- Git 2.30+

**Production:**
- Node.js 18+ (production build)
- PostgreSQL 14+ (managed service recommended)
- Redis 6+ (managed service recommended)
- CDN for static assets
- SSL certificate

### Environment Setup

Create `.env.local` file:
```bash
# Application
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@host:port/wine_pokedx
REDIS_URL=redis://user:password@host:port/0

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Storage (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=wine-pokedx-uploads
AWS_REGION=us-east-1

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SEGMENT_WRITE_KEY=your-segment-key

# External APIs (optional)
WINE_API_KEY=your-wine-api-key
WEATHER_API_KEY=your-weather-key

# Feature Flags
ENABLE_BATTLES=true
ENABLE_TRADING=true
ENABLE_AI_RECOMMENDATIONS=true
```

---

## 🏗️ Database Setup

### PostgreSQL Configuration

**1. Create Database:**
```sql
-- Connect as superuser
CREATE DATABASE wine_pokedx;
CREATE USER wine_app WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wine_pokedx TO wine_app;

-- Connect to wine_pokedx database
\c wine_pokedx;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

**2. Run Migrations:**
```bash
# Navigate to project root
cd apps/wine-pokedx

# Run all migration files in order
psql $DATABASE_URL -f database/setup.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

**3. Seed Data (Optional):**
```bash
# Load sample data for development/testing
psql $DATABASE_URL -f database/migrations/009_seed_data.sql

# Custom seed data
npm run db:seed
```

### Production Database

**Recommended Providers:**
- **Railway**: Simple PostgreSQL hosting
- **Supabase**: PostgreSQL with real-time features
- **AWS RDS**: Enterprise-grade managed PostgreSQL
- **Google Cloud SQL**: Managed PostgreSQL service

**Performance Tuning:**
```sql
-- Add to postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

---

## 🏗️ Build Process

### Local Build

```bash
# Install dependencies
npm install

# Build application
npm run build

# Test build locally
npm run start

# Test with production database
NODE_ENV=production npm run build
```

### Optimization

**Bundle Analysis:**
```bash
# Analyze bundle size
ANALYZE=true npm run build

# View bundle analyzer report
open .next/analyze/client.html
```

**Performance Checks:**
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Performance monitoring
npm run perf:test
```

---

## ☁️ Cloud Deployment

### Vercel Deployment

**Project Configuration:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "apps/wine-pokedx/src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1", "sfo1", "lhr1"],
  "cleanUrls": true,
  "trailingSlash": false
}
```

**Environment Variables:**
```bash
# Add via Vercel Dashboard or CLI
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

### AWS Deployment

**Using AWS Amplify:**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

**Using Docker on ECS:**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

### Digital Ocean Deployment

**App Platform:**
```yaml
# .do/app.yaml
name: wine-pokedx
services:
- name: web
  source_dir: /apps/wine-pokedx
  github:
    repo: your-username/wine-pokedx
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXTAUTH_SECRET
    value: your-secret
    type: SECRET
databases:
- name: wine-db
  engine: PG
  version: "14"
  size: db-s-1vcpu-1gb
```

---

## 🔧 Configuration

### Production Next.js Config

```typescript
// next.config.ts
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    domains: ['wine-images.s3.amazonaws.com'],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=900',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/collection',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // Production webpack config
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        wine: {
          test: /[\\/]src[\\/](components|lib)[\\/]/,
          name: 'wine-core',
          priority: 5,
          chunks: 'all',
          minChunks: 2,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
```

### Environment-Specific Configs

**Production:**
```bash
NODE_ENV=production
NEXTAUTH_URL=https://wine-pokedx.app
DATABASE_URL=postgresql://prod_user:password@prod-host/wine_pokedx
REDIS_URL=redis://prod-redis:6379/0
LOG_LEVEL=info
ENABLE_ANALYTICS=true
```

**Staging:**
```bash
NODE_ENV=staging
NEXTAUTH_URL=https://staging.wine-pokedx.app
DATABASE_URL=postgresql://staging_user:password@staging-host/wine_pokedx
REDIS_URL=redis://staging-redis:6379/0
LOG_LEVEL=debug
ENABLE_ANALYTICS=false
```

---

## 📊 Monitoring & Analytics

### Application Monitoring

**Vercel Analytics:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Sentry Error Tracking:**
```bash
npm install @sentry/nextjs

# sentry.client.config.js
import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Custom Monitoring:**
```typescript
// lib/monitoring.ts
export const trackEvent = (event: string, properties?: any) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    gtag('event', event, properties);
    
    // Custom analytics
    analytics.track(event, properties);
  }
};

export const trackError = (error: Error, context?: any) => {
  console.error('Application Error:', error, context);
  
  // Send to monitoring service
  Sentry.captureException(error, { extra: context });
};
```

### Performance Monitoring

**Web Vitals:**
```typescript
// app/layout.tsx
import { sendGTMEvent } from '@next/third-parties/google';

export function reportWebVitals(metric) {
  sendGTMEvent({
    event: 'web-vital',
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_id: metric.id,
  });
}
```

**Database Monitoring:**
```sql
-- Monitor query performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

---

## 🔒 Security

### Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  );
  
  return response;
}
```

### API Security

```typescript
// lib/auth.ts
import { rateLimit } from './rate-limit';

export const withAuth = (handler) => async (req, res) => {
  // Rate limiting
  const rateLimitResult = await rateLimit(req, res);
  if (!rateLimitResult.success) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Authentication
  const session = await getSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Input validation
  const validatedInput = validateInput(req.body);
  if (!validatedInput.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  return handler(req, res);
};
```

### Data Protection

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const [iv, encrypted] = encryptedText.split(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

---

## 🔧 Maintenance

### Database Maintenance

**Backup Strategy:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="wine_pokedx_backup_${DATE}.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://wine-pokedx-backups/

# Clean local backup
rm $BACKUP_FILE

# Cleanup old backups (keep 30 days)
aws s3 ls s3://wine-pokedx-backups/ --recursive \
  | awk '$1 < "'$(date -d "30 days ago" "+%Y-%m-%d")'" {print $4}' \
  | xargs -I {} aws s3 rm s3://wine-pokedx-backups/{}
```

**Health Checks:**
```bash
#!/bin/bash
# health-check.sh

# Check database connection
psql $DATABASE_URL -c "SELECT 1" > /dev/null
if [ $? -eq 0 ]; then
  echo "Database: OK"
else
  echo "Database: FAILED"
  exit 1
fi

# Check Redis connection
redis-cli -u $REDIS_URL ping > /dev/null
if [ $? -eq 0 ]; then
  echo "Redis: OK"
else
  echo "Redis: FAILED"
  exit 1
fi

# Check API health
curl -f http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
  echo "API: OK"
else
  echo "API: FAILED"
  exit 1
fi
```

### Log Management

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: .next/
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Migrations

```bash
#!/bin/bash
# migrate.sh - Safe database migrations

echo "Starting database migration..."

# Backup before migration
pg_dump $DATABASE_URL > backup_pre_migration.sql

# Run migrations
for migration in database/migrations/*.sql; do
  echo "Running $migration..."
  psql $DATABASE_URL -f $migration
  if [ $? -ne 0 ]; then
    echo "Migration failed: $migration"
    echo "Restoring backup..."
    psql $DATABASE_URL < backup_pre_migration.sql
    exit 1
  fi
done

echo "Migrations completed successfully!"
rm backup_pre_migration.sql
```

---

## 📊 Performance Optimization

### CDN Configuration

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['cdn.wine-pokedx.app'],
    loader: 'cloudinary', // or 'custom'
  },
  
  async rewrites() {
    return [
      {
        source: '/wine-images/:path*',
        destination: 'https://cdn.wine-pokedx.app/:path*',
      },
    ];
  },
};
```

### Caching Strategy

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheGet = async (key: string) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, data: any, ttl = 300) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};
```

---

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database Connection Issues:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check SSL requirements
psql $DATABASE_URL?sslmode=require -c "SELECT 1;"
```

**Performance Issues:**
```bash
# Analyze bundle size
ANALYZE=true npm run build

# Profile performance
npm run perf:profile

# Check memory usage
node --max-old-space-size=4096 npm run build
```

### Rollback Procedure

```bash
#!/bin/bash
# rollback.sh

echo "Starting rollback procedure..."

# Get previous deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --scope=wine-pokedx | sed -n '3p' | awk '{print $1}')

# Promote previous deployment
vercel promote $PREVIOUS_DEPLOYMENT --scope=wine-pokedx

# Restore database backup
echo "Restoring database..."
psql $DATABASE_URL < backup_$(date -d "1 day ago" +"%Y%m%d").sql

echo "Rollback completed!"
```

---

## 📞 Support

### Monitoring Dashboards

**Production Monitoring:**
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Database Monitoring**: Provider-specific dashboard
- **Error Tracking**: Sentry dashboard
- **Analytics**: Google Analytics/Vercel Analytics

### Emergency Contacts

**On-Call Rotation:**
- Primary: DevOps Lead
- Secondary: Backend Lead  
- Escalation: CTO

**Communication:**
- **Slack**: #wine-pokedx-alerts
- **PagerDuty**: wine-pokedx service
- **Status Page**: status.wine-pokedx.app

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks verified
- [ ] Security audit completed
- [ ] Database migration scripts tested
- [ ] Environment variables configured
- [ ] Backup strategy verified
- [ ] Monitoring alerts configured

### Deployment

- [ ] Feature flags configured
- [ ] Database migrations executed
- [ ] Application deployed
- [ ] Health checks passing
- [ ] Performance metrics within bounds
- [ ] Error rates normal
- [ ] User acceptance testing completed

### Post-Deployment

- [ ] Monitor error rates (24h)
- [ ] Verify key user journeys
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Update documentation
- [ ] Communicate release notes
- [ ] Schedule post-mortem (if issues)

---

**🎉 Congratulations! Your Wine Pokédx deployment is complete!**

For additional support, visit our [documentation](https://docs.wine-pokedx.app) or contact [support@wine-pokedx.app](mailto:support@wine-pokedx.app).