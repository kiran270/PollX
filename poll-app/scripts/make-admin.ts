import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('Usage: npx tsx scripts/make-admin.ts <email>')
    console.log('\nCurrent users:')
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    })
    console.table(users)
    process.exit(0)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })

  console.log(`✅ ${user.email} is now an ADMIN`)
  
  console.log('\nAll users:')
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  })
  console.table(users)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
