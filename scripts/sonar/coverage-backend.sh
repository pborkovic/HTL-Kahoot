#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/../.."

REPORT_DIR="backend/storage/app/coverage"
mkdir -p "$REPORT_DIR"

echo "[sonar] Running phpunit with coverage (XDEBUG_MODE=coverage)..."
docker compose exec -T \
    -e XDEBUG_MODE=coverage \
    backend \
    ./vendor/bin/phpunit \
        --coverage-clover=storage/app/coverage/clover.xml \
        --log-junit=storage/app/coverage/junit.xml

echo "[sonar] Coverage written to:"
echo "          $REPORT_DIR/clover.xml"
echo "          $REPORT_DIR/junit.xml"
