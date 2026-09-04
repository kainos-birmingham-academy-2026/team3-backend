# Backend API Framework

An API framework built in Express + TypeScript.

## Tech Stack

- Node.js
- TypeScript
- Express

## Infrastructure

Azure architecture, Terraform setup, and separate dev and production
environment instructions are documented in
[infrastructure/README.md](infrastructure/README.md).

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
- `ENABLE_SWAGGER_DOCS` to `true` when you want to expose the Swagger routes

Generate a strong JWT secret in your terminal:

```bash
openssl rand -hex 32
```

Example:

```env
DATABASE_URL="postgresql://YOUR_USER:password@localhost:5432/jobRoles?schema=public"
JWT_SECRET="replace-with-a-strong-local-secret"
ENABLE_SWAGGER_DOCS=false
AZURE_OPENAI_ENDPOINT="https://aoai-team3-chatbot-dev.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT="team3-chatbot-gpt5-nano"
AZURE_OPENAI_API_VERSION="2025-04-01-preview"
```

The chatbot uses keyless Microsoft Entra authentication. Run `az login` locally
with an account assigned the `Cognitive Services OpenAI User` role. In Azure,
the backend Container App uses its user-assigned managed identity. Do not add an
Azure OpenAI API key to the environment.

The development Azure OpenAI account and model deployment are intentionally
academy-managed prerequisites rather than resources owned by this Terraform
state. Before planning or deploying dev, they must exist in `rg-team3-dev` with
these settings:

- Account: `aoai-team3-chatbot-dev` in UK South, Standard S0
- Deployment: `team3-chatbot-gpt5-nano`
- Model: `gpt-5-nano`, version `2025-08-07`
- SKU and capacity: Global Standard, 10K TPM

Terraform fails while reading the account if that prerequisite is absent. It
manages the backend identity's OpenAI role assignment and injects the endpoint,
deployment name, API version, and managed identity client ID. Model deployment
and quota changes remain owned by the academy Azure administrators.

The deployed backend has private Container App ingress. Public chatbot traffic
must pass through the frontend, where the per-IP request limit is enforced.

### 3. Ensure Docker is running and start Postgres

Make sure Docker is running, then start the local Postgres container:

**Important:** If you have a local Postgres instance running (e.g., via Homebrew), stop it first to avoid port conflicts:

```bash
brew services stop postgresql
```

Then start the Docker Postgres container:

```bash
docker run --name jobRoles-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jobRoles -p 5432:5432 -d postgres
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

If necessary, reset the local database by dropping it, reapplying all migrations, and reseeding it:

```bash
npx prisma migrate reset
```

Warning: this deletes all data in the database.

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

Swagger is disabled by default. Enable it in `.env`:

```env
ENABLE_SWAGGER_DOCS=true
```

Then start the backend with `npm run dev` and open:

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

## Running With Docker

These steps run the backend in Docker with the existing Postgres container and make it reachable by the frontend container.

### 1. Start or create Postgres

If the `jobRoles-db` container already exists, start it:

```bash
docker start jobRoles-db
```

If it does not exist yet, create it:

```bash
docker run --name jobRoles-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jobRoles -p 5432:5432 -d postgres
```

### 2. Create the shared Docker network

```bash
docker network create team3-network
docker network connect team3-network jobRoles-db
```

If either command says the network or connection already exists, that is fine.

### 3. Build the backend image

On a Kainos-managed Mac, export the corporate CA chain first so Prisma can download its Linux engine during the Docker build:

```bash
security find-certificate -a -c 'KAINOS-ZSCALER G2' -p > "$TMPDIR/kainos-corporate-ca-bundle.crt"
security find-certificate -a -c 'KAINOS-INSPECTION G2' -p >> "$TMPDIR/kainos-corporate-ca-bundle.crt"
security find-certificate -a -c 'KAINOS-ROOT-CA G2' -p >> "$TMPDIR/kainos-corporate-ca-bundle.crt"
```

Then build with the CA bundle as a BuildKit secret:

```bash
docker build --secret id=corporate_ca,src="$TMPDIR/kainos-corporate-ca-bundle.crt" -t backend:1.0.0 .
```

On a machine that is not behind Kainos/Zscaler HTTPS inspection, this should be enough:

```bash
docker build -t backend:1.0.0 .
```

### 4. Apply migrations and seed data (optional)

The backend image automatically runs `prisma migrate deploy` before starting the
server. To seed local data before the first container start, use the database
port exposed on `localhost:5432`:

```bash
npx prisma migrate deploy
npm run seed
```

### 5. Run the backend container

Inside Docker, use the Postgres container name as the database host:

```bash
docker rm -f team3-backend
docker run -d \
  --name team3-backend \
  --network team3-network \
  -p 4000:4000 \
  --env-file .env \
  -e DATABASE_URL='postgresql://postgres:password@jobRoles-db:5432/jobRoles?schema=public' \
  backend:1.0.0
