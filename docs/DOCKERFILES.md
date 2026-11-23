# Writing a Dockerfile for any app

Dokploy builds whatever your Dockerfile describes, so the recipe depends on the framework, not on Dokploy.
Recipes below marked **deployed here** run on this server (`apps/`). The others follow each framework's documented
production layout; they are standard patterns, not deployed on this server, so test them (see the end) before relying on them.

## The rules (every framework)

1. **Listen on `0.0.0.0` and a fixed port.** `localhost` inside a container is unreachable from Traefik, which shows up as a 502.
2. **Put the same port in Dokploy → Domains.** Container port, not a published one; never use `ports:` in Compose.
3. **Install dependencies before copying source** (`package*.json` or `requirements.txt` first) so rebuilds reuse the cache.
4. **Multi-stage builds:** compile in one stage, ship only the output in a small final stage.
5. **Run as non-root** (`USER node`, or `useradd` for Python), and `chown` any folder the app writes to.
6. **Add `HEALTHCHECK` and a `/health` route.** Dokploy and Docker only route to healthy containers.
7. **Runtime config comes from environment variables** (Dokploy → Environment). Never `COPY` a `.env` file or bake secrets into the image.
8. **Add a `.dockerignore`:** `node_modules`, `.git`, `.next`, `dist`, `.env`.
9. **Pin the base image's major version** (`node:22-alpine`, `python:3.13-slim`), and commit lockfiles so `npm ci` works.

## Which recipe?

| Your app | Recipe | Container port | Run command |
|---|---|---|---|
| Vue, React, Svelte, Angular, Astro/Next/Nuxt **static** export | A. Static site + nginx | 80 | nginx |
| Next.js with server features (SSR, API routes) | B. Next.js standalone | 3000 | `node server.js` |
| Nuxt 3 (SSR) | C. Nuxt | 3000 | `node .output/server/index.mjs` |
| Express, Fastify, Koa (plain JS) | D. Node API | 3000 | `node src/server.js` |
| NestJS or any TypeScript API | D. Node API (TypeScript) | 3000 | `node dist/main.js` |
| SvelteKit, Remix, Astro SSR | Same shape as C; run what the adapter builds | 3000 | adapter-specific, below |
| Flask, Django, FastAPI | See `apps/flask`, `apps/django`, `apps/ml` | 8000 | gunicorn / uvicorn |
| PHP | See `apps/php` (Apache). Laravel: set Apache's DocumentRoot to `public/` | 80 | apache |
| No Dockerfile wanted | Railpack or Nixpacks build type (last section) | auto | auto |

## A. Static site: Vue, React, Svelte, Angular (deployed here: `apps/mern/web`)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL            # build-time value, see "Build-time vs runtime" below
RUN npm run build

FROM nginx:1-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
```

`nginx.conf` (the `try_files` line makes client-side routes like `/about` work on refresh):

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri /index.html; }
}
```

Only the output folder differs: Vite and Astro `dist`, Angular `dist/<project>/browser`, Create React App `build`,
Next.js `output: "export"` → `out`, Nuxt `nuxi generate` → `.output/public`.

## B. Next.js with a server

In `next.config.js` set `output: "standalone"` (this makes Next emit a small self-contained server).

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL     # NEXT_PUBLIC_* values are compiled in at build time
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
```

`HOSTNAME=0.0.0.0` matters: Docker sets `HOSTNAME` to the container id, and Next would bind to that instead of all interfaces.

## C. Nuxt 3 (and the same shape for SvelteKit / Astro SSR)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production NITRO_PORT=3000 NITRO_HOST=0.0.0.0
WORKDIR /app
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

For SvelteKit (`adapter-node`) copy `build/` plus `package*.json`, install prod deps, run `node build` with
`PORT=3000 HOST=0.0.0.0`. For Astro SSR with the Node adapter run `node ./dist/server/entry.mjs` with `HOST=0.0.0.0 PORT=3000`.
Follow the adapter's own deployment page for the exact output layout.

## D. Node API: Express, Fastify, NestJS (deployed here: `apps/mern/api`)

Plain JavaScript:

```dockerfile
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src src
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "src/server.js"]
```

TypeScript / NestJS: compile first, then ship only `dist` and production dependencies.

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Prisma users: also copy the `prisma/` folder and run `npx prisma generate` in the build stage; run
`npx prisma migrate deploy` once at start (see [DATABASES.md](DATABASES.md)).

## Build-time vs runtime configuration

| Kind | Examples | Where in Dokploy | Changing it |
|---|---|---|---|
| Runtime | `DATABASE_URL`, API keys, `PORT` | Environment tab | Save, then redeploy |
| Build-time (compiled into the JS) | `VITE_*`, `NEXT_PUBLIC_*`, `NUXT_PUBLIC_*` | Environment tab, **build-time arguments** section, with a matching `ARG` in the Dockerfile | Save, then **rebuild** |

Anything the browser can read is public. Never put a secret in a build-time argument: it stays in the image's history.
For a secret the *build itself* needs (a private npm token, say) use **Build-time Secrets** on the same tab and read it with
`RUN --mount=type=secret,id=NAME ...`; it is not stored in the image. Leave **Create Environment File** off unless you
want Dokploy to write a `.env` next to your Dockerfile during the build.

## Monorepo notes

- One app per folder: **Build Path** `/apps/<name>`, **Docker File** `Dockerfile`. Docker only sees files inside that folder.
- If the app imports shared packages from elsewhere in the repo, set Build Path to `/` and Docker File to `apps/<name>/Dockerfile`,
  then `COPY` what you need. Keep the Watch Paths limited to the app and its shared packages.

## No Dockerfile? Railpack or Nixpacks

Dokploy → app → General → **Build Type** → *Railpack* or *Nixpacks*. They detect `package.json` (Next.js, Vue, Nuxt, Express…),
install, build and start it for you; for static sites pick *Static*. Good for a quick start. Switch to a Dockerfile when you need
system packages, exact reproducibility, a custom start command or faster builds. Builds run on this server and use real CPU and memory.

## Test a Dockerfile before pushing

```bash
docker build -t myapp .
docker run --rm -p 8080:3000 -e PORT=3000 myapp      # then: curl localhost:8080/health
```

No local Docker? Open a pull request: CI runs `make build` for the app on GitHub's runners (see the guide).

## Common mistakes

| Symptom | Cause and fix |
|---|---|
| 502 after deploy | App binds `127.0.0.1`, or Domains port differs from the app port. |
| Next.js unreachable though it started | Missing `HOSTNAME=0.0.0.0`. |
| `npm ci` fails | No `package-lock.json` committed. |
| `EACCES` / permission denied at runtime | Non-root user cannot write there; `chown` the folder in the Dockerfile or use a volume. |
| `undefined` API URL in the browser | `VITE_*` / `NEXT_PUBLIC_*` set as a runtime variable; it must be a build-time argument, then rebuild. |
| Refreshing `/about` gives 404 on a SPA | nginx is missing `try_files $uri /index.html`. |
| Slow or huge builds | No `.dockerignore`, or `COPY . .` before installing dependencies. |
