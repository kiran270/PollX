#!/bin/bash

# Quick HTTPS Enable Script for pollx.duckdns.org
# Usage: ./enable-https.sh your@email.com

set -e

DOMAIN="pollx.duckdns.org"
EMAIL=$1

if [ -z "$EMAIL" ]; then
    echo "❌ Error: Email required"
    echo "Usage: ./enable-https.sh your@email.com"
    exit 1
fi

echo "🔒 Enabling HTTPS for $DOMAIN"
echo "=============================="
echo ""

# Stop current setup
echo "🛑 Stopping current containers..."
docker-compose down

# Check if certificate already exists
if docker run --rm -v certbot-etc:/etc/letsencrypt certbot/certbot certificates | grep -q "$DOMAIN"; then
    echo "✅ SSL certificate already exists"
else
    echo "📜 Obtaining SSL certificate..."
    
    # Create temporary nginx for certificate
    cat > /tmp/nginx-temp.conf << 'EOF'
server {
    listen 80;
    server_name pollx.duckdns.org;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
EOF
    
    # Start temporary nginx
    docker run -d --name temp-nginx \
        -p 80:80 \
        -v /tmp/nginx-temp.conf:/etc/nginx/conf.d/default.conf:ro \
        -v certbot-www:/var/www/certbot \
        nginx:alpine
    
    sleep 3
    
    # Get certificate
    docker run --rm \
        -v certbot-etc:/etc/letsencrypt \
        -v certbot-www:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"
    
    # Stop temporary nginx
    docker stop temp-nginx
    docker rm temp-nginx
    rm /tmp/nginx-temp.conf
    
    echo "✅ SSL certificate obtained"
fi

# Update .env file
echo "📝 Updating .env file..."
if [ -f .env ]; then
    sed -i.bak 's|NEXTAUTH_URL=http://|NEXTAUTH_URL=https://|g' .env
    echo "✅ Updated NEXTAUTH_URL to HTTPS"
else
    echo "⚠️  Warning: .env file not found"
fi

# Start with HTTPS
echo "🚀 Starting services with HTTPS..."
docker-compose up -d

echo ""
echo "✅ HTTPS enabled successfully!"
echo ""
echo "🌐 Your site is now available at:"
echo "   https://$DOMAIN"
echo ""
echo "📋 Next steps:"
echo "   1. Update Google OAuth redirect URI:"
echo "      https://$DOMAIN/api/auth/callback/google"
echo ""
echo "   2. Test your site:"
echo "      curl -I https://$DOMAIN"
echo ""
echo "   3. Verify certificate:"
echo "      docker exec poll-nginx ls /etc/letsencrypt/live/$DOMAIN/"
echo ""
