# 🚀 Start Here - pollx.duckdns.org Setup

## Quick Start (Choose One)

### ⚡ Option A: Simple HTTP (No SSL) - 30 seconds

```bash
docker-compose -f docker-compose.simple.yml up -d
```

Then visit: **http://pollx.duckdns.org**

---

### 🔒 Option B: HTTPS with SSL - 5 minutes

```bash
./setup-pollx.sh your@email.com
```

Then visit: **https://pollx.duckdns.org**

---

## What's the Difference?

| Feature | Option A (HTTP) | Option B (HTTPS) |
|---------|----------------|------------------|
| Setup Time | 30 seconds | 5 minutes |
| URL | http://pollx.duckdns.org | https://pollx.duckdns.org |
| SSL/Encryption | ❌ No | ✅ Yes |
| Port Number | None needed | None needed |
| Production Ready | ⚠️ Not recommended | ✅ Yes |
| Google OAuth | Works | Works (recommended) |

---

## After Setup

### Update Environment Variables

Edit `.env.local`:

**For Option A (HTTP):**
```env
NEXTAUTH_URL=http://pollx.duckdns.org
```

**For Option B (HTTPS):**
```env
NEXTAUTH_URL=https://pollx.duckdns.org
```

### Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to your OAuth 2.0 Client
2. Add authorized redirect URI:
   - **For HTTP:** `http://pollx.duckdns.org/api/auth/callback/google`
   - **For HTTPS:** `https://pollx.duckdns.org/api/auth/callback/google`
3. Save changes

### Restart App

```bash
docker-compose restart poll-app
```

---

## Troubleshooting

### Can't access the site?

```bash
# Check if containers are running
docker ps

# Check nginx logs
docker logs poll-nginx

# Check app logs
docker logs poll-app

# Test locally
curl http://localhost
```

### Port already in use?

```bash
# Find what's using port 80
sudo lsof -i :80

# Stop it (example for Apache)
sudo systemctl stop apache2
```

### Need to switch between HTTP and HTTPS?

```bash
# Stop current setup
docker-compose down

# Start with HTTP
docker-compose -f docker-compose.simple.yml up -d

# OR start with HTTPS
docker-compose up -d
```

---

## Useful Commands

```bash
# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart app only
docker-compose restart poll-app

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Check status
docker ps
```

---

## 📚 More Documentation

- **Detailed Setup:** [SETUP_POLLX_DUCKDNS.md](./SETUP_POLLX_DUCKDNS.md)
- **Nginx & SSL Guide:** [NGINX_SSL_SETUP.md](./NGINX_SSL_SETUP.md)
- **Quick Domain Setup:** [QUICK_DOMAIN_SETUP.md](./QUICK_DOMAIN_SETUP.md)

---

## 🎯 Recommended Path

1. **Start with Option A (HTTP)** to test everything works
2. **Verify** you can access http://pollx.duckdns.org
3. **Update** Google OAuth and environment variables
4. **Test** authentication works
5. **Upgrade to Option B (HTTPS)** for production

---

## Need Help?

Check the troubleshooting section in [SETUP_POLLX_DUCKDNS.md](./SETUP_POLLX_DUCKDNS.md)
