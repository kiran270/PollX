#!/bin/bash

# PollX DuckDNS Setup Script
# Domain: pollx.duckdns.org

echo "🚀 PollX Setup for pollx.duckdns.org"
echo "====================================="
echo ""

DOMAIN="pollx.duckdns.org"

# Check if email is provided
if [ -z "$1" ]; then
    echo "❌ Error: Email is required for Let's Encrypt"
    echo "Usage: ./setup-pollx.sh your@email.com"
    exit 1
fi

EMAIL=$1

echo "📝 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down
echo ""

# Create temporary nginx config for initial certificate
echo "📝 Creating temporary nginx config for certificate generation..."
cat > nginx-temp.conf << 'EOF'
server {
    listen 80;
    server_name pollx.duckdns.org;

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
EOF

# Backup original nginx.conf
cp nginx.conf nginx.conf.ssl

# Use temporary config
cat > docker-compose-temp.yml << 'EOF'
version: '3.8'

services:
  poll-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: poll-app
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://pollx.duckdns.org}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NODE_ENV=production
    volumes:
      - poll-data:/app/prisma
    networks:
      - poll-network

  nginx:
    image: nginx:alpine
    container_name: poll-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-temp.conf:/etc/nginx/conf.d/default.conf:ro
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - certbot-www:/var/www/certbot
    depends_on:
      - poll-app
    networks:
      - poll-network

volumes:
  poll-data:
    driver: local
  certbot-etc:
    driver: local
  certbot-var:
    driver: local
  certbot-www:
    driver: local

networks:
  poll-network:
    driver: bridge
EOF

echo "🚀 Starting services with temporary config..."
docker-compose -f docker-compose-temp.yml up -d
sleep 10

echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
docker run --rm \
    -v "$(pwd)/certbot-etc:/etc/letsencrypt" \
    -v "$(pwd)/certbot-var:/var/lib/letsencrypt" \
    -v "$(pwd)/certbot-www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
    echo ""
    
    # Update docker-compose.yml to use SSL config
    echo "📝 Updating docker-compose.yml for SSL..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  poll-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: poll-app
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - NEXTAUTH_URL=https://pollx.duckdns.org
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NODE_ENV=production
    volumes:
      - poll-data:/app/prisma
    networks:
      - poll-network

  nginx:
    image: nginx:alpine
    container_name: poll-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot-etc:/etc/letsencrypt:ro
      - certbot-var:/var/lib/letsencrypt
      - certbot-www:/var/www/certbot
    depends_on:
      - poll-app
    networks:
      - poll-network

  certbot:
    image: certbot/certbot
    container_name: poll-certbot
    volumes:
      - ./certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - certbot-www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  poll-data:
    driver: local
  certbot-etc:
    driver: local
  certbot-var:
    driver: local
  certbot-www:
    driver: local

networks:
  poll-network:
    driver: bridge
EOF
    
    echo "🔄 Restarting services with SSL..."
    docker-compose -f docker-compose-temp.yml down
    docker-compose up -d
    
    # Cleanup
    rm nginx-temp.conf docker-compose-temp.yml
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🌐 Your site is now available at:"
    echo "   https://pollx.duckdns.org"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update your .env.local:"
    echo "      NEXTAUTH_URL=https://pollx.duckdns.org"
    echo ""
    echo "   2. Update Google OAuth redirect URIs:"
    echo "      https://pollx.duckdns.org/api/auth/callback/google"
    echo ""
    echo "   3. Restart the app:"
    echo "      docker-compose restart poll-app"
    echo ""
else
    echo "❌ Failed to obtain SSL certificate"
    echo ""
    echo "Please check:"
    echo "   1. Domain pollx.duckdns.org is pointing to this server"
    echo "   2. Ports 80 and 443 are open"
    echo "   3. Domain is accessible from the internet"
    echo ""
    echo "You can test with HTTP-only setup instead:"
    echo "   docker-compose -f docker-compose.simple.yml up -d"
    exit 1
fi
