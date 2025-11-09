# Deployment Guide

## Step 1: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   cd poll-app
   vercel
   ```
   - Follow the prompts
   - Choose "yes" to link to existing project or create new
   - Your app will be deployed and you'll get a URL like: `https://your-app.vercel.app`

## Step 2: Update Environment Variables in Vercel

After deployment, add environment variables in Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=uFfaua6IOyQIzq+DaPWg7CQ1VNAnAkJlNzQ4pXhTrSs=
GOOGLE_CLIENT_ID=310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Important**: Replace `https://your-app.vercel.app` with your actual Vercel URL!

## Step 3: Update Google OAuth Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Update **Authorized JavaScript origins**:
   - Add: `https://your-app.vercel.app`
   - Keep: `http://localhost:3000` (for local development)

6. Update **Authorized redirect URIs**:
   - Add: `https://your-app.vercel.app/api/auth/callback/google`
   - Keep: `http://localhost:3000/api/auth/callback/google` (for local development)

7. Click **Save**

## Step 4: Database Considerations

**Important**: SQLite (file:./dev.db) won't work on Vercel because the filesystem is read-only!

You need to switch to a production database. Options:

### Option A: PostgreSQL (Recommended)

**Free PostgreSQL Providers:**
- **Neon** (https://neon.tech) - Free tier, serverless
- **Supabase** (https://supabase.com) - Free tier
- **Railway** (https://railway.app) - Free tier

**Steps to switch to PostgreSQL:**

1. Create a free PostgreSQL database (e.g., on Neon)
2. Get your connection string (looks like: `postgresql://user:pass@host/db`)
3. Update `DATABASE_URL` in Vercel environment variables
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
5. Redeploy: `vercel --prod`

### Option B: Vercel Postgres (Paid)

Vercel offers integrated PostgreSQL starting at $20/month.

## Step 5: Run Database Migrations

After switching to PostgreSQL, you need to run migrations:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed the database (optional)
npx tsx scripts/seed-polls.ts
```

## Step 6: Redeploy

After all changes:
```bash
vercel --prod
```

## Custom Domain (Optional)

If you bought a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `mypollapp.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain
5. Update Google OAuth redirect URIs to use custom domain

## Testing

1. Visit your deployed URL
2. Try signing in with Google
3. Create a poll (if you're admin)
4. Vote on polls

## Troubleshooting

- **OAuth errors**: Double-check redirect URIs in Google Console
- **Database errors**: Ensure you've switched from SQLite to PostgreSQL
- **Environment variables**: Verify all variables are set in Vercel Dashboard
- **Build errors**: Check Vercel deployment logs
