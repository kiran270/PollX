# 🔒 Security Package Update

## 📦 Updated Packages

### Core Dependencies
- **Next.js**: `15.5.6` → `15.6.0` (Latest stable)
- **Prisma**: `6.19.0` → `6.20.0` (Security patches)
- **NextAuth**: `5.0.0-beta.30` → `5.0.0-beta.31` (Bug fixes)
- **Node Types**: `^20` → `^22.10.2` (Latest LTS types)

### Development Dependencies
- **TypeScript**: `^5` → `^5.7.2` (Latest stable)
- **ESLint**: `^9` → `^9.17.0` (Security rules)
- **TSX**: `4.20.6` → `4.21.0` (Performance improvements)

### Security Additions
- Added `engines` field to lock Node.js version
- Added `overrides` for vulnerable dependencies
- Added security audit scripts
- Updated to Node.js 22 LTS in Docker

## 🚀 Update Commands

### Method 1: Automatic Update
```bash
chmod +x update-packages.sh
./update-packages.sh
```

### Method 2: Manual Update
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Security audit
npm audit
npm audit fix

# Generate Prisma client
npx prisma generate
```

## 🔍 Security Checks

### Before Deployment
```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Test build
npm run build

# Test application
npm run dev
```

### After Deployment
```bash
# Rebuild Docker with new packages
docker compose down
docker compose up -d --build

# Monitor logs
docker logs poll-app
```

## 🛡️ Security Improvements

1. **Package Versions**: All packages updated to latest stable
2. **Node.js**: Updated to v22 LTS (better security)
3. **Audit Scripts**: Added npm audit to package.json
4. **Lock Files**: Configured for exact versions
5. **Registry**: Locked to official npm registry

## ⚠️ Breaking Changes

- **Node.js 22**: Requires Node.js 22+ (Docker handles this)
- **TypeScript 5.7**: May have stricter type checking
- **ESLint 9**: New linting rules may require fixes

## 🧪 Testing Checklist

- [ ] Application starts without errors
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] Polls can be created/voted on
- [ ] Embed functionality works
- [ ] No console errors
- [ ] Docker build succeeds

## 🚨 If Issues Occur

### Rollback Plan
```bash
git checkout HEAD~1 -- package.json
npm install
```

### Common Fixes
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install
npx prisma generate
npm run build
```

## 📊 Security Score

**Before Update**: Potential vulnerabilities in older packages
**After Update**: ✅ Latest security patches applied

Run `npm audit` to see current security status.