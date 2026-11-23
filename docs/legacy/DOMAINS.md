# Connecting domains

Pointing a domain at an app takes three steps and about two minutes: a DNS record, a Domain entry in Dokploy, and telling the app its new address.

**Server IP: `72.61.171.146`** (ports 80 and 443 open). DNS for `yuvajanasamiti.org` is on Cloudflare, and its CAA records already allow Let's Encrypt.

## 1. Point DNS at the server

Add one record where the domain's DNS is hosted (Cloudflare, for `yuvajanasamiti.org`):

| Type | Name | Value | Proxy (Cloudflare) |
|---|---|---|---|
| `A` | `app` (gives `app.yuvajanasamiti.org`) | `72.61.171.146` | **DNS only** (grey cloud) |

- Use a **subdomain** (`app.example.org`) by default. A root domain (`example.org`) also works with an `A` record at the apex.
- Another registrar or DNS host works the same way: one `A` record to the server IP.
- Check it from your laptop before going further: `dig +short app.example.org` must print `72.61.171.146`.
- **Wildcard shortcut:** one record `*.apps` → `72.61.171.146` makes every `anything.apps.example.org` resolve, so new apps need no DNS work.

**Cloudflare proxy (orange cloud):** leave it **grey** while the certificate is issued. Afterwards you may turn it orange, but only
with SSL/TLS mode **Full (strict)**. Mode *Flexible* causes endless redirects (`ERR_TOO_MANY_REDIRECTS`) because Dokploy already
redirects HTTP to HTTPS. Proxied traffic is also subject to Cloudflare's upload-size and timeout limits.

## 2. Add the domain in Dokploy

App → **Domains** tab → **Add Domain**:

| Field | What to enter |
|---|---|
| Host | `app.example.org` (no `https://`, no path) |
| Path | `/` for the whole site, or e.g. `/api` to route only that prefix |
| Internal Path / Strip Path | Only for path routing: the path the app expects, and whether to remove the public prefix before forwarding |
| Container Port | The port the app listens on inside the container (3000 Node, 80 nginx/PHP, 8000 Python) |
| HTTPS | **On**, certificate provider **Let's Encrypt** (issued and renewed automatically) |
| Custom Entrypoint, Middlewares | Leave empty unless you know you need them |

Compose stacks: choose the **service** that serves HTTP (here `mern-web`) as well as the port.
Changes to an application's domains apply within seconds; Compose writes its routing at deploy time, so **redeploy** after changing them.

The first request can show a certificate warning for up to a minute while Let's Encrypt issues the certificate; then it is valid.

## 3. Tell the app its new address

Most apps hard-code or validate their public URL. After adding a domain, update these (Environment tab, then redeploy):

| App type | Update |
|---|---|
| Django | `DJANGO_ALLOWED_HOSTS` (host) and `DJANGO_CSRF_TRUSTED_ORIGINS` (`https://host`) |
| API called from a browser | CORS allowed origins: the frontend's `https://` address |
| Frontend calling an API | The API base URL (`VITE_*`, `NEXT_PUBLIC_*` are **build-time**, so rebuild) |
| Next.js with auth | `NEXTAUTH_URL` / `AUTH_URL` / your app's `APP_URL` |
| Anything with OAuth or webhooks | The redirect/callback URLs registered with the provider |
| Cookies | Cookie domain and `Secure` flag, which needs HTTPS |

## Common setups

- **Frontend and API on separate hosts** (used by other apps on this server): `app.example.org` → frontend, `api.example.org` → backend, each its own Dokploy app and Domain; set CORS on the API.
- **One host, API under a path:** frontend on `/`, backend with Path `/api`; or let nginx proxy `/api` as `apps/mern` does, which needs only one Domain.
- **`www` and apex together:** add both hosts to the same app (two Domain entries, two `A` records). To redirect one to the other, use a Cloudflare Redirect Rule.
- **No DNS access yet:** `<name>.72-61-171-146.sslip.io` resolves to the server automatically (the five demos use it). Dokploy can also generate a `traefik.me` hostname for you, as several apps here do. Both are fine for testing; move to a real domain for anything permanent.
- **Moving the demos to real domains:** add the `A` records, add the new Domain entry in each app, update the app settings above (Django!), confirm it works, then delete the old `sslip.io` entry.
- **The Dokploy panel itself:** Settings → Server → Domain (currently `server.yuvajanasamiti.org`), with the Let's Encrypt email.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Browser says certificate invalid or `TRAEFIK DEFAULT CERT` | DNS does not yet point at the server (`dig`), Cloudflare is proxied in the wrong mode, or the certificate is still being issued (wait a minute). |
| Plain "404 page not found" | Host does not match the Domain entry (typo, or `www` vs apex), or the service is stopped. |
| 502 Bad Gateway | Container Port is wrong or the app is unhealthy; see the guide's troubleshooting. |
| `ERR_TOO_MANY_REDIRECTS` | Cloudflare SSL/TLS mode is *Flexible*; set **Full (strict)**. |
| Old IP or "site can't be reached" for a while | DNS cache; test with `dig @1.1.1.1 host`, wait out the TTL. |
| Django `DisallowedHost` / CSRF 403 | `DJANGO_ALLOWED_HOSTS` / `DJANGO_CSRF_TRUSTED_ORIGINS` missing the new host. |
| Certificate keeps failing | Let's Encrypt limits repeated attempts for the same hostname (roughly 5 duplicate certificates a week). Fix DNS first, then retry once; do not delete and recreate the Domain in a loop. |
| Two apps fight over one host | Each host and path pair can belong to only one service. |

## Go-live checklist

- [ ] `A` record created, grey cloud, `dig` returns `72.61.171.146`
- [ ] Domain added with the right container port, HTTPS on, Let's Encrypt
- [ ] App settings updated (allowed hosts, CORS, callback URLs, build-time URLs) and redeployed
- [ ] `https://host/health` returns 200 with a valid certificate
- [ ] Old test hostnames removed
