#!/bin/bash

# User Management Script for EC2
# Usage: ./manage-users.sh [command] [email]

CONTAINER_NAME="poll-app"
DB_PATH="/app/prisma/dev.db"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_help() {
    echo "User Management Script"
    echo "======================"
    echo ""
    echo "Usage: ./manage-users.sh [command] [email]"
    echo ""
    echo "Commands:"
    echo "  list                    - List all users"
    echo "  show <email>           - Show specific user details"
    echo "  make-admin <email>     - Make user an admin"
    echo "  make-member <email>    - Make user a member"
    echo "  delete <email>         - Delete user"
    echo ""
    echo "Examples:"
    echo "  ./manage-users.sh list"
    echo "  ./manage-users.sh show user@example.com"
    echo "  ./manage-users.sh make-admin user@example.com"
}

list_users() {
    echo -e "${BLUE}📋 All Users:${NC}"
    echo "============================================"
    docker exec $CONTAINER_NAME sqlite3 $DB_PATH <<EOF
.mode column
.headers on
SELECT email, name, role, createdAt FROM User ORDER BY createdAt DESC;
EOF
}

show_user() {
    local email=$1
    if [ -z "$email" ]; then
        echo "❌ Error: Email required"
        echo "Usage: ./manage-users.sh show <email>"
        exit 1
    fi
    
    echo -e "${BLUE}👤 User Details:${NC}"
    echo "============================================"
    docker exec $CONTAINER_NAME sqlite3 $DB_PATH <<EOF
.mode column
.headers on
SELECT * FROM User WHERE email = '$email';
EOF
}

make_admin() {
    local email=$1
    if [ -z "$email" ]; then
        echo "❌ Error: Email required"
        echo "Usage: ./manage-users.sh make-admin <email>"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Updating user role to ADMIN...${NC}"
    docker exec $CONTAINER_NAME sqlite3 $DB_PATH "UPDATE User SET role = 'ADMIN' WHERE email = '$email';"
    
    echo -e "${GREEN}✅ User updated!${NC}"
    echo ""
    show_user "$email"
}

make_member() {
    local email=$1
    if [ -z "$email" ]; then
        echo "❌ Error: Email required"
        echo "Usage: ./manage-users.sh make-member <email>"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Updating user role to MEMBER...${NC}"
    docker exec $CONTAINER_NAME sqlite3 $DB_PATH "UPDATE User SET role = 'MEMBER' WHERE email = '$email';"
    
    echo -e "${GREEN}✅ User updated!${NC}"
    echo ""
    show_user "$email"
}

delete_user() {
    local email=$1
    if [ -z "$email" ]; then
        echo "❌ Error: Email required"
        echo "Usage: ./manage-users.sh delete <email>"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  Warning: This will delete the user and all their data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi
    
    echo -e "${YELLOW}🔄 Deleting user...${NC}"
    docker exec $CONTAINER_NAME sqlite3 $DB_PATH "DELETE FROM User WHERE email = '$email';"
    
    echo -e "${GREEN}✅ User deleted!${NC}"
}

# Main script
case "$1" in
    list)
        list_users
        ;;
    show)
        show_user "$2"
        ;;
    make-admin)
        make_admin "$2"
        ;;
    make-member)
        make_member "$2"
        ;;
    delete)
        delete_user "$2"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
