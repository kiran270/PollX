# Deploy to EC2 with SQLite + Free Domain

This guide shows how to deploy your poll app to EC2 using the existing SQLite database and get a free domain.

## Part 1: Get a Free Domain

### Option 1: Freenom (Completely Free)

**Domains:** .tk, .ml, .ga, .cf, .gq

1. Go to https://www.freenom.com
2. Search for your desired domain name
3. Click "Get it now" and "Checkout"
4. Select "12 Months @ FREE"
5. Create account and complete registration
6. You'll get a free domain like `mypollapp.tk`

**Pros:** Completely free
**Cons:** Less professional, may have reputation issues with some services

### Option 2: Free Subdomain Services

**A. afraid.org (FreeDNS)**
- Go to https://freedns.afraid.org
- Sign up for free
- Get subdomain like `mypollapp.mooo.com`
- Many domain options available

**B. DuckDNS**
- Go to https://www.duckdns.org
- Sign in with social account
- Get subdomain like `mypollapp.duckdns.org`
- Very simple setup

**C. No-IP**
- Go to https://www.noip.com
- Free tier: 1 hostname
- Get subdomain like `mypollapp.ddns.net`

### Option 3: Student/Developer Programs (Best Quality)

**GitHub Student Developer Pack** (If you're a student)
- Go to https://education.github.com/pack
- Get free .me domain from Namecheap (1 year)
- Get $200 AWS credits
- Many other benefits

**AWS Educate** (If you're a student)
- Go to https://aws.amazon.com/education/awseducate/
- Get AWS credits

## Part 2: Deploy to EC2 with SQLite

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Name:** `poll-app-server`
3. **AMI:** Ubuntu Server 22.04 LTS
4. **Instance Type:** t2.micro (free tier)
5. **Key Pair:** Create and download
6. **Security Group:** Allow SSH (22), HTTP (80), HTTPS (443)
7. **Storage:** 8 GB (free tier)
8. Launch!

### Step 2: Get Elastic IP (Free Static IP)

1. Go to EC2 → Elastic IPs
2. Click "Allocate Elastic IP address"
3. Click "Allocate"
4. Select the new IP → Actions → Associate Elastic IP address
5. Select your instance
6. Click "Associate"
7. **Note your Elastic IP** (e.g., 54.123.45.67)

**Important:** Elastic IPs are FREE when attached to a running instance!

### Step 3: Connect to EC2

```bash
# Set permissions
chmod 400 your-key.pem

# Connect (replace with your Elastic IP)
ssh -i your-key.pem ubuntu@54.123.45.67
```

### Step 4: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### Step 5: Deploy Your Application

```bash
# Clone your repo (or upload files)
cd /home/ubuntu
git clone YOUR_REPO_URL poll-app
cd poll-app

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add this (update with your domain):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://54.123.45.67"  # Use your Elastic IP for now
NEXTAUTH_SECRET="uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs="
GOOGLE_CLIENT_ID="310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NODE_ENV="production"
```

Save: `Ctrl+X`, `Y`, `Enter`

```bash
# Setup database
npx prisma generate
npx prisma db push

# Seed database (optional)
npx tsx scripts/seed-polls.ts

# Build application
npm run build

# Start with PM2
pm2 start npm --name "poll-app" -- start

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
```

### Step 6: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/poll-app
```

Add this:
```nginx
server {
    listen 80;
    server_name 54.123.45.67;  # Your Elastic IP

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

Save and enable:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/poll-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Update Google OAuth

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth Client ID
4. Add to **Authorized JavaScript origins:**
   - `http://54.123.45.67` (your Elastic IP)
5. Add to **Authorized redirect URIs:**
   - `http://54.123.45.67/api/auth/callback/google`
6. Save

### Step 8: Test

Visit `http://54.123.45.67` - Your app should work!

## Part 3: Connect Free Domain

### For Freenom Domain

1. **Login to Freenom**
2. Go to "Services" → "My Domains"
3. Click "Manage Domain"
4. Click "Management Tools" → "Nameservers"
5. Select "Use custom nameservers"
6. Add:
   - Nameserver 1: `ns1.afraid.org`
   - Nameserver 2: `ns2.afraid.org`
   
   OR use Cloudflare (better):
   - Nameserver 1: `ava.ns.cloudflare.com`
   - Nameserver 2: `tim.ns.cloudflare.com`

7. **Setup DNS Records** (in Cloudflare or FreeDNS):
   - Type: A
   - Name: @
   - Value: Your Elastic IP (54.123.45.67)
   - TTL: Auto
   
   - Type: A
   - Name: www
   - Value: Your Elastic IP
   - TTL: Auto

### For DuckDNS

1. Go to https://www.duckdns.org
2. Sign in
3. Add domain (e.g., `mypollapp`)
4. Enter your Elastic IP in the "current ip" field
5. Click "update ip"
6. Your domain is now: `mypollapp.duckdns.org`

### For FreeDNS (afraid.org)

1. Go to https://freedns.afraid.org
2. Sign up and login
3. Click "Subdomains" → "Add"
4. Choose a domain from dropdown
5. Enter subdomain name
6. Type: A
7. Destination: Your Elastic IP
8. Click "Save"

## Part 4: Update Configuration for Domain

### 1. Update Nginx

```bash
sudo nano /etc/nginx/sites-available/poll-app
```

Change `server_name`:
```nginx
server {
    listen 80;
    server_name mypollapp.tk www.mypollapp.tk;  # Your domain
    # ... rest stays the same
}
```

Restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Update Environment Variables

```bash
cd /home/ubuntu/poll-app
nano .env.production
```

Change:
```env
NEXTAUTH_URL="http://mypollapp.tk"  # Your domain
```

Restart app:
```bash
pm2 restart poll-app
```

### 3. Update Google OAuth

Add your domain to Google Console:
- Authorized JavaScript origins: `http://mypollapp.tk`
- Authorized redirect URIs: `http://mypollapp.tk/api/auth/callback/google`

## Part 5: Add Free SSL (HTTPS)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d mypollapp.tk -d www.mypollapp.tk
```

Follow prompts:
- Enter email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

### Update Environment Variables

```bash
nano .env.production
```

Change to HTTPS:
```env
NEXTAUTH_URL="https://mypollapp.tk"
```

Restart:
```bash
pm2 restart poll-app
```

### Update Google OAuth

Change to HTTPS:
- Authorized JavaScript origins: `https://mypollapp.tk`
- Authorized redirect URIs: `https://mypollapp.tk/api/auth/callback/google`

## Part 6: Backup SQLite Database

### Create Backup Script

```bash
nano ~/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup SQLite database
cp /home/ubuntu/poll-app/prisma/dev.db $BACKUP_DIR/dev_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "dev_*.db" -mtime +7 -delete

echo "Backup completed: dev_$DATE.db"
```

Make executable:
```bash
chmod +x ~/backup-db.sh
```

### Schedule Daily Backups

```bash
crontab -e
```

Add this line (backup daily at 2 AM):
```
0 2 * * * /home/ubuntu/backup-db.sh
```

## Useful Commands

### Application Management
```bash
# View logs
pm2 logs poll-app

# Restart
pm2 restart poll-app

# Status
pm2 status

# Stop
pm2 stop poll-app
```

### Update Application
```bash
cd /home/ubuntu/poll-app
git pull
npm install
npm run build
pm2 restart poll-app
```

### Backup Database Manually
```bash
~/backup-db.sh
```

### Restore Database
```bash
cp /home/ubuntu/backups/dev_TIMESTAMP.db /home/ubuntu/poll-app/prisma/dev.db
pm2 restart poll-app
```

## Cost Breakdown

- **EC2 t2.micro:** FREE (first 12 months)
- **Elastic IP:** FREE (when attached to running instance)
- **Domain:** FREE (Freenom, DuckDNS, etc.)
- **SSL Certificate:** FREE (Let's Encrypt)
- **Total:** $0/month for first year!

After first year:
- **EC2 t2.micro:** ~$8/month
- **Everything else:** Still FREE
- **Total:** ~$8/month

## Troubleshooting

### Domain not working
- Wait 5-30 minutes for DNS propagation
- Check DNS with: `nslookup yourdomain.tk`
- Verify A record points to your Elastic IP

### SSL certificate fails
- Make sure domain is pointing to your IP first
- Wait for DNS propagation
- Try again after 30 minutes

### Database file permissions
```bash
cd /home/ubuntu/poll-app/prisma
sudo chown ubuntu:ubuntu dev.db
chmod 644 dev.db
```

### App won't start
```bash
pm2 logs poll-app  # Check logs
pm2 restart poll-app  # Restart
```

## Summary

✅ Free domain (Freenom, DuckDNS, etc.)
✅ Free EC2 hosting (first year)
✅ Free SSL certificate
✅ SQLite database (no external DB needed)
✅ Automatic backups
✅ Total cost: $0 for first year!

Your poll app is now live at: `https://yourdomain.tk` 🎉
