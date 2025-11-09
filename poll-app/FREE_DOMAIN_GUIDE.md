# Complete Guide to Getting a Free Domain Name

## Quick Comparison

| Service | Domain Type | Duration | Best For | Setup Difficulty |
|---------|-------------|----------|----------|------------------|
| **Freenom** | .tk, .ml, .ga, .cf, .gq | 12 months (renewable) | Custom names | Easy |
| **DuckDNS** | subdomain.duckdns.org | Forever | Quick setup | Very Easy |
| **FreeDNS** | Various subdomains | Forever | Many options | Easy |
| **No-IP** | subdomain.ddns.net | 30 days (renewable) | Dynamic IP | Easy |
| **GitHub Student** | .me, .tech, etc. | 1 year | Students | Easy |
| **Vercel** | yourapp.vercel.app | Forever | Next.js apps | Very Easy |
| **Netlify** | yourapp.netlify.app | Forever | Static sites | Very Easy |

## Option 1: Freenom (Best for Custom Names)

### What You Get
- Free domains: **.tk**, **.ml**, **.ga**, **.cf**, **.gq**
- Example: `mypollapp.tk`, `pollvote.ml`
- Duration: 12 months (can renew for free)
- Full DNS control

### Step-by-Step Setup

1. **Go to Freenom**
   - Visit: https://www.freenom.com

2. **Search for Domain**
   - Enter your desired name (e.g., "mypollapp")
   - Click "Check Availability"

3. **Select Domain**
   - Choose from available extensions (.tk, .ml, etc.)
   - Click "Get it now"
   - Click "Checkout"

4. **Configure Duration**
   - Select "12 Months @ FREE"
   - Period: 12 months

5. **Create Account**
   - Enter email address
   - Create password
   - Verify email

6. **Complete Order**
   - Click "Complete Order"
   - Domain is now yours!

7. **Setup DNS**
   - Go to "Services" → "My Domains"
   - Click "Manage Domain"
   - Click "Manage Freenom DNS"
   - Add A record:
     - Name: (leave blank for root domain)
     - Type: A
     - TTL: 3600
     - Target: Your server IP (e.g., 34.123.45.67)
   - Add another A record for www:
     - Name: www
     - Type: A
     - TTL: 3600
     - Target: Your server IP
   - Click "Save Changes"

8. **Wait for DNS Propagation**
   - Usually 5-30 minutes
   - Check with: `nslookup mypollapp.tk`

### Pros & Cons

**Pros:**
- ✅ Completely free
- ✅ Custom domain name
- ✅ Full DNS control
- ✅ Can use with any hosting

**Cons:**
- ❌ Less professional extensions
- ❌ Need to renew yearly
- ❌ May be blocked by some services
- ❌ Can be reclaimed if not used

## Option 2: DuckDNS (Easiest & Most Reliable)

### What You Get
- Free subdomain: **yourname.duckdns.org**
- Example: `mypollapp.duckdns.org`
- Duration: Forever (as long as you use it)
- Auto-update IP support

### Step-by-Step Setup

1. **Go to DuckDNS**
   - Visit: https://www.duckdns.org

2. **Sign In**
   - Click sign in with:
     - Google
     - GitHub
     - Reddit
     - Twitter

3. **Create Subdomain**
   - Enter your desired name (e.g., "mypollapp")
   - Click "Add domain"

4. **Update IP**
   - Enter your server IP in "current ip" field
   - Click "update ip"

5. **Done!**
   - Your domain is now: `mypollapp.duckdns.org`
   - Points to your server IP

### Auto-Update IP (Optional)

If your server IP changes, setup auto-update:

```bash
# Create update script
nano ~/duckdns-update.sh
```

Add:
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=mypollapp&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns.log -K -
```

Make executable and schedule:
```bash
chmod +x ~/duckdns-update.sh

# Add to crontab (update every 5 minutes)
crontab -e
# Add: */5 * * * * ~/duckdns-update.sh
```

### Pros & Cons

**Pros:**
- ✅ Super easy setup
- ✅ Forever free
- ✅ Very reliable
- ✅ Auto-update IP support
- ✅ No renewal needed

**Cons:**
- ❌ Must use .duckdns.org subdomain
- ❌ Less customizable

## Option 3: FreeDNS (afraid.org) (Most Options)

### What You Get
- Many free subdomains to choose from
- Examples: `yourname.mooo.com`, `yourname.chickenkiller.com`
- Duration: Forever
- Multiple domains allowed

### Step-by-Step Setup

1. **Go to FreeDNS**
   - Visit: https://freedns.afraid.org

2. **Create Account**
   - Click "Setup Account"
   - Enter username, email, password
   - Verify email

3. **Add Subdomain**
   - Click "Subdomains" → "Add"
   - Choose domain from dropdown (many options!)
   - Enter subdomain name
   - Type: A
   - Destination: Your server IP
   - Click "Save!"

4. **Done!**
   - Your domain is ready
   - Example: `mypollapp.mooo.com`

### Available Domain Options

Popular choices:
- `.mooo.com`
- `.chickenkiller.com`
- `.freeddns.org`
- `.myftp.org`
- `.redirectme.net`
- And 100+ more!

### Pros & Cons

**Pros:**
- ✅ Many domain options
- ✅ Forever free
- ✅ Multiple subdomains allowed
- ✅ Good community

**Cons:**
- ❌ Must use provided domains
- ❌ Some domains are quirky names

## Option 4: No-IP (Dynamic DNS)

### What You Get
- Free subdomain: **yourname.ddns.net** (and others)
- Duration: 30 days (must confirm monthly)
- Dynamic IP support

### Step-by-Step Setup

1. **Go to No-IP**
   - Visit: https://www.noip.com

2. **Create Account**
   - Click "Sign Up"
   - Enter email and password
   - Verify email

3. **Create Hostname**
   - Click "Create Hostname"
   - Enter hostname (e.g., "mypollapp")
   - Choose domain (.ddns.net, .hopto.org, etc.)
   - Enter your server IP
   - Click "Create Hostname"

4. **Monthly Confirmation**
   - No-IP sends email every 30 days
   - Click link to confirm (keeps domain active)

### Pros & Cons

**Pros:**
- ✅ Free
- ✅ Dynamic IP support
- ✅ Multiple domain options

**Cons:**
- ❌ Must confirm every 30 days
- ❌ Only 3 hostnames on free plan

## Option 5: GitHub Student Developer Pack (Best Quality)

### What You Get
- **Free .me domain** for 1 year (from Namecheap)
- **$200 AWS credits**
- **Free .tech domain** (from get.tech)
- Many other benefits

### Requirements
- Must be a student
- Valid student email or ID

### Step-by-Step Setup

1. **Apply for Student Pack**
   - Visit: https://education.github.com/pack
   - Click "Get your pack"
   - Sign in with GitHub

2. **Verify Student Status**
   - Upload student ID or
   - Use .edu email address

3. **Get Approved**
   - Usually takes 1-7 days

4. **Claim Domain**
   - Go to pack benefits
   - Find "Namecheap" or "get.tech"
   - Click "Get access"
   - Choose your domain name
   - Register for free!

5. **Setup DNS**
   - Login to Namecheap/get.tech
   - Go to domain management
   - Add A record pointing to your server IP

### Pros & Cons

**Pros:**
- ✅ Professional domain (.me, .tech)
- ✅ Free for 1 year
- ✅ Full control
- ✅ Many other benefits

**Cons:**
- ❌ Must be a student
- ❌ Only free for 1 year
- ❌ Approval process

## Option 6: Vercel/Netlify Subdomain (For Vercel/Netlify Hosting)

### Vercel

**What You Get:**
- Free subdomain: **yourapp.vercel.app**
- Automatic HTTPS
- Global CDN

**Setup:**
1. Deploy to Vercel
2. Automatically get: `yourapp.vercel.app`
3. Can customize: Go to Settings → Domains

### Netlify

**What You Get:**
- Free subdomain: **yourapp.netlify.app**
- Automatic HTTPS
- Global CDN

**Setup:**
1. Deploy to Netlify
2. Automatically get: `random-name.netlify.app`
3. Customize: Site settings → Change site name

### Pros & Cons

**Pros:**
- ✅ Professional subdomain
- ✅ Automatic HTTPS
- ✅ Fast (CDN)
- ✅ Forever free

**Cons:**
- ❌ Must use their hosting
- ❌ Can't use with your own server

## Recommended Setup by Use Case

### For Personal Projects
**Best:** DuckDNS
- Easiest setup
- Most reliable
- Forever free
- Example: `mypollapp.duckdns.org`

### For Portfolio/Professional
**Best:** GitHub Student Pack (if student)
- Professional domain
- Full control
- Example: `mypollapp.me`

**Alternative:** Buy cheap domain
- Namecheap: ~$10/year
- Cloudflare: ~$10/year

### For Quick Testing
**Best:** Vercel/Netlify subdomain
- Instant setup
- Professional looking
- Example: `mypollapp.vercel.app`

### For Custom Name (Free)
**Best:** Freenom
- Custom domain name
- Free for 12 months
- Example: `mypollapp.tk`

## How to Use Your Free Domain

### 1. Point Domain to Your Server

**For A Record (most common):**
```
Type: A
Name: @ (or leave blank)
Value: Your server IP (e.g., 34.123.45.67)
TTL: 3600
```

**For www subdomain:**
```
Type: A
Name: www
Value: Your server IP
TTL: 3600
```

### 2. Update Your App Configuration

**Update .env file:**
```env
NEXTAUTH_URL="http://yourdomain.tk"
```

**Update Nginx:**
```nginx
server_name yourdomain.tk www.yourdomain.tk;
```

### 3. Update Google OAuth

Add to Google Console:
- Authorized JavaScript origins: `http://yourdomain.tk`
- Authorized redirect URIs: `http://yourdomain.tk/api/auth/callback/google`

