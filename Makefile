.PHONY: help build up down restart logs ps shell-backend shell-frontend shell-db clean

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

clean:
	docker compose down -v

backend-shell:
	docker compose exec backend /bin/sh

backend-install:
	docker compose exec backend composer install

backend-update:
	docker compose exec backend composer update

backend-migrate:
	docker compose exec backend php artisan migrate

backend-fresh:
	docker compose exec backend php artisan migrate:fresh

backend-seed:
	docker compose exec backend php artisan db:seed

backend-test:
	docker compose exec backend php artisan test

backend-cache-clear:
	docker compose exec backend php artisan cache:clear
	docker compose exec backend php artisan config:clear
	docker compose exec backend php artisan route:clear
	docker compose exec backend php artisan view:clear

backend-key-generate:
	docker compose exec backend php artisan key:generate

db-shell:
	docker compose exec postgres psql -U postgres -d htl_kahoot

db-backup:
	docker compose exec postgres pg_dump -U postgres htl_kahoot > backup.sql
	@echo "Database backed up to backup.sql"

db-restore:
	cat backup.sql | docker compose exec -T postgres psql -U postgres htl_kahoot
	@echo "Database restored from backup.sql"

redis-shell:
	docker compose exec redis redis-cli

redis-flush:
	docker compose exec redis redis-cli FLUSHALL

setup:
	@echo "Setting up environment files..."
	@if [ ! -f .env ]; then cp .env.docker .env; echo "Created .env"; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.docker backend/.env; echo "Created backend/.env"; fi
	@$(MAKE) build
	@$(MAKE) up
	@$(MAKE) backend-install
	@$(MAKE) backend-key-generate
	@$(MAKE) backend-migrate
	@echo "Setup complete! Application is running."
	@echo "Backend: http://localhost"

dev:
	docker compose up

fresh-install: clean setup
	@echo "Fresh install complete!"
