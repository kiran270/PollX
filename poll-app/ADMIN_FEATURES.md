# Admin Features Guide

This guide explains the admin-only features for managing polls.

## Admin Capabilities

Admins have special privileges to manage all polls in the system:

✅ **Create Polls** - Create new polls with custom options and expiration times
✅ **Edit Polls** - Update poll title, description, and extend expiration time
✅ **Delete Polls** - Remove polls permanently from the system
✅ **View All Polls** - Access to all active and expired polls

## How to Become an Admin

By default, the first user to sign in becomes an admin. To make additional users admins:

### Method 1: Using Prisma Studio (Easiest)

```bash
# If running locally
npx prisma studio

# If running in Docker
docker-compose exec poll-app npx prisma studio
```

1. Open Prisma Studio (usually at http://localhost:5555)
2. Click on "User" table
3. Find the user you want to make admin
4. Change their `role` from `MEMBER` to `ADMIN`
5. Save changes

### Method 2: Using Database Directly

**For SQLite (local or Docker):**

```bash
# If running locally
sqlite3 prisma/dev.db

# If running in Docker
docker-compose exec poll-app sqlite3 /app/prisma/dev.db
```

Then run:
```sql
-- View all users
SELECT id, email, role FROM User;

-- Make a user admin (replace email)
UPDATE User SET role = 'ADMIN' WHERE email = 'user@example.com';

-- Verify
SELECT id, email, role FROM User;

-- Exit
.quit
```

**For PostgreSQL (production):**

```bash
psql $DATABASE_URL
```

Then run:
```sql
-- View all users
SELECT id, email, role FROM "User";

-- Make a user admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'user@example.com';

-- Verify
SELECT id, email, role FROM "User";

-- Exit
\q
```

## Admin Features in Detail

### 1. Create Poll

**Access:** Sidebar → "Create Poll" (only visible to admins)

**Features:**
- Custom poll question
- Optional description
- Multiple answer options (minimum 2)
- Set expiration time (1h to 72h)

**Steps:**
1. Click "Create Poll" in sidebar
2. Enter poll question
3. Add description (optional)
4. Add answer options
5. Select duration
6. Click "Create Poll"

### 2. Edit Poll

**Access:** Edit icon (pencil) on any poll card

**What You Can Edit:**
- Poll title/question
- Poll description
- Expiration time (extend only)

**What You Cannot Edit:**
- Poll options (to preserve vote integrity)
- Existing votes

**Steps:**
1. Find the poll you want to edit
2. Click the pencil icon (✏️) in the top-right corner
3. Update the fields you want to change
4. Select new expiration time (hours from now)
5. Click "Save Changes"

**Note:** Editing a poll does not reset votes or change the options. It only updates the metadata.

### 3. Delete Poll

**Access:** Delete icon (trash) on any poll card

**Warning:** This action is permanent and cannot be undone!

**What Gets Deleted:**
- The poll itself
- All poll options
- All votes on the poll

**Steps:**
1. Find the poll you want to delete
2. Click the trash icon (🗑️) in the top-right corner
3. Confirm deletion in the popup
4. Poll is immediately removed

**Use Cases:**
- Remove duplicate polls
- Delete test polls
- Remove inappropriate content
- Clean up expired polls

## Admin UI Elements

### Poll Card Admin Controls

When you're logged in as an admin, you'll see two additional icons on each poll card:

**Edit Button (Pencil Icon):**
- Location: Top-right corner of poll card
- Color: Blue on hover
- Action: Opens edit page for the poll

**Delete Button (Trash Icon):**
- Location: Top-right corner of poll card (next to edit)
- Color: Red on hover
- Action: Deletes the poll after confirmation

### Sidebar Navigation

Admins see an additional menu item:
- **Create Poll** - Only visible to admins

Regular users (members) do not see this option.

## API Endpoints (For Developers)

### Create Poll
```
POST /api/polls
Body: { title, description, options, expiresAt }
Auth: Required (Admin only)
```

### Update Poll
```
PATCH /api/polls/[id]
Body: { title, description, expiresAt }
Auth: Required (Admin only)
```

### Delete Poll
```
DELETE /api/polls/[id]
Auth: Required (Admin only)
```

## Security

### Role-Based Access Control

- **Authentication:** All admin actions require a valid session
- **Authorization:** Server-side checks ensure only admins can perform admin actions
- **Validation:** All inputs are validated before processing

### What's Protected

✅ Only admins can create polls
✅ Only admins can edit polls
✅ Only admins can delete polls
✅ Regular users can only vote
✅ All admin actions are verified server-side

### Error Handling

- **401 Unauthorized:** User is not signed in
- **403 Forbidden:** User is signed in but not an admin
- **404 Not Found:** Poll doesn't exist
- **500 Server Error:** Something went wrong

## Best Practices

### For Poll Management

1. **Before Deleting:**
   - Consider if the poll has valuable data
   - Export results if needed
   - Confirm it's not actively being used

2. **When Editing:**
   - Only extend expiration times, don't shorten
   - Keep changes minimal to avoid confusion
   - Update description to note any changes

3. **Creating Polls:**
   - Use clear, unambiguous questions
   - Provide enough context in description
   - Set appropriate expiration times
   - Test with a few users first

### For User Management

1. **Granting Admin Access:**
   - Only give admin access to trusted users
   - Document who has admin access
   - Review admin list periodically

2. **Revoking Admin Access:**
   - Change role back to MEMBER in database
   - User loses admin privileges immediately

## Troubleshooting

### "Admin access required" error

**Problem:** You're trying to perform an admin action but getting an error.

**Solutions:**
1. Check if you're signed in
2. Verify your role is set to ADMIN in database
3. Sign out and sign back in
4. Clear browser cache

### Edit/Delete buttons not showing

**Problem:** You're an admin but don't see the edit/delete buttons.

**Solutions:**
1. Refresh the page
2. Check your role in database
3. Sign out and sign back in
4. Check browser console for errors

### Changes not saving

**Problem:** You edit a poll but changes don't persist.

**Solutions:**
1. Check browser console for errors
2. Verify you have admin role
3. Check server logs: `docker-compose logs poll-app`
4. Ensure database is writable

### Can't delete poll

**Problem:** Delete button doesn't work or shows error.

**Solutions:**
1. Check if poll has votes (should still work)
2. Verify admin permissions
3. Check server logs for errors
4. Try refreshing and deleting again

## Database Schema

### User Roles

```prisma
enum Role {
  ADMIN
  MEMBER
}
```

### User Model

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  image String?
  role  Role   @default(MEMBER)
  votes Vote[]
}
```

## Testing Admin Features

### Test Checklist

- [ ] Create a new poll
- [ ] Edit poll title
- [ ] Edit poll description
- [ ] Extend poll expiration
- [ ] Delete a poll
- [ ] Verify regular users can't access admin features
- [ ] Verify deleted polls are gone
- [ ] Verify edited polls show updated info

### Test as Regular User

1. Sign in with a non-admin account
2. Verify "Create Poll" is not in sidebar
3. Verify no edit/delete buttons on polls
4. Try accessing `/create-poll` directly (should be blocked)
5. Try accessing `/edit-poll/1` directly (should be blocked)

## Summary

Admin features give you full control over poll management:

- **Create** polls with custom options
- **Edit** poll details and extend time
- **Delete** polls permanently
- **Manage** all polls in the system

All admin actions are:
- ✅ Secure (server-side validation)
- ✅ Fast (immediate updates)
- ✅ Intuitive (clear UI controls)
- ✅ Safe (confirmation for destructive actions)

For questions or issues, check the troubleshooting section or review server logs.
