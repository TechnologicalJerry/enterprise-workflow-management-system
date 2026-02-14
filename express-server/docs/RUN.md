# How to Run the Express Server (Microservices)

This guide explains **what must be running before** the Express server and **how to run** the full stack **locally on your system (no Docker)**. Docker is covered in section 3 for later.

---

## 1. Prerequisites (local run, no Docker)

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** 14+ installed and running on your machine (port 5432)
- **Redis** installed and running on your machine (port 6379)
- **Git** (repo already cloned)

---

## 2. Run Infrastructure Locally (No Docker)

These must be running **before** you start the Express API Gateway and microservices.

| Service    | Purpose                              | Port | Required |
|-----------|---------------------------------------|------|----------|
| PostgreSQL | Databases for all 11 services        | 5432 | **Yes**  |
| Redis     | Session/token cache, rate limit      | 6379 | **Yes**  |

### 2.1 Install and run PostgreSQL (Windows)

1. **Install**
   - Download: https://www.postgresql.org/download/windows/
   - Or: `winget install PostgreSQL.PostgreSQL`
   - During setup, set a password for the `postgres` user and note the port (default 5432).

2. **Ensure it's running**
   - Windows: **Services** → find "PostgreSQL" → Start (or set to Automatic).
   - Or from a terminal (if `psql` is on PATH):
     ```powershell
     psql -U postgres -c "SELECT 1"
     ```

3. **Create the 11 databases** (once)
   - Open **pgAdmin** or **psql** and run:
     ```sql
     CREATE DATABASE workflow_auth;
     CREATE DATABASE workflow_user;
     CREATE DATABASE workflow_permission;
     CREATE DATABASE workflow_workflow_def;
     CREATE DATABASE workflow_workflow_inst;
     CREATE DATABASE workflow_task;
     CREATE DATABASE workflow_approval;
     CREATE DATABASE workflow_document;
     CREATE DATABASE workflow_audit;
     CREATE DATABASE workflow_notification;
     CREATE DATABASE workflow_reporting;
     ```
   - Or in one go with `psql`:
     ```powershell
     psql -U postgres -c "CREATE DATABASE workflow_auth; CREATE DATABASE workflow_user; CREATE DATABASE workflow_permission; CREATE DATABASE workflow_workflow_def; CREATE DATABASE workflow_workflow_inst; CREATE DATABASE workflow_task; CREATE DATABASE workflow_approval; CREATE DATABASE workflow_document; CREATE DATABASE workflow_audit; CREATE DATABASE workflow_notification; CREATE DATABASE workflow_reporting;"
     ```

You should see `workflow-postgres` and `workflow-redis` with state “Up” (and “healthy” for postgres).

### 2.2 Install and run Redis (Windows)

1. **Option A – Memurai (Redis-compatible, recommended on Windows)**
   - Download: https://www.memurai.com/
   - Install and start the service. It listens on port 6379 by default.
   - No password by default; leave `REDIS_PASSWORD` empty in `.env` if you don't set one.

2. **Option B – Redis from tporadowski**
   - https://github.com/tporadowski/redis/releases
   - Extract and run `redis-server.exe`.
   - No password by default.

3. **Option C – WSL2**
   - In WSL: `sudo apt install redis-server` then `redis-server` (or run as service).
   - Use `localhost:6379` from Windows; no password unless you configure one.

4. **Check Redis**
   ```powershell
   redis-cli ping
   ```
   Expected: `PONG`.

---

## 3. (Later) Run infrastructure with Docker

When you switch to Docker:

- Start only Postgres and Redis:
  ```bash
  docker-compose up -d postgres redis
  ```
- Docker's init creates DBs named `auth_db`, `user_db`, … so either use those names in each service's `DATABASE_URL` or create `workflow_*` DBs manually. See section 4 (Environment) for DB names.

---

## 4. Environment Configuration

### 4.1 Root `.env`

Copy the root example and set at least:

- `POSTGRES_USER` and `POSTGRES_PASSWORD` (must match your local Postgres user)
- `REDIS_PASSWORD` (leave empty if Redis has no password, e.g. Memurai/tporadowski default)
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (long random strings, e.g. 32+ chars)

```bash
cd express-server
cp .env.example .env
```

Edit `.env` and set:

```env
POSTGRES_USER=workflow_admin
POSTGRES_PASSWORD=your_secure_password_here
REDIS_PASSWORD=your_redis_password_here
JWT_ACCESS_SECRET=your_very_long_and_secure_access_token_secret_key_here_min_256_bits
JWT_REFRESH_SECRET=your_very_long_and_secure_refresh_token_secret_key_here_min_256_bits
```

If you use the default Postgres user `postgres` and no password for local dev, use:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 4.2 Redis without password (local dev)

