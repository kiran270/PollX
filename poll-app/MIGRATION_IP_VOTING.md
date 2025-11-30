# IP-Based Voting Migration Guide

## Changes Made

IP-based voting has been implemented to allow users to vote without signing in.

### 1. Database Schema Changes

**Modified `Vote` model in `prisma/schema.prisma`:**
- Made `userId` optional (can be null for anonymous votes)
- Added `ipAddress` field for tracking anonymous votes
- Added unique constraint on `ipAddress` + `pollId` to prevent duplicate votes from same IP

### 2. New Files Created

- `lib/ip.ts` - Helper function to extract client IP address from request headers

### 3. Modified Files

- `app/api/polls/[id]/vote/route.ts` - Updated to support both authenticated and IP-based voting
- `prisma/schema.prisma` - Updated Vote model

## Migration Steps

### Step 1: Apply Database Migration

```bash
cd poll-app
npx prisma migrate dev --name add_ip_voting
```

This will:
- Make `userId` nullable in the Vote table
- Add `ipAddress` column
- Add unique constraint for IP-based voting

### Step 2: Restart Your Development Server

```bash
npm run dev
```

## How It Works

### For Signed-In Users:
- Votes are tracked by `userId` (same as before)
- More reliable and allows cross-device tracking

### For Anonymous Users:
- Votes are tracked by IP address
- Prevents duplicate votes from the same IP
- Less reliable (VPN, shared networks) but better than nothing

### Priority:
1. If user is signed in → use `userId`
2. If user is not signed in → use `ipAddress`

## Testing

### Test Anonymous Voting:
1. Open your app in incognito/private mode (not signed in)
2. Try to vote on a poll
3. Vote should be successful
4. Try to vote again on the same poll
5. Should show "You have already voted" error

### Test Authenticated Voting:
1. Sign in with your account
2. Vote on a poll
3. Sign out and try to vote again from same IP
4. Should still work (different tracking method)

## Important Notes

### IP Address Limitations:
- **VPN users**: Can bypass by changing VPN server
- **Shared networks**: Multiple users on same network share IP
- **Dynamic IPs**: Some ISPs change IPs frequently
- **Privacy**: IP addresses are stored (consider GDPR compliance)

### Production Considerations:

1. **Reverse Proxy**: Ensure your server is behind a reverse proxy (nginx, Cloudflare) that sets proper headers:
   - `x-forwarded-for`
   - `x-real-ip`
   - `cf-connecting-ip`

2. **Docker/Kubernetes**: Make sure IP forwarding is configured correctly

3. **Privacy Policy**: Update your privacy policy to mention IP address collection

4. **GDPR Compliance**: Consider:
   - Hashing IP addresses
   - Setting retention period
   - Allowing users to request deletion

## Rollback

If you need to rollback:

```bash
# Revert the migration
npx prisma migrate resolve --rolled-back add_ip_voting

# Restore old files from git
git checkout HEAD -- app/api/polls/[id]/vote/route.ts
git checkout HEAD -- prisma/schema.prisma
rm lib/ip.ts
```

## Future Improvements

Consider adding:
1. **Browser fingerprinting** for better tracking
2. **Cookie-based tracking** as additional layer
3. **Rate limiting** to prevent abuse
4. **IP hashing** for privacy
5. **Hybrid approach** combining multiple methods

## Support

If you encounter issues:
1. Check that migrations ran successfully
2. Verify IP address is being captured (check logs)
3. Test in different browsers/networks
4. Check database for vote records

