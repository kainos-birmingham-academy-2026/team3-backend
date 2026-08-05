# Backend API Framework

An API framework built in Express + TypeScript.

## Tech Stack

- Node.js
- TypeScript
- Express

## Getting Started

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
Then set a valid `DATABASE_URL` in `.env` for your local Postgres instance.

Use your own local Postgres username, and set the password to `password`.

### 3. Apply database migrations

```bash
npx prisma migrate dev
```

### 4. Seed the database (optional)

```bash
npm run seed
```

### 5. Run in development mode

Starts the app with file watching via `tsx watch`.

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

### 6. Build for production

```bash
npm run build
```

### 7. Start production build

```bash
npm start
```

## Available Scripts

- `npm run dev` - Run the server in watch mode for development.
- `npm run build` - Compile TypeScript into `dist/`.
- `npm start` - Run the compiled app from `dist/index.js`.
- `npm run lint` - Type-check without emitting files.
- `npm test` - Placeholder test command.

## API Endpoints

### `GET /`

Returns a simple welcome response.

Example response:

```text
Welcome to your API!
```

### `GET /health`

Returns a basic health check object with service status and current server time.

Example response:

```json
{
    "status": "UP",
    "time": "Tue Aug 04 2026 10:00:00 GMT..."
}
```

## Quick Check

After starting the app, you can verify endpoints with:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```