```

### 6. Verify the backend

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/job-roles
docker logs team3-backend
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

### `POST /api/job-role-chat`

Answers public applicant questions using current job role records.

- Accepts `{ "message": "Which roles are based in Belfast?" }`
- Rejects blank messages, messages over 500 characters, and unknown fields
- Sends no conversation history and at most three matching role details to AI
- Limits generated output to 250 tokens and does not store the response
- Returns source role IDs and names so clients can link to role details
- Returns `503` without exposing provider details when AI is unavailable

### `GET /`

Returns a simple welcome response.

Example response:

```json
{
  "message": "Welcome to your API!"
}
```

### `GET /api/job-roles`

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

### `POST /api/auth/login`

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

### `GET /api/job-roles/{jobRoleId}`

Returns the full details for a job role. This endpoint is public and does not require authentication.

Path parameters:

- `jobRoleId` - A positive integer job role ID

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

- `GET /api/job-roles/statuses` returns `{ "statusId": 1, "statusName": "OPEN" }` objects.
- `GET /api/job-roles/bands` returns `{ "bandId": 3, "bandName": "Engineer" }` objects.
- `GET /api/job-roles/capabilities` returns `{ "capabilityId": 1, "capabilityName": "Software Engineering" }` objects.
- `GET /api/job-roles/locations` returns `{ "locationId": 1, "locationName": "Belfast" }` objects.

Each endpoint returns an array with status `200`. If no lookup records exist, it returns `404` with an error object; unexpected database or service failures return `500`.

### `DELETE /api/job-roles/{jobRoleId}`

Deletes a job role and its associated applications.

Authentication:

- Requires `Authorization: Bearer <jwt>`
- Admin role required

Path parameters:

- `id` - A positive integer job role ID

Success response: `204 No Content`

Error responses:

- `401` - Missing or invalid token
- `403` - Authenticated user is not an admin
- `404` - Job role does not exist

Authentication error (`401`) example:

```json
{
  "message": "Invalid email or password"
}
```

Seeded login users for local and E2E testing all use the password `password`:

- Admin: `test@example.com`
- Applicants: 15 `USER` accounts are seeded, including `user@example.com`, `alex.johnson@example.com`, and `samira.khan@example.com`

Each applicant has at least one application. The seed includes applications across multiple job roles with `IN_PROGRESS`, `HIRED`, and `REJECTED` statuses. Running `npm run seed` again restores these records to their original states.

### `POST /api/auth/register`

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


### `POST /api/job-roles`

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
  "message": "Token error"
}
```


Authorisation error (403):

```json
{
  "message": "Forbidden"
}
```



### `POST /api/job-applications`

Allows an authenticated user to apply for a specific job role with their CV.

Authentication:

- Requires `Authorization: Bearer <jwt>`
- Accepted roles: `ADMIN` and `USER`

Request body:

