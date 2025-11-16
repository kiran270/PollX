import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌟 Seeding trending polls...')

  // Find or create an admin user for poll creation
  let adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (!adminUser) {
    console.log('⚠️  No admin user found. Creating a default admin...')
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@pollx.com',
        name: 'PollX Admin',
        role: 'admin',
      }
    })
  }

  console.log(`✅ Using admin: ${adminUser.email}`)

  const trendingPolls = [
    // Technology
    {
      title: "Which AI tool do you use most in 2024?",
      description: "AI tools have become essential in our daily work. Which one is your go-to?",
      category: "Technology",
      options: ["ChatGPT", "Claude", "Gemini", "Copilot", "Midjourney", "None"],
      expiresIn: 168, // 7 days
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "What's your preferred programming language for 2024?",
      description: "The tech landscape keeps evolving. What language are you betting on?",
      category: "Technology",
      options: ["Python", "JavaScript/TypeScript", "Rust", "Go", "Java", "C++"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Will Apple Vision Pro succeed in the market?",
      description: "Apple's spatial computing device launched in 2024. What's your prediction?",
      category: "Technology",
      options: ["Yes, it will revolutionize computing", "Moderate success", "No, too expensive", "Too early to tell"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },

    // Politics
    {
      title: "Should social media platforms be regulated more strictly?",
      description: "With growing concerns about misinformation and privacy, what's your stance?",
      category: "Politics",
      options: ["Yes, much stricter regulation needed", "Some regulation is good", "No, keep them free", "Unsure"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "What's the biggest global challenge in 2024?",
      description: "Multiple crises face the world. Which should be the top priority?",
      category: "Politics",
      options: ["Climate Change", "Economic Inequality", "Global Conflicts", "AI Regulation", "Healthcare Access"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },

    // Entertainment
    {
      title: "Best streaming platform in 2024?",
      description: "With so many options, which streaming service gives you the most value?",
      category: "Entertainment",
      options: ["Netflix", "Disney+", "Prime Video", "Apple TV+", "Max (HBO)", "YouTube Premium"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Most anticipated movie of 2024?",
      description: "2024 has some blockbusters coming. Which are you most excited about?",
      category: "Entertainment",
      options: ["Dune: Part Two", "Deadpool 3", "Inside Out 2", "Joker 2", "Gladiator 2"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Should video games be considered art?",
      description: "The debate continues. What's your take on gaming as an art form?",
      category: "Entertainment",
      options: ["Absolutely, they're art", "Some games are art", "No, they're just entertainment", "It depends on the game"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },

    // Sports
    {
      title: "Who will win the 2024 NBA Championship?",
      description: "The race is heating up. Which team has the best shot?",
      category: "Sports",
      options: ["Boston Celtics", "Denver Nuggets", "Milwaukee Bucks", "Phoenix Suns", "LA Lakers", "Other"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Should esports be in the Olympics?",
      description: "Esports continues to grow. Should it be recognized as an Olympic sport?",
      category: "Sports",
      options: ["Yes, it's a legitimate sport", "Maybe in the future", "No, keep it separate", "Only certain games"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },

    // Science
    {
      title: "Will humans land on Mars by 2030?",
      description: "SpaceX and NASA have ambitious plans. Is it realistic?",
      category: "Science",
      options: ["Yes, definitely", "Possibly, but unlikely", "No, too ambitious", "After 2030"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "What's the most promising renewable energy source?",
      description: "As we transition away from fossil fuels, which technology will lead?",
      category: "Science",
      options: ["Solar Power", "Wind Energy", "Nuclear Fusion", "Hydrogen Fuel", "Geothermal"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Should gene editing be allowed for human enhancement?",
      description: "CRISPR technology advances. Where should we draw the line?",
      category: "Science",
      options: ["Yes, for medical purposes only", "Yes, including enhancements", "No, too risky", "Only with strict regulation"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },

    // Business
    {
      title: "Will remote work become the standard?",
      description: "Post-pandemic, companies are deciding on work models. What's the future?",
      category: "Business",
      options: ["Fully remote", "Hybrid (2-3 days office)", "Back to office full-time", "Depends on industry"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Which tech company will dominate the AI race?",
      description: "The AI arms race is on. Who will come out on top?",
      category: "Business",
      options: ["OpenAI", "Google", "Microsoft", "Meta", "Anthropic", "A startup we don't know yet"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "Should there be a 4-day work week?",
      description: "Trials show promising results. Should it become standard?",
      category: "Business",
      options: ["Yes, with same pay", "Yes, but with adjusted pay", "No, keep 5 days", "Let companies decide"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },

    // Other
    {
      title: "What's your biggest concern about AI?",
      description: "AI is advancing rapidly. What worries you most?",
      category: "Other",
      options: ["Job displacement", "Privacy concerns", "Misinformation", "AI becoming too powerful", "Not concerned"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "How do you feel about cryptocurrency in 2024?",
      description: "After market volatility, what's your stance on crypto?",
      category: "Other",
      options: ["Bullish - it's the future", "Cautiously optimistic", "Bearish - it's a bubble", "Don't understand it"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
    {
      title: "What's your preferred way to learn new skills?",
      description: "Education is evolving. How do you prefer to learn?",
      category: "Other",
      options: ["Online courses", "YouTube tutorials", "Books", "Bootcamps", "Traditional education", "Learning by doing"],
      expiresIn: 168,
      allowVoteChange: true,
      isPublic: true,
    },
  ]

  let created = 0
  let skipped = 0

  for (const pollData of trendingPolls) {
    // Check if poll already exists
    const existing = await prisma.poll.findFirst({
      where: { title: pollData.title }
    })

    if (existing) {
      console.log(`⏭️  Skipping: "${pollData.title}" (already exists)`)
      skipped++
      continue
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + pollData.expiresIn)

    await prisma.poll.create({
      data: {
        title: pollData.title,
        description: pollData.description,
        category: pollData.category,
        allowVoteChange: pollData.allowVoteChange,
        isPublic: pollData.isPublic,
        expiresAt,
        userId: adminUser.id,
        options: {
          create: pollData.options.map(text => ({ text }))
        }
      }
    })

    console.log(`✅ Created: "${pollData.title}"`)
    created++
  }

  console.log('\n🎉 Seeding complete!')
  console.log(`✅ Created: ${created} polls`)
  console.log(`⏭️  Skipped: ${skipped} polls (already exist)`)
  console.log(`📊 Total: ${created + skipped} polls processed`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding polls:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
