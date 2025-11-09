# Migrate User Roles to Lowercase

This guide shows how to update all user roles from uppercase (ADMIN/MEMBER) to lowercase (admin/member).

## 🚀 Quick Migration

### **Option 1: Using Docker (Recommended)**

```bash
# Run the migration script inside the container
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const admin = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { role: 'admin' }
  });
  const member = await prisma.user.updateMany({
    where: { role: 'MEMBER' },
    data: { role: 'member' }
  });
  console.log('✅ Updated', admin.count, 'ADMIN users to admin');
  console.log('✅ Updated', member.count, 'MEMBER users to member');
  await prisma.\$disconnect();
})();
"
```

### **Option 2: Using SQLite Directly**

```bash
# Local
docker exec poll-app sqlite3 /app/prisma/dev.db "UPDATE User SET role = 'admin' WHERE role = 'ADMIN';"
docker exec poll-app sqlite3 /app/prisma/dev.db "UPDATE User SET role = 'member' WHERE role = 'MEMBER';"

# Verify
docker exec poll-app sqlite3 /app/prisma/dev.db "SELECT email, role FROM User;"
```

### **Option 3: On EC2**

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run migration
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const admin = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { role: 'admin' }
  });
  const member = await prisma.user.updateMany({
    where: { role: 'MEMBER' },
    data: { role: 'member' }
  });
  console.log('Updated', admin.count, 'admins and', member.count, 'members');
  await prisma.\$disconnect();
})();
"
```

---

## 📋 Step-by-Step Guide

### **1. Backup Database First**

```bash
# Local
docker cp poll-app:/app/prisma/dev.db ~/backup-before-migration.db

# EC2
docker cp poll-app:/app/prisma/dev.db ~/backup-before-migration.db
```

### **2. Check Current Roles**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.table(users);
  await prisma.\$disconnect();
})();
"
```

### **3. Run Migration**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  console.log('🔄 Migrating roles...');
  
  const admin = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { role: 'admin' }
  });
  console.log('✅ Updated', admin.count, 'ADMIN → admin');
  
  const member = await prisma.user.updateMany({
    where: { role: 'MEMBER' },
    data: { role: 'member' }
  });
  console.log('✅ Updated', member.count, 'MEMBER → member');
  
  await prisma.\$disconnect();
})();
"
```

### **4. Verify Migration**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const adminCount = await prisma.user.count({ where: { role: 'admin' } });
  const memberCount = await prisma.user.count({ where: { role: 'member' } });
  const oldAdmin = await prisma.user.count({ where: { role: 'ADMIN' } });
  const oldMember = await prisma.user.count({ where: { role: 'MEMBER' } });
  
  console.log('Current roles:');
  console.log('  admin:', adminCount);
  console.log('  member:', memberCount);
  console.log('  ADMIN (old):', oldAdmin);
  console.log('  MEMBER (old):', oldMember);
  
  await prisma.\$disconnect();
})();
"
```

### **5. Restart Application**

```bash
docker-compose restart poll-app
```

---

## 🔧 Troubleshooting

### **If migration fails:**

1. **Restore from backup:**
   ```bash
   docker cp ~/backup-before-migration.db poll-app:/app/prisma/dev.db
   docker-compose restart poll-app
   ```

2. **Check for errors:**
   ```bash
   docker logs poll-app
   ```

3. **Manually update via SQL:**
   ```bash
   docker exec poll-app sqlite3 /app/prisma/dev.db <<EOF
   UPDATE User SET role = 'admin' WHERE role = 'ADMIN';
   UPDATE User SET role = 'member' WHERE role = 'MEMBER';
   SELECT email, role FROM User;
   EOF
   ```

---

## ✅ Verification Checklist

- [ ] Database backed up
- [ ] Migration script executed successfully
- [ ] All ADMIN roles converted to admin
- [ ] All MEMBER roles converted to member
- [ ] No uppercase roles remaining
- [ ] Application restarted
- [ ] Login still works
- [ ] Admin features still accessible
- [ ] User management works

---

## 📊 Quick Check Commands

```bash
# Count users by role
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  });
  console.table(roles);
  await prisma.\$disconnect();
})();
"

# List all users with roles
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true }
  });
  console.table(users);
  await prisma.\$disconnect();
})();
"
```

---

## 🎯 One-Line Migration

For quick migration, copy and paste this:

```bash
docker exec poll-app node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { await prisma.user.updateMany({ where: { role: 'ADMIN' }, data: { role: 'admin' } }); await prisma.user.updateMany({ where: { role: 'MEMBER' }, data: { role: 'member' } }); console.log('✅ Migration complete'); await prisma.\$disconnect(); })();"
```

That's it! Your roles are now lowercase. 🎉
