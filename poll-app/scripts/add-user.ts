import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUser() {
  try {
    const email = 'kirangilli.kumar@gmail.com'
    const name = 'Kiran Gilli Kumar'

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      console.log('✅ User already exists:', user.email)
      console.log('Current role:', user.role)
      
      // Update to admin if not already
      if (user.role !== 'admin') {
        user = await prisma.user.update({
          where: { email },
          data: { role: 'admin' }
        })
        console.log('✅ Updated user to admin role')
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'admin',
          emailVerified: new Date()
        }
      })
      console.log('✅ Created new user:', user.email)
    }

    console.log('\n📊 User Details:')
    console.log('- ID:', user.id)
    console.log('- Email:', user.email)
    console.log('- Name:', user.name)
    console.log('- Role:', user.role)
    console.log('\n✅ User is ready to create polls!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addUser()
