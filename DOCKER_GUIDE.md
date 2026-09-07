# Docker Deployment Guide

Complete guide to containerize and run your poll app with Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed (usually comes with Docker Desktop)

### Install Docker

**Mac:**
```bash
# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or using Homebrew:
brew install --cask docker
```

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Windows:**
```
Download Docker Desktop from:
https://www.docker.com/products/docker-desktop
```

## Quick Start (2 Minutes)

### 1. Create Environment File

```bash
cd poll-app
cp .env.docker .env
```

Edit `.env` with your values:
```env
DATABASE_URL="file:/app/prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs="
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Build and Run

```bash
# Build and start container
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Setup Database

```bash
# Run migrations
docker-compose exec poll-app npx prisma db push

# Seed database (optional)
docker-compose exec poll-app npx tsx scripts/seed-polls.ts
```

### 4. Access Your App

Open browser: **http://localhost:3000**

Done! 🎉

## Detailed Instructions

### Method 1: Using Docker Compose (Recommended)

#### 1. Build the Image

```bash
cd poll-app
docker-compose build
```

This will:
- Install dependencies
- Generate Prisma client
- Build Next.js app
- Create optimized production image

#### 2. Start the Container

```bash
docker-compose up -d
```

Flags:
- `-d`: Run in detached mode (background)

#### 3. Check Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f poll-app

# Check health
docker-compose exec poll-app node --version
```

#### 4. Initialize Database

```bash
# Push Prisma schema
docker-compose exec poll-app npx prisma db push

# Seed database
docker-compose exec poll-app npx tsx scripts/seed-polls.ts
```

#### 5. Access Application

Visit: **http://localhost:3000**

### Method 2: Using Docker Commands

#### 1. Build Image

```bash
cd poll-app
docker build -t poll-app:latest .
```

#### 2. Create Volume for Database

```bash
docker volume create poll-data
```

#### 3. Run Container

```bash
docker run -d \
  --name poll-app \
  -p 3000:3000 \
  -v poll-data:/app/prisma \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs=" \
  -e GOOGLE_CLIENT_ID="your-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-client-secret" \
  poll-app:latest
```

#### 4. Initialize Database

```bash
docker exec poll-app npx prisma db push
docker exec poll-app npx tsx scripts/seed-polls.ts
```

## Docker Commands Reference

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f poll-app

# Execute command in container
docker-compose exec poll-app sh

# View running containers
docker-compose ps

# View container stats
docker stats poll-app
```

### Image Management

```bash
# Build image
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Pull latest base images
docker-compose pull

# List images
docker images

# Remove image
docker rmi poll-app:latest
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect poll-app_poll-data

# Backup database
docker run --rm \
  -v poll-app_poll-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/poll-data-backup.tar.gz -C /data .

# Restore database
docker run --rm \
  -v poll-app_poll-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/poll-data-backup.tar.gz -C /data
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove all unused containers, networks, images
docker system prune -a

# Remove specific container
docker rm -f poll-app

# Remove specific volume
docker volume rm poll-app_poll-data
```

## Deploy to Production Server

### 1. Copy Files to Server

```bash
# Using SCP
scp -r poll-app user@server-ip:/home/user/

# Or using rsync
rsync -avz poll-app/ user@server-ip:/home/user/poll-app/
```

### 2. SSH into Server

```bash
ssh user@server-ip
cd poll-app
```

### 3. Install Docker (if not installed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose
```

### 4. Create Production Environment File

```bash
nano .env
```

Add production values:
```env
DATABASE_URL="file:/app/prisma/dev.db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NODE_ENV="production"
```

### 5. Build and Run

```bash
docker-compose up -d
```

### 6. Setup Database

```bash
docker-compose exec poll-app npx prisma db push
docker-compose exec poll-app npx tsx scripts/seed-polls.ts
```

### 7. Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/poll-app
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/poll-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Setup SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Docker Compose Configuration Options

### Change Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Access on port 8080
```

### Add PostgreSQL Database

Edit `docker-compose.yml`:
```yaml
services:
  poll-app:
    # ... existing config
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/pollapp
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    container_name: poll-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=pollapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - poll-network

volumes:
  poll-data:
  postgres-data:
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Add Redis for Caching

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: poll-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - poll-network
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs poll-app

# Check if port is in use
lsof -i :3000

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Database errors

```bash
# Check database file permissions
docker-compose exec poll-app ls -la /app/prisma/

# Recreate database
docker-compose exec poll-app npx prisma db push --force-reset

# Check Prisma client
docker-compose exec poll-app npx prisma generate
```

### Can't access app

```bash
# Check container is running
docker-compose ps

# Check port mapping
docker port poll-app

# Check logs
docker-compose logs -f poll-app

# Test from inside container
docker-compose exec poll-app curl localhost:3000
```

### Out of disk space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a
docker volume prune
```

### Build fails

```bash
# Clear build cache
docker builder prune

# Rebuild from scratch
docker-compose build --no-cache
```

## Performance Optimization

### Multi-stage Build

The Dockerfile already uses multi-stage builds to minimize image size:
- Base stage: Node.js runtime
- Deps stage: Install dependencies
- Builder stage: Build application
- Runner stage: Production runtime (smallest)

### Image Size

```bash
# Check image size
docker images poll-app

# Typical sizes:
# - Development: ~1.5 GB
# - Production (optimized): ~200-300 MB
```

### Resource Limits

Edit `docker-compose.yml`:
```yaml
services:
  poll-app:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Monitoring

### View Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Logs since 1 hour ago
docker-compose logs --since 1h
```

### Container Stats

```bash
# Real-time stats
docker stats poll-app

# One-time stats
docker stats --no-stream poll-app
```

### Health Check

Add to `docker-compose.yml`:
```yaml
services:
  poll-app:
    # ... existing config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose exec poll-app cp /app/prisma/dev.db /app/prisma/backup.db

# Copy to host
docker cp poll-app:/app/prisma/backup.db ./backup.db

# Or backup entire volume
docker run --rm \
  -v poll-app_poll-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/poll-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup.db poll-app:/app/prisma/dev.db

# Restart container
docker-compose restart poll-app

# Or restore from volume backup
docker run --rm \
  -v poll-app_poll-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/poll-backup-20241109.tar.gz -C /data
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/docker.yml`:
```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t poll-app:latest ./poll-app
      
      - name: Run tests
        run: docker run poll-app:latest npm test
```

## Docker Hub Deployment

### 1. Login to Docker Hub

```bash
docker login
```

### 2. Tag Image

```bash
docker tag poll-app:latest yourusername/poll-app:latest
docker tag poll-app:latest yourusername/poll-app:v1.0.0
```

### 3. Push Image

```bash
docker push yourusername/poll-app:latest
docker push yourusername/poll-app:v1.0.0
```

### 4. Pull and Run on Any Server

```bash
docker pull yourusername/poll-app:latest
docker run -d -p 3000:3000 yourusername/poll-app:latest
```

## Summary

✅ **Containerized app** with Docker
✅ **Easy deployment** with docker-compose
✅ **Persistent data** with volumes
✅ **Production ready** with optimized build
✅ **Portable** - runs anywhere Docker runs

**Start your app:**
```bash
docker-compose up -d
```

**Stop your app:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

Your poll app is now fully containerized! 🐳
