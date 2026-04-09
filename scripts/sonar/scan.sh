#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/../.."

if [[ -z "${SONAR_TOKEN:-}" && -f .env.sonar ]]; then
    set -a; source .env.sonar; set +a
fi

if [[ -z "${SONAR_TOKEN:-}" ]]; then
    echo "[sonar] ERROR: SONAR_TOKEN is not set."
    echo "        Generate a token at http://localhost:9000/account/security"
    echo "        then: export SONAR_TOKEN=sqp_xxx   (or put it in .env.sonar)"
    exit 1
fi

SONAR_HOST_URL="${SONAR_HOST_URL:-http://sonarqube:9000}"
NETWORK="${SONAR_NETWORK:-gamquiz-sonarqube}"

echo "[sonar] Scanning against $SONAR_HOST_URL (network: $NETWORK)..."

docker run --rm \
    --network "$NETWORK" \
    -e SONAR_HOST_URL="$SONAR_HOST_URL" \
    -e SONAR_TOKEN="$SONAR_TOKEN" \
    -v "$PWD":/usr/src \
    -w /usr/src \
    sonarsource/sonar-scanner-cli:latest

echo "[sonar] Scan complete. Results: http://localhost:${SONAR_PORT:-9000}/dashboard?id=htl-kahoot"
