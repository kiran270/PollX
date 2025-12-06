# My Polls Feature

## Overview
Added a dedicated "My Polls" page where users can view and manage all polls they've created.

## Features

### Navigation
- New "My Polls" link in the sidebar (only visible when signed in)
- Located between "History" and "Create Poll"
- Uses a calendar/list icon

### My Polls Page (`/my-polls`)

#### Statistics Dashboard
- **Total Polls**: Count of all polls created by the user
- **Active**: Number of polls that haven't expired yet
- **Expired**: Number of polls that have passed their expiry date

#### Filters & Search
- **Search Bar**: Search through your polls by title or description
- **Category Filter**: Filter by poll category (Politics, Sports, etc.)
- **Status Toggle**: Switch between viewing Active or Expired polls

#### Poll Display
- Shows all polls created by the logged-in user
- Displays both public and private polls
- Uses the same PollCard component for consistency
- Includes all poll actions (edit, delete, share, vote)

### API Endpoint
**GET** `/api/polls/my-polls`
- Requires authentication
- Returns all polls created by the current user
- Includes vote counts, comments, and options
- Ordered by creation date (newest first)

## Access Control
- Page is protected - redirects to home if not signed in
- Only shows polls created by the authenticated user
- Users can see both their public and private polls

## Use Cases
- Track all your created polls in one place
- Monitor vote counts and engagement
- Quickly edit or delete your polls
- View expired polls for historical reference
- Filter and search through your poll collection

## Implementation Details

### Files Created
1. `app/my-polls/page.tsx` - Main My Polls page component
2. `app/api/polls/my-polls/route.ts` - API endpoint for fetching user's polls

### Files Modified
1. `components/Navbar.tsx` - Added "My Polls" navigation link

### Key Features
- Real-time filtering (no page reload)
- Responsive design (mobile & desktop)
- Loading states
- Empty states with helpful messages
- Statistics cards for quick overview
- Smooth animations on poll cards
