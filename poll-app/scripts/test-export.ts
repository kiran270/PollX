import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testExport() {
  try {
    // Get a poll owned by kirangilli.kumar@gmail.com
    const user = await prisma.user.findUnique({
      where: { email: 'kirangilli.kumar@gmail.com' }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    const polls = await prisma.poll.findMany({
      where: { userId: user.id },
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      take: 1
    })

    if (polls.length === 0) {
      console.log('❌ No polls found for this user')
      return
    }

    const poll = polls[0]
    console.log('\n✅ Found poll:', poll.title)
    console.log('Poll ID:', poll.id)
    console.log('Total options:', poll.options.length)
    
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
    console.log('Total votes:', totalVotes)

    if (totalVotes === 0) {
      console.log('\n⚠️  This poll has no votes yet. CSV will be empty.')
    } else {
      console.log('\n📊 Vote breakdown:')
      poll.options.forEach(option => {
        console.log(`  - ${option.text}: ${option.votes.length} votes`)
      })
    }

    console.log('\n✅ Export should work for this poll!')
    console.log(`\nTest URL: http://localhost:3000/poll/${poll.id}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testExport()
