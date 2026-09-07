#!/bin/bash

# EC2 Deployment Script
# Run this on your EC2 instance after initial setup

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /home/ubuntu/poll-app || exit

# Pull latest changes (if using git)
echo "📥 Pulling latest code..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma db push

# Restart application
echo "♻️  Restarting application..."
pm2 restart poll-app

echo "✅ Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs poll-app"
