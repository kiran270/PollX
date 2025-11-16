import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate random names
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
  'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
  'Frank', 'Rachel', 'Alexander', 'Catherine', 'Patrick', 'Carolyn', 'Jack', 'Janet',
  'Dennis', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
]

function generateRandomUser(index: number) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@test.com`,
    name: `${firstName} ${lastName}`
  }
}

async function main() {
  console.log('🗳️  Seeding 5000 votes with test users...')
  console.log('⏳ This may take a few minutes...\n')

  const TARGET_VOTES = 5000
  const BATCH_SIZE = 100

  // Get all polls
  const polls = await prisma.poll.findMany({
    include: {
      options: true,
      _count: {
        select: { votes: true }
      }
    }
  })

  if (polls.length === 0) {
    console.log('❌ No polls found. Please create some polls first.')
    return
  }

  console.log(`📊 Found ${polls.length} polls`)
  
  // Calculate current total votes
  const currentVotes = polls.reduce((sum, poll) => sum + poll._count.votes, 0)
  console.log(`📈 Current votes: ${currentVotes}`)
  console.log(`🎯 Target votes: ${TARGET_VOTES}`)
  
  const votesToAdd = TARGET_VOTES - currentVotes
  
  if (votesToAdd <= 0) {
    console.log('✅ Already have enough votes!')
    return
  }

  console.log(`➕ Adding ${votesToAdd} more votes...\n`)

  let votesAdded = 0
  let usersCreated = 0
  let batchCount = 0

  while (votesAdded < votesToAdd) {
    const batchVotes = Math.min(BATCH_SIZE, votesToAdd - votesAdded)
    
    for (let i = 0; i < batchVotes; i++) {
      // Generate random user
      const userData = generateRandomUser(Date.now() + votesAdded + i)
      
      // Create or get user
      let user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      })

      if (user.createdAt.getTime() > Date.now() - 1000) {
        usersCreated++
      }

      // Select random poll
      const randomPoll = polls[Math.floor(Math.random() * polls.length)]
      
      // Select random option
      const randomOption = randomPoll.options[Math.floor(Math.random() * randomPoll.options.length)]

      try {
        // Check if user already voted on this poll
        const existingVote = await prisma.vote.findUnique({
          where: {
            userId_pollId: {
              userId: user.id,
              pollId: randomPoll.id
            }
          }
        })

        if (!existingVote) {
          await prisma.vote.create({
            data: {
              userId: user.id,
              pollId: randomPoll.id,
              optionId: randomOption.id
            }
          })
          votesAdded++
        }
      } catch (error) {
        // Skip if vote fails (duplicate, etc.)
        continue
      }
    }

    batchCount++
    console.log(`✅ Batch ${batchCount}: ${votesAdded}/${votesToAdd} votes added`)
  }

  console.log(`\n🎉 Seeding complete!`)
  console.log(`✅ Created: ${usersCreated} new test users`)
  console.log(`✅ Added: ${votesAdded} votes`)
  console.log(`📊 Total votes now: ${currentVotes + votesAdded}`)
  console.log(`📋 Across ${polls.length} polls`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding votes:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
