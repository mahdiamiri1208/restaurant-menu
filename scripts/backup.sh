#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$BACKUP_DIR/database-$STAMP.sql.gz"
docker compose exec -T app tar -czf - -C /app/public uploads > "$BACKUP_DIR/uploads-$STAMP.tar.gz"
find "$BACKUP_DIR" -type f -name '*.gz' -mtime +30 -delete
printf 'Backup completed: %s\n' "$STAMP"