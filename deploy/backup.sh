#!/bin/bash
# SQLite Database Backup Script
# This script creates timestamped backups of the SQLite database and removes old backups
# Usage: ./backup.sh [retention_days]
# Default retention: 7 days

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/app/backups"
DATA_DIR="/opt/app/data"
DB_FILE="dev.db"
RETENTION_DAYS="${1:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${TIMESTAMP}.db"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Check if database file exists
if [ ! -f "$DATA_DIR/$DB_FILE" ]; then
    log "WARNING: Database file not found at $DATA_DIR/$DB_FILE"
    exit 0
fi

# Create backup using SQLite's backup command for consistency
# This ensures the backup is created safely even if the database is in use
log "Starting backup of $DB_FILE..."

if command -v sqlite3 &> /dev/null; then
    # Use SQLite's online backup API for a consistent backup
    sqlite3 "$DATA_DIR/$DB_FILE" ".backup '$BACKUP_DIR/$BACKUP_FILE'"
else
    # Fallback to file copy if sqlite3 is not available
    cp "$DATA_DIR/$DB_FILE" "$BACKUP_DIR/$BACKUP_FILE"
fi

# Verify backup was created
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log "ERROR: Backup failed - file not created"
    exit 1
fi

# Also backup uploaded images (incremental)
UPLOADS_BACKUP_DIR="$BACKUP_DIR/uploads_${TIMESTAMP}"
if [ -d "/opt/app/uploads" ] && [ "$(ls -A /opt/app/uploads 2>/dev/null)" ]; then
    log "Backing up uploaded images..."
    cp -r /opt/app/uploads "$UPLOADS_BACKUP_DIR"
    log "Uploads backup created: $UPLOADS_BACKUP_DIR"
fi

# Remove old backups
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*.db" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "uploads_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true

# List remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.db" -type f | wc -l)
log "Backup complete. Total backups retained: $BACKUP_COUNT"

# Show disk usage
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backup directory size: $TOTAL_SIZE"
