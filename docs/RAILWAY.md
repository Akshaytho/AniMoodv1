# Railway resources for AniMood

These are the resources provisioned in your Railway account for AniMood. None of these IDs are secrets — the only secret is the Postgres password embedded in `DATABASE_URL` (kept in `.env`, never committed).

## Project

- **Name:** `animood`
- **ID:** `383a7bb2-b7ab-4f1b-8368-f0c9a0cb5f64`
- **URL:** https://railway.com/project/383a7bb2-b7ab-4f1b-8368-f0c9a0cb5f64
- **Environment:** `production` (`2011a5c0-78e5-473c-a0cb-12a5a2da02f8`)

## Services

| Service | ID | Image | Purpose |
|---|---|---|---|
| Postgres | `abea7e2d-2886-4723-b8d6-156144df4ba4` | `ghcr.io/railwayapp-templates/postgres-ssl:latest` | App database (Postgres 16.13 + pgvector 0.8.2) |

### Postgres networking

- **Private host** (Railway internal, used by services hosted on Railway): `postgres.railway.internal:5432`
- **Public TCP proxy** (used by local dev / migrations): `viaduct.proxy.rlwy.net:49938`
- **Volume:** `postgres-volume` mounted at `/var/lib/postgresql/data` (id `1b3bdac7-ffd3-49b5-9976-414fc7cf32e7`)

`DATABASE_URL` in local `.env` points to the public proxy.
Railway-hosted services should use the `DATABASE_URL` variable Railway injects, which resolves to the private host automatically.

## What's NOT here yet (provisioned later in execution plan)

- `n8n` service (commits 18+)
- `api` service (commits 6+, dashboard backend)
- `dashboard` service (commits 7+, review UI)

## Reprovisioning from scratch

If you ever need to rebuild this from zero, the steps the build script performs are:

1. `mutation projectCreate(input: { name: "animood" })`
2. `mutation serviceCreate(input: { projectId, environmentId, name: "Postgres", source: { image: "ghcr.io/railwayapp-templates/postgres-ssl:latest" } })`
3. `mutation variableCollectionUpsert` with `POSTGRES_*`, `PG*`, `DATABASE_URL`, `DATABASE_PUBLIC_URL`, `PGDATA=/var/lib/postgresql/data/pgdata`, `SSL_CERT_DAYS=820`
4. `mutation volumeCreate(input: { mountPath: "/var/lib/postgresql/data" })`
5. `mutation tcpProxyCreate(input: { applicationPort: 5432 })`
6. `mutation serviceInstanceDeployV2(serviceId, environmentId)`
7. Wait until `SELECT 1` succeeds against the public URL
8. `CREATE EXTENSION IF NOT EXISTS vector` via psql
9. `pnpm --filter @animood/db run migrate && pnpm --filter @animood/db run seed:budget`
