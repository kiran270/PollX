import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗳️  Seeding votes with test users...')

  // Create test users
  const testUsers = [
    { email: 'alice@test.com', name: 'Alice Johnson' },
    { email: 'bob@test.com', name: 'Bob Smith' },
    { email: 'charlie@test.com', name: 'Charlie Brown' },
    { email: 'diana@test.com', name: 'Diana Prince' },
    { email: 'eve@test.com', name: 'Eve Wilson' },
    { email: 'frank@test.com', name: 'Frank Miller' },
    { email: 'grace@test.com', name: 'Grace Lee' },
    { email: 'henry@test.com', name: 'Henry Ford' },
    { email: 'iris@test.com', name: 'Iris West' },
    { email: 'jack@test.com', name: 'Jack Ryan' },
  ]

  console.log('Creating test users...')
  const users = []
  for (const userData of testUsers) {
    let user = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: userData
      })
      console.log(`✅ Created user: ${user.name}`)
    } else {
      console.log(`⏭️  User exists: ${user.name}`)
    }
    users.push(user)
  }

  // Get all polls
  const polls = await prisma.poll.findMany({
    include: {
      options: true,
      votes: true
    }
  })

  if (polls.length === 0) {
    console.log('❌ No polls found. Please create some polls first.')
    return
  }

  console.log(`\n📊 Found ${polls.length} polls. Adding votes...\n`)

  let totalVotesAdded = 0

  for (const poll of polls) {
    console.log(`\n📋 Poll: "${poll.title}"`)
    
    // Check if poll already has votes
    if (poll.votes.length > 0) {
      console.log(`   ⏭️  Already has ${poll.votes.length} votes, skipping...`)
      continue
    }

    // Randomly select 3-7 users to vote on this poll
    const numVoters = Math.floor(Math.random() * 5) + 3 // 3-7 voters
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
    const voters = shuffledUsers.slice(0, numVoters)

    for (const user of voters) {
      // Randomly select an option
      const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)]

      try {
        // Check if user already voted
        const existingVote = await prisma.vote.findUnique({
          where: {
            userId_pollId: {
              userId: user.id,
              pollId: poll.id
            }
          }
        })

        if (!existingVote) {
          await prisma.vote.create({
            data: {
              userId: user.id,
              pollId: poll.id,
              optionId: randomOption.id
            }
          })
          console.log(`   ✅ ${user.name} voted for "${randomOption.text}"`)
          totalVotesAdded++
        }
      } catch (error) {
        console.error(`   ❌ Failed to add vote for ${user.name}:`, error)
      }
    }
  }

  console.log(`\n🎉 Seeding complete!`)
  console.log(`✅ Created/verified: ${users.length} test users`)
  console.log(`✅ Added: ${totalVotesAdded} votes`)
  console.log(`📊 Processed: ${polls.length} polls`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding votes:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
