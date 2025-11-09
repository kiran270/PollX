# Nginx + SSL Setup Guide

This guide will help you set up your PollX application to be accessible without port numbers using Nginx as a reverse proxy with automatic SSL certificates from Let's Encrypt.

## Prerequisites

1. A domain name pointing to your server's IP address
2. Ports 80 and 443 open on your server
3. Docker and Docker Compose installed

## Quick Setup (Automated)

### 1. Make the setup script executable

```bash
chmod +x setup-ssl.sh
```

### 2. Run the setup script

```bash
./setup-ssl.sh yourdomain.com your@email.com
```

Replace:
- `yourdomain.com` with your actual domain
- `your@email.com` with your email for Let's Encrypt notifications

### 3. Update environment variables

Edit `.env.local` or `.env.production`:

```bash
NEXTAUTH_URL=https://yourdomain.com
```

### 4. Update Google OAuth settings

Go to [Google Cloud Console](https://console.cloud.google.com/):
1. Navigate to your OAuth 2.0 Client
2. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
3. Save changes

### 5. Restart the application

```bash
docker-compose restart poll-app
```

### 6. Access your site

Visit: `https://yourdomain.com` (no port number needed!)

---

## Manual Setup

If you prefer to set up manually or the automated script doesn't work:

### 1. Update nginx.conf

Replace `yourdomain.com` with your actual domain in `nginx.conf`:

```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx.conf
```

### 2. Start Nginx without SSL first

Create a temporary nginx config (`nginx-temp.conf`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://poll-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Start services

```bash
docker-compose up -d
```

### 4. Obtain SSL certificate

```bash
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com
```

### 5. Update nginx config to use SSL

Replace the temporary config with the full SSL config from `nginx.conf`.

### 6. Restart services

```bash
docker-compose down
docker-compose up -d
```

---

## Alternative: Simple HTTP Setup (No SSL)

If you don't need SSL (not recommended for production), you can use a simpler setup:

### 1. Create simple nginx config

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://poll-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Update docker-compose.yml

Remove the certbot service and SSL volumes, keep only nginx with port 80.

### 3. Start services

```bash
docker-compose up -d
```

---

## Troubleshooting

### Certificate generation fails

**Issue**: "Failed to obtain SSL certificate"

**Solutions**:
1. Verify DNS is pointing to your server: `dig yourdomain.com`
2. Check ports are open: `sudo netstat -tulpn | grep -E ':(80|443)'`
3. Ensure domain is accessible: `curl http://yourdomain.com`
4. Check firewall rules: `sudo ufw status`

### Site not accessible

**Issue**: Cannot access site at domain

**Solutions**:
1. Check nginx is running: `docker ps | grep nginx`
2. Check nginx logs: `docker logs poll-nginx`
3. Verify nginx config: `docker exec poll-nginx nginx -t`
4. Check app is running: `docker ps | grep poll-app`

### SSL certificate renewal

Certificates auto-renew every 12 hours via the certbot container. To manually renew:

```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### Mixed content errors

If you see mixed content warnings, ensure:
1. `NEXTAUTH_URL` uses `https://`
2. All internal links use relative paths
3. External resources use HTTPS

---

## Port Configuration Summary

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| poll-app | 3000 | - | Next.js app (not exposed) |
| nginx | 80, 443 | 80, 443 | Reverse proxy (exposed) |

With this setup:
- Users access: `https://yourdomain.com` (port 443)
- Nginx forwards to: `http://poll-app:3000` (internal)
- No port numbers needed in the URL!

---

## Security Notes

1. **Always use HTTPS in production** - Protects user data and OAuth tokens
2. **Keep certificates updated** - Certbot handles this automatically
3. **Use strong SSL configuration** - The provided config uses TLS 1.2+
4. **Set security headers** - Already included in nginx.conf
5. **Firewall configuration** - Only expose ports 80 and 443

---

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
