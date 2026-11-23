# Dokploy guide

Deploy, run and maintain apps on **https://server.yuvajanasamiti.org** (Dokploy v0.30).
Everything below is what is running today in the Dokploy project **Examples**, built from this repo.

Companion guides: **[DOCKERFILES.md](DOCKERFILES.md)** (Dockerfile recipes for Next.js, Vue, Nuxt, Node/NestJS and more),
**[DATABASES.md](DATABASES.md)** (MySQL, Postgres, MongoDB, Redis, SQLite: setup, connection strings, backups) and
**[DOMAINS.md](DOMAINS.md)** (connecting your own domains, Cloudflare, HTTPS).

## 1. What is deployed

| App | Stack | URL | Dokploy type | Container port |
|---|---|---|---|---|
| `mern` | MongoDB 7 + Express 5 + React 19 (nginx) | https://mern.72-61-171-146.sslip.io | Compose | `mern-web`: 80 |
| `php` | PHP 8.3 + Apache | https://php.72-61-171-146.sslip.io | Application (Dockerfile) | 80 |
| `flask` | Flask 3 + gunicorn | https://flask.72-61-171-146.sslip.io | Application (Dockerfile) | 8000 |
| `django` | Django 5.2 LTS + gunicorn + WhiteNoise + SQLite on a volume | https://django.72-61-171-146.sslip.io | Application (Dockerfile) | 8000 |
| `ml` | FastAPI + scikit-learn iris classifier (`/docs` for Swagger) | https://ml.72-61-171-146.sslip.io | Application (Dockerfile) | 8000 |

## 2. How it fits together

```
GitHub repo ──(GitHub App, read-only)──► Dokploy builds the Docker image on the server
                                         └─► Traefik routes the domain and issues the Let's Encrypt certificate
```

```
apps/<name>/            one folder per app
  Dockerfile            how to build and run it
  Makefile              `make test` and `make build` (the contract CI relies on)
.github/workflows/      ci.yml (test + build changed apps) · deploy.yml (CI, then deploy)
.github/dokploy.json    app name → Dokploy service id
```

An app is deployable when it: listens on `0.0.0.0:<port>`, answers a `/health` URL, reads config from
environment variables, runs as a non-root user, and has a `HEALTHCHECK` in its Dockerfile.

## 3. Deploy a new app (about 5 minutes)

**One-time GitHub connection** (already done for `imradhe/dokploy-examples`):
Dokploy → Settings → Git → *Github* → Create GitHub App (personal account or organization) → on GitHub choose
**Only select repositories**. To add another repo later: GitHub → Settings → Applications → the app → Configure.

**Per app:**

1. Add `apps/<name>/` with a Dockerfile, a `/health` route and a `Makefile` (`test`, `build`).
2. Dokploy → project → **Create Service** → *Application* (one container) or *Compose* (several, e.g. app + database).
3. **Provider**: GitHub → repo, branch `main`.
   Application: **Build Path** `/apps/<name>`, **Build Type** *Dockerfile*.
   Compose: **Compose Path** `./apps/<name>/docker-compose.yml`.
4. **Environment** tab: add secrets and settings (never commit them).
5. **Domains** tab: host, the container port from the table above, HTTPS on, certificate *Let's Encrypt*.
   For Compose pick the service that serves HTTP (here `mern-web`).
6. **General → Provider → Watch Paths**: `apps/<name>/**`, so only this app rebuilds when it changes.
7. Click **Deploy**, then open `/health` and check the **Logs** tab.
8. Add the app to the filters in `ci.yml` and to `.github/dokploy.json`.

**Choosing a build type**

| Situation | Use |
|---|---|
| Any app, reproducible builds (recommended; used here for all five) | Dockerfile |
| Quick start, no Dockerfile | Railpack or Nixpacks (auto-detect Node, PHP, Python); *Static* for plain HTML sites |
| App plus its own database or sidecars | Docker Compose |
| Production database with scheduled backups | Dokploy's built-in Postgres / MySQL / MongoDB / Redis service |
| Image already built elsewhere | Docker image from a registry |

## 4. Hostnames and HTTPS

Short version below; the full walkthrough (Cloudflare, `www`, API subdomains, troubleshooting) is in [DOMAINS.md](DOMAINS.md).

- The demo hosts `<name>.72-61-171-146.sslip.io` resolve to the server IP with no DNS change, and Let's Encrypt
  issues real certificates for them. Good for testing, not for permanent URLs.
- For real domains add a DNS **A record** to `72.61.171.146` (in Cloudflare use *DNS only*, grey cloud, so the
  certificate can be issued). A wildcard such as `*.apps.yuvajanasamiti.org` makes every new app instant.
  Then change the host in the app's Domains tab.
- Django also needs the new host in `DJANGO_ALLOWED_HOSTS` and `https://<host>` in `DJANGO_CSRF_TRUSTED_ORIGINS`.
- Ports 80 and 443 are open. Do not publish database ports; Compose services talk over their private network.
  SSH (22) was not reachable from outside when this was set up, so administration is through the Dokploy UI and API.

## 5. CI/CD

```
Pull request ──► CI: for each changed app run `make test` then `make build` ──► review ──► merge
Push to main ──► Deploy workflow: CI again ──► Dokploy deploys only the changed apps
```

`ci.yml` finds changed apps with path filters, so a Flask change never tests or rebuilds Django. Editing `ci.yml`
itself runs every app.

