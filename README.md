# Smart Campus Operations Hub

University web platform to manage facility and asset bookings (rooms, labs, equipment) and maintenance/incident handling (fault reports, technician updates, resolutions).

## Architecture

- **Frontend:** React (Vite) — module folders under `frontend/smart-campus-ui/src/modules/`
  - `facilities-assets` — resources listing & admin CRUD
  - `booking-management` — bookings, approvals, QR verification
  - `maintenance-tickets` — tickets, attachments, comments, technician workflow
  - `auth-notifications` — login (Google OAuth + dev login), JWT session, notification panel
- **Backend:** Spring Boot REST API — packages mirror the same feature areas under `backend/smart-campus-api/src/main/java/com/sliit/smartcampus/`
- **Database:** MongoDB (MongoDB Atlas recommended)
- **Security:** Google OAuth2 login on the backend, then redirect to the SPA with a **JWT** (Bearer token) so the React app on port 5173 can call `/api/**` without sharing cookies across ports.

## Prerequisites

- Java 22+ (matches `pom.xml`)
- Node.js 20+
- MongoDB Atlas account (recommended) or local MongoDB

## SETUP GUID ----------------------------------------------------------------------------------------------------

## MongoDB Atlas setup

1. Create a MongoDB Atlas cluster (M0 free tier is fine for dev).
2. Create a database user (username/password).
3. Allow your IP in **Network Access** (or allow from anywhere for quick local dev).
4. Copy the **connection string** (SRV URI) and set it as an environment variable:

```powershell
setx MONGODB_URI "mongodb+srv://dewmithinara68:dewmi0817@cluster0.kn0ch.mongodb.net/smartcampus?retryWrites=true&w=majority"
```

The backend uses `spring.data.mongodb.uri` (see `backend/smart-campus-api/src/main/resources/application.properties`).



<!-- (first time) -->
<!-- 1. Install and start MySQL.
2. Create schema and tables (or use `spring.jpa.hibernate.ddl-auto=update` only — see below).

**Option A — Manual SQL**

```bash
mysql -u root -p < docs/mysql-schema.sql
```

Adjust `spring.datasource.*` in `backend/smart-campus-api/src/main/resources/application.properties` (or use env vars `DB_USERNAME`, `DB_PASSWORD`).

**Option B — Hibernate only**

- Create an empty database:

```sql
CREATE DATABASE smart_campus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- Set `spring.jpa.hibernate.ddl-auto=update` (default in `application.properties`) and run the API once; tables will be created from JPA entities. -->

## Google OAuth (production-style login)

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project.
2. Configure **OAuth consent screen** (External is fine for local dev). Add your email as a test user if needed.
3. Create **OAuth 2.0 Client ID** → **Web application**.
4. Add this **Authorized redirect URI** (must match exactly):

- `http://localhost:8080/login/oauth2/code/google`

5. (Recommended) Add this **Authorized JavaScript origin**:

- `http://localhost:5173`

6. Put your credentials in a backend `.env` file:

- Copy `backend/smart-campus-api/.env.example` to `backend/smart-campus-api/.env`
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (and `FRONTEND_URL` if needed)

Alternatively, set environment variables:

```bash
set GOOGLE_CLIENT_ID=your-client-id
set GOOGLE_CLIENT_SECRET=your-client-secret
```

And edit `backend\smart-campus-api\src\main\resources\application.properties`

4. From the UI, use **Continue with Google**. After success, the backend redirects to `http://localhost:5173/auth/callback?token=...`.

## Developer login (no Google yet)

While MySQL or Google are not configured, use **Developer login** on `/login`. It calls `POST /api/auth/dev-login` and stores a JWT in `localStorage`. The first user created becomes **ADMIN** if the database is empty.

Disable in production:

```properties
app.dev-login.enabled=false
```

## Run locally

**Terminal 1 — Backend**

```bash
cd backend/smart-campus-api
```

**Windows PowerShell** (you must prefix local scripts with `.\`):

```powershell
.\mvnw.cmd spring-boot:run
```

**Command Prompt (cmd.exe)**:

```bat
mvnw.cmd spring-boot:run
```

**Terminal 2 — Frontend**

```bash
cd frontend/smart-campus-ui
npm install
npm run dev
```

- UI: `http://localhost:5173` (Vite proxies `/api`, `/oauth2`, `/login`, `/uploads` to `http://localhost:8080`)
- API: `http://localhost:8080`

**Uploads:** Ticket attachments are stored under `uploads/` (see `app.upload.dir`). Ensure the process can write there.

## Environment variables (reference)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FRONTEND_URL` | Where OAuth redirects after login (default `http://localhost:5173`) |
| `JWT_SECRET` | HS256 signing key (min 32 characters) |
| `QR_HMAC_SECRET` | QR signing secret (min 16 characters) |
| `DEV_LOGIN_ENABLED` | `true`/`false` for dev login endpoint |

## API overview (selected)

- **Resources:** `POST/GET/PUT/DELETE /api/resources` (admin for mutating)
- **Bookings:** `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings` (admin), `PUT .../approve|reject`, `GET .../qr`, `POST /api/bookings/verify` (public)
- **Tickets:** `POST /api/tickets` (multipart), `GET /api/tickets`, `PUT .../assign`, `PUT .../status`, `POST/GET .../comments`
- **Auth:** `GET /api/users/me`, `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `POST /api/auth/dev-login`

## CI

GitHub Actions runs backend tests and frontend build on `main` / `develop` (see `.github/workflows/ci.yml`).


