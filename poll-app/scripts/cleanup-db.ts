import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up database...')
  console.log('==========================')
  console.log('')

  // Get current counts
  const userCount = await prisma.user.count()
  const pollCount = await prisma.poll.count()
  const voteCount = await prisma.vote.count()

  console.log('📊 Current database:')
  console.log(`   Users: ${userCount}`)
  console.log(`   Polls: ${pollCount}`)
  console.log(`   Votes: ${voteCount}`)
  console.log('')

  // Delete all votes first
  console.log('🗑️  Deleting all votes...')
  await prisma.vote.deleteMany({})
  console.log('✅ All votes deleted')

  // Delete all options
  console.log('🗑️  Deleting all options...')
  await prisma.option.deleteMany({})
  console.log('✅ All options deleted')

  // Delete all polls
  console.log('🗑️  Deleting all polls...')
  await prisma.poll.deleteMany({})
  console.log('✅ All polls deleted')

  // Delete all non-admin users
  console.log('🗑️  Deleting non-admin users...')
  const deletedUsers = await prisma.user.deleteMany({
    where: { 
      role: { not: 'admin' }
    },
  })
  console.log(`✅ Deleted ${deletedUsers.count} non-admin users`)

  // Get admin users
  const adminUsers = await prisma.user.findMany({
    where: { role: 'admin' },
  })

  if (adminUsers.length === 0) {
    console.log('⚠️  No admin users found!')
    console.log('   Please create an admin user first')
    return
  }

  console.log(`✅ Kept ${adminUsers.count} admin users`)
  console.log('')

  // Create 3 sample polls
  console.log('📝 Creating 3 sample polls...')

  const adminUser = adminUsers[0]

  // Poll 1
  await prisma.poll.create({
    data: {
      title: 'What is your favorite programming language?',
      description: 'Vote for your most preferred programming language',
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      options: {
        create: [
          { text: 'JavaScript' },
          { text: 'Python' },
          { text: 'TypeScript' },
          { text: 'Java' },
        ],
      },
    },
  })
  console.log('✅ Poll 1: Programming Language')

  // Poll 2
  await prisma.poll.create({
    data: {
      title: 'Best time to code?',
      description: 'When are you most productive?',
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      options: {
        create: [
          { text: 'Early Morning (5-9 AM)' },
          { text: 'Late Morning (9-12 PM)' },
          { text: 'Afternoon (12-5 PM)' },
          { text: 'Evening (5-9 PM)' },
          { text: 'Night (9 PM-1 AM)' },
          { text: 'Late Night (1-5 AM)' },
        ],
      },
    },
  })
  console.log('✅ Poll 2: Best Time to Code')

  // Poll 3
  await prisma.poll.create({
    data: {
      title: 'Preferred Development Environment?',
      description: 'Which IDE or editor do you use most?',
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      options: {
        create: [
          { text: 'VS Code' },
          { text: 'IntelliJ IDEA' },
          { text: 'Vim/Neovim' },
          { text: 'Sublime Text' },
          { text: 'WebStorm' },
        ],
      },
    },
  })
  console.log('✅ Poll 3: Development Environment')

  console.log('')
  console.log('📊 Final database:')
  const finalUsers = await prisma.user.count()
  const finalPolls = await prisma.poll.count()
  const finalOptions = await prisma.option.count()

  console.log(`   Users: ${finalUsers} (all admins)`)
  console.log(`   Polls: ${finalPolls}`)
  console.log(`   Options: ${finalOptions}`)
  console.log('')
  console.log('✅ Database cleanup complete!')
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
