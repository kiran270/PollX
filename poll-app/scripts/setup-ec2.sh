#!/bin/bash

# Initial EC2 Setup Script
# Run this script on a fresh Ubuntu EC2 instance

echo "🔧 Starting EC2 setup..."

# Update system
echo "📦 Updating system..."
sudo apt update
sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "🗄️  Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Setup firewall
echo "🔒 Setting up firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL database and user"
echo "2. Clone your application"
echo "3. Configure environment variables"
echo "4. Build and start the application"
echo ""
echo "See AWS_EC2_DEPLOYMENT.md for detailed instructions"
