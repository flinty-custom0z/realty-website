#!/bin/bash

# Full backup script for realty website
BACKUP_DIR="$HOME/realty-backups/$(date +"%Y%m%d_%H%M%S")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

echo "Backing up database..."
# Get DATABASE_URL from .env file
source .env

# Database backup
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/realty_db_$TIMESTAMP.sql"

echo "Backing up images..."
# Run the Node.js script to backup images
node scripts/backup-images.js

echo "Creating archive of the backups..."
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

echo "Backup completed: $BACKUP_DIR.tar.gz"