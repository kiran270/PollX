# Database Cleanup Guide

Remove all users (except admins) and all polls, then create 3 fresh sample polls.

## 🧹 Quick Cleanup

### **On EC2:**

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to app
cd ~/poll-app

# Run cleanup
docker exec poll-app npx tsx scripts/cleanup-db.ts
```

### **Local (Docker):**

```bash
cd ~/Documents/Poll/PollX/poll-app
docker exec poll-app npx tsx scripts/cleanup-db.ts
```

---

## 📋 What Gets Deleted

- ❌ All votes
- ❌ All poll options
- ❌ All polls
- ❌ All users with role "member"

## ✅ What Gets Kept

- ✅ All users with role "admin"

## 📝 What Gets Created

- ✅ 3 new sample polls:
  1. "What is your favorite programming language?"
  2. "Best time to code?"
  3. "Preferred Development Environment?"

---

## 🔧 Manual Cleanup (Alternative)

If the script doesn't work, use these commands:

### **Delete Everything:**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  await prisma.vote.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.poll.deleteMany({});
  await prisma.user.deleteMany({ where: { role: 'member' } });
  console.log('✅ Cleanup complete');
  await prisma.\$disconnect();
})();
"
```

### **Create Sample Polls:**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) { console.log('No admin found'); return; }
  
  await prisma.poll.create({
    data: {
      title: 'What is your favorite programming language?',
      userId: admin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      options: {
        create: [
          { text: 'JavaScript' },
          { text: 'Python' },
          { text: 'TypeScript' },
          { text: 'Java' }
        ]
      }
    }
  });
  
  console.log('✅ Sample poll created');
  await prisma.\$disconnect();
})();
"
```

---

## 🔍 Verify Cleanup

### **Check Database:**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.count();
  const polls = await prisma.poll.count();
  const votes = await prisma.vote.count();
  console.log('Users:', users);
  console.log('Polls:', polls);
  console.log('Votes:', votes);
  await prisma.\$disconnect();
})();
"
```

### **List Users:**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.table(users);
  await prisma.\$disconnect();
})();
"
```

### **List Polls:**

```bash
docker exec poll-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const polls = await prisma.poll.findMany({
    select: { title: true, expiresAt: true }
  });
  console.table(polls);
  await prisma.\$disconnect();
})();
"
```

---

## ⚠️ Important Notes

1. **Backup First:** This operation cannot be undone!
   ```bash
   docker cp poll-app:/app/prisma/dev.db ~/backup-before-cleanup.db
   ```

2. **Admin Users:** Make sure you have at least one admin user before running cleanup

3. **Active Sessions:** Users will need to sign in again after cleanup

---

## 🔄 Restore from Backup

If you need to restore:

```bash
# Stop containers
docker-compose down

# Restore database
docker cp ~/backup-before-cleanup.db poll-app:/app/prisma/dev.db

# Start containers
docker-compose up -d
```

---

## ✅ Success Checklist

- [ ] Database backed up
- [ ] Cleanup script executed
- [ ] Only admin users remain
- [ ] 3 sample polls created
- [ ] Verified counts are correct
- [ ] Tested accessing the site
- [ ] Polls are visible

---

## 🎯 One-Line Cleanup

For quick cleanup without the script:

```bash
docker exec poll-app node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { await prisma.vote.deleteMany({}); await prisma.option.deleteMany({}); await prisma.poll.deleteMany({}); await prisma.user.deleteMany({ where: { role: 'member' } }); console.log('✅ Cleanup done'); await prisma.\$disconnect(); })();"
```

That's it! Your database is now clean with only admin users and 3 fresh polls. 🎉
