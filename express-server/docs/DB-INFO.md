# Database info (for AI / onboarding)

**System:** Enterprise Workflow Management – Express-based microservices.

**PostgreSQL:** One instance (default port **5432**), **11 separate databases** (one per service). Each service has its own DB; no shared DB.

**Database names:**

| Service              | Database name              |
|----------------------|----------------------------|
| Auth                 | `workflow_auth`            |
| User                 | `workflow_user`            |
| Permission           | `workflow_permission`      |
| Workflow Definition  | `workflow_workflow_def`    |
| Workflow Instance    | `workflow_workflow_inst`   |
| Task                 | `workflow_task`            |
| Approval             | `workflow_approval`        |
| Document             | `workflow_document`        |
| Audit                | `workflow_audit`           |
| Notification         | `workflow_notification`   |
| Reporting            | `workflow_reporting`      |

**Connection:** Each service uses `DATABASE_URL` in its `.env` (e.g. `postgresql://USER:PASSWORD@localhost:5432/workflow_auth?schema=public`). Migrations and seeds are per-service (Prisma in each service folder).

**Redis:** Port **6379** – used by API Gateway and Auth (sessions, rate limit, token blacklist). Not a “DB name”; it’s a separate cache/session store.

Share this file so an AI or new dev knows: one Postgres, 11 DBs with the names above, and Redis on 6379.
