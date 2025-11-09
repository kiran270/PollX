# EC2 Setup Commands for pollx.duckdns.org

Complete step-by-step commands to deploy PollX on AWS EC2.

## Prerequisites

- EC2 instance running (Ubuntu 20.04/22.04 recommended)
- Security group with ports 22, 80, 443 open
- SSH key to access EC2
- Domain `pollx.duckdns.org` pointing to EC2 public IP

---

## Step 1: Connect to EC2

```bash
# From your local machine
ssh -i your-key.pem ubuntu@your-ec2-ip
# or
ssh -i your-key.pem ec2-user@your-ec2-ip  # for Amazon Linux
```

---

## Step 2: Update System & Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no need for sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
```

**Then reconnect:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

## Step 3: Install Git & Clone Repository

```bash
# Install git
sudo apt install git -y

# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository (or upload files)
# Option A: If you have a git repo
git clone https://github.com/yourusername/poll-app.git
cd poll-app

# Option B: If uploading from local machine (run from your Mac)
# scp -i your-key.pem -r poll-app ubuntu@your-ec2-ip:~/apps/
```

---

## Step 4: Create Environment File

```bash
# Create .env.local file
nano .env.local
```

**Add this content (replace with your actual values):**
```env
NEXTAUTH_URL=http://pollx.duckdns.org
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Quick HTTP Setup (Test First)

```bash
# Make sure you're in the poll-app directory
cd ~/apps/poll-app

# Start with simple HTTP setup
docker-compose -f docker-compose.simple.yml up -d

# Check if containers are running
docker ps

# Check logs
docker logs poll-nginx
docker logs poll-app

# Test locally
curl http://localhost
```

**Now test in browser:** `http://pollx.duckdns.org`

---

## Step 6: Upgrade to HTTPS (Recommended)

Once HTTP works, upgrade to HTTPS:

```bash
# Stop HTTP setup
docker-compose -f docker-compose.simple.yml down

# Run HTTPS setup script
chmod +x setup-pollx.sh
./setup-pollx.sh your@email.com

# Update environment for HTTPS
nano .env.local
# Change: NEXTAUTH_URL=https://pollx.duckdns.org

# Restart app
docker-compose restart poll-app
```

**Now access:** `https://pollx.duckdns.org`

---

## Step 7: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client
3. Add authorized redirect URI:
   - For HTTP: `http://pollx.duckdns.org/api/auth/callback/google`
   - For HTTPS: `https://pollx.duckdns.org/api/auth/callback/google`
4. Save changes

---

## Useful Commands

### Check Status
```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Check logs
docker logs poll-app
docker logs poll-nginx
docker logs -f poll-app  # Follow logs
```

### Restart Services
```bash
# Restart everything
docker-compose restart

# Restart app only
docker-compose restart poll-app

# Restart nginx only
docker-compose restart poll-nginx
```

### Stop/Start
```bash
# Stop all
docker-compose down

# Start all
docker-compose up -d

# Rebuild and start
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View Logs
```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker logs poll-app --tail 100
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Troubleshooting

### Port 80 already in use
```bash
# Check what's using port 80
sudo lsof -i :80

# If Apache is running
sudo systemctl stop apache2
sudo systemctl disable apache2

# If nginx is running
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Firewall Issues
```bash
# Check firewall status
sudo ufw status

# Allow ports
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Check EC2 Security Group
Make sure these ports are open in AWS Console:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

### SSL Certificate Issues
```bash
# Check certificate
docker exec poll-nginx ls -la /etc/letsencrypt/live/pollx.duckdns.org/

# Manually renew certificate
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### Database Issues
```bash
# Check database file
docker exec poll-app ls -la /app/prisma/

# Run migrations
docker exec poll-app npx prisma migrate deploy

# Seed database
docker exec poll-app npm run seed
```

### Container Won't Start
```bash
# Check logs for errors
docker logs poll-app
docker logs poll-nginx

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

---

## File Upload from Local Machine

If you need to upload files from your Mac to EC2:

```bash
# Upload entire directory
scp -i your-key.pem -r poll-app ubuntu@your-ec2-ip:~/apps/

# Upload single file
scp -i your-key.pem .env.local ubuntu@your-ec2-ip:~/apps/poll-app/

# Upload using rsync (better for updates)
rsync -avz -e "ssh -i your-key.pem" poll-app/ ubuntu@your-ec2-ip:~/apps/poll-app/
```

---

## Monitoring

### Check Resource Usage
```bash
# CPU and Memory
docker stats

# Disk usage
df -h
docker system df
```

### Auto-restart on Reboot
Containers are already configured with `restart: unless-stopped`, so they'll auto-start after EC2 reboot.

---

## Complete Setup Script

Save this as `ec2-setup.sh` and run it:

```bash
#!/bin/bash

echo "🚀 PollX EC2 Setup"
echo "=================="

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📦 Installing Git..."
sudo apt install git -y

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Log out and back in: exit"
echo "2. Clone your repo: git clone <your-repo>"
echo "3. Create .env.local file"
echo "4. Run: docker-compose -f docker-compose.simple.yml up -d"
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `docker ps` | List running containers |
| `docker logs poll-app` | View app logs |
| `docker-compose restart` | Restart all services |
| `docker-compose down` | Stop all services |
| `docker-compose up -d` | Start all services |
| `curl http://localhost` | Test locally |

---

## Success Checklist

- [ ] EC2 instance running
- [ ] Ports 22, 80, 443 open in security group
- [ ] Docker and Docker Compose installed
- [ ] Code uploaded to EC2
- [ ] .env.local file created with correct values
- [ ] Containers running (`docker ps`)
- [ ] Site accessible at http://pollx.duckdns.org
- [ ] Google OAuth configured
- [ ] SSL certificate obtained (optional)
- [ ] Site accessible at https://pollx.duckdns.org

---

## Need Help?

- Check logs: `docker logs poll-app`
- Test locally: `curl http://localhost`
- Verify DNS: `ping pollx.duckdns.org`
- Check ports: `sudo lsof -i :80`
