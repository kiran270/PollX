# Quick Domain Setup Guide

Access your PollX app at `yourdomain.com` instead of `yourdomain.com:3000`

## Option 1: Simple HTTP Setup (Fastest - No SSL)

**Best for**: Testing, development, or if you'll add SSL later via Cloudflare

### Steps:

1. **Update the nginx config with your domain:**
   ```bash
   sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx-simple.conf
   ```

2. **Stop current containers:**
   ```bash
   docker-compose down
   ```

3. **Start with simple config:**
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

4. **Access your site:**
   ```
   http://yourdomain.com
   ```

**That's it!** Your site is now accessible without the port number.

---

## Option 2: Full HTTPS Setup with SSL (Recommended for Production)

**Best for**: Production deployments with automatic SSL certificates

### Prerequisites:
- Domain DNS pointing to your server
- Ports 80 and 443 open

### Steps:

1. **Run the automated setup:**
   ```bash
   ./setup-ssl.sh yourdomain.com your@email.com
   ```

2. **Update environment variables:**
   ```bash
   # Edit .env.local
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Update Google OAuth redirect URI:**
   - Go to Google Cloud Console
   - Add: `https://yourdomain.com/api/auth/callback/google`

4. **Restart app:**
   ```bash
   docker-compose restart poll-app
   ```

5. **Access your site:**
   ```
   https://yourdomain.com
   ```

---

## Option 3: Using Cloudflare (Easiest SSL)

If your domain is on Cloudflare, you can use their free SSL:

### Steps:

1. **Use the simple HTTP setup** (Option 1 above)

2. **In Cloudflare Dashboard:**
   - Go to SSL/TLS settings
   - Set SSL mode to "Flexible" or "Full"
   - Enable "Always Use HTTPS"

3. **Access your site:**
   ```
   https://yourdomain.com
   ```

Cloudflare handles SSL automatically!

---

## Troubleshooting

### Can't access site at domain

1. **Check DNS:**
   ```bash
   ping yourdomain.com
   ```
   Should show your server's IP

2. **Check containers are running:**
   ```bash
   docker ps
   ```
   Should see `poll-app` and `poll-nginx`

3. **Check nginx logs:**
   ```bash
   docker logs poll-nginx
   ```

4. **Test locally:**
   ```bash
   curl http://localhost
   ```

### Port 80 already in use

Stop the service using port 80:
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # or nginx, or whatever is using it
```

### Firewall blocking access

Open ports 80 and 443:
```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## What Changed?

**Before:**
- Direct access to app: `http://yourdomain.com:3000`
- Port 3000 exposed to internet

**After:**
- Access via standard ports: `http://yourdomain.com` (port 80) or `https://yourdomain.com` (port 443)
- Nginx forwards requests to app on port 3000 internally
- Port 3000 not exposed to internet (more secure!)

---

## Need Help?

See the full guide: [NGINX_SSL_SETUP.md](./NGINX_SSL_SETUP.md)
