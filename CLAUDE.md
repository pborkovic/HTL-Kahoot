# GamQuiz (HTL-Kahoot)

A real-time quiz/game platform for HTL schools. Teachers create quizzes and host live sessions; students join via game PIN and answer questions in real time. Built with a Laravel 12 backend and Next.js 16 frontend, connected via REST API and WebSockets.

## Project Structure

```
HTL-Kahoot/
├── backend/          # Laravel 12 (PHP 8.2+) — API, auth, WebSocket broadcasting
├── frontend/         # Next.js 16 (React 19, TypeScript) — SPA with App Router
├── nginx/            # Reverse proxy config (routes /api, /media, /ws)
├── seaweedfs/        # S3-compatible object storage config
├── docker-compose.yml        # Production: Traefik, Postgres, Redis, SeaweedFS, Reverb
├── docker-compose.dev.yml    # Development overrides
└── .env.example              # All required environment variables
```

## Architecture

### Backend: Controller -> Service -> Repository -> Model

Every layer communicates through **contracts (interfaces)**, bound in `AppServiceProvider`. This is the strict call chain — controllers never call repositories directly.

```
Controller (HTTP, validation, authorization, response formatting)
    ↓ injects ServiceContract
Service (business logic, orchestration, event dispatching)
    ↓ injects RepositoryContract
Repository (Eloquent queries, data persistence, transactions)
    ↓ uses
Model (Eloquent ORM, relationships, casts, scopes)
```

**Key directories:**
- `app/Http/Controllers/Api/V1/` — 7 controllers (Auth, User, Session, Quiz, Question, QuestionPool, Role + Permission + Media)
- `app/Services/` + `app/Services/Contracts/` — 8 services with interface contracts
- `app/Repositories/` + `app/Repositories/Contracts/` — 5 repositories with interface contracts, all extend `BaseRepository`
- `app/Models/` — 19 Eloquent models, all use UUID primary keys (`HasUuids`)
- `app/Policies/` — 7 authorization policies (role-based: student, teacher, admin, superadmin)
- `app/Http/Requests/Api/V1/` — 28+ FormRequest validation classes
- `app/Http/Resources/Api/V1/` — JSON API resource transformers
- `app/Events/` — 6 broadcast events for real-time game sessions
- `app/Filters/` — Query filter classes (UserFilter, QuizFilter, QuestionFilter)
- `app/DTOs/` — Data transfer objects (CreateSessionDto, AuthCallbackDto, EntraUserDto)

### Frontend: Pages -> Components + Hooks -> API Client

```
App Router Pages (/app)
    ↓ compose
Feature Components (/components/admin, /teacher, /play)
    ↓ use
Custom Hooks (/hooks) — data fetching, WebSocket, preferences
    ↓ call
API Client (/lib/api.ts) — fetch wrapper with auth headers
    ↓ hits
Next.js Rewrites → Backend API
```

