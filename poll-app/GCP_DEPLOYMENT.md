# Deploy to Google Cloud Platform (GCP)

This guide shows how to deploy your poll app to GCP using Compute Engine with SQLite database.

## Why GCP?

- **$300 free credits** for 90 days (new accounts)
- **Always Free tier** after credits expire
- **e2-micro instance** free (1 per account)
- Integrates well with Google OAuth (same account)

## Part 1: Setup GCP Account

### 1. Create GCP Account

1. Go to https://cloud.google.com/
2. Click "Get started for free"
3. Sign in with Google account (same one you use for OAuth)
4. Enter billing information (required but won't be charged)
5. Get **$300 free credits** for 90 days

### 2. Create New Project

1. Go to https://console.cloud.google.com/
2. Click project dropdown (top left)
3. Click "New Project"
4. Name: `poll-app`
5. Click "Create"
6. Select the new project

## Part 2: Create VM Instance

### 1. Enable Compute Engine API

1. Go to "Compute Engine" → "VM instances"
2. Click "Enable" if prompted
3. Wait 2-3 minutes for API to enable

### 2. Create VM Instance

1. Click "Create Instance"

**Configuration:**

**Name:** `poll-app-server`

**Region:** Choose closest to you
- `us-central1` (Iowa) - Free tier eligible
- `us-west1` (Oregon) - Free tier eligible
- `us-east1` (South Carolina) - Free tier eligible

**Zone:** Any (e.g., `us-central1-a`)

**Machine configuration:**
- Series: E2
- Machine type: **e2-micro** (Free tier: 0.25-1 vCPU, 1 GB memory)

**Boot disk:**
- Click "Change"
- Operating system: **Ubuntu**
- Version: **Ubuntu 22.04 LTS**
- Boot disk type: **Standard persistent disk**
- Size: **30 GB** (Free tier includes 30 GB)
- Click "Select"

**Firewall:**
- ✅ Allow HTTP traffic
- ✅ Allow HTTPS traffic

**Advanced options → Networking:**
- Click "Network interfaces"
- External IPv4 address: Click dropdown
- Select "Create IP address"
- Name: `poll-app-ip`
- Click "Reserve"

3. Click **"Create"**
4. Wait 1-2 minutes for instance to start
5. **Note your External IP** (e.g., 34.123.45.67)

## Part 3: Connect to VM

### Option A: Browser SSH (Easiest)

1. Go to "Compute Engine" → "VM instances"
2. Click "SSH" button next to your instance
3. Browser window opens with terminal

### Option B: Local Terminal (Mac/Linux)

1. Go to "Compute Engine" → "Metadata" → "SSH Keys"
2. Click "Add SSH Key"
3. Generate key locally:
```bash
ssh-keygen -t rsa -f ~/.ssh/gcp-poll-app -C "your-email@gmail.com"
cat ~/.ssh/gcp-poll-app.pub
```
4. Copy the output and paste in GCP
5. Connect:
```bash
ssh -i ~/.ssh/gcp-poll-app your-username@EXTERNAL_IP
```

### Option C: gcloud CLI

```bash
# Install gcloud CLI
# Mac: brew install google-cloud-sdk
# Or: https://cloud.google.com/sdk/docs/install

# Initialize
gcloud init

# Connect
gcloud compute ssh poll-app-server --zone=us-central1-a
```

## Part 4: Setup Server

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js 20

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 3. Install PM2

```bash
sudo npm install -g pm2
```

### 4. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install Git

```bash
sudo apt install -y git
```

### 6. Configure Firewall

```bash
# GCP uses its own firewall, but we'll also setup ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Part 5: Deploy Application

### 1. Clone Your Code

```bash
cd ~
git clone YOUR_REPO_URL poll-app
cd poll-app
```

Or upload via SCP:
```bash
# From your local machine
gcloud compute scp --recurse poll-app poll-app-server:~ --zone=us-central1-a
```

### 2. Install Dependencies

```bash
cd ~/poll-app
npm install
```

### 3. Create Environment File

```bash
nano .env.production
```

Add (replace EXTERNAL_IP with your VM's IP):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://EXTERNAL_IP"
NEXTAUTH_SECRET="uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs="
GOOGLE_CLIENT_ID="310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NODE_ENV="production"
```

Save: `Ctrl+X`, `Y`, `Enter`

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema
npx prisma db push

# Seed database (optional)
npx tsx scripts/seed-polls.ts
```

### 5. Build Application

```bash
npm run build
```

### 6. Start with PM2

```bash
# Start app
pm2 start npm --name "poll-app" -- start

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs (starts with sudo)
```

## Part 6: Configure Nginx

### 1. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/poll-app
```

Add:
```nginx
server {
    listen 80;
    server_name EXTERNAL_IP;  # Your VM's external IP

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

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Part 7: Update Google OAuth

Since you're using the same Google account for GCP and OAuth, this is easy!

1. Go to https://console.cloud.google.com/
2. Make sure you're in the **same project** as your OAuth credentials
3. Go to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID

**Add to Authorized JavaScript origins:**
- `http://EXTERNAL_IP` (your VM's IP)

**Add to Authorized redirect URIs:**
- `http://EXTERNAL_IP/api/auth/callback/google`

5. Click "Save"

## Part 8: Test Your App

Visit: `http://EXTERNAL_IP`

Your poll app should be live! 🎉

## Part 9: Add Custom Domain (Optional)

### 1. Get Free Domain

Use any from the free domain guide:
- Freenom: https://www.freenom.com
- DuckDNS: https://www.duckdns.org
- FreeDNS: https://freedns.afraid.org

### 2. Point Domain to GCP IP

Add DNS A record:
- Type: A
- Name: @ (or your subdomain)
- Value: Your GCP External IP
- TTL: 3600

### 3. Update Nginx

```bash
sudo nano /etc/nginx/sites-available/poll-app
```

Change `server_name`:
```nginx
server_name yourdomain.tk www.yourdomain.tk;
```

Restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Update Environment

```bash
cd ~/poll-app
nano .env.production
```

Change:
```env
NEXTAUTH_URL="http://yourdomain.tk"
```

Restart:
```bash
pm2 restart poll-app
```

### 5. Update Google OAuth

Add domain to OAuth credentials:
- Authorized JavaScript origins: `http://yourdomain.tk`
- Authorized redirect URIs: `http://yourdomain.tk/api/auth/callback/google`

## Part 10: Add Free SSL (HTTPS)

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Get SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.tk -d www.yourdomain.tk
```

Follow prompts:
- Enter email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

### 3. Update Environment

```bash
nano .env.production
```

Change to HTTPS:
```env
NEXTAUTH_URL="https://yourdomain.tk"
```

Restart:
```bash
pm2 restart poll-app
```

### 4. Update Google OAuth

Change to HTTPS:
- Authorized JavaScript origins: `https://yourdomain.tk`
- Authorized redirect URIs: `https://yourdomain.tk/api/auth/callback/google`

### 5. Auto-Renewal

Certbot automatically sets up renewal. Test it:
```bash
sudo certbot renew --dry-run
```

## Part 11: Backup & Monitoring

### 1. Create Backup Script

```bash
nano ~/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup SQLite database
cp ~/poll-app/prisma/dev.db $BACKUP_DIR/dev_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "dev_*.db" -mtime +7 -delete

echo "Backup completed: dev_$DATE.db"
```

Make executable:
```bash
chmod +x ~/backup.sh
```

### 2. Schedule Backups

```bash
crontab -e
```

Add (daily at 2 AM):
```
0 2 * * * /home/YOUR_USERNAME/backup.sh
```

### 3. Setup GCP Monitoring (Optional)

1. Go to "Monitoring" in GCP Console
2. Create workspace
3. Add VM instance to monitoring
4. Set up alerts for:
   - CPU usage > 80%
   - Disk usage > 80%
   - Instance down

## Useful Commands

### Application Management

```bash
# View logs
pm2 logs poll-app

# Restart
pm2 restart poll-app

# Stop
pm2 stop poll-app

# Status
pm2 status

# Monitor
pm2 monit
```

### Update Application

```bash
cd ~/poll-app
git pull
npm install
npm run build
pm2 restart poll-app
```

### Nginx Management

```bash
# Test config
sudo nginx -t

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Database Backup

```bash
# Manual backup
~/backup.sh

# Restore
cp ~/backups/dev_TIMESTAMP.db ~/poll-app/prisma/dev.db
pm2 restart poll-app
```

### VM Management

```bash
# Stop VM (from GCP Console or gcloud)
gcloud compute instances stop poll-app-server --zone=us-central1-a

# Start VM
gcloud compute instances start poll-app-server --zone=us-central1-a

# SSH into VM
gcloud compute ssh poll-app-server --zone=us-central1-a
```

## Cost Breakdown

### Free Tier (Always Free)

- **e2-micro instance:** 1 per account (US regions only)
  - 0.25-1 vCPU
  - 1 GB memory
  - 30 GB standard persistent disk
- **Network egress:** 1 GB/month (North America)
- **Static IP:** Free when attached to running instance

### After Free Credits ($300/90 days)

If you stay within Always Free limits: **$0/month**

If you exceed:
- **e2-micro:** ~$7/month (if not in free tier region)
- **30 GB disk:** ~$1.20/month
- **Network egress:** ~$0.12/GB after 1 GB
- **Static IP:** $0 (when attached)

**Total:** $0-8/month depending on usage

## GCP vs AWS vs Vercel

| Feature | GCP | AWS | Vercel |
|---------|-----|-----|--------|
| Free tier | $300 credits + Always Free | 12 months free | Free hobby plan |
| VM instance | e2-micro (always free) | t2.micro (12 months) | N/A |
| Database | SQLite on VM | SQLite on EC2 | Need external DB |
| Setup | Medium | Medium | Easy |
| Best for | Long-term free hosting | First year free | Quick deployment |

## Troubleshooting

### Can't connect to VM

```bash
# Check firewall rules
gcloud compute firewall-rules list

# Create HTTP/HTTPS rules if missing
gcloud compute firewall-rules create allow-http --allow tcp:80
gcloud compute firewall-rules create allow-https --allow tcp:443
```

### App not accessible

```bash
# Check if app is running
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check if port 3000 is listening
sudo lsof -i :3000
```

### Database permission errors

```bash
cd ~/poll-app/prisma
chmod 644 dev.db
```

### Out of memory

```bash
# Add swap space (for e2-micro with 1GB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### SSL certificate fails

- Ensure domain points to your IP
- Wait 5-30 minutes for DNS propagation
- Check with: `nslookup yourdomain.tk`

## Security Best Practices

### 1. Change SSH Port (Optional)

```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222/tcp
```

### 2. Setup Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
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

### 4. Enable GCP Security Features

1. Go to "Security" → "Security Command Center"
2. Enable security health analytics
3. Review and fix security findings

## Advanced: Auto-Scaling (Optional)

If your app grows, you can setup auto-scaling:

1. Create instance template from your VM
2. Create instance group
3. Setup load balancer
4. Configure auto-scaling policies

## Summary

✅ **$300 free credits** for 90 days
✅ **Always Free e2-micro** instance
✅ **SQLite database** (no external DB needed)
✅ **Free SSL** with Let's Encrypt
✅ **Static IP** included
✅ **Integrates with Google OAuth** seamlessly

Your poll app is now live on GCP! 🎉

**Next Steps:**
1. Add custom domain
2. Setup SSL
3. Configure backups
4. Monitor performance
5. Share your app!
