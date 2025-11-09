# AWS EC2 Deployment Guide

## Prerequisites
- AWS Account
- Domain name (optional but recommended)
- Basic terminal/SSH knowledge

## Part 1: Launch EC2 Instance

### 1. Create EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Name**: `poll-app-server`
3. **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance Type**: t2.micro (Free tier) or t2.small (recommended for production)
5. **Key Pair**: Create new key pair
   - Name: `poll-app-key`
   - Type: RSA
   - Format: .pem
   - Download and save securely
6. **Network Settings**:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
7. **Storage**: 8-20 GB (default is fine)
8. Click **Launch Instance**

### 2. Connect to EC2 Instance

```bash
# Set permissions for key file
chmod 400 poll-app-key.pem

# Connect to instance (replace with your instance IP)
ssh -i poll-app-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## Part 2: Server Setup

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js (v18 or higher)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE pollapp;
CREATE USER polluser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pollapp TO polluser;
\q
EOF
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Part 3: Deploy Application

### 1. Clone or Upload Your Code

**Option A: Using Git (Recommended)**
```bash
# Install git
sudo apt install -y git

# Clone your repository
cd /home/ubuntu
git clone YOUR_REPO_URL poll-app
cd poll-app
```

**Option B: Upload via SCP**
```bash
# From your local machine
scp -i poll-app-key.pem -r poll-app ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

### 2. Install Dependencies

```bash
cd /home/ubuntu/poll-app
npm install
```

### 3. Create Production Environment File

```bash
nano .env.production
```

Add the following (update values):
```env
# Database - Local PostgreSQL
DATABASE_URL="postgresql://polluser:your_secure_password@localhost:5432/pollapp"

# NextAuth - Use your domain or EC2 IP
NEXTAUTH_URL="http://YOUR_EC2_PUBLIC_IP"
# Or if you have a domain:
# NEXTAUTH_URL="https://yourdomain.com"

NEXTAUTH_SECRET="uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs="

# Google OAuth
GOOGLE_CLIENT_ID="310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

NODE_ENV="production"
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 4. Update Prisma Schema for PostgreSQL

```bash
nano prisma/schema.prisma
```

Change the datasource:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 5. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (optional)
npx tsx scripts/seed-polls.ts
```

### 6. Build Application

```bash
npm run build
```

### 7. Start with PM2

```bash
# Start the app
pm2 start npm --name "poll-app" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

## Part 4: Configure Nginx

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/poll-app
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Or your domain name

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/poll-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Part 5: Update Google OAuth

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   - `http://YOUR_EC2_PUBLIC_IP`
   - Or: `https://yourdomain.com`
6. Add to **Authorized redirect URIs**:
   - `http://YOUR_EC2_PUBLIC_IP/api/auth/callback/google`
   - Or: `https://yourdomain.com/api/auth/callback/google`
7. Click **Save**

## Part 6: Setup SSL (HTTPS) with Let's Encrypt

### 1. Point Domain to EC2

If you have a domain:
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add an A record pointing to your EC2 public IP
3. Wait for DNS propagation (5-30 minutes)

### 2. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Get SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

### 4. Update Environment Variable

```bash
nano .env.production
```

Change:
```env
NEXTAUTH_URL="https://yourdomain.com"
```

### 5. Restart Application

```bash
pm2 restart poll-app
```

### 6. Auto-Renew SSL

Certbot automatically sets up renewal. Test it:
```bash
sudo certbot renew --dry-run
```

## Part 7: Useful Commands

### Application Management
```bash
# View logs
pm2 logs poll-app

# Restart app
pm2 restart poll-app

# Stop app
pm2 stop poll-app

# View status
pm2 status

# Monitor
pm2 monit
```

### Database Management
```bash
# Access PostgreSQL
sudo -u postgres psql -d pollapp

# Backup database
pg_dump -U polluser pollapp > backup.sql

# Restore database
psql -U polluser pollapp < backup.sql
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Update Application
```bash
cd /home/ubuntu/poll-app

# Pull latest code
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart poll-app
```

## Part 8: Security Best Practices

### 1. Setup Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Secure PostgreSQL

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Ensure local connections only:
```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

### 3. Regular Updates

```bash
# Create update script
nano ~/update.sh
```

Add:
```bash
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

Make executable:
```bash
chmod +x ~/update.sh
```

### 4. Setup Automatic Backups

```bash
# Create backup script
nano ~/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U polluser pollapp > $BACKUP_DIR/pollapp_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "pollapp_*.sql" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /home/ubuntu/backup.sh
```

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs poll-app

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart
pm2 restart poll-app
```

### Database connection errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U polluser -d pollapp -h localhost
```

### Nginx errors
```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Cost Estimation

- **t2.micro** (Free tier): $0/month for first year, then ~$8/month
- **t2.small**: ~$17/month
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$8-17/month after free tier

## Alternative: Use Elastic IP

To keep a permanent IP address:
1. Go to EC2 → Elastic IPs
2. Allocate new address
3. Associate with your instance
4. Update DNS and OAuth settings with new IP

**Note**: Elastic IPs are free when associated with a running instance, but cost $0.005/hour when not in use.
