# Local Development Setup

## ✅ Fixed: Google OAuth Configuration

The app is now configured for local development at `http://localhost:3000`

## 🔧 Google Cloud Console Setup

To enable Google Sign-In locally, you need to add localhost to your authorized redirect URIs:

### Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Select Your Project**
   - Find your project in the dropdown

3. **Navigate to Credentials**
   - Go to: APIs & Services → Credentials

4. **Edit OAuth 2.0 Client**
   - Click on your OAuth 2.0 Client ID
   - Find "Authorized redirect URIs" section

5. **Add Localhost URI**
   - Click "ADD URI"
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Click "SAVE"

### Current Configuration:

```env
NEXTAUTH_URL="http://localhost:3000"
```

## 🚀 Testing Locally

1. **Server is Running**
   ```
   ✓ Local: http://localhost:3000
   ```

2. **Open in Browser**
   - Visit: http://localhost:3000
   - Click "Sign in with Google"
   - Should redirect to Google OAuth
   - After authorization, redirects back to localhost

3. **Set Admin Role**
   ```bash
   npx prisma studio
   ```
   - Open User table
   - Find your user
   - Change `role` to `"admin"`
   - Save

## 🌐 Production vs Development

### For Local Development:
```env
NEXTAUTH_URL="http://localhost:3000"
```
**Authorized Redirect URI**: `http://localhost:3000/api/auth/callback/google`

### For Production (DuckDNS):
```env
NEXTAUTH_URL="http://pollx.duckdns.org"
```
**Authorized Redirect URI**: `http://pollx.duckdns.org/api/auth/callback/google`

## 💡 Pro Tip

You can have **both** redirect URIs in Google Cloud Console:
- `http://localhost:3000/api/auth/callback/google` (for local dev)
- `http://pollx.duckdns.org/api/auth/callback/google` (for production)

Then just switch the `NEXTAUTH_URL` in `.env.local` depending on where you're running.

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch" error
**Solution**: Make sure you added `http://localhost:3000/api/auth/callback/google` to Google Cloud Console

### Issue: Still redirecting to DuckDNS
**Solution**: 
1. Stop the dev server (Ctrl+C)
2. Verify `.env.local` has `NEXTAUTH_URL="http://localhost:3000"`
3. Restart: `npm run dev`

### Issue: Can't sign in
**Solution**: 
1. Check Google Cloud Console has localhost redirect URI
2. Clear browser cookies for localhost:3000
3. Try again

## ✅ Current Status

- ✅ Environment configured for localhost
- ✅ Dev server running on http://localhost:3000
- ⚠️ Need to add localhost redirect URI in Google Cloud Console
- ✅ All features ready to test

## 📝 Next Steps

1. Add localhost redirect URI to Google Cloud Console (see steps above)
2. Visit http://localhost:3000
3. Sign in with Google
4. Set your role to admin via Prisma Studio
5. Test all the new features!

## 🔄 Switching Between Environments

### To switch to local:
```bash
# Edit .env.local
NEXTAUTH_URL="http://localhost:3000"

# Restart server
npm run dev
```

### To switch to production:
```bash
# Edit .env.local
NEXTAUTH_URL="http://pollx.duckdns.org"

# Restart server
npm run dev
```

Happy testing! 🎉
