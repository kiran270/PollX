import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findUser() {
  try {
    const email = 'kirangilli.kumar@gmail.com'
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            polls: true,
            votes: true
          }
        }
      }
    })

    if (user) {
      console.log('\n✅ User Found!\n')
      console.log('ID:', user.id)
      console.log('Email:', user.email)
      console.log('Name:', user.name)
      console.log('Role:', user.role)
      console.log('Polls Created:', user._count.polls)
      console.log('Votes Cast:', user._count.votes)
      console.log('\n✅ This user CAN create polls!')
    } else {
      console.log('\n❌ User not found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findUser()
