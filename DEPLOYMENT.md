# 🚀 Deployment Guide - TW Wrap

This guide covers deploying TW Wrap using Docker, cloud platforms, or manual deployment.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Railway](#railway)
  - [Render](#render)
  - [DigitalOcean](#digitalocean)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 20+ (for manual deployment)
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 14+ database
- Domain name (optional, for production)

## 🐳 Quick Start with Docker Compose

The easiest way to deploy TW Wrap is using Docker Compose.

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd "TW Wrap"

# Copy environment file
cp .env.example .env
```

### 2. Edit `.env` file

```env
# REQUIRED: Change this to a secure random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Update with your domain (or keep localhost for local testing)
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access your app:**
- Frontend: http://localhost
- Backend API: http://localhost:3000

### 4. Seed Demo Data (Optional)

```bash
# Access backend container
docker exec -it tw-backend sh

# Run seed script
npm run seed

# Exit container
exit
```

## 🌐 Platform-Specific Deployments

### Railway

Railway provides simple deployment with automatic CI/CD.

#### Backend Deployment

1. Create new project in Railway
2. Add PostgreSQL database
3. Connect GitHub repo
4. Set root directory: `TW-Backend`
5. Add environment variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-secret>
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend-url.railway.app
BCRYPT_ROUNDS=12
NODE_ENV=production
PORT=3000
```

6. Deploy command: `npm run build && npx prisma migrate deploy && npm start`

#### Frontend Deployment

1. Create new service in same project
2. Set root directory: `Turtle Wrap`
3. Add environment variable:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

4. Build command: `npm run build:prod`
5. Use Nixpacks or add custom Dockerfile

### Render

#### Backend (Web Service)

1. Create new Web Service
2. Connect repo, select `TW-Backend` directory
3. Configure:
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma migrate deploy && npm start`
4. Add PostgreSQL database (from Render dashboard)
5. Set environment variables:

```env
DATABASE_URL=<from-postgres-service>
JWT_SECRET=<generate-random-secret>
FRONTEND_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

#### Frontend (Static Site)

1. Create new Static Site
2. Select `Turtle Wrap` directory
3. Configure:
   - **Build Command:** `npm install && npm run build:prod`
   - **Publish Directory:** `dist`
4. Add environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com
```

### DigitalOcean

#### Using App Platform

1. Create new app from GitHub
2. Add two components:
   - **Backend:** Node.js service from `TW-Backend`
   - **Frontend:** Static site from `Turtle Wrap`
3. Add PostgreSQL managed database
4. Configure environment variables (see below)
5. Deploy!

#### Using Droplet + Docker

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repo
git clone <your-repo>
cd "TW Wrap"

# Configure environment
cp .env.example .env
nano .env  # Edit variables

# Start with Docker Compose
docker-compose up -d
```

## 🔧 Manual Deployment

### Backend

```bash
cd TW-Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Generate Prisma Client
npx prisma generate

# Build TypeScript
npm run build

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npm run seed

# Start production server
npm start
```

### Frontend

```bash
cd Turtle Wrap

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Set VITE_API_URL

# Build for production
npm run build:prod

# Serve with nginx or any static server
# Files are in ./dist
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/Turtle Wrap/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Environment Variables

### Backend (TW-Backend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3000` |
| `NODE_ENV` | Yes | Environment | `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | JWT signing key | Random 32+ char string |
| `JWT_EXPIRES_IN` | No | Token expiry | `24h` |
| `FRONTEND_URL` | Yes | CORS origin | `https://your-app.com` |
| `BCRYPT_ROUNDS` | No | Password hashing | `12` |

### Frontend (Turtle Wrap/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://api.your-app.com` |

### Docker Compose (.env in root)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `JWT_SECRET` | Yes | JWT secret | Random string |
| `FRONTEND_URL` | Yes | Frontend domain | `https://app.com` |
| `VITE_API_URL` | Yes | Backend URL | `https://api.app.com` |

## ✅ Post-Deployment

### 1. Verify Services

```bash
# Check backend health
curl https://your-api-url.com/health

# Check database connection
docker exec -it tw-backend npx prisma db pull
```

### 2. Create Admin Account

Visit your frontend URL and register the first account - it will be the family owner.

### 3. (Optional) Load Demo Data

```bash
# If using Docker
docker exec -it tw-backend npm run seed

# If manual deployment
cd TW-Backend && npm run seed
```

### 4. Set Up SSL/HTTPS

- **Railway/Render:** Automatic SSL
- **DigitalOcean:** Use App Platform or configure Certbot
- **Manual:** Use Certbot/Let's Encrypt

```bash
# Certbot for nginx
sudo certbot --nginx -d your-domain.com
```

### 5. Configure CORS

Ensure `FRONTEND_URL` in backend `.env` matches your actual frontend domain.

## 🔄 Updates & Migrations

### Docker Compose

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations
docker exec -it tw-backend npx prisma migrate deploy
```

### Manual

```bash
# Backend
cd TW-Backend
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart tw-backend

# Frontend
cd Turtle Wrap
git pull
npm install
npm run build:prod
# Copy dist/ to web server
```

## 🐛 Troubleshooting

### Database Connection Failed

- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check firewall rules

### CORS Errors

- Verify `FRONTEND_URL` matches exactly (no trailing slash)
- Check browser console for actual origin

### Build Fails

```bash
# Frontend TypeScript errors
# Use build:prod instead of build to skip type-check
npm run build:prod
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend
```

## 📊 Monitoring

### View Logs

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps
```

### Database Backup

```bash
# Backup
docker exec tw-postgres pg_dump -U tw_user tw_wrap > backup.sql

# Restore
cat backup.sql | docker exec -i tw-postgres psql -U tw_user -d tw_wrap
```

## 🎯 Production Checklist

- [ ] Change `JWT_SECRET` to secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `FRONTEND_URL` and `VITE_API_URL`
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring/alerts
- [ ] Test user registration and login
- [ ] Verify CORS configuration
- [ ] Review security headers

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Review application logs
- Consult README files in TW-Backend and Turtle Wrap

---

**Happy Deploying! 🎉**
