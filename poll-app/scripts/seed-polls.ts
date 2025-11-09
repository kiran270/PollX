import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pollTemplates = [
  {
    title: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "Java", "C++", "Go", "Rust", "TypeScript", "Ruby"]
  },
  {
    title: "Best time to code?",
    options: ["Early Morning", "Late Night", "Afternoon", "Whenever inspiration strikes"]
  },
  {
    title: "Preferred development environment?",
    options: ["VS Code", "IntelliJ IDEA", "Vim", "Sublime Text", "Atom", "WebStorm"]
  },
  {
    title: "Favorite web framework?",
    options: ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "SolidJS"]
  },
  {
    title: "Coffee or Tea?",
    options: ["Coffee", "Tea", "Energy Drinks", "Water", "Nothing"]
  },
  {
    title: "Best operating system for development?",
    options: ["macOS", "Linux", "Windows", "BSD"]
  },
  {
    title: "Tabs or Spaces?",
    options: ["Tabs", "Spaces", "Both", "Don't care"]
  },
  {
    title: "Favorite database?",
    options: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase"]
  },
  {
    title: "Best mobile platform?",
    options: ["iOS", "Android", "Both equally", "Neither"]
  },
  {
    title: "Preferred cloud provider?",
    options: ["AWS", "Google Cloud", "Azure", "DigitalOcean", "Vercel", "Netlify"]
  },
  {
    title: "Dark mode or Light mode?",
    options: ["Dark Mode", "Light Mode", "Auto Switch", "Depends on time"]
  },
  {
    title: "Best version control?",
    options: ["Git", "SVN", "Mercurial", "Perforce"]
  },
  {
    title: "Favorite CSS framework?",
    options: ["Tailwind CSS", "Bootstrap", "Material UI", "Bulma", "Foundation", "Pure CSS"]
  },
  {
    title: "Best testing framework?",
    options: ["Jest", "Mocha", "Jasmine", "Cypress", "Playwright", "Vitest"]
  },
  {
    title: "Preferred package manager?",
    options: ["npm", "yarn", "pnpm", "bun"]
  },
  {
    title: "Best backend language?",
    options: ["Node.js", "Python", "Go", "Java", "PHP", "Ruby", "C#"]
  },
  {
    title: "Favorite code editor theme?",
    options: ["Dracula", "One Dark Pro", "Monokai", "Solarized", "Nord", "Material Theme"]
  },
  {
    title: "Best way to learn coding?",
    options: ["Online Courses", "Books", "YouTube", "Practice Projects", "Bootcamp", "University"]
  },
  {
    title: "Preferred work setup?",
    options: ["Remote", "Office", "Hybrid", "Co-working Space"]
  },
  {
    title: "Best documentation tool?",
    options: ["Notion", "Confluence", "GitBook", "Docusaurus", "MkDocs", "Swagger"]
  },
  {
    title: "Favorite API style?",
    options: ["REST", "GraphQL", "gRPC", "WebSocket", "SOAP"]
  },
  {
    title: "Best containerization tool?",
    options: ["Docker", "Kubernetes", "Podman", "LXC"]
  },
  {
    title: "Preferred CI/CD platform?",
    options: ["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "Travis CI"]
  },
  {
    title: "Best monitoring tool?",
    options: ["Datadog", "New Relic", "Prometheus", "Grafana", "Sentry"]
  },
  {
    title: "Favorite design tool?",
    options: ["Figma", "Sketch", "Adobe XD", "InVision", "Framer"]
  },
  {
    title: "Best project management tool?",
    options: ["Jira", "Trello", "Asana", "Linear", "Monday.com", "ClickUp"]
  },
  {
    title: "Preferred authentication method?",
    options: ["JWT", "OAuth", "Session-based", "API Keys", "SAML"]
  },
  {
    title: "Best state management?",
    options: ["Redux", "MobX", "Zustand", "Recoil", "Context API", "Jotai"]
  },
  {
    title: "Favorite terminal?",
    options: ["iTerm2", "Hyper", "Windows Terminal", "Alacritty", "Kitty", "Warp"]
  },
  {
    title: "Best email service for developers?",
    options: ["SendGrid", "Mailgun", "AWS SES", "Postmark", "Resend"]
  }
]