If you prefer no Redis password, run Redis without `--requirepass` (e.g. override in docker-compose or run `redis-server` locally) and leave `REDIS_PASSWORD` empty in `.env` and in each service that uses Redis (api-gateway, auth-service).

### 4.3 Database names (Docker vs local)

Docker Compose’s init script creates:

`auth_db`, `user_db`, `permission_db`, `workflow_def_db`, `workflow_inst_db`, `task_db`, `approval_db`, `document_db`, `audit_db`, `notification_db`, `reporting_db`

Each service’s `.env.example` uses names like `workflow_auth`, `workflow_user`, etc. You can either:

- **Use Docker DB names**: in each service `.env`, set `DATABASE_URL` to the corresponding DB (e.g. auth-service → `auth_db`, user-service → `user_db`, …), with the same user/password as in step 3.1, or  
- **Create `workflow_*` databases** in Postgres and keep using the URLs from `.env.example` (e.g. `workflow_auth`, `workflow_user`, …).

Example for **auth-service** with Docker DB name:

```env
DATABASE_URL=postgresql://workflow_admin:your_secure_password_here@localhost:5432/auth_db?schema=public
```

Use the same host, port, user, and password for every service; only change the database name.

---

## 5. Install Dependencies and Build Shared

From `express-server` (monorepo root):

```bash
npm install
npm run build:shared
```

If `build:shared` fails due to TypeScript in `shared`, you can still run services that don’t depend on it; fix the shared package for full build.

---

## 6. Run Migrations and Seeds

Each service that uses Prisma needs its database created and migrated. Use the same `DATABASE_URL` (and DB name) you configured in step 3.

Run migrations (and seed where applicable) for each service. Examples (adjust workspace name if different):

```bash
# Auth
npm run migrate:dev -w @workflow/auth-service
npm run db:seed -w @workflow/auth-service

# User
npm run migrate:dev -w @workflow/user-service
npm run db:seed -w @workflow/user-service

# Permission
npm run migrate:dev -w @workflow/permission-service
npm run db:seed -w @workflow/permission-service

# Workflow Definition
npm run migrate:dev -w @workflow/workflow-definition-service
npm run db:seed -w @workflow/workflow-definition-service

# Workflow Instance
npm run migrate:dev -w @workflow/workflow-instance-service

# Task
npm run migrate:dev -w @workflow/task-service

# Approval
npm run migrate:dev -w @workflow/approval-service

# Document
npm run migrate:dev -w @workflow/document-service

# Audit
npm run migrate:dev -w @workflow/audit-service

# Notification
npm run migrate:dev -w @workflow/notification-service

# Reporting
npm run migrate:dev -w @workflow/reporting-service
```

If a workspace name doesn’t match, use the name from that service’s `package.json` (e.g. `@workflow/auth-service`).

---

## 7. Start the Express Server (API Gateway + Services)

### Option A: Run everything (gateway + all 11 services)

From `express-server`:

```bash
npm run dev
```

This starts:

- API Gateway (port 3000)
- Auth (3001), User (3002), Permission (3003)
- Workflow Definition (3004), Workflow Instance (3005)
- Task (3006), Approval (3007)
- Document (3008), Audit (3009), Notification (3010), Reporting (3011)

### Option B: Run infrastructure only (e.g. gateway + auth + user + permission)

```bash
npm run dev:gateway
npm run dev:auth
npm run dev:user
npm run dev:permission
```

Run each in a separate terminal, or use a process manager.

### Option C: Run one service at a time

```bash
npm run dev -w @workflow/api-gateway
npm run dev -w @workflow/auth-service
# etc.
```

Or the shortcut scripts:

```bash
npm run dev:gateway
npm run dev:auth
npm run dev:user
# ...
```

---

## 8. Verify

- **API Gateway**: http://localhost:3000/health  
- **Auth**: http://localhost:3001/health  
- **User**: http://localhost:3002/health  
- **Permission**: http://localhost:3003/health  
- … same pattern for 3004–3011.

**Login (via gateway):**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@workflow.local\",\"password\":\"Admin@123456\"}"
```

(Use the same credentials you seeded in auth and user/permission services.)

---

## 9. Quick Reference: What Must Run Before the Express Server

| Order | What to run              | Purpose |
|-------|--------------------------|--------|
| 1     | **PostgreSQL** (installed and running on your machine) | All services’ databases |
| 2     | **Redis** (installed and running on your machine)     | Gateway + auth (sessions, rate limit, token blacklist) |
| 3     | Create the 11 databases (section 2.1)                 | So each service has its own DB |
| 4     | `npm install` + `npm run build:shared`                 | Dependencies and shared package |
| 5     | Migrations (and seed) for each service                | Create tables and initial data |
| 6     | `npm run dev` (or individual services)                 | Start API Gateway and microservices |

**Minimum to run the Express server:**  
PostgreSQL and Redis must be up. Then configure `.env`, run migrations/seed, and start the gateway and the services you need.
