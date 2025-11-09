# Fix Google OAuth Error 400: redirect_uri_mismatch

## Problem
You're seeing: "Error 400: redirect_uri_mismatch"

This means the redirect URI in your Google OAuth settings doesn't match your app's URL.

---

## Solution

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth Client

Look for your OAuth 2.0 Client ID:
- Name might be: "Web client" or "PollX" or similar
- Client ID: `310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com`

Click on it to edit.

### Step 3: Add Authorized Redirect URIs

In the **Authorized redirect URIs** section, add these:

```
http://localhost:3000/api/auth/callback/google
http://localhost/api/auth/callback/google
http://pollx.duckdns.org/api/auth/callback/google
https://pollx.duckdns.org/api/auth/callback/google
```

**Important:** Make sure there are NO trailing slashes!

### Step 4: Add Authorized JavaScript Origins

In the **Authorized JavaScript origins** section, add these:

```
http://localhost:3000
http://localhost
http://pollx.duckdns.org
https://pollx.duckdns.org
```

### Step 5: Save Changes

Click the **SAVE** button at the bottom.

⚠️ **Note:** Changes may take 5-10 minutes to propagate.

---

## Verify Your Configuration

### Check Your .env.local

Your current configuration:
```env
NEXTAUTH_URL="http://pollx.duckdns.org"
GOOGLE_CLIENT_ID="310418779553-pgesbbt7pcvtm8mm8a6hsg50turhtlmh.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
```

### Match URL with Redirect URI

If you access: `http://pollx.duckdns.org`
Then redirect URI must be: `http://pollx.duckdns.org/api/auth/callback/google`

If you access: `https://pollx.duckdns.org`
Then redirect URI must be: `https://pollx.duckdns.org/api/auth/callback/google`

---

## After Making Changes

### On EC2:

1. **Restart your application:**
   ```bash
   docker-compose restart poll-app
   ```

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
   - Clear cookies and cached data
   - Or use Incognito/Private mode

3. **Try signing in again:**
   - Go to: http://pollx.duckdns.org
   - Click "Sign in with Google"

---

## Still Not Working?

### Check the Error Details

When you see the error, look for the actual redirect URI being used:
- It will show something like: `redirect_uri=http://pollx.duckdns.org/api/auth/callback/google`
- Copy that EXACT URL
- Add it to Google Cloud Console

### Common Issues

1. **Trailing slash:** 
   - ❌ Wrong: `http://pollx.duckdns.org/api/auth/callback/google/`
   - ✅ Correct: `http://pollx.duckdns.org/api/auth/callback/google`

2. **HTTP vs HTTPS:**
   - Make sure NEXTAUTH_URL matches how you access the site
   - If using HTTP, use `http://` in both places
   - If using HTTPS, use `https://` in both places

3. **Port numbers:**
   - ❌ Wrong: `http://pollx.duckdns.org:3000/api/auth/callback/google`
   - ✅ Correct: `http://pollx.duckdns.org/api/auth/callback/google`

4. **Wait time:**
   - Google OAuth changes can take 5-10 minutes to take effect
   - Try again after waiting

---

## Quick Fix Checklist

- [ ] Added redirect URI to Google Cloud Console
- [ ] Added JavaScript origin to Google Cloud Console
- [ ] Clicked SAVE in Google Cloud Console
- [ ] Waited 5-10 minutes
- [ ] Restarted application: `docker-compose restart poll-app`
- [ ] Cleared browser cache or used Incognito mode
- [ ] NEXTAUTH_URL matches the URL you're accessing
- [ ] No trailing slashes in redirect URIs
- [ ] HTTP/HTTPS matches between .env and Google Console

---

## Screenshot Guide

### Where to Add Redirect URIs:

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. Scroll to **Authorized redirect URIs**
4. Click **+ ADD URI**
5. Paste: `http://pollx.duckdns.org/api/auth/callback/google`
6. Click **+ ADD URI** again for each additional URI
7. Scroll to **Authorized JavaScript origins**
8. Click **+ ADD URI**
9. Paste: `http://pollx.duckdns.org`
10. Click **SAVE** at the bottom

---

## Test After Setup

1. Go to: http://pollx.duckdns.org
2. Click "Sign in with Google"
3. You should see Google's sign-in page
4. After signing in, you should be redirected back to your app

---

## Need More Help?

If still not working, check:
1. The exact error message
2. The redirect_uri shown in the error
3. Your Google Cloud Console settings
4. Your .env.local file
5. Whether you're using HTTP or HTTPS

The redirect URI in the error message must EXACTLY match one in Google Cloud Console.