```json
{
  "jobRoleId": 1,
  "cvText": "Lagosuchus. Amtosaurus. Ischyrosaurus. Xixiasaurus. Sinoceratops. Changchunsaurus. Kundurosaurus. Cryptovolans. Sinovenator. Heterosaurus. Lisboasaurus. Borogovia. Gideonmantellia. Apatodon. Aviatyrannis. Saurophaganax. Baotianmansaurus. Teyuwasu. Pachycephalosaurus. Galtonia. Sinornithomimus.

 Geminiraptor. Vulcanodon. Banji. Sinucerasaurus. Maiasaura. Osmakasaurus. Inosaurus. Eucercosaurus. Petrobrasaurus. Indosuchus. Anserimimus. Yuanmousaurus. Adeopapposaurus. Abydosaurus. Crichtonsaurus. Prenoceratops. Coronosaurus. Xenoceratops. Shuvuuia. Mirischia. Ojoraptorsaurus. Eotyrannus. Tsaagan. Qinlingosaurus. Epidexipteryx. Gresslyosaurus. Platyceratops. Sinornithoides. Halticosaurus. Siluosaurus. Campylodoniscus. Eocarcharia.

 Mirischia. Geminiraptor. Styracosaurus. Chaoyangsaurus. Triassolestes. Elaphrosaurus. Albertonykus. Pyroraptor. Asylosaurus. Austroraptor. Qiupalong. Coelosaurus. Trimucrodon. Xuwulong. Libycosaurus. Gongxianosaurus. Augustia. Nothronychus. Maxakalisaurus. Procerosaurus. Fukuiraptor. Alectrosaurus. Proa. Karongasaurus. Teinurosaurus. Troodon. Krzyzanowskisaurus.

 Jiangshanosaurus. Hypselorhachis. Owenodon. Calamosaurus. Saltasaurus. Isisaurus. Cryptodraco. Huaxiaosaurus. Elosaurus. Mandschurosaurus. Jixiangornis. Serendipaceratops. Rioarribasaurus. Agathaumas. Sinocalliopteryx. Cystosaurus. Ferganasaurus. Alectrosaurus. Pellegrinisaurus. Machimosaurus. Suchomimus. Aviatyrannis. Rioarribasaurus. Riojasuchus. Pelecanimimus. Bicentenaria. Chienkosaurus. Therizinosaurus. Valdoraptor. Oohkotokia. Penelopognathus. Iguanacolossus. Heterodontosaurus. Zhuchengceratops. Tianchisaurus. Vulcanodon. Herbstosaurus. Orkoraptor."
          
}
```

Validation rules:

- `jobRoleId` must be a positive integer
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
  "message": "JobRole with id 999 not found"
}
```

Conflict error (`409`) example:

```json
{
  "message": "User has already applied for this job role"
}
```

Authentication error (`401`) example:

```json
{
  "message": "Token error"
}
```

### `PATCH /api/job-applications/:applicationId/status`

Withdraws an authenticated user's in-progress application.

Request body:

```json
{
  "status": "WITHDRAWN"
}
```

Only `WITHDRAWN` is accepted for user-owned application status updates.

### Admin Job Applications Endpoints

#### `GET /api/job-applications/admin`

Retrieves job applications for administrators. Use the optional `jobRoleId`
query parameter to filter the collection to a specific job role.

Authentication:

- Requires `Authorization: Bearer <jwt>`
- Admin role required

Query parameters:

- `jobRoleId` - Optional positive integer job role ID

Success response (`200`):

```json
[
  {
    "applicationId": 1,
    "jobRoleId": 1,
    "applicantEmail": "test@example.com",
    "roleName": "Software Engineer",
    "applicationDate": "2026-08-15T10:30:00.000Z",
    "status": "IN_PROGRESS",
    "cvText": "Lorem ipsum dolor sit amet...",
    "actions": {
      "canHire": true,
      "canReject": true
    }
  }
]
```

Not found error (`404`) example:

```json
{
  "message": "JobRole with id 999 not found"
}
```

#### `PATCH /api/job-applications/admin/:applicationId/status`

Updates the status of a job application (admin only).

Authentication:

- Requires `Authorization: Bearer <jwt>`
- Admin role required

Path parameters:

- `applicationId` - The application ID (positive integer)

Request body:

```json
{
  "status": "HIRED"
}
```

Allowed status values:

- `HIRED` - Mark applicant as hired
- `REJECTED` - Reject the application

Success response (`200`):

```json
{
	"message": "Applicant hired",
	"application": {
		"applicationId": 1,
		"applicantEmail": "test@example.com",
		"status": "HIRED"
	}
}
```

Validation error (`400`) example:

```json
{
  "errors": [
    {
      "field": "status",
      "message": "Invalid option: expected one of HIRED or REJECTED"
    }
  ]
}
```

Not found error (`404`) example:

```json
{
  "message": "Application not found"
}
```

Conflict error (`409`) example:

```json
{
  "message": "Only IN_PROGRESS applications can be hired"
}
```

## Quick Check

After starting the app, you can verify endpoints with:

```bash
curl http://localhost:4000/
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new.user@example.com","password":"Password123!"}'
curl -X POST http://localhost:4000/api/job-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"jobRoleId":1,"cvText":"Lorem ipsum dolor sit amet. Qui repellendus exercitationem sed reiciendis..."}'
curl -X POST http://localhost:4000/api/job-roles \
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
