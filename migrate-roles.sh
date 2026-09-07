#!/bin/bash

# Role Migration Script
# Converts ADMIN -> admin and MEMBER -> member in the database

echo "🔄 Role Migration Script"
echo "========================"
echo ""
echo "This will update all user roles to lowercase:"
echo "  ADMIN  → admin"
echo "  MEMBER → member"
echo ""

# Check if running in Docker or local
if [ -f "/.dockerenv" ]; then
    echo "📦 Running in Docker container..."
    npx tsx scripts/migrate-roles-lowercase.ts
else
    echo "💻 Running locally..."
    
    # Check if Docker container is running
    if docker ps | grep -q poll-app; then
        echo "📦 Found Docker container, running migration inside container..."
        docker exec poll-app npx tsx scripts/migrate-roles-lowercase.ts
    else
        echo "💻 Running migration locally..."
        npx tsx scripts/migrate-roles-lowercase.ts
    fi
fi

echo ""
echo "✅ Migration complete!"