### Live today: deploy only after CI passes
A merge to `main` runs `deploy.yml`: CI first, then one call to Dokploy per changed app,
`POST /api/application.deploy` or `compose.deploy`, using the ids in `.github/dokploy.json`.
Dokploy's own **Autodeploy is off** on all five services, so nothing ships unless CI is green.
This was tested end to end: a change to Flask and MERN ran CI, then Dokploy deployed exactly those two and left
PHP, Django and ML alone.

Needs (already set): repo secret `DOKPLOY_API_KEY`, repo variable `DOKPLOY_URL`
(`https://server.yuvajanasamiti.org`). Without `DOKPLOY_URL` the deploy job is skipped.

**Rotate the key** before it expires (the current one expires 2027-11-23) or if it was ever shared:
1. Dokploy → Settings → Profile → **API/CLI Keys** → generate a new key (shown once; set an expiry).
2. Run `gh secret set DOKPLOY_API_KEY` and paste it when prompted, so it never lands in shell history or chat.
3. Delete the old key in Dokploy.

**Adding an app:** add it to `ci.yml` and `.github/dokploy.json`, and switch Autodeploy off for it.

### Alternative: Dokploy Auto Deploy (simpler, not gated)
Turn **Autodeploy** on (General tab → Deploy Settings). A push to `main` then reaches Dokploy through the GitHub
App webhook and rebuilds the apps whose Watch Paths matched, with no secrets. CI runs alongside but cannot hold the
deploy back, so protect `main` (require a pull request and the *CI* check; branch protection on private repos needs
a paid GitHub plan). Do not combine it with the workflow above, or every push deploys twice.

### Practices this setup follows
- `main` is always deployable; changes arrive by small pull requests.
- CI runs the same `make test` / `make build` you run locally. Workflow permissions are read-only.
- Secrets live only in Dokploy and GitHub secrets. The GitHub App is read-only and limited to selected repos.
- Dependencies are pinned (lockfiles, exact versions). Dependabot opens weekly grouped PRs; CI validates them.
  Runtime upgrades (Python, Node, Django major) are deliberate, so Dependabot ignores them.
- Every container has a health check and a restart policy.
- **Scale-up path:** build the image once in CI, push it to GHCR, and have Dokploy deploy that exact image. That
  moves builds off the server and makes rollbacks instant.

## 6. Running it day to day

| Task | Where |
|---|---|
| Live logs | app → **Logs** tab |
| Build logs | app → **Deployments** → View |
| CPU / memory | app → **Monitoring**, or Dashboard → Monitoring |
| Redeploy | app → General → Deploy / Rebuild (also **Open Terminal** for a shell in the container) |
| Roll back | **Deployments → Configure Rollbacks** (turn on, then roll back to an earlier deploy), or `git revert` and push |
| Change a setting or secret | **Environment** tab, save, then redeploy |
| Keep data across deploys | **Advanced → Volumes** (Django mounts `/data`; MongoDB uses a Compose volume) |
| Backups | database service → **Backups** (destination under Settings → S3 Destinations); apps with volumes → **Volume Backups**. Test a restore. |
| Limit a runaway app | **Advanced → Resources** (memory and CPU limits); this server hosts many other services |
| Free disk space | Settings → Server → Daily Docker Cleanup, or *Clean Cache* on deploy |
| Update Dokploy | Settings → Server → check for updates (back up first, read the release notes) |
| Certificates | Renewed automatically by Traefik; nothing to do |
| Stuck or slow builds | Deployments → **Cancel Queues** / **Kill Build** (builds run one at a time) |

Security basics: enable 2FA on Dokploy and GitHub, rotate API keys when people leave, keep containers non-root,
and never put real secrets in the repo or in a `.env` file that is committed.

## 7. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| **502 Bad Gateway** just after a deploy | The container is still starting; wait 15–30 s. If it persists: the Domains port does not match the port the app listens on, the app binds `127.0.0.1` instead of `0.0.0.0`, or the health check fails (Logs tab). In Django the health check sends `Host: 127.0.0.1`, so `localhost` and `127.0.0.1` must stay in `ALLOWED_HOSTS`. |
| Browser shows an invalid certificate (`TRAEFIK DEFAULT CERT`) | Certificate not issued yet (give it a minute), or DNS does not point at the server, or Cloudflare proxying is on. |
| Build cannot find the Dockerfile or files | Wrong **Build Path**. It must be `/apps/<name>` and the Dockerfile name `Dockerfile`. |
| Push did not trigger a deploy | Open the repo's **Actions** tab. CI failed (fix it; nothing ships on red), the changed files are outside every `apps/<name>/` folder, `DOKPLOY_URL` is unset (deploy job skipped), or the deploy step returned 401 (API key expired or deleted; rotate it). In Auto Deploy mode check Watch Paths and GitHub App → Advanced → *Recent Deliveries*. |
| Django `403 CSRF verification failed` | `DJANGO_CSRF_TRUSTED_ORIGINS` is missing `https://<host>`. |
| MongoDB `Authentication failed` | The root password only applies when the volume is first created. Changing `MONGO_PASSWORD` later needs the user updated in Mongo or the volume reset. |
| Data vanished after a redeploy | The path was not on a volume; containers are replaced on every deploy. |
| `make build` fails only in CI | Run `make build` locally; CI runs exactly that. |

## 8. Reference

- Dokploy project **Examples**; service ids are in `.github/dokploy.json`.
- GitHub App on Dokploy: `Dokploy-2026-11-23-4tuioz` (personal account, selected repo only, not shared with the organization).
- Dokploy API: `POST https://server.yuvajanasamiti.org/api/<application|compose>.deploy` with header `x-api-key`.
- Each app's runtime settings: Django `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`,
  `DJANGO_DEBUG`; MERN `MONGO_USER`, `MONGO_PASSWORD`.
