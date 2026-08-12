#!/bin/sh
set -eu

# Apply SQL migrations without Prisma CLI network downloads.
psql_url="$DATABASE_URL"
case "$psql_url" in
	*\?*) psql_url="${psql_url%%\?*}" ;;
esac

psql "$psql_url" -v ON_ERROR_STOP=1 -c "CREATE TABLE IF NOT EXISTS public.local_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());"

for sql in /app/prisma/migrations/*/migration.sql; do
	[ -f "$sql" ] || continue
	migration_dir="$(basename "$(dirname "$sql")")"
	already_applied="$(psql "$psql_url" -tA -c "SELECT 1 FROM public.local_migrations WHERE name = E'$migration_dir' LIMIT 1;")"

	if [ "$already_applied" != "1" ]; then
		psql "$psql_url" -v ON_ERROR_STOP=1 -f "$sql"
		psql "$psql_url" -v ON_ERROR_STOP=1 -c "INSERT INTO public.local_migrations(name) VALUES (E'$migration_dir');"
	fi
done

npm run seed
npm run dev
