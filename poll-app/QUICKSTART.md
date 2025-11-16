# Quick Start Guide - New Features

## 🚀 Get Started in 5 Minutes

### Step 1: Update Database (30 seconds)

```bash
cd poll-app
npx prisma db push
npx prisma generate
```

### Step 2: Start Development Server (10 seconds)

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Step 3: Set Up Admin User (1 minute)

1. Sign in with Google
2. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```
3. Go to User table
4. Find your user
5. Change `role` to `"admin"`
6. Save

### Step 4: Test New Features (3 minutes)

#### Test 1: Create a Categorized Poll
1. Click "Create Poll" in sidebar
2. Fill in title: "What's your favorite programming language?"
3. Select category: "Technology"
4. Add options: "JavaScript", "Python", "Go", "Rust"
5. Toggle "Allow Vote Changes" ON
6. Click "Create Poll"

#### Test 2: Search and Filter
1. Go to homepage
2. Type "programming" in search bar
3. Select "Technology" from category dropdown
4. See your poll appear

#### Test 3: Vote and Change Vote
1. Click on your poll
2. Select "Python"
3. Click "Submit Vote"
4. Select "JavaScript"
5. Click "Change Vote"
6. See vote updated

#### Test 4: Add Comments
1. Scroll to comments section
2. Type: "Great poll! I love Python for data science"
3. Click "Post Comment"
4. See your comment appear

#### Test 5: Share Poll
1. Click share button (top right)
2. Click "Copy Link"
3. See "Link copied!" message
4. Try sharing on Twitter/Facebook

#### Test 6: Toggle Theme
1. Look at sidebar
2. Click "Theme" button
3. See app switch to light mode
4. Click again to switch back to dark mode

## 🎉 You're Done!

All features are now working. Here's what you can do:

### As Admin:
- ✅ Create polls with categories
- ✅ Make polls public or private
- ✅ Allow users to change votes
- ✅ Edit and delete polls
- ✅ View analytics

### As User:
- ✅ Search for polls
- ✅ Filter by category
- ✅ Vote on polls
- ✅ Change votes (if allowed)
- ✅ Comment on polls
- ✅ Share polls on social media
- ✅ Switch between dark/light themes

## 📚 Learn More

- **FEATURES.md** - Detailed feature documentation
- **MIGRATION.md** - Migration guide for existing installations
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **README.md** - Complete user guide

## 🐛 Troubleshooting

### Issue: TypeScript errors in IDE
**Solution**: Restart your IDE or TypeScript server

### Issue: Database not updating
**Solution**: 
```bash
npx prisma db push --force-reset
npx prisma generate
```

### Issue: Theme not switching
**Solution**: Clear browser cache and reload

### Issue: Can't create polls
**Solution**: Make sure your user role is "admin" in Prisma Studio

## 💡 Tips

1. **Categories**: Use them to organize polls by topic
2. **Vote Changes**: Enable for opinion polls, disable for elections
3. **Private Polls**: Use for internal team polls
4. **Comments**: Great for gathering feedback and discussion
5. **Sharing**: Increases engagement and reach
6. **Theme**: Let users choose their preferred experience

## 🎯 Next Steps

1. **Customize Categories**: Edit the category list in `app/create-poll/page.tsx`
2. **Add More Themes**: Extend the theme system in `components/ThemeProvider.tsx`
3. **Email Notifications**: Add email alerts for new comments
4. **Analytics**: Build dashboards showing category trends
5. **User Profiles**: Show user's voting and comment history

## 📞 Need Help?

Check the documentation files:
- FEATURES.md for feature details
- MIGRATION.md for upgrade help
- IMPLEMENTATION_SUMMARY.md for technical info

Happy polling! 🎊
