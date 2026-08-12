# Backend API Framework

An API framework built in Express + TypeScript.

## Tech Stack

- Node.js
- TypeScript
- Express

## Getting Started

### Docker development mode (recommended for full stack)

Clone both repositories as sibling folders under the same parent directory:

```text
your-workspace/
  team3-backend/
  team3-frontend/
```

From the backend repository folder, start frontend, backend, and Postgres together:

On a fresh machine, generate Prisma Client first:

```bash
npx prisma generate
```

Then start the full Docker development stack:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Troubleshooting: this first-run `npx prisma generate` step prevents Prisma query engine runtime mismatches (for example, macOS-generated client used inside Linux containers).

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Backend health: `http://localhost:4000/health`

**Environment configuration:**

The `.env.dev` file in the repository contains safe defaults for Docker Compose development. To use custom values:

```bash
# Override defaults by setting environment variables before running docker compose
export DATABASE_URL="postgresql://user:pass@db:5432/custom-db?schema=public"
export JWT_SECRET="your-custom-secret"
docker compose -f docker-compose.dev.yml up --build
```

Or create a `.env.dev.local` file (git-ignored) for persistent overrides:

```env
DATABASE_URL="postgresql://custom:password@db:5432/jobRoles?schema=public"
JWT_SECRET="my-custom-jwt-secret"
SESSION_SECRET="my-custom-session-secret"
```

On backend container startup, the app applies migrations and runs the seed script automatically before starting the dev server.
The seed and all reference data (statuses, locations, capabilities, bands, job roles) are idempotent, so container restarts do not fail on duplicate values.

Stop and remove containers:

```bash
docker compose -f docker-compose.dev.yml down
```

Reset database volume as well:

```bash
docker compose -f docker-compose.dev.yml down -v
```

Dependencies are installed at image build time for both backend and frontend containers, so startup does not perform `npm install`.

Docker Compose mounts source/config files only in development and does not mount `node_modules` from the host. This avoids cross-platform native module issues (for example macOS modules inside Linux containers).

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

This repository already contains Prisma files, so running `npx prisma init` again will fail.

Create your local `.env` from the template:

```bash
cp .env.example .env
```
Then set these values in `.env`:

- `DATABASE_URL` for your local Postgres instance
- `JWT_SECRET` for signing login tokens

Generate a strong JWT secret in your terminal:

```bash
openssl rand -hex 32
```

Example:

```env
DATABASE_URL="postgresql://YOUR_USER:password@localhost:5432/jobRoles?schema=public"
JWT_SECRET="replace-with-a-strong-local-secret"
```

### 3. Ensure Docker is running and start Postgres

Make sure Docker is running, then start the local Postgres container:

```bash
docker run --name jobRoles-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jobRoles -p 5432:5432 -d postgres
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

### 5. Open Prisma Studio (optional)

```bash
npx prisma studio
```

### 6. Run in development mode

Starts the app with file watching via `tsx watch`.

```bash
npm run dev
```

The server runs on:

```text
http://localhost:4000
```

### 6.1 Open Swagger docs

Swagger UI is served by the same backend process. Once `npm run dev` is running, open:

```text
http://localhost:4000/docs
```

OpenAPI JSON is also available at:

```text
http://localhost:4000/docs.json
```

Quick check from terminal:

```bash
curl http://localhost:4000/docs.json
```

### 7. Build for production

```bash
npm run build
```

### 8. Start production build

```bash
npm start
```

## Available Scripts

- `npm run dev` - Run the server in watch mode for development.
- `npm run build` - Compile TypeScript into `dist/`.
- `npm start` - Run the compiled app from `dist/index.js`.
- `npm run lint` - Lints files and flags issues
- `npm run lint:fix` - Lints files and auto all fixes (both safe and unsafe fixes) with biome .
- `npm test` - Executes unit tests.
- `npm run test:watch` - Runs unit tests in watch mode.
- `npm run test:coverage` - Generates coverage report.
- `npm run seed` - Seeds the database.

## Docker Startup Behavior

When running with `docker compose -f docker-compose.dev.yml up --build`, the backend container startup script performs these steps:

1. Creates `public.local_migrations` if it does not exist
2. Applies SQL files from `prisma/migrations/*/migration.sql` once each (tracked in `public.local_migrations`)
3. `npm run seed` — Runs the seed script, which is fully idempotent:
   - Reference data (statuses, locations, capabilities, bands) are upserted (updated if exists, created if new)
   - Job roles are upserted (updated if exists, created if new), allowing changes to be re-seeded without manual DB reset
4. `npm run dev`

This ensures the database schema and seed data are in place automatically, and developers can update seed data and re-run `npm run seed` during development.

## API Endpoints

### `GET /`

Returns a simple welcome response.

Example response:

```json
{
  "message": "Welcome to your API!"
}
```

### `GET /job-roles`

Returns all job roles in the database (currently seeded with test data).

Example response:

```json
[
  {
    "jobRoleId": 1,
    "roleName": "Software Engineer",
    "location": "Belfast",
    "capabilityId": 1,
    "bandId": 3,
    "closingDate": "2026-09-30T00:00:00.000Z",
    "status": "open"
  },
  {
    "jobRoleId": 2,
    "roleName": "Senior Software Engineer",
    "location": "Glasgow",
    "capabilityId": 1,
    "bandId": 4,
    "closingDate": "2026-10-15T00:00:00.000Z",
    "status": "open"
  },
  {
    "jobRoleId": 3,
    "roleName": "Lead Software Engineer",
    "location": "Birmingham",
    "capabilityId": 1,
    "bandId": 5,
    "closingDate": "2026-09-05T00:00:00.000Z",
    "status": "open"
  }
]
```

### `GET /health`

Returns a basic health check object with service status and current server time.

Example response:

```json
{
  "status": "UP",
  "timestamp": "2026-08-10T14:10:00.000Z"
}
```

### `POST /api/login`

Authenticates a user with email and password and returns a JWT token.

Request body:

```json
{
  "email": "test@example.com",
  "password": "password"
}
```

Success response (`200`):

```json
{
  "token": "<jwt-token>"
}
```

Validation error (`400`) example:

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Authentication error (`401`) example:

```json
{
  "message": "Invalid email or password"
}
```

Seeded login user for local testing:

- email: `test@example.com`
- password: `password`

## Quick Check

After starting the app, you can verify endpoints with:

```bash
curl http://localhost:4000/
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```
