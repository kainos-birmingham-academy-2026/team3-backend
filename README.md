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

This endpoint is public and does not require authentication.

Example response:

```json
[
  {
    "jobRoleId": 1,
    "roleName": "Software Engineer",
    "closingDate": "2026-09-30T00:00:00.000Z",
    "capabilityName": "Software Engineering",
    "bandName": "Band 3",
    "locationName": "Belfast",
    "statusName": "OPEN"
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

### `GET /teapot`

Returns a fun 418 I'm a teapot response. This endpoint demonstrates the HTTP 418 status code (RFC 2324).

Example response (`418`):

```json
{
  "message": "I'm a teapot"
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
      "message": "Invalid email address",
      "code": "too_small"
    }
  ]
}
```

### `GET /job-roles/{id}`

Returns the full details for a job role. This endpoint is public and does not require authentication.

Path parameters:

- `id` - A positive integer job role ID

Example response (`200`):

```json
{
  "jobRoleId": 1,
  "roleName": "Software Engineer",
  "description": "Build and maintain backend services and APIs.",
  "responsibilities": "Deliver features, write tests, and support production services.",
  "sharepointUrl": "https://sharepoint.example.com/job-roles/software-engineer",
  "numberOfOpenPositions": 3,
  "closingDate": "2026-09-30T00:00:00.000Z",
  "capabilityName": "Software Engineering",
  "bandName": "Engineer",
  "locationName": "Belfast",
  "statusName": "OPEN",
  "addressLine1": "10 Donegall Square South",
  "addressLine2": "Floor 2",
  "postcode": "BT1 5JD"
}
```

### Job role lookup endpoints

These public endpoints provide the lookup data used when creating a job role. They do not require authentication and do not accept a request body or query parameters.

- `GET /job-roles/statuses` returns `{ "statusId": 1, "statusName": "OPEN" }` objects.
- `GET /job-roles/bands` returns `{ "bandId": 3, "bandName": "Engineer" }` objects.
- `GET /job-roles/capabilities` returns `{ "capabilityId": 1, "capabilityName": "Software Engineering" }` objects.
- `GET /job-roles/locations` returns `{ "locationId": 1, "locationName": "Belfast" }` objects.

Each endpoint returns an array with status `200`. If no lookup records exist, it returns `404` with an error object; unexpected database or service failures return `500`.

Authentication error (`401`) example:

```json
{
  "message": "Invalid email or password"
}
```

Seeded login user for local testing:

- email: `test@example.com`
- password: `password`

### `POST /api/register`

Registers a new user account.

Request body:

```json
{
  "email": "new.user@example.com",
  "password": "Password123!"
}
```

Validation rules:

- Email must be valid
- Password must be more than 8 characters
- Password must include uppercase, lowercase, and special characters

Success response (`201`):

```json
{
  "message": "User registered"
}
```

Conflict response (`409`) example:

```json
{
  "message": "Email already in use"
}
```

Role behaviour:

- New registrations default to role `USER`
- Passwords are salted and hashed with Argon2id before storage


### `POST /job-roles/create`

Creates a new job role.

Authentication:

- Requires `Authorization: Bearer <jwt>`
- Admin role required

Request body:

```json
{
  "roleName": "Software Engineer",
  "description": "Develops and maintains software applications.",
  "responsibilities": "Design, implement, test, and maintain software.",
  "sharepointUrl": "https://example.sharepoint.com/sites/jobs/software-engineer",
  "numberOfOpenPositions": 2,
  "closingDate": "2026-12-31",
  "capabilityId": 1,
  "bandId": 3,
  "locationId": 1
}

