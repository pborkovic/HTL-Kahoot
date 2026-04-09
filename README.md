# HTL Kahoot

Laravel 12 backend + Next.js 16 frontend, orchestrated via Docker Compose and Traefik.

## Requirements

- Docker + Docker Compose
- A populated `.env` file at the repo root (see `docker-compose.yml` for required variables)

## Run

Production-like:

```bash
docker compose -f docker-compose.yml up -d
```

Development (hot reload, debug logging, exposed service ports):

```bash
docker compose -f docker-compose.dev.yml up -d
```

The app is reachable at `http://gamquiz.localhost` via Traefik. The Traefik dashboard is on `http://localhost:8080`.

## Common Commands

Enter the backend container:

```bash
docker compose exec backend bash
```

Run migrations / seed:

```bash
docker compose exec backend php artisan migrate --seed
```

Tail logs:

```bash
docker compose logs -f backend frontend
```

## OpenAPI / Swagger UI

The backend uses `darkaonline/l5-swagger`. Annotations live in the controllers under `backend/app/Http/Controllers`.

Generate the OpenAPI spec:

```bash
docker compose exec backend php artisan l5-swagger:generate
```

This writes `backend/storage/api-docs/api-docs.json` (and `openapi.yaml`).

Open the Swagger UI in the browser:

```
http://gamquiz.localhost/api/documentation
```

The raw JSON spec is served at `http://gamquiz.localhost/docs`.

## Generated Code Docs

PHPDoc HTML for the backend is checked in under `docs/backend/` — open `docs/backend/index.html` in a browser. Regenerate with:

```bash
php phpDocumentor.phar -d backend/app -t docs/backend
```
