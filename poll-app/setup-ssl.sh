#!/bin/bash

# SSL Setup Script for PollX
# This script sets up Nginx with Let's Encrypt SSL certificates

echo "🔐 PollX SSL Setup Script"
echo "=========================="
echo ""

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Error: Domain name is required"
    echo "Usage: ./setup-ssl.sh yourdomain.com your@email.com"
    exit 1
fi

if [ -z "$2" ]; then
    echo "❌ Error: Email is required for Let's Encrypt"
    echo "Usage: ./setup-ssl.sh yourdomain.com your@email.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "📝 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Update nginx.conf with actual domain
echo "📝 Updating nginx.conf with your domain..."
sed -i.bak "s/yourdomain.com/$DOMAIN/g" nginx.conf
echo "✅ nginx.conf updated"
echo ""

# Create temporary nginx config for initial certificate
echo "📝 Creating temporary nginx config for certificate generation..."
cat > nginx-temp.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# Backup original nginx.conf
cp nginx.conf nginx.conf.ssl
cp nginx-temp.conf nginx.conf

echo "🚀 Starting services with temporary config..."
docker-compose up -d nginx
sleep 5

echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
    echo ""
    
    # Restore SSL-enabled nginx config
    echo "📝 Restoring SSL-enabled nginx config..."
    cp nginx.conf.ssl nginx.conf
    rm nginx-temp.conf nginx.conf.ssl
    
    echo "🔄 Restarting services with SSL..."
    docker-compose down
    docker-compose up -d
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🌐 Your site is now available at:"
    echo "   https://$DOMAIN"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update your NEXTAUTH_URL in .env.local to https://$DOMAIN"
    echo "   2. Update Google OAuth redirect URIs to https://$DOMAIN/api/auth/callback/google"
    echo "   3. Restart the app: docker-compose restart poll-app"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Please check:"
    echo "   1. Domain DNS is pointing to this server"
    echo "   2. Ports 80 and 443 are open"
    echo "   3. Domain is accessible from the internet"
    exit 1
fi
