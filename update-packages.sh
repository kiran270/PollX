#!/bin/bash

echo "🔒 Updating npm packages for security..."

# Remove existing node_modules and lock file for clean install
echo "📦 Cleaning existing packages..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install with latest versions
echo "⬇️ Installing latest packages..."
npm install

# Run security audit
echo "🔍 Running security audit..."
npm audit

# Fix any vulnerabilities
echo "🛠️ Fixing vulnerabilities..."
npm audit fix --force

# Update Prisma
echo "🗄️ Updating Prisma..."
npx prisma generate

# Check for outdated packages
echo "📊 Checking for outdated packages..."
npm outdated

echo "✅ Package update complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Test the application: npm run dev"
echo "2. Run build: npm run build"
echo "3. Deploy: docker compose up -d --build"