### 4. Add SSL (HTTPS)

```bash
sudo certbot --nginx -d yourdomain.tk -d www.yourdomain.tk
```

Update to HTTPS:
```env
NEXTAUTH_URL="https://yourdomain.tk"
```

## DNS Propagation Check

After setting up DNS, check if it's working:

```bash
# Check DNS
nslookup yourdomain.tk

# Or use online tools
# https://dnschecker.org
# https://www.whatsmydns.net
```

Usually takes:
- 5-30 minutes (most cases)
- Up to 48 hours (worst case)

## Troubleshooting

### Domain not resolving

**Check DNS settings:**
- Verify A record is correct
- Check server IP is correct
- Wait for propagation (5-30 min)

**Test DNS:**
```bash
nslookup yourdomain.tk
dig yourdomain.tk
```

### SSL certificate fails

**Common issues:**
- DNS not propagated yet → Wait longer
- Wrong domain in command → Check spelling
- Firewall blocking → Check ports 80/443

**Solution:**
```bash
# Wait 30 minutes after DNS setup
# Then try SSL again
sudo certbot --nginx -d yourdomain.tk
```

### Google OAuth not working

**Check:**
- Domain matches exactly in Google Console
- Include both http:// and https:// if testing
- Redirect URI includes full path: `/api/auth/callback/google`

## My Recommendation

**For your poll app, I recommend:**

### Option 1: DuckDNS (Easiest)
1. Go to https://www.duckdns.org
2. Sign in with Google (same account as OAuth!)
3. Create subdomain: `mypollapp.duckdns.org`
4. Point to your server IP
5. Done in 2 minutes!

### Option 2: Freenom (Custom name)
1. Go to https://www.freenom.com
2. Register `mypollapp.tk`
3. Setup DNS to point to server
4. More professional looking

### Option 3: Vercel (If using Vercel hosting)
1. Deploy to Vercel
2. Get `mypollapp.vercel.app` automatically
3. Zero configuration needed

## Summary

| Best For | Service | Domain Example | Cost |
|----------|---------|----------------|------|
| Easiest | DuckDNS | mypollapp.duckdns.org | Free forever |
| Custom name | Freenom | mypollapp.tk | Free 12 months |
| Professional | GitHub Student | mypollapp.me | Free 1 year |
| Quick deploy | Vercel | mypollapp.vercel.app | Free forever |
| Most options | FreeDNS | mypollapp.mooo.com | Free forever |

**My top pick for you:** Start with **DuckDNS** for simplicity, then upgrade to a paid domain (~$10/year) when your app grows!
