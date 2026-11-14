#!/usr/bin/env bash
# Starts local Supabase, injects its keys into backend/.env, and runs the app stack.
# Runs on every container start, so each step must be idempotent.
set -euo pipefail

cd "$(dirname "$0")/.."

# Docker-in-Docker starts alongside the container, so wait for the daemon.
for _ in $(seq 1 30); do
	docker info >/dev/null 2>&1 && break
	sleep 1
done

# Applies migrations and seed.sql on first start; no-op when already running.
supabase start

# Replace placeholder or empty key values with the local stack's JWT keys.
# Leaves real values alone, so you can point .env at another project.
eval "$(supabase status -o env 2>/dev/null | grep -E '^(ANON_KEY|SERVICE_ROLE_KEY)=')"

set_key() {
	local name="$1" value="$2" file="backend/.env"
	if grep -qE "^${name}=(\s*$|\S*\.\.\.)" "$file"; then
		sed -i -E "s|^${name}=.*|${name}=${value}|" "$file"
		echo "Set ${name} in ${file}"
	elif ! grep -q "^${name}=" "$file"; then
		echo "${name}=${value}" >>"$file"
		echo "Added ${name} to ${file}"
	fi
}

set_key SUPABASE_KEY "$ANON_KEY"
set_key SUPABASE_SECRET_KEY "$SERVICE_ROLE_KEY"

# Compose reads env_file at container creation, so recreate after key changes.
docker compose up -d --build
