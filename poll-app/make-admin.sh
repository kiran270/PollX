#!/bin/bash

# Make a user admin
# Usage: ./make-admin.sh user@example.com

if [ -z "$1" ]; then
    echo "Usage: ./make-admin.sh <email>"
    echo ""
    echo "Listing all users:"
    docker-compose exec -T poll-app node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.user.findMany().then(users => {
      console.table(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
      prisma.\$disconnect();
    });
    "
    exit 0
fi

EMAIL="$1"

echo "Making $EMAIL an admin..."

docker-compose exec -T poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.update({
  where: { email: '$EMAIL' },
  data: { role: 'ADMIN' }
}).then(user => {
  console.log('✅ ' + user.email + ' is now an ADMIN');
  return prisma.user.findMany();
}).then(users => {
  console.log('\nAll users:');
  console.table(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
  prisma.\$disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  prisma.\$disconnect();
});
"
