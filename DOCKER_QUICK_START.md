# Docker Quick Start

Your poll app is now containerized and running! 🐳

## Current Status

✅ Docker image built successfully
✅ Container running on port 3000
✅ Database initialized
✅ App accessible at http://localhost:3000

## Quick Commands

### Start the app
```bash
docker-compose up -d
```

### Stop the app
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f poll-app
```

### Restart the app
```bash
docker-compose restart
```

### Check status
```bash
docker-compose ps
```

### Access container shell
```bash
docker-compose exec poll-app sh
```

### Seed database
```bash
docker-compose exec poll-app npx tsx scripts/seed-polls.ts
```

## Access Your App

Open your browser and visit:
**http://localhost:3000**

## What's Running

- **Container Name:** poll-app
- **Port:** 3000
- **Database:** SQLite (persisted in Docker volume)
- **Network:** poll-network
- **Volume:** poll-data (for database persistence)

## Files Created

- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build
- `.env` - Environment variables
- `docker-start.sh` - Quick start script

## Troubleshooting

### Port already in use
```bash
# Stop other services on port 3000
docker-compose down
# Or change port in docker-compose.yml
```

### Container won't start
```bash
# Check logs
docker-compose logs poll-app

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database issues
```bash
# Reset database
docker-compose exec poll-app npx prisma db push --force-reset
```

## Deploy to Production

See `DOCKER_GUIDE.md` for complete deployment instructions including:
- Deploying to AWS/GCP
- Setting up Nginx reverse proxy
- Adding SSL certificates
- Backup strategies
- Monitoring

## Next Steps

1. ✅ App is running in Docker
2. Visit http://localhost:3000
3. Sign in with Google
4. Create and vote on polls
5. Deploy to production when ready!

Enjoy your containerized poll app! 🎉
