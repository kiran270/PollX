# Migration Guide

## Upgrading to Version 2.0 (New Features)

This guide helps you migrate your existing PollApp installation to include the new features.

### Step 1: Backup Your Database

Before making any changes, backup your existing database:

```bash
cp prisma/dev.db prisma/dev.db.backup
```

### Step 2: Update Dependencies

Make sure all dependencies are up to date:

```bash
npm install
```

### Step 3: Apply Database Changes

The new schema includes these changes:
- Added `category`, `isPublic`, `allowVoteChange` fields to Poll model
- Added `theme` field to User model
- Added new `Comment` model for discussions

Apply the migration:

```bash
npx prisma db push
```

This will:
- Add new columns to existing tables
- Create the new Comment table
- Set default values for existing records:
  - `category`: null (no category)
  - `isPublic`: true (all existing polls remain public)
  - `allowVoteChange`: false (existing polls don't allow vote changes)
  - `theme`: "light" (users default to light theme)

### Step 4: Generate Prisma Client

Regenerate the Prisma client with new types:

```bash
npx prisma generate
```

### Step 5: Verify Migration

Check that everything is working:

```bash
npm run dev
```

Visit `http://localhost:3000` and verify:
- ✅ Existing polls are still visible
- ✅ You can create new polls with categories
- ✅ Search and filter work
- ✅ Theme toggle works
- ✅ Comments can be added to polls

### Step 6: Update Admin Users (Optional)

If you want to test admin features, ensure your user has admin role:

```bash
npx prisma studio
```

1. Open the User table
2. Find your user
3. Change `role` to "admin"
4. Save changes

## Rollback (If Needed)

If you need to rollback:

1. Restore the backup:
```bash
cp prisma/dev.db.backup prisma/dev.db
```

2. Checkout the previous version of your code

## Data Integrity

All existing data is preserved:
- ✅ Users and their authentication
- ✅ Polls and their settings
- ✅ Options and their text
- ✅ Votes and their associations

New fields have sensible defaults that maintain existing behavior.

## Breaking Changes

**None!** All changes are backward compatible:
- Existing polls work exactly as before
- New features are opt-in (categories, vote changes, etc.)
- API routes are extended, not replaced
- UI components gracefully handle missing data

## New Environment Variables

No new environment variables are required. The existing `.env.local` configuration works as-is.

## Production Deployment

When deploying to production:

1. **Backup production database first**
2. Run migrations in a maintenance window
3. Test thoroughly in staging first
4. Monitor for any issues after deployment

### Vercel/Production Checklist

- [ ] Backup database
- [ ] Update code
- [ ] Run `npx prisma db push` in production
- [ ] Run `npx prisma generate`
- [ ] Restart application
- [ ] Verify all features work
- [ ] Check error logs

## Support

If you encounter issues:

1. Check the console for errors
2. Verify Prisma client is generated: `npx prisma generate`
3. Ensure database is in sync: `npx prisma db push`
4. Check the FEATURES.md file for detailed documentation

## Post-Migration Tasks

After successful migration:

1. **Announce new features** to your users
2. **Create some categorized polls** to demonstrate the feature
3. **Enable vote changes** on appropriate polls
4. **Test sharing** on different platforms
5. **Encourage users** to try the new theme toggle

## Performance Notes

The new features have minimal performance impact:
- Comments are loaded on-demand (only on detail page)
- Search and filters use indexed fields
- Theme switching is instant (CSS variables)
- No additional API calls on homepage

Enjoy the new features! 🎉
