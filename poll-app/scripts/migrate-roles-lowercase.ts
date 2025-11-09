import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migrating user roles to lowercase...')
  
  // Update ADMIN to admin
  const adminUpdated = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { role: 'admin' },
  })
  console.log(`✅ Updated ${adminUpdated.count} ADMIN users to admin`)

  // Update MEMBER to member
  const memberUpdated = await prisma.user.updateMany({
    where: { role: 'MEMBER' },
    data: { role: 'member' },
  })
  console.log(`✅ Updated ${memberUpdated.count} MEMBER users to member`)

  // Verify the changes
  const allUsers = await prisma.user.findMany({
    select: { email: true, role: true },
  })
  
  console.log('\n📊 Current users:')
  console.table(allUsers)
  
  const adminCount = await prisma.user.count({ where: { role: 'admin' } })
  const memberCount = await prisma.user.count({ where: { role: 'member' } })
  
  console.log(`\n✅ Migration complete!`)
  console.log(`   - ${adminCount} admin users`)
  console.log(`   - ${memberCount} member users`)
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
