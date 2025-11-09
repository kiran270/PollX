# DuckDNS Setup Guide - Step by Step

Complete guide to get your free domain `yourapp.duckdns.org` in 2 minutes!

## What is DuckDNS?

DuckDNS is a free dynamic DNS service that gives you:
- Free subdomain: `yourname.duckdns.org`
- Forever free (no renewal needed)
- Easy to setup
- Works with any server (AWS, GCP, your own server)
- Auto-update IP support

## Step 1: Create DuckDNS Account

### 1. Go to DuckDNS Website

Visit: **https://www.duckdns.org**

### 2. Sign In

Click on one of the sign-in options:
- **Google** (Recommended - use same account as your Google OAuth!)
- GitHub
- Reddit
- Twitter
- Persona

**Tip:** Use Google sign-in with the same account you use for Google OAuth - makes everything easier!

### 3. Authorize

- Click "Allow" to authorize DuckDNS
- You'll be redirected back to DuckDNS dashboard

## Step 2: Create Your Subdomain

### 1. Enter Your Desired Name

In the "sub domain" field, enter your app name:
```
mypollapp
```

Or any name you want:
```
pollvote
awesomepolls
quickpoll
votingapp
```

**Note:** Only letters, numbers, and hyphens allowed. No spaces or special characters.

### 2. Click "add domain"

Your domain is created instantly!

Your full domain will be: `mypollapp.duckdns.org`

## Step 3: Point Domain to Your Server

### 1. Get Your Server IP

**If using AWS EC2:**
- Go to EC2 Console → Instances
- Find your "Public IPv4 address" or "Elastic IP"
- Example: `54.123.45.67`

**If using GCP:**
- Go to Compute Engine → VM instances
- Find your "External IP"
- Example: `34.123.45.67`

**If using your own server:**
- Run: `curl ifconfig.me`
- Or check your hosting provider dashboard

### 2. Update IP in DuckDNS

Back on DuckDNS dashboard:

1. Find your domain in the list
2. In the "current ip" field, enter your server IP
   ```
   54.123.45.67
   ```
3. Click **"update ip"**

You'll see a green "OK" message!

### 3. Verify Domain

Your domain `mypollapp.duckdns.org` now points to your server!

**Test it:**
```bash
# On your computer
nslookup mypollapp.duckdns.org

# Or
ping mypollapp.duckdns.org
```

You should see your server IP!

## Step 4: Configure Your Server

### 1. Update Environment Variables

SSH into your server and update your app's environment file:

```bash
# Connect to your server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Navigate to your app
cd ~/poll-app

# Edit environment file
nano .env.production
```

