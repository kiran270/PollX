# Domain Setup Complete ✅

Your PollX application is configured for **pollx.duckdns.org**

## 🎯 Goal Achieved

**Before:** `pollx.duckdns.org:3000` (with port number)  
**After:** `pollx.duckdns.org` (no port number!)

---

## 🚀 Quick Start

### Choose Your Setup:

#### 1️⃣ Simple HTTP (Fastest)
```bash
docker-compose -f docker-compose.simple.yml up -d
```
Access: **http://pollx.duckdns.org**

#### 2️⃣ Secure HTTPS (Recommended)
```bash
./setup-pollx.sh your@email.com
```
Access: **https://pollx.duckdns.org**

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `nginx.conf` | Full HTTPS configuration |
| `nginx-simple.conf` | Simple HTTP configuration |
| `docker-compose.simple.yml` | HTTP-only setup |
| `setup-pollx.sh` | Automated HTTPS setup script |
| `START_HERE.md` | Quick start guide |
| `SETUP_POLLX_DUCKDNS.md` | Detailed setup instructions |

---

## 🔧 Configuration Summary

### Domain
- **Domain:** pollx.duckdns.org
- **HTTP Port:** 80 (standard, no number needed)
- **HTTPS Port:** 443 (standard, no number needed)
- **App Port:** 3000 (internal only, not exposed)

### How It Works
```
Internet → Nginx (port 80/443) → Your App (port 3000)
```

Users access your site at `pollx.duckdns.org`, and Nginx forwards requests to your app internally on port 3000.

---

## ⚙️ Post-Setup Configuration

### 1. Update Environment Variables

Edit `.env.local`:

**For HTTP:**
```env
NEXTAUTH_URL=http://pollx.duckdns.org
```

**For HTTPS:**
```env
NEXTAUTH_URL=https://pollx.duckdns.org
```

### 2. Update Google OAuth

Add redirect URI in [Google Cloud Console](https://console.cloud.google.com/):

**For HTTP:**
```
http://pollx.duckdns.org/api/auth/callback/google
```

**For HTTPS:**
```
https://pollx.duckdns.org/api/auth/callback/google
```

### 3. Restart Application

```bash
docker-compose restart poll-app
```

---

## 📊 What Changed?

### Before
- URL: `http://pollx.duckdns.org:3000`
- Port 3000 exposed to internet
- Direct access to Next.js app
- Port number required in URL

### After
- URL: `http://pollx.duckdns.org` or `https://pollx.duckdns.org`
- Ports 80/443 exposed (standard web ports)
- Nginx reverse proxy
- No port number needed!
- More secure (port 3000 not exposed)

---

## 🛠️ Common Commands

```bash
# Start with HTTP
docker-compose -f docker-compose.simple.yml up -d

# Start with HTTPS
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker logs poll-nginx
docker logs poll-app

# Restart app
docker-compose restart poll-app

# Check status
docker ps
```

---

## 🔍 Troubleshooting

### Site not accessible?

1. **Check DNS:**
   ```bash
   ping pollx.duckdns.org
   ```

2. **Check containers:**
   ```bash
   docker ps
   ```

3. **Check logs:**
   ```bash
   docker logs poll-nginx
   ```

4. **Test locally:**
   ```bash
   curl http://localhost
   ```

### Port 80 in use?

```bash
# Find what's using it
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx
```

### Firewall issues?

```bash
# Open ports
sudo ufw allow 80
sudo ufw allow 443
```

---

## 📚 Documentation

- **Quick Start:** [START_HERE.md](./START_HERE.md)
- **Detailed Setup:** [SETUP_POLLX_DUCKDNS.md](./SETUP_POLLX_DUCKDNS.md)
- **Nginx Guide:** [NGINX_SSL_SETUP.md](./NGINX_SSL_SETUP.md)
- **Domain Guide:** [QUICK_DOMAIN_SETUP.md](./QUICK_DOMAIN_SETUP.md)

---

## ✅ Checklist

- [ ] Choose HTTP or HTTPS setup
- [ ] Run setup command
- [ ] Update `.env.local` with correct URL
- [ ] Update Google OAuth redirect URI
- [ ] Restart application
- [ ] Test access at `pollx.duckdns.org`
- [ ] Test Google sign-in
- [ ] Verify admin features work

---

## 🎉 Success!

Once setup is complete, your PollX application will be accessible at:

**HTTP:** http://pollx.duckdns.org  
**HTTPS:** https://pollx.duckdns.org

No port number needed! 🚀