```

Validation rules:

- `roleName`, `description`, and `responsibilities` must be non-empty strings
- `sharepointUrl` must be a valid URL
- `numberOfOpenPositions`, `capabilityId`, `bandId`, and `locationId` must be positive integers
- `closingDate` is optional, but must be a valid date that is not in the past

Success response (201):

```json
{
  "jobRoleId": 1,
  "roleName": "Software Engineer",
  "closingDate": "2026-12-31T00:00:00.000Z",
  "capabilityName": "Software Engineering",
  "bandName": "Band 3",
  "locationName": "Belfast",
  "statusName": "OPEN"
}
```

Validation error (400):

```json
{
  "errors": [
    {
      "field": "roleName",
      "message": "Role name is required",
      "code": "too_small"
    }
  ]
}
```

Authentication error (401):

```json
{
  "error": "Token error"
}
```


Authorisation error (403):

```json
{
  "message": "Forbidden"
}
```



### `POST /job-roles/:id/apply`

Allows an authenticated user to apply for a specific job role with their CV.

Authentication:

- Requires `Authorization: Bearer <jwt>`
- Accepted roles: `ADMIN` and `USER`

Request body:

```json
{
  "cvText": "Lorem ipsum dolor sit amet. Qui repellendus exercitationem sed reiciendis quia est voluptate autem ut ratione consequatur est eligendi nisi rem aliquid illum et dolorem autem. Id error voluptas non fuga doloribus ut iure velit ut voluptas laboriosam. Qui quae possimus ut Quis blanditiis ut modi molestiae in natus voluptate et quisquam distinctio sed molestias molestiae eum ratione ipsam.\n\nVel saepe delectus ad expedita quia sed laborum laborum et quasi sunt.Vel error odio et consequuntur sunt qui unde quaerat sed provident iusto et blanditiis cupiditate sed quae iusto et architecto molestiae.\n\nId minima harum nam incidunt delectus non eligendi modi ut molestiae rerum ut placeat autem nam ipsam doloremque 33 perspiciatis distinctio.Ut optio dicta in laboriosam vitae hic officia molestiae a dolores eveniet id fugiat dolorem ut magni earum? Est laboriosam voluptatibus et rerum cupiditate aut rerum ullam non distinctio facere ut veritatis voluptatem et alias facere.In iure nihil est autem molestiae est asperiores excepturi."
          
}
```

URL parameters:

- `id` - The job role ID (integer)

Validation rules:

- `cvText` must be a non-empty string

Success response (`201`):

```json
{
  "applicationId": 1,
  "jobRoleId": 1,
  "userId": 1,
  "cvText": "Lorem ipsum dolor sit amet. Qui repellendus exercitationem sed reiciendis quia est voluptate autem ut ratione consequatur est eligendi nisi rem aliquid illum et dolorem autem. Id error voluptas non fuga doloribus ut iure velit ut voluptas laboriosam. Qui quae possimus ut Quis blanditiis ut modi molestiae in natus voluptate et quisquam distinctio sed molestias molestiae eum ratione ipsam.\n\nVel saepe delectus ad expedita quia sed laborum laborum et quasi sunt.Vel error odio et consequuntur sunt qui unde quaerat sed provident iusto et blanditiis cupiditate sed quae iusto et architecto molestiae.\n\nId minima harum nam incidunt delectus non eligendi modi ut molestiae rerum ut placeat autem nam ipsam doloremque 33 perspiciatis distinctio.Ut optio dicta in laboriosam vitae hic officia molestiae a dolores eveniet id fugiat dolorem ut magni earum? Est laboriosam voluptatibus et rerum cupiditate aut rerum ullam non distinctio facere ut veritatis voluptatem et alias facere.In iure nihil est autem molestiae est asperiores excepturi.",
          
}
```

Not found error (`404`) example:

```json
{
  "error": "JobRole with id 999 not found"
}
```

Conflict error (`409`) example:

```json
{
  "error": "User has already applied for this job role"
}
```

Authentication error (`401`) example:

```json
{
  "error": "Token error"
}
```

## Quick Check

After starting the app, you can verify endpoints with:

```bash
curl http://localhost:4000/
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
curl -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new.user@example.com","password":"Password123!"}'
curl -X POST http://localhost:4000/job-roles/1/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"cvText":"Lorem ipsum dolor sit amet. Qui repellendus exercitationem sed reiciendis..."}'
curl -X POST http://localhost:4000/job-roles/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -d '{
    "roleName": "Software Engineer",
    "description": "Develops and maintains software applications.",
    "responsibilities": "Design, implement, test, and maintain software.",
    "sharepointUrl": "https://example.sharepoint.com/sites/jobs/software-engineer",
    "numberOfOpenPositions": 2,
    "closingDate": "2026-12-31",
    "capabilityId": 1,
    "bandId": 3,
    "locationId": 1
  }'
          
```
