# Setup Guide for pollx.duckdns.org

Quick guide to access your PollX app at `pollx.duckdns.org` (without port 3000)

## Current Status
- Domain: `pollx.duckdns.org`
- Currently accessible at: `pollx.duckdns.org:3000`
- Goal: Access at `pollx.duckdns.org` or `https://pollx.duckdns.org`

---

## Option 1: Simple HTTP Setup (Fastest - 2 minutes)

**Best for**: Quick testing, or if you'll use Cloudflare SSL later

### Steps:

1. **Stop current setup:**
   ```bash
   docker-compose down
   ```

2. **Start with simple HTTP config:**
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

3. **Access your site:**
   ```
   http://pollx.duckdns.org
   ```

**Done!** No port number needed.

---

## Option 2: Full HTTPS Setup (Recommended - 5 minutes)

**Best for**: Production use with automatic SSL certificates

### Prerequisites:
- Ports 80 and 443 must be open on your server
- Domain must be pointing to your server

### Steps:

1. **Run the automated setup:**
   ```bash
   ./setup-pollx.sh your@email.com
   ```
   Replace `your@email.com` with your actual email.

2. **Update .env.local:**
   ```bash
   nano .env.local
   ```
   Change:
   ```
   NEXTAUTH_URL=https://pollx.duckdns.org
   ```

3. **Update Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Find your OAuth 2.0 Client
   - Add authorized redirect URI:
     ```
     https://pollx.duckdns.org/api/auth/callback/google
     ```
   - Save

4. **Restart the app:**
   ```bash
   docker-compose restart poll-app
   ```

5. **Access your site:**
   ```
   https://pollx.duckdns.org
   ```

**Done!** Secure HTTPS access without port number.

---

## Option 3: Manual HTTP Setup

If the automated scripts don't work:

1. **Stop current containers:**
   ```bash
   docker-compose down
   ```

2. **Update docker-compose.simple.yml if needed** (already configured for pollx.duckdns.org)

3. **Start services:**
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

4. **Check logs:**
   ```bash
   docker logs poll-nginx
   docker logs poll-app
   ```

5. **Access:**
   ```
   http://pollx.duckdns.org
   ```

---

## Troubleshooting

### Can't access pollx.duckdns.org

1. **Check if domain points to your server:**
   ```bash
   ping pollx.duckdns.org
   ```
   Should show your server's IP address.

2. **Check containers are running:**
   ```bash
   docker ps
   ```
   Should see `poll-app` and `poll-nginx`.

3. **Check nginx logs:**
   ```bash
   docker logs poll-nginx
   ```

4. **Test locally:**
   ```bash
   curl http://localhost
   ```
   Should return HTML from your app.

### Port 80 already in use

Find what's using it:
```bash
sudo lsof -i :80
```

Stop the conflicting service:
```bash
# If it's Apache
sudo systemctl stop apache2

# If it's another nginx
sudo systemctl stop nginx
```

### Firewall blocking ports

Open ports 80 and 443:
```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status

# Check if firewall is active
sudo ufw status
```

### SSL certificate fails

If HTTPS setup fails, use HTTP setup (Option 1) and add SSL via Cloudflare:

1. Add your domain to Cloudflare (free)
2. Use HTTP setup (Option 1)
3. In Cloudflare:
   - SSL/TLS → Set to "Flexible"
   - Enable "Always Use HTTPS"
4. Access: `https://pollx.duckdns.org`

---

## What's Different?

### Before:
```
http://pollx.duckdns.org:3000
```
- Port 3000 exposed to internet
- Direct access to Next.js app

### After (HTTP):
```
http://pollx.duckdns.org
```
- Port 80 (standard HTTP)
- Nginx forwards to app internally
- No port number needed!

### After (HTTPS):
```
https://pollx.duckdns.org
```
- Port 443 (standard HTTPS)
- Automatic SSL certificates
- Secure encrypted connection
- No port number needed!

---

## Quick Commands Reference

```bash
# Start with HTTP (simple)
docker-compose -f docker-compose.simple.yml up -d

# Start with HTTPS (full)
./setup-pollx.sh your@email.com

# Stop all containers
docker-compose down

# View logs
docker logs poll-nginx
docker logs poll-app

# Restart app only
docker-compose restart poll-app

# Restart everything
docker-compose restart

# Check status
docker ps
```

---

## Environment Variables

Update your `.env.local`:

**For HTTP:**
```env
NEXTAUTH_URL=http://pollx.duckdns.org
```

**For HTTPS:**
```env
NEXTAUTH_URL=https://pollx.duckdns.org
```

---

## Google OAuth Configuration

Update your Google OAuth redirect URIs:

**For HTTP:**
```
http://pollx.duckdns.org/api/auth/callback/google
```

**For HTTPS:**
```
https://pollx.duckdns.org/api/auth/callback/google
```

---

## Need More Help?

- Full Nginx guide: [NGINX_SSL_SETUP.md](./NGINX_SSL_SETUP.md)
- Quick domain setup: [QUICK_DOMAIN_SETUP.md](./QUICK_DOMAIN_SETUP.md)
- DuckDNS guide: [DUCKDNS_SETUP_GUIDE.md](./DUCKDNS_SETUP_GUIDE.md)
