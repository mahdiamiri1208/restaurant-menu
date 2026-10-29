#!/usr/bin/env sh
set -eu

if [ "$#" -ne 2 ]; then
  printf 'Usage: %s database-backup.sql.gz uploads-backup.tar.gz\n' "$0" >&2
  exit 2
fi

gzip -dc "$1" | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose exec -T app tar -xzf - -C /app/public < "$2"
printf 'Restore completed.\n'