import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create admin user
  const adminEmail = 'kirangilli.kumar@gmail.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Kiran Gilli Kumar',
        role: 'admin'
      }
    })
    console.log('✅ Admin user created:', adminEmail)
  } else {
    console.log('ℹ️  Admin user already exists:', adminEmail)
  }
  
  console.log('✅ Database seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
