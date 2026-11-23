# imradhe.com · MERN

A React application backed by an Express API and MongoDB. Node serves the production client, public files, and AR media on port 8080. PHP, Apache, and MySQL are no longer runtime dependencies.

The portfolio content, photographs, resume, project images, chat archive, audio and 3D models are retained. The original application is preserved on branch `main`; this implementation is on `mern-rewrite`.

## Run with Docker

From this directory:

```sh
docker compose up --build -d
docker compose exec web npm run seed
```

Open http://localhost:8080. MongoDB has a persistent named volume and is reachable only on the Compose network. The web port binds to loopback for local use. `docker compose down` stops services and keeps your database volume.

The first seed adds the three original stories and three scenes from `data/legacy-content.json`, derived from the supplied live-site export `db/imradhe.sql`. It does **not** import the unrelated Kautilya database. It also imports valid Markdown filenames from `content/blog/`; `_example.md` is a hidden template. Re-running seed inserts missing records and preserves existing edits. There are no published blog posts in the supplied source.

## Local development

Use Node **22.17 or newer** and a running MongoDB server (MongoDB 7 or 8).

```sh
npm ci
cp .env.example .env
# Set MONGODB_URI to your local MongoDB or Atlas database.
npm run seed
npm run dev
```

Open http://localhost:5173. Vite proxies API and media requests to Express on port 8080. All database access and secrets stay on the server. To use the production client locally:

```sh
npm run build
npm start
```

Then open http://localhost:8080. Building does not require MongoDB. The portfolio, static files and `/health` remain available without a database; database routes respond with 503 until MongoDB is ready.

## Administrator account

1. Register at `/register`, using a password of at least 12 characters. Public registration always creates an ordinary user.
2. Promote the existing account from the application directory:

   ```sh
   npm run admin -- you@example.com
   # For Compose:
   docker compose exec web npm run admin -- you@example.com
   ```

3. Log in at `/login` and open `/admin`. You can create, edit, and delete stories, scenes, and Markdown blog posts, review flags, and inspect recent login records.

Set `ALLOW_REGISTRATION=false` after creating the accounts you need. No default admin or password is included. The original export contains no user records; old MD5 hashes are intentionally not imported.

Sessions are stored in MongoDB with expiration and an HttpOnly, SameSite=Strict cookie. Passwords use salted scrypt hashes. State-changing authenticated requests require the session’s CSRF token. New sessions rotate the browser’s previous token. Deletes require an explicit UI confirmation and a DELETE request; deleting a story that still has scenes returns 409.

## Content

- `data/portfolio.json`: education, experience, and all 15 project entries; changes take effect after server restart.
- `/admin/posts`: author posts in Markdown, set descriptions and tags, and toggle draft visibility.
- `content/blog/*.md`: optional import source for new posts. Run `npm run seed` to insert new slugs; edit existing posts through admin.
- `/admin/stories` and `/admin/scenes`: manage story content. Scene IDs are generated as `<storyID>-<act>-<chapter>-<scene>`. Changing these numbers changes the scene URL.
- Scene HTML and rendered blog HTML are sanitized. The browser renders portfolio and archive Markdown without raw HTML.
- `public/assets/`: preserved media and public resources. `media/ar/` contains the large models and is served at `/assets/ar/` without copying them into the Vite bundle.

## Environment

| Variable | Default / purpose |
| --- | --- |
| `PORT` | `8080` |
| `APP_URL` | `http://localhost:8080`; public origin used for canonical links and mutation origin checks |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/imradhe` |
| `NODE_ENV` | Use `production` behind HTTPS to enable secure cookies and HTTPS CSP behavior |
| `TRUST_PROXY` | `0`; use `1` only when the application is reachable through exactly one trusted reverse proxy |
| `ALLOW_REGISTRATION` | `true`; set `false` to close registration |
| `ASR_URL` | Optional AI4Bharat-compatible ASR HTTP inference endpoint |
| `ASR_TOKEN` | Optional bearer token, sent only to that configured endpoint |

The speech-to-text page sends WAV/MP3 audio through `/api/transcribe`. It validates language, size and format, detects the audio’s sample rate, and forwards audio only when submitted. With no configured service it returns an explicit 503 instead of pretending transcription worked. The speech-synthesis demo at `/balloon` uses the browser’s voices and no embedded bearer credential.

AR model viewing works on desktop; native AR needs a compatible phone and HTTPS. The isolated marker-video demo loads A-Frame and AR.js from their pinned upstream versions and requires camera permission. Camera/native AR and the external ASR provider need testing on their target devices/services.

## Deploy on Dokploy or another Docker host

Use `app/Dockerfile` with build context `app/`, container port **8080**, and liveness check `/health`. Provide a private MongoDB service or an Atlas URI, `APP_URL=https://imradhe.com`, `NODE_ENV=production`, and the appropriate `TRUST_PROXY` value. The container runs as the unprivileged `node` user.

Run `npm run seed` once in the deployed container’s terminal. Register/promote your admin, then close registration if desired. MongoDB indexes, including unique identifiers and session expiration, are created before the API reports readiness. `/api/health` is the database readiness check (200 when ready, 503 otherwise).

A production deployment needs both the Node container and a persistent MongoDB service. Do not reuse the old PHP/MySQL build settings. Compose defaults to local HTTP development; set production values when adapting it for an HTTPS reverse proxy.

## Verify

```sh
npm run check  # production build, API/content tests against temporary MongoDB, React interaction tests
```

The integration suite starts and stops its own isolated MongoDB process; it never connects to `MONGODB_URI` or a real user database. The first test run may download the MongoDB test binary to `/tmp/imradhe-mongodb-binaries`. Tests cover content migration, role/CSRF enforcement, sessions, CRUD, drafts, HTML sanitization, flag ownership/aggregates, HTTP status and redirect behavior, static-file isolation, outage handling, chess moves, streak rewards, and subtitle timestamps.

See [`../docs/MIGRATION.md`](../docs/MIGRATION.md) for all legacy routes and compatibility changes.
