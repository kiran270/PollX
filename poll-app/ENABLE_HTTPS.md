# Enable HTTPS for pollx.duckdns.org

Complete guide to enable HTTPS with automatic SSL certificates.

## 🔒 Quick HTTPS Setup

### **Prerequisites:**
- Domain `pollx.duckdns.org` pointing to your EC2 IP
- Ports 80 and 443 open in EC2 security group
- App currently running on HTTP

---

## 🚀 Method 1: Automated Setup (Recommended)

### **On EC2:**

```bash
# 1. SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Navigate to app directory
cd ~/poll-app

# 3. Stop current setup
docker-compose down

# 4. Run HTTPS setup script
./setup-pollx.sh your@email.com

# 5. Update environment variable
nano .env
# Change: NEXTAUTH_URL=https://pollx.duckdns.org

# 6. Restart app
docker-compose restart poll-app
```

### **Update Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update redirect URI to: `https://pollx.duckdns.org/api/auth/callback/google`
3. Save changes

---

## 🔧 Method 2: Manual Setup

### **Step 1: Update nginx.conf**

The `nginx.conf` file is already configured for HTTPS with your domain `pollx.duckdns.org`.

### **Step 2: Obtain SSL Certificate**

```bash
# On EC2
cd ~/poll-app

# Stop current containers
docker-compose -f docker-compose.simple.yml down

# Create temporary nginx config for certificate
cat > nginx-cert.conf << 'EOF'
server {
    listen 80;
    server_name pollx.duckdns.org;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Start nginx with temporary config
docker run -d --name temp-nginx \
  -p 80:80 \
  -v $(pwd)/nginx-cert.conf:/etc/nginx/conf.d/default.conf:ro \
  -v certbot-www:/var/www/certbot \
  nginx:alpine

# Get SSL certificate
docker run --rm \
  -v certbot-etc:/etc/letsencrypt \
  -v certbot-www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  -d pollx.duckdns.org

# Stop temporary nginx
docker stop temp-nginx
docker rm temp-nginx

# Start with full HTTPS setup
docker-compose up -d
```

### **Step 3: Update Environment**

```bash
# Edit .env file
nano .env

# Change to HTTPS
NEXTAUTH_URL=https://pollx.duckdns.org
```

### **Step 4: Restart**

```bash
docker-compose restart poll-app
```

---

## 📋 Verification

### **Check SSL Certificate:**

```bash
# Check certificate files
docker exec poll-nginx ls -la /etc/letsencrypt/live/pollx.duckdns.org/

# Test HTTPS
curl -I https://pollx.duckdns.org
```

### **Test in Browser:**

1. Visit: `https://pollx.duckdns.org`
2. Check for padlock icon in address bar
3. Click padlock to view certificate details
4. Test Google sign-in

---

## 🔄 Certificate Auto-Renewal

The `docker-compose.yml` includes a certbot container that automatically renews certificates every 12 hours.

### **Manual Renewal:**

```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### **Check Certificate Expiry:**

```bash
docker exec poll-nginx openssl x509 -in /etc/letsencrypt/live/pollx.duckdns.org/fullchain.pem -noout -dates
```

---

## 🐛 Troubleshooting

### **Certificate Generation Fails**

**Error:** "Failed to obtain SSL certificate"

**Solutions:**

1. **Check DNS:**
   ```bash
   ping pollx.duckdns.org
   # Should show your EC2 IP
   ```

2. **Check Ports:**
   ```bash
   sudo netstat -tulpn | grep -E ':(80|443)'
   # Ports should be open
   ```

3. **Check Firewall:**
   ```bash
   sudo ufw status
   # Ports 80 and 443 should be allowed
   ```

4. **Check EC2 Security Group:**
   - Port 80: 0.0.0.0/0
   - Port 443: 0.0.0.0/0

### **Mixed Content Errors**

If you see warnings about mixed content:

1. **Check .env:**
   ```bash
   cat .env | grep NEXTAUTH_URL
   # Should be: https://pollx.duckdns.org
   ```

2. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear all cached data

3. **Restart app:**
   ```bash
   docker-compose restart poll-app
   ```

### **Redirect Loop**

If you get stuck in a redirect loop:

1. **Check nginx config:**
   ```bash
   docker exec poll-nginx nginx -t
   ```

2. **Check logs:**
   ```bash
   docker logs poll-nginx
   docker logs poll-app
   ```

3. **Restart services:**
   ```bash
   docker-compose restart
   ```

---

## 📊 Current vs HTTPS Setup

### **Before (HTTP):**
```
http://pollx.duckdns.org
- No encryption
- Not secure
- Google OAuth works but not recommended
```

### **After (HTTPS):**
```
https://pollx.duckdns.org
- Encrypted connection
- Secure padlock icon
- Required for production
- Better SEO
- Required by some browsers
```

---

## ✅ Post-Setup Checklist

- [ ] SSL certificate obtained successfully
- [ ] HTTPS accessible: `https://pollx.duckdns.org`
- [ ] HTTP redirects to HTTPS
- [ ] Padlock icon visible in browser
- [ ] `.env` updated with HTTPS URL
- [ ] Google OAuth redirect URI updated
- [ ] Google sign-in works
- [ ] No mixed content warnings
- [ ] Certificate auto-renewal configured

---

## 🔐 Security Best Practices

1. **Always use HTTPS in production**
2. **Keep certificates up to date** (auto-renewal handles this)
3. **Use strong SSL configuration** (already configured)
4. **Enable HSTS** (already in nginx.conf)
5. **Regular security updates**

---

## 📞 Quick Commands

```bash
# Check if HTTPS is working
curl -I https://pollx.duckdns.org

# View certificate details
openssl s_client -connect pollx.duckdns.org:443 -servername pollx.duckdns.org

# Check certificate expiry
docker exec poll-nginx openssl x509 -in /etc/letsencrypt/live/pollx.duckdns.org/fullchain.pem -noout -dates

# Renew certificate manually
docker-compose run --rm certbot renew

# Restart services
docker-compose restart
```

---

## 🎉 Success!

Once setup is complete, your site will be accessible at:

**https://pollx.duckdns.org** 🔒

All HTTP traffic will automatically redirect to HTTPS!
