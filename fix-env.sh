#!/bin/bash

# Fix environment variables for EC2 deployment

echo "🔧 Fixing Environment Variables"
echo "==============================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "📝 Creating .env file..."
    
    # Copy from .env.production if it exists
    if [ -f .env.production ]; then
        cp .env.production .env
        echo "✅ Created .env from .env.production"
    elif [ -f .env.local ]; then
        cp .env.local .env
        echo "✅ Created .env from .env.local"
    else
        echo "❌ No environment file found!"
        echo ""
        echo "Please create .env file with:"
        echo ""
        cat << 'EOF'
NEXTAUTH_URL=http://pollx.duckdns.org
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
EOF
        exit 1
    fi
fi

echo ""
echo "📋 Current .env contents:"
echo "------------------------"
cat .env | grep -v "SECRET"
echo "NEXTAUTH_SECRET=***hidden***"
echo "GOOGLE_CLIENT_SECRET=***hidden***"
echo ""

# Restart containers
echo "🔄 Restarting containers..."
docker-compose down
docker-compose -f docker-compose.simple.yml up -d

echo ""
echo "✅ Done!"
echo ""
echo "Check logs:"
echo "  docker logs poll-app"
echo ""
echo "Test:"
echo "  curl http://localhost"
echo ""
