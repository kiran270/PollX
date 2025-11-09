# Deployment Checklist

Use this checklist to ensure you don't miss any steps!

## Pre-Deployment

- [ ] Update `prisma/schema.prisma` to use PostgreSQL
  ```prisma
  provider = "postgresql"  // Change from "sqlite"
  ```

- [ ] Push code to GitHub
  ```bash
  git add .
  git commit -m "Ready for deployment"
  git push
  ```

## Database Setup

- [ ] Sign up for Neon.tech (or Supabase/Railway)
- [ ] Create new PostgreSQL project
- [ ] Copy connection string
- [ ] Save connection string securely

## Vercel Deployment

- [ ] Sign up for Vercel (https://vercel.com)
- [ ] Import project from GitHub
- [ ] Set root directory to `poll-app` (if needed)
- [ ] Add environment variables:
  - [ ] `DATABASE_URL` (from Neon)
  - [ ] `NEXTAUTH_URL` (placeholder first)
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
- [ ] Click Deploy
- [ ] Wait for deployment to complete
- [ ] Copy your Vercel URL

## Post-Deployment

- [ ] Update `NEXTAUTH_URL` with actual Vercel URL
- [ ] Redeploy or push new commit

## Database Migration

- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] (Optional) Run `npx tsx scripts/seed-polls.ts`

## Google OAuth Configuration

- [ ] Go to Google Cloud Console
- [ ] Navigate to Credentials
- [ ] Add Authorized JavaScript origins:
  - [ ] `https://your-app.vercel.app`
- [ ] Add Authorized redirect URIs:
  - [ ] `https://your-app.vercel.app/api/auth/callback/google`
- [ ] Click Save

## Testing

- [ ] Visit your Vercel URL
- [ ] Test Google Sign In
- [ ] Create a test poll (if admin)
- [ ] Vote on a poll
- [ ] Check poll history page
- [ ] Test on mobile device

## Optional: Custom Domain

- [ ] Purchase domain
- [ ] Add domain in Vercel settings
- [ ] Configure DNS records
- [ ] Wait for DNS propagation
- [ ] Update `NEXTAUTH_URL` to custom domain
- [ ] Update Google OAuth with custom domain
- [ ] Test with custom domain

## Done! 🎉

Your poll app is now live!

Share your URL: `https://your-app.vercel.app`

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Neon Dashboard:** https://console.neon.tech
**Google Console:** https://console.cloud.google.com

**Redeploy:** Push to GitHub or click "Redeploy" in Vercel
**View Logs:** Vercel Dashboard → Project → Deployment → Functions
**Update Env Vars:** Vercel Dashboard → Project → Settings → Environment Variables
