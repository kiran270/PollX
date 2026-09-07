#!/bin/bash

echo "🐳 Starting Poll App with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your configuration"
    echo "   Then run this script again"
    exit 0
fi

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for container to be ready..."
sleep 5

# Check if container is running
if [ "$(docker-compose ps -q poll-app)" ]; then
    echo "✅ Container is running!"
    
    echo ""
    echo "🗄️  Setting up database..."
    docker-compose exec -T poll-app npx prisma db push
    
    echo ""
    read -p "Do you want to seed the database with sample polls? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        docker-compose exec -T poll-app npx tsx scripts/seed-polls.ts
    fi
    
    echo ""
    echo "✅ Poll App is ready!"
    echo ""
    echo "🌐 Access your app at: http://localhost:3000"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop app:     docker-compose down"
    echo "   Restart app:  docker-compose restart"
    echo ""
else
    echo "❌ Failed to start container"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
