#!/bin/bash

# Database Backup Script
# Usage: ./backup-db.sh [local|ec2]

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

case "$1" in
  local)
    echo "📦 Backing up local database..."
    docker cp poll-app:/app/prisma/dev.db "$BACKUP_DIR/local-backup-$TIMESTAMP.db"
    echo "✅ Backup saved: $BACKUP_DIR/local-backup-$TIMESTAMP.db"
    ;;
    
  ec2)
    if [ -z "$2" ]; then
      echo "❌ Error: EC2 IP required"
      echo "Usage: ./backup-db.sh ec2 <ec2-ip> <key-file>"
      exit 1
    fi
    
    EC2_IP=$2
    KEY_FILE=${3:-~/.ssh/id_rsa}
    
    echo "📦 Backing up EC2 database..."
    
    # Copy from container to EC2 host
    ssh -i "$KEY_FILE" ubuntu@"$EC2_IP" "docker cp poll-app:/app/prisma/dev.db ~/temp-backup.db"
    
    # Download to local
    scp -i "$KEY_FILE" ubuntu@"$EC2_IP":~/temp-backup.db "$BACKUP_DIR/ec2-backup-$TIMESTAMP.db"
    
    # Cleanup EC2
    ssh -i "$KEY_FILE" ubuntu@"$EC2_IP" "rm ~/temp-backup.db"
    
    echo "✅ Backup saved: $BACKUP_DIR/ec2-backup-$TIMESTAMP.db"
    ;;
    
  *)
    echo "Database Backup Script"
    echo "====================="
    echo ""
    echo "Usage:"
    echo "  ./backup-db.sh local                           - Backup local Docker database"
    echo "  ./backup-db.sh ec2 <ip> <key-file>            - Backup EC2 database"
    echo ""
    echo "Examples:"
    echo "  ./backup-db.sh local"
    echo "  ./backup-db.sh ec2 1.2.3.4 ~/.ssh/my-key.pem"
    ;;
esac
