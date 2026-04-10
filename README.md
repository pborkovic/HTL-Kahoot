# HTL Kahoot

Laravel 12 backend + Next.js 16 frontend, orchestrated via Docker Compose and Traefik.

## Authors

- Philipp Borkovic
- Julius Ball
- Benjamin Smetana
- Anton Pfurtscheller

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
http://localhost:8081/api/docs
```

## SonarQube

A self-hosted SonarQube Community stack (SonarQube + Postgres) is declared in `docker-compose.sonarqube.yml` and auto-included by the main compose file, so it boots and shuts down together with the rest of the stack (`docker compose up -d` / `docker compose down`). Configuration lives in `sonar-project.properties` at the repo root.

SonarQube comes up at `http://localhost:9000`. Default credentials on first boot are `admin` / `admin` — you will be prompted to change the password.

Create a project token at `http://localhost:9000/account/security`, then drop it in `.env.sonar`:

```bash
echo 'SONAR_TOKEN=sqp_xxx' > .env.sonar
```

Generate backend test coverage (requires the dev stack running and Xdebug enabled in the backend container):

```bash
./scripts/sonar/coverage-backend.sh
```

Run the scanner against the whole repo (backend PHP + frontend TypeScript):

```bash
./scripts/sonar/scan.sh
```

Results: `http://localhost:9000/dashboard?id=htl-kahoot`.

## Generated Code Docs

PHPDoc HTML for the backend is checked in under `docs/backend/` — open `docs/backend/index.html` in a browser. Regenerate with:

```bash
php phpDocumentor.phar -d backend/app -t docs/backend
```