const additionalPolls = [
  { title: "Best pizza topping?", options: ["Pepperoni", "Mushrooms", "Olives", "Pineapple", "Sausage", "Bacon", "Vegetables"] },
  { title: "Favorite season?", options: ["Spring", "Summer", "Fall", "Winter"] },
  { title: "Best movie genre?", options: ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Thriller", "Documentary"] },
  { title: "Preferred workout time?", options: ["Morning", "Afternoon", "Evening", "Night", "Don't workout"] },
  { title: "Best social media platform?", options: ["Twitter", "Instagram", "Facebook", "LinkedIn", "TikTok", "Reddit", "YouTube"] },
  { title: "Favorite music genre?", options: ["Rock", "Pop", "Hip Hop", "Jazz", "Classical", "Electronic", "Country", "R&B"] },
  { title: "Best streaming service?", options: ["Netflix", "Disney+", "HBO Max", "Amazon Prime", "Hulu", "Apple TV+"] },
  { title: "Preferred reading format?", options: ["Physical Books", "E-books", "Audiobooks", "All formats"] },
  { title: "Best vacation type?", options: ["Beach", "Mountains", "City Tour", "Adventure", "Cruise", "Staycation"] },
  { title: "Favorite pet?", options: ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Reptile", "No pets"] },
  { title: "Best breakfast food?", options: ["Pancakes", "Eggs", "Cereal", "Toast", "Fruit", "Smoothie", "Nothing"] },
  { title: "Preferred communication?", options: ["Text", "Call", "Video Call", "Email", "In Person"] },
  { title: "Best superhero?", options: ["Spider-Man", "Batman", "Superman", "Iron Man", "Wonder Woman", "Captain America"] },
  { title: "Favorite sport?", options: ["Football", "Basketball", "Soccer", "Tennis", "Baseball", "Cricket", "Hockey"] },
  { title: "Best ice cream flavor?", options: ["Vanilla", "Chocolate", "Strawberry", "Mint", "Cookie Dough", "Caramel", "Pistachio"] },
  { title: "Preferred learning style?", options: ["Visual", "Auditory", "Kinesthetic", "Reading/Writing"] },
  { title: "Best car brand?", options: ["Tesla", "BMW", "Mercedes", "Toyota", "Honda", "Ford", "Audi", "Porsche"] },
  { title: "Favorite holiday?", options: ["Christmas", "New Year", "Halloween", "Thanksgiving", "Easter", "Birthday"] },
  { title: "Best phone brand?", options: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Huawei"] },
  { title: "Preferred sleep schedule?", options: ["Early Bird", "Night Owl", "Flexible", "Irregular"] }
]

async function main() {
  console.log('🌱 Starting to seed polls...')

  // Create demo user if doesn't exist
  let user = await prisma.user.findUnique({ where: { id: 'demo-user-id' } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin',
      },
    })
    console.log('✅ Created demo user')
  }

  const allPolls = [...pollTemplates, ...additionalPolls]
  
  // Generate 100 polls
  for (let i = 0; i < 100; i++) {
    const template = allPolls[i % allPolls.length]
    
    // Randomly select 2-8 options
    const numOptions = Math.floor(Math.random() * 7) + 2 // 2 to 8 options
    const shuffledOptions = [...template.options].sort(() => Math.random() - 0.5)
    const selectedOptions = shuffledOptions.slice(0, Math.min(numOptions, template.options.length))
    
    // Random expiration time
    // 30% expired, 70% active with various times
    const now = new Date()
    let expiresAt: Date
    
    if (Math.random() < 0.3) {
      // Expired polls (1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1
      expiresAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    } else {
      // Active polls with various times remaining
      const hoursRemaining = [1, 3, 6, 12, 24, 48, 72, 168][Math.floor(Math.random() * 8)]
      expiresAt = new Date(now.getTime() + hoursRemaining * 60 * 60 * 1000)
    }
    
    // Add variation to title
    const titleVariations = [
      template.title,
      `${template.title} 🔥`,
      `POLL: ${template.title}`,
      `Quick Poll - ${template.title}`,
      `${template.title} [${i + 1}]`
    ]
    const title = titleVariations[i % titleVariations.length]
    
    // Random descriptions (50% have descriptions)
    const descriptions = [
      null,
      "Cast your vote and see what others think!",
      "Help us understand community preferences",
      "Your opinion matters - vote now!",
      "Quick poll - takes just a second",
      null,
      "Share your thoughts with the community",
      null
    ]
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]
    
    try {
      const poll = await prisma.poll.create({
        data: {
          title,
          description,
          expiresAt,
          userId: user.id,
          options: {
            create: selectedOptions.map(text => ({ text })),
          },
        },
        include: {
          options: true,
        },
      })
      
      // Add random votes (0-50 votes per poll)
      const numVotes = Math.floor(Math.random() * 51)
      for (let v = 0; v < numVotes; v++) {
        const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)]
        const voterId = `voter-${i}-${v}`
        
        // Create voter if doesn't exist
        let voter = await prisma.user.findUnique({ where: { id: voterId } })
        if (!voter) {
          voter = await prisma.user.create({
            data: {
              id: voterId,
              email: `voter${i}${v}@example.com`,
              name: `Voter ${v}`,
            },
          })
        }
        
        // Create vote
        try {
          await prisma.vote.create({
            data: {
              userId: voter.id,
              pollId: poll.id,
              optionId: randomOption.id,
            },
          })
        } catch (error) {
          // Skip if vote already exists
        }
      }
      
      console.log(`✅ Created poll ${i + 1}/100: "${title}" with ${selectedOptions.length} options and ${numVotes} votes`)
    } catch (error) {
      console.error(`❌ Error creating poll ${i + 1}:`, error)
    }
  }
  
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
