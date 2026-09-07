# 🖼️ Image/GIF Support - Implementation Guide

## ✅ What's Been Set Up

### 1. Database Schema Updated
Added image support to the database:

```prisma
model Poll {
  imageUrl String? // Poll question image
  reactions Reaction[] // GIF reactions
}

model Option {
  imageUrl String? // Visual voting options
}

model Reaction {
  emoji String // Emoji/GIF reactions
  // Unique per user per poll per emoji
}
```

### 2. API Routes Created
- ✅ `/api/polls/[id]/reactions` - GET/POST reactions
- ✅ Reaction toggle (add/remove)
- ✅ Reaction counts by emoji

### 3. Image Upload Utility
- ✅ `lib/imageUpload.ts` - Validation and conversion
- ✅ File size limit (5MB)
- ✅ Allowed types: JPEG, PNG, GIF, WebP
- ✅ Base64 conversion for simple storage

## 🚧 What Needs to Be Completed

### Frontend Implementation

#### 1. Update Create Poll Page
Add image upload UI:
```tsx
// Poll image upload
<input 
  type="file" 
  accept="image/*"
  onChange={(e) => handleImageUpload(e.target.files[0], 'poll')}
/>

// Option image upload
{options.map((option, index) => (
  <div>
    <input value={option.text} />
    <input 
      type="file"
      accept="image/*"
      onChange={(e) => handleImageUpload(e.target.files[0], 'option', index)}
    />
  </div>
))}
```

#### 2. Update Poll Display
Show images in polls:
```tsx
{poll.imageUrl && (
  <img src={poll.imageUrl} alt={poll.title} />
)}

{option.imageUrl && (
  <img src={option.imageUrl} alt={option.text} />
)}
```

#### 3. Add Reaction Component
Create emoji/GIF reaction picker:
```tsx
const REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '👏']

<div className="reactions">
  {REACTIONS.map(emoji => (
    <button onClick={() => handleReaction(emoji)}>
      {emoji} {reactionCounts[emoji] || 0}
    </button>
  ))}
</div>
```

### Backend Updates

#### 1. Update Poll Creation API
Modify `/api/polls/route.ts`:
```typescript
const { imageUrl, options } = body

await prisma.poll.create({
  data: {
    imageUrl,
    options: {
      create: options.map(opt => ({
        text: opt.text,
        imageUrl: opt.imageUrl
      }))
    }
  }
})
```

#### 2. Include Reactions in Poll Fetch
Update poll queries to include reactions:
```typescript
include: {
  reactions: {
    select: {
      emoji: true,
      userId: true
    }
  }
}
```

## 🎨 UI Components Needed

### 1. Image Upload Component
```tsx
<ImageUpload
  onUpload={(base64) => setImage(base64)}
  preview={image}
  onRemove={() => setImage('')}
/>
```

### 2. Reaction Picker
```tsx
<ReactionPicker
  pollId={poll.id}
  reactions={poll.reactions}
  onReact={(emoji) => handleReaction(emoji)}
/>
```

### 3. Visual Poll Option
```tsx
<VisualOption
  image={option.imageUrl}
  text={option.text}
  selected={selected}
  onClick={() => selectOption(option.id)}
/>
```

## 📦 Optional Enhancements

### Cloud Storage Integration
Instead of base64, use cloud storage:

**Cloudinary:**
```bash
npm install cloudinary
```

**AWS S3:**
```bash
npm install @aws-sdk/client-s3
```

**Vercel Blob:**
```bash
npm install @vercel/blob
```

### GIF Search Integration
Add Giphy API:
```typescript
// Get free API key: https://developers.giphy.com/
const GIPHY_API_KEY = process.env.GIPHY_API_KEY

async function searchGifs(query: string) {
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}`
  )
  return res.json()
}
```

## 🎯 Implementation Steps

### Phase 1: Basic Image Upload (1-2 hours)
1. ✅ Database schema updated
2. ✅ API routes created
3. ⏳ Update create poll form
4. ⏳ Add image preview
5. ⏳ Update poll display

### Phase 2: Visual Options (1 hour)
1. ⏳ Add option image upload
2. ⏳ Display option images
3. ⏳ Style visual voting

### Phase 3: Reactions (1 hour)
1. ✅ Reaction API ready
2. ⏳ Create reaction picker UI
3. ⏳ Display reaction counts
4. ⏳ Add reaction animations

### Phase 4: GIF Support (Optional, 1 hour)
1. ⏳ Integrate Giphy API
2. ⏳ GIF search modal
3. ⏳ GIF preview
4. ⏳ Animated GIF reactions

## 🔧 Quick Start

### 1. Test Reactions API
```bash
# Add reaction
curl -X POST http://localhost:3000/api/polls/[poll-id]/reactions \
  -H "Content-Type: application/json" \
  -d '{"emoji":"👍"}'

# Get reactions
curl http://localhost:3000/api/polls/[poll-id]/reactions
```

### 2. Test Image Upload
```typescript
// In create poll form
const handleImageUpload = (file: File) => {
  const reader = new FileReader()
  reader.onloadend = () => {
    setPollImage(reader.result as string)
  }
  reader.readAsDataURL(file)
}
```

## 📝 Example Usage

### Creating Poll with Image
```typescript
const pollData = {
  title: "Which design do you prefer?",
  imageUrl: "data:image/png;base64,...",
  options: [
    { text: "Design A", imageUrl: "data:image/png;base64,..." },
    { text: "Design B", imageUrl: "data:image/png;base64,..." }
  ]
}
```

### Adding Reactions
```typescript
const handleReaction = async (emoji: string) => {
  await fetch(`/api/polls/${pollId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji })
  })
  // Refresh reactions
}
```

## 🎨 Design Considerations

### Image Display
- Max width: 100% of container
- Aspect ratio: Maintain original
- Loading state: Skeleton/spinner
- Error state: Fallback image

### Visual Options
- Grid layout for image options
- Hover effects
- Selected state highlight
- Image optimization

### Reactions
- Emoji picker modal
- Animated reactions
- Real-time updates
- Reaction tooltips (who reacted)

## 🚀 Current Status

- ✅ Database ready for images
- ✅ Reaction system implemented
- ✅ Image validation utility
- ✅ API routes created
- ⏳ Frontend UI pending
- ⏳ Image upload form pending
- ⏳ Visual display pending

## 💡 Next Steps

1. **Complete the UI** - Add image upload inputs to create poll form
2. **Display images** - Show images in poll cards and detail pages
3. **Add reactions** - Create reaction picker component
4. **Test thoroughly** - Upload images, vote, react
5. **Optimize** - Consider cloud storage for production

Would you like me to complete any specific part of this implementation?
