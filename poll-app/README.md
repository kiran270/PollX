# PollApp - Real-time Polling Application

A modern polling application built with Next.js 15, featuring Google authentication, real-time countdown timers, and admin controls.

## Features

### Core Features
- 🔐 Google OAuth authentication
- 👤 Role-based access (Admin/User)
- 📊 Real-time poll results with percentages
- ⏱️ Live countdown timers for poll expiration
- 🗳️ One vote per user per poll
- 📱 Responsive design with Tailwind CSS
- 💾 SQLite database with Prisma ORM

### New Features ✨
- 🏷️ **Poll Categories** - Organize polls by Politics, Sports, Entertainment, Technology, etc.
- 🔍 **Search & Filter** - Find polls quickly with search and category filters
- 🔄 **Vote Changes** - Allow users to change their vote (admin configurable)
- 🔒 **Public/Private Polls** - Control poll visibility
- 🌓 **Dark/Light Mode** - Full theme support with user preferences
- 💬 **Comments & Discussion** - Engage with community through comments
- 🔗 **Social Sharing** - Share polls on Twitter, Facebook, LinkedIn, WhatsApp

## Setup Instructions

### 1. Install Dependencies

```bash
cd poll-app
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### 3. Environment Variables

Update the `.env.local` file with your credentials:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Database Setup

The database is already initialized, but if you need to reset it:

```bash
npx prisma db push
npx prisma generate
```

### 5. Create Admin User

After signing in for the first time, you need to manually set your user as admin:

```bash
npx prisma studio
```

This opens Prisma Studio in your browser. Find your user and change the `role` field from `"user"` to `"admin"`.

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## Usage

### For Users:
1. Sign in with Google
2. **Browse & Search**: Use search bar and category filters to find polls
3. **Vote**: Select an option and submit your vote
4. **Change Vote**: If enabled by admin, change your vote before poll expires
5. **Comment**: Click on polls to view details and join discussions
6. **Share**: Share interesting polls on social media
7. **Theme**: Toggle between dark and light mode in sidebar

### For Admins:
1. Sign in with Google (ensure your role is set to "admin")
2. Click "Create Poll" in the navbar
3. Fill in poll details:
   - Title (required)
   - Description (optional)
   - Category (optional) - Choose from predefined categories
   - At least 2 options
   - Expiration time in hours
   - **Public/Private** - Toggle poll visibility
   - **Allow Vote Changes** - Let users change their votes
4. Submit to create the poll
5. Edit or delete polls from the poll cards

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Database Schema

- **User**: Stores user information and role
- **Poll**: Contains poll details and expiration time
- **Option**: Poll options
- **Vote**: Tracks user votes (unique constraint on userId + pollId)

## Security Features

- Google OAuth authentication
- Role-based access control
- One vote per user per poll (database constraint)
- Expired poll validation
- Protected API routes

## Project Structure

```
poll-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── polls/
│   ├── admin/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── PollCard.tsx
│   └── SessionProvider.tsx
├── lib/
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── next-auth.d.ts
└── auth.ts
```

## License

MIT
