# Databases on Dokploy

## Choose where the database lives

| Need | Use | Backups |
|---|---|---|
| Production data (Postgres, MySQL, MariaDB, MongoDB, Redis, libSQL) | **Dokploy-managed database service** (best default) | Built in, scheduled to S3 |
| A database that belongs to one app and is disposable or small | A service inside the app's **Docker Compose** with a named volume (deployed here: MongoDB in `apps/mern`) | Volume backups or a dump job |
| Tiny single-user or internal app, no separate server | **SQLite file on a volume** (deployed here: `apps/django`) | Copy or volume backup |
| You already pay for Atlas, RDS, Supabase, PlanetScale, Neon… | External connection string in an env var | Provider's backups |

SQL: Postgres, MySQL, MariaDB, SQLite/libSQL. NoSQL: MongoDB (documents), Redis (key-value, cache, queues).
Anything else (Cassandra, Elasticsearch, ClickHouse…) runs as a Compose service with a volume.

## Add a managed database (5 minutes)

1. Dokploy → your project → **Create Service → Database** → pick the engine.
2. Set a name, database name, user and a strong password (Dokploy can generate one), and the image version
   (pin it, e.g. `postgres:17`; do not use `latest`).
3. **Deploy** the database. Open its **General** tab and copy the **internal** connection details: host (its *App Name*),
   port, user, password.
4. In the app's **Environment** tab set one variable, usually `DATABASE_URL`, using the internal host:

   | Engine | Connection string |
   |---|---|
   | PostgreSQL | `postgresql://USER:PASSWORD@HOST:5432/DB` |
   | MySQL / MariaDB | `mysql://USER:PASSWORD@HOST:3306/DB` |
   | MongoDB | `mongodb://USER:PASSWORD@HOST:27017/DB?authSource=admin` |
   | Redis | `redis://:PASSWORD@HOST:6379` |
   | SQLite | `sqlite:////data/app.db` (Prisma: `file:/data/app.db`); mount a volume at `/data` |

5. Redeploy the app, then open **Backups** on the database and set up a schedule (next section).

**Keep the database private.** Leave *External Port* empty. Apps on the same Dokploy reach it by its internal host. If you must
connect from your laptop, enable the external port temporarily, restrict it with a firewall, and turn it off afterwards.

**Compose apps:** Compose stacks run in an isolated private network, so they cannot see a managed database by hostname.
Either keep the database inside the same Compose file (as `apps/mern` does), or attach the service to Dokploy's shared network:

```yaml
services:
  api:
    networks: [dokploy-network]      # keep the default network too if the service also talks to its siblings
networks:
  dokploy-network:
    external: true
```

## Backups and restore

- **Set up a destination first.** Dokploy cannot back anything up until one exists, and at the time of writing this server has
  none configured, so no database on it has scheduled Dokploy backups.
- **Managed databases:** Dokploy → Settings → **S3 Destinations** (AWS S3, Cloudflare R2, Wasabi, DigitalOcean Spaces or any
  S3-compatible bucket), then database → **Backups**:
  schedule (cron), prefix and how many to keep. Run one manually, then **restore it into a scratch database** to prove it works.
  An untested backup is not a backup.
- **SQLite and other volumes:** use the app's **Volume Backups** tab. For SQLite prefer a consistent copy,
  `sqlite3 /data/db.sqlite3 ".backup '/data/backup.sqlite3'"`, over copying a file that is being written.
- **Compose databases:** a volume backup works, but a logical dump is safer (`mongodump`, `pg_dump`, `mysqldump`) run from the
  service's **Schedules** tab.
- Keep backups off the server (the S3 bucket), and keep at least one recent copy you have actually restored.

## Migrations

Run schema migrations **once per deploy, at start-up, before the app serves traffic**, as `apps/django` does
(`manage.py migrate && gunicorn …`). Other stacks: `npx prisma migrate deploy`, `knex migrate:latest`, `alembic upgrade head`,
`php artisan migrate --force`. Make migrations backward compatible (add columns before using them), because the old and new
containers briefly overlap during a deploy.

## Engine notes

- **PostgreSQL / MySQL / MariaDB:** use one database and one user per app, never the admin user. Pin the major version; a major
  upgrade needs a dump and restore, not just a new image tag.
- **MongoDB:** the root user lives in the `admin` database, hence `authSource=admin`. The root password applies only when the
  volume is first created; changing it later requires updating the user inside Mongo.
- **Redis:** always set a password. For a pure cache, persistence can stay off; for queues or sessions enable AOF/RDB persistence
  and a volume.
- **SQLite:** one writer at a time and **one app replica only**. Keep the file on a named volume, never inside the image
  (containers are replaced on each deploy). Enable WAL (`PRAGMA journal_mode=WAL`). When you need several replicas or heavy
  writes, move to Postgres; **libSQL** (also offered as a managed service) gives a SQLite-compatible server if you want to keep the API.

## Local development

Run the same engine locally with a throwaway container, and keep the connection string in an untracked `.env`:

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:17
docker run -d --name mongo -p 27017:27017 mongo:7
```

## Checklist

- [ ] Strong, unique passwords; one DB user per app
- [ ] External port closed; password manager or Dokploy holds the credentials, not the repo
- [ ] Image version pinned
- [ ] Volume attached, backup scheduled, restore tested
- [ ] Migrations run at start-up and are backward compatible
