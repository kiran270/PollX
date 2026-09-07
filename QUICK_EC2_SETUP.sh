#!/bin/bash

# Quick EC2 Setup Script for PollX
# Run this on your EC2 instance

set -e

echo "🚀 PollX EC2 Quick Setup"
echo "========================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "❌ Please don't run as root. Run as ubuntu or ec2-user"
   exit 1
fi

# Update system
echo "📦 Step 1/6: Updating system..."
sudo apt update -qq && sudo apt upgrade -y -qq

# Install Docker
echo "🐳 Step 2/6: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "📦 Step 3/6: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Install Git
echo "📦 Step 4/6: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y -qq
    echo "✅ Git installed"
else
    echo "✅ Git already installed"
fi

# Configure firewall
echo "🔥 Step 5/6: Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo "✅ Firewall configured"
fi

# Stop conflicting services
echo "🛑 Step 6/6: Stopping conflicting services..."
if systemctl is-active --quiet apache2; then
    sudo systemctl stop apache2
    sudo systemctl disable apache2
    echo "✅ Stopped Apache"
fi

if systemctl is-active --quiet nginx; then
    sudo systemctl stop nginx
    sudo systemctl disable nginx
    echo "✅ Stopped system Nginx"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Log out and back in for Docker group to take effect:"
echo "   exit"
echo ""
echo "2. Upload your poll-app folder to EC2 (from your Mac):"
echo "   scp -i your-key.pem -r poll-app ubuntu@$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):~/"
echo ""
echo "3. SSH back in and navigate to the app:"
echo "   cd ~/poll-app"
echo ""
echo "4. Create .env.local file:"
echo "   nano .env.local"
echo ""
echo "5. Start the application:"
echo "   docker-compose -f docker-compose.simple.yml up -d"
echo ""
echo "6. Check status:"
echo "   docker ps"
echo ""
echo "7. Access your site:"
echo "   http://pollx.duckdns.org"
echo ""