Update `NEXTAUTH_URL`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://mypollapp.duckdns.org"
NEXTAUTH_SECRET="uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs="
GOOGLE_CLIENT_ID="310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NODE_ENV="production"
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 2. Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/poll-app
```

Update `server_name`:
```nginx
server {
    listen 80;
    server_name mypollapp.duckdns.org;  # Your DuckDNS domain

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

Save and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Restart Your Application

```bash
pm2 restart poll-app
```

## Step 5: Update Google OAuth

### 1. Go to Google Cloud Console

Visit: **https://console.cloud.google.com/**

### 2. Navigate to Credentials

1. Select your project (top left dropdown)
2. Click "APIs & Services" in left menu
3. Click "Credentials"
4. Find your OAuth 2.0 Client ID
5. Click on it to edit

### 3. Add Authorized JavaScript Origins

Scroll to "Authorized JavaScript origins"

Click "ADD URI" and add:
```
http://mypollapp.duckdns.org
```

**Keep your localhost for development:**
```
http://localhost:3000
```

### 4. Add Authorized Redirect URIs

Scroll to "Authorized redirect URIs"

Click "ADD URI" and add:
```
http://mypollapp.duckdns.org/api/auth/callback/google
```

**Keep your localhost for development:**
```
http://localhost:3000/api/auth/callback/google
```

### 5. Save Changes

Click **"SAVE"** at the bottom

**Important:** Changes may take 5-10 minutes to propagate!

## Step 6: Test Your App

### 1. Visit Your Domain

Open browser and go to:
```
http://mypollapp.duckdns.org
```

You should see your poll app! 🎉

### 2. Test Google Sign In

1. Click "Sign In" in the sidebar
2. Sign in with Google
3. Should work perfectly!

### 3. Test Creating Polls

If you're an admin:
1. Go to "Create Poll"
2. Create a test poll
3. Vote on it

Everything should work!

## Step 7: Add HTTPS (SSL Certificate)

Make your site secure with free SSL from Let's Encrypt!

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Get SSL Certificate

```bash
sudo certbot --nginx -d mypollapp.duckdns.org
```

Follow the prompts:
1. Enter your email address
2. Agree to Terms of Service (Y)
3. Share email with EFF (optional - Y or N)
4. Choose option 2: Redirect HTTP to HTTPS (recommended)

### 3. Update Environment Variables

```bash
nano .env.production
```

Change to HTTPS:
```env
NEXTAUTH_URL="https://mypollapp.duckdns.org"
```

Save and restart:
```bash
pm2 restart poll-app
```

### 4. Update Google OAuth

Go back to Google Console and update to HTTPS:

**Authorized JavaScript origins:**
```
https://mypollapp.duckdns.org
```

**Authorized redirect URIs:**
```
https://mypollapp.duckdns.org/api/auth/callback/google
```

Click "SAVE"

### 5. Test HTTPS

Visit:
```
https://mypollapp.duckdns.org
```

You should see a padlock 🔒 in the browser!

### 6. Auto-Renewal

Certbot automatically sets up renewal. Test it:
```bash
sudo certbot renew --dry-run
```

If successful, your SSL will auto-renew every 90 days!

## Bonus: Auto-Update IP (Optional)

If your server IP changes (dynamic IP), setup auto-update:

### 1. Get Your Token

On DuckDNS dashboard, you'll see your token at the top:
```
token: 12345678-1234-1234-1234-123456789abc
```

Copy this token!

### 2. Create Update Script

```bash
nano ~/duckdns-update.sh
```

Add (replace TOKEN and DOMAIN):
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=mypollapp&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns.log -K -
```

Make executable:
```bash
chmod +x ~/duckdns-update.sh
```

### 3. Test Script

```bash
~/duckdns-update.sh
cat ~/duckdns.log
```

Should show: `OK`

### 4. Schedule Auto-Update

```bash
crontab -e
```

Add this line (updates every 5 minutes):
```
*/5 * * * * ~/duckdns-update.sh
```

Save and exit.

Now your DuckDNS domain will always point to your current IP!

## Complete Configuration Summary

After setup, you should have:

**DuckDNS:**
- ✅ Domain: `mypollapp.duckdns.org`
- ✅ Points to your server IP

**Server:**
- ✅ Nginx configured with your domain
- ✅ App running on port 3000
- ✅ Environment variables updated

**Google OAuth:**
- ✅ Authorized origins added
- ✅ Redirect URIs added

**SSL (Optional but recommended):**
- ✅ HTTPS enabled
- ✅ Auto-renewal configured

## Troubleshooting

### Domain not resolving

**Check DNS:**
```bash
nslookup mypollapp.duckdns.org
```

**If not working:**
1. Wait 2-5 minutes (DNS propagation)
2. Check IP is correct in DuckDNS dashboard
3. Try updating IP again

### Google OAuth error: "redirect_uri_mismatch"

**Fix:**
1. Double-check redirect URI in Google Console
2. Make sure it matches exactly: `http://mypollapp.duckdns.org/api/auth/callback/google`
3. Check for typos
4. Wait 5-10 minutes after saving in Google Console

### SSL certificate fails

**Common causes:**
1. Domain not resolving yet → Wait 5-10 minutes
2. Ports 80/443 not open → Check firewall
3. Nginx not running → `sudo systemctl status nginx`

**Solution:**
```bash
# Check domain resolves first
nslookup mypollapp.duckdns.org

# Then try SSL again
sudo certbot --nginx -d mypollapp.duckdns.org
```

### App not loading

**Check app is running:**
```bash
pm2 status
pm2 logs poll-app
```

**Check Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Check if port 3000 is listening:**
```bash
sudo lsof -i :3000
```

## Quick Reference Commands

```bash
# Update DuckDNS IP manually
curl "https://www.duckdns.org/update?domains=mypollapp&token=YOUR_TOKEN&ip="

# Check DNS
nslookup mypollapp.duckdns.org

# Restart app
pm2 restart poll-app

# Restart Nginx
sudo systemctl restart nginx

# View app logs
pm2 logs poll-app

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test SSL renewal
sudo certbot renew --dry-run
```

## What's Next?

Now that your app is live with a domain:

1. ✅ Share your app: `https://mypollapp.duckdns.org`
2. ✅ Create some polls
3. ✅ Invite friends to vote
4. ✅ Monitor with `pm2 monit`
5. ✅ Setup backups (see deployment guides)

## Cost

**Total cost: $0** 🎉

- DuckDNS: Free forever
- SSL Certificate: Free (Let's Encrypt)
- Server: Free tier (AWS/GCP first year)

## Support

**DuckDNS Issues:**
- FAQ: https://www.duckdns.org/faqs.jsp
- Twitter: @duck_dns

**Let's Encrypt Issues:**
- Docs: https://letsencrypt.org/docs/
- Community: https://community.letsencrypt.org/

## Summary

You now have:
- ✅ Free domain: `mypollapp.duckdns.org`
- ✅ HTTPS enabled (secure)
- ✅ Google OAuth working
- ✅ Poll app live and accessible
- ✅ Total cost: $0

**Your app is live at:** `https://mypollapp.duckdns.org` 🚀

Congratulations! 🎉
