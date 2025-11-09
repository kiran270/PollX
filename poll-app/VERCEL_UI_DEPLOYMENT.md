# Deploy to Vercel Using UI (Easiest Method)

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free) - https://vercel.com

## Step 1: Prepare Your Code

### 1. Update Prisma Schema for PostgreSQL

Open `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 2: Get Free PostgreSQL Database

### Option A: Neon (Recommended - Easiest)

1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub for quick signup)
3. Click "Create Project"
   - Name: `poll-app`
   - Region: Choose closest to you
   - PostgreSQL version: 16 (latest)
4. Click "Create Project"
5. **Copy the connection string** - looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
6. Save this - you'll need it in Step 4!

### Option B: Supabase

1. Go to https://supabase.com
2. Sign up and create new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)

### Option C: Railway

1. Go to https://railway.app
2. Sign up and create new project
3. Add PostgreSQL database
4. Copy connection string from variables

## Step 3: Deploy to Vercel

### 1. Go to Vercel

1. Visit https://vercel.com
2. Click "Sign Up" (use GitHub for easy integration)
3. Authorize Vercel to access your GitHub

### 2. Import Project

1. Click "Add New..." → "Project"
2. Find your GitHub repository in the list
3. Click "Import"

### 3. Configure Project

**Framework Preset**: Next.js (should auto-detect)

**Root Directory**: `poll-app` (if your Next.js app is in a subfolder)
- Click "Edit" next to Root Directory
- Select `poll-app`
- Or leave as `.` if poll-app is your root

**Build Settings**: Leave as default
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Add Environment Variables

Click "Environment Variables" and add these:

```
DATABASE_URL
postgresql://your-connection-string-from-neon

NEXTAUTH_URL
https://your-app.vercel.app

NEXTAUTH_SECRET
uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs=

GOOGLE_CLIENT_ID
310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET
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
```

**Important Notes:**
- For `DATABASE_URL`: Paste your Neon connection string
- For `NEXTAUTH_URL`: Use `https://your-project-name.vercel.app` (you'll update this after deployment)
- Leave `NEXTAUTH_URL` as placeholder for now, we'll update it

### 5. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://your-app-abc123.vercel.app`

## Step 4: Update Environment Variables

### 1. Update NEXTAUTH_URL

1. Copy your Vercel deployment URL (e.g., `https://your-app-abc123.vercel.app`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Find `NEXTAUTH_URL`
4. Click "Edit"
5. Update value to your actual Vercel URL
6. Click "Save"

### 2. Redeploy

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Or just push a new commit to trigger auto-deploy

## Step 5: Setup Database

### 1. Run Migrations

You need to push your schema to the database. Two options:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run Prisma commands
npx prisma generate
npx prisma db push
```

**Option B: Using Local Terminal with Production DB**

```bash
# Create temporary .env file with production database
echo 'DATABASE_URL="your-neon-connection-string"' > .env.production.local

# Run migrations
npx prisma generate
npx prisma db push

# Seed database (optional)
npx tsx scripts/seed-polls.ts

# Delete temporary file
rm .env.production.local
```

## Step 6: Update Google OAuth

### 1. Get Your Vercel URL

Your app is now at: `https://your-app-abc123.vercel.app`

### 2. Update Google Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID

### 3. Add Authorized JavaScript Origins

Click "Add URI" under "Authorized JavaScript origins":
```
https://your-app-abc123.vercel.app
```

Keep the localhost one for development:
```
http://localhost:3000
```

### 4. Add Authorized Redirect URIs

Click "Add URI" under "Authorized redirect URIs":
```
https://your-app-abc123.vercel.app/api/auth/callback/google
```

Keep the localhost one:
```
http://localhost:3000/api/auth/callback/google
```

### 5. Save Changes

Click "Save" at the bottom

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-abc123.vercel.app`
2. Click "Sign In" in the sidebar
3. Sign in with Google
4. Try creating a poll (if you're admin)
5. Try voting on polls

## Step 8: Add Custom Domain (Optional)

### 1. Buy a Domain

Buy from:
- Namecheap (~$10/year)
- Google Domains (~$12/year)
- Cloudflare (~$10/year)

### 2. Add Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `mypollapp.com`)
4. Click "Add"

### 3. Configure DNS

Vercel will show you DNS records to add. Go to your domain registrar and add:

**For root domain (mypollapp.com):**
- Type: A
- Name: @
- Value: 76.76.21.21

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

### 4. Wait for DNS Propagation

Usually takes 5-30 minutes, sometimes up to 48 hours.

### 5. Update Environment Variables

1. Go to Settings → Environment Variables
2. Update `NEXTAUTH_URL` to `https://mypollapp.com`
3. Redeploy

### 6. Update Google OAuth

Add your custom domain to Google Console:
- Authorized JavaScript origins: `https://mypollapp.com`
- Authorized redirect URIs: `https://mypollapp.com/api/auth/callback/google`

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys!
```

## Useful Vercel Features

### 1. View Logs

1. Go to Vercel Dashboard → Your Project
2. Click on a deployment
3. Click "Functions" tab to see logs
4. Or click "Runtime Logs" for real-time logs

### 2. Preview Deployments

Every branch and PR gets a preview URL automatically!

### 3. Environment Variables per Environment

You can set different variables for:
- Production
- Preview
- Development

### 4. Analytics

Enable analytics in Settings → Analytics (free tier available)

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to deployment
2. Click "Building" section
3. Look for errors

**Common issues:**
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Run `npm run build` locally to check
- Environment variables: Make sure all are set

### OAuth Errors

**"redirect_uri_mismatch":**
- Double-check redirect URIs in Google Console
- Make sure they match exactly (including https://)
- Wait a few minutes after updating Google Console

### Database Connection Errors

**"Can't reach database server":**
- Check DATABASE_URL is correct
- Make sure it includes `?sslmode=require` for Neon
- Verify database is running (check Neon dashboard)

### App Loads but Shows Errors

**Check runtime logs:**
1. Go to deployment
2. Click "Functions" tab
3. Look for runtime errors

## Cost

**Vercel:**
- Hobby (Free): Perfect for personal projects
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Custom domains

**Neon PostgreSQL:**
- Free tier: 0.5 GB storage, 1 project
- Paid: $19/month for more storage

**Total: $0/month** (free tier is enough for most projects!)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Setup PostgreSQL database
3. ✅ Configure environment variables
4. ✅ Update Google OAuth
5. ✅ Test the application
6. 🎉 Share your poll app!

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Neon Docs: https://neon.tech/docs
