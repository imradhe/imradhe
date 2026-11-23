# imradhe.com

MERN rewrite of the personal website: **MongoDB, Express, React, Node.js**.

The runnable application is in [`app/`](app/README.md). The original PHP application is preserved on Git branch `main`; the migration is on `mern-rewrite`.

```sh
cd app
npm ci
docker compose up --build -d
docker compose exec web npm run seed
```

Open **http://localhost:8080**. See the [application guide](app/README.md) for development without Docker, administrator setup, tests, and production configuration. The [migration notes](docs/MIGRATION.md) record route coverage and behavior changes.

The original hosting backup, zip archive, and root-level SQL dumps remain untouched and untracked. Historical PHP deployment notes are in `docs/legacy/`; they do not describe the MERN deployment.