**Key directories:**
- `src/app/` — Next.js App Router pages (login, admin/*, teacher/*, play/*, join/*)
- `src/components/ui/` — shadcn/ui primitives (Button, Dialog, Table, etc.)
- `src/components/admin/` — Admin dashboard & user management
- `src/components/teacher/` — Quiz, question, session management
- `src/components/play/` — Student game play components
- `src/hooks/` — Custom hooks (use-quizzes, use-questions, use-session-channel, etc.)
- `src/lib/api.ts` — API client (native fetch with Bearer token auth)
- `src/lib/echo.ts` — Laravel Echo WebSocket setup
- `src/context/AuthContext.tsx` — Global auth state (React Context)
- `src/types/` — TypeScript interfaces per domain (auth, quiz, question, session, etc.)

## Tech Stack

### Backend
- **Framework:** Laravel 12 (PHP 8.2+)
- **Database:** PostgreSQL 16
- **Cache/Queue/Sessions:** Redis
- **Auth:** Laravel Sanctum (API tokens) + Azure Entra ID OAuth2 (via Socialite)
- **WebSockets:** Laravel Reverb (broadcasting)
- **Storage:** SeaweedFS (S3-compatible) for media uploads
- **API Docs:** L5-Swagger (OpenAPI 3.0 attributes on controllers)
- **Testing:** Pest PHP
- **Code Style:** Laravel Pint

### Frontend
- **Framework:** Next.js 16.1.1 with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Real-time:** laravel-echo + pusher-js (connects to Reverb)
- **Linting:** Biome
- **Icons:** lucide-react
- **QR Codes:** qrcode.react
- **UI Language:** German

### Infrastructure
- **Reverse Proxy:** Nginx (behind Traefik for TLS in production)
- **Containers:** Docker Compose
- **TLS:** Let's Encrypt via Traefik

## Authentication

Dual auth system — both return a Sanctum personal access token:

1. **Azure Entra ID (OAuth2):** Primary for students/teachers. Frontend redirects to Azure, callback exchanges code for token. Auto-creates/updates users from Microsoft Graph data (email, display_name, avatar_url, class_name).
2. **Email/Password:** For admin accounts. Uses Argon2ID hashing.

Token stored in localStorage (`auth_token`) and as httpOnly cookie. All API routes protected by `auth:sanctum` middleware.

## Authorization (Roles)

Four roles: `student`, `teacher`, `admin`, `superadmin`. Enforced via Laravel Policies:
- **Student:** Join sessions, submit answers, view own data
- **Teacher:** Create/manage quizzes & questions, host sessions, view own students
- **Admin:** Manage users, bulk import, view statistics
- **Superadmin:** Delete users, manage roles/permissions, restore soft-deleted records

## Real-time Game Flow (WebSockets)

Events broadcast on presence channel `session.{gamePin}`:
- `ParticipantJoined` — student joins lobby
- `GameStarted` — teacher starts the game
- `QuestionOpened` — next question displayed to all
- `AnswerReceived` — student submits answer
- `QuestionClosed` — time's up, show results
- `GameFinished` — final leaderboard

Frontend hook: `useSessionChannel(gamePin, { onParticipantJoined, onGameStarted, ... })`

## Database

All models use **UUID primary keys**. Key tables:
- `users` — auth_provider (local/azure/entra_id), preferences JSON, soft deletes
- `roles`, `permissions`, `role_permissions`, `user_roles` — RBAC
- `quizzes` — speed_scoring, randomize_questions flags, soft deletes
- `questions` — versioned via `question_versions`, soft deletes
- `sessions` — game_pin, status (lobby/active/finished), qr_code_url
- `session_participants` — total_score, is_connected
- `responses` — answer submissions with is_correct flag

## API Routes

All under `/api`. Auth routes are public; everything else requires `auth:sanctum`.

- `POST /auth/login` | `GET /auth/redirect` | `POST /auth/callback` | `POST /auth/logout`
- `/v1/users` — CRUD, bulk import, stats, preferences, class list
- `/v1/quizzes` — CRUD, publish, sync questions/participants, session history
- `/v1/questions` — CRUD, publish, versions, import, media upload
- `/v1/pools` — Question pool CRUD, add/remove questions
- `/v1/sessions` — Create, join, start, next question, close question, answer, leaderboard, results, report
- `/v1/roles`, `/v1/permissions` — Admin role/permission management

## Development

### Running locally

```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# Backend
cd backend && composer install && php artisan migrate --seed

# Frontend
cd frontend && npm install && npm run dev
```

### Conventions

- **Backend:** Follow existing Laravel conventions. Use named parameters in service provider bindings. Add OpenAPI attributes to new controller methods. Always create a FormRequest for validation. Use policies for authorization.
- **Frontend:** Use `"use client"` directive for interactive components. Use `cn()` utility for Tailwind class merging. Follow existing hook patterns for data fetching. Types go in `src/types/`.
- **Naming:** Controllers are `{Resource}Controller`, services are `{Resource}Service`, repositories are `{Resource}Repository`. Contracts mirror the class name with `Contract` suffix.
- **New features:** Add controller method -> add FormRequest -> add service method (update contract) -> add repository method if needed (update contract) -> add API resource if needed -> add route -> add policy check.
- **Models:** Always use UUIDs. Add relationships, casts, and fillable/guarded as needed. Use soft deletes for user-facing entities.
