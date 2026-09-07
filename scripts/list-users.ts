import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        _count: {
          select: {
            polls: true,
            votes: true
          }
        }
      }
    })

    console.log('\n📊 All Users in Database:\n')
    console.log('Total Users:', users.length)
    console.log('─'.repeat(80))
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No Name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Polls Created: ${user._count.polls}`)
      console.log(`   Votes Cast: ${user._count.votes}`)
    })
    
    console.log('\n' + '─'.repeat(80))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
