# imradhe.com (GraphenePHP, container build)

The old imradhe.com code, packaged for Dokploy and with the `/blog` routes added.
`src/` is the site, `media/ar/` holds the 350 MB AR models (kept apart so Docker caches that layer).

## What changed from the old code

| File | Change |
|---|---|
| `src/.htaccess` | `index.php?/$1` became `index.php [QSA,L]`, as in the latest GraphenePHP. The old rule dropped the query string and turned `QUERY_STRING` into the path, so `?page=2` never reached PHP. Also redirects `/aibro` and `/adcast` to their subdomains, as the live site does. |
| `src/router.php` | Same matching order and behaviour as before, plus: literal parts of a route are regex-quoted (`.` is no longer a wildcard), a missing query string no longer raises a notice, `/blog/` redirects to `/blog` and keeps `?query`, a route whose view file is missing returns 404 instead of a blank page. |
| `src/routes.json` | Added `blog`, `blog/{slug}` and `health`. |
| `src/controllers/BlogController.php`, `src/views/blog/*` | The blog. Posts are Markdown files in `src/content/blog/`. |
| `src/views/partials/head.php` | A page can set `$pageTitle` and `$pageDescription`. |
| `src/config.php` | Reads secrets and host settings from environment variables instead of holding them. |

## Writing a post

Add `src/content/blog/<slug>.md` (slug: `a-z`, `0-9`, `-`), see `src/content/blog/_example.md`:

```
---
title: My post
date: 2026-11-23
description: One line for the index and search results.
tags: speech, nlp
---
Markdown here.
```

`draft: true` hides a post; files starting with `_` are ignored. Commit and redeploy to publish.

## Test

```bash
make test      # lint, build the image, smoke-test it over HTTP, then again against a MariaDB loaded with db/ (needs Docker)
```

## Database

`db/imradhe.sql` is the export of the live site's database, `u881909133_imradhe` on Hostinger: tables `stories` (3) and
`scenes` (3: `short-stories-1-1-1`, `short-stories-1-2-1`, `streaktracker-1-1-1`), MariaDB 11.8 dump. Do not confuse it with
`u881909133_kautilyaedu`, an unrelated database of another project that also has `scenes` and `stories` tables with test data.
The dump creates tables only (no `DROP`), so it loads into an empty database as is. It is not part of the image.
`make smoke-db` imports it into a throwaway MariaDB and checks the scene and admin pages.

On Dokploy: create a **MySQL** (or MariaDB) service in the project, create the app database and user, then load the file
from the service's **Terminal** (the shell has `MYSQL_USER`, `MYSQL_PASSWORD` and `MYSQL_DATABASE`). To **replace** the
stories and scenes in a database that already has them (this leaves `users` and `logs` alone), back up first and drop the two tables:

```bash
mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --no-tablespaces "$MYSQL_DATABASE" scenes stories > /tmp/backup.sql
( echo "SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS scenes, stories;"; cat imradhe.sql; echo "SET FOREIGN_KEY_CHECKS=1;" ) \
  | mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"
```

Point the app at the database with the `DB_*` variables below, using the service's internal host name.

### Login and admin

The stories export has no `users` or `logs` tables, which `/login`, `/register` and `/admin` need. `db/auth.sql` creates them
(schema only, safe to run twice; `make smoke-db` runs it). Import it the same way as the dump. It deliberately creates
no user: the example user in `src/models/auth/logs.sql` has a guessable password, so do not use that file.

1. Open `/register` and create your account with your own password. New accounts get the role `user`.
2. Promote it in the database service's Terminal (the shell has `MYSQL_USER`, `MYSQL_PASSWORD` and `MYSQL_DATABASE`):

   ```bash
   mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "update users set role='admin' where email='you@example.com'"
   ```

3. Log in at `/login`; `/admin` now opens. Once your account exists, consider removing `/register` from
   `src/routes.json`, because anyone can create a `user` account.

Admin pages: `/admin` (home), `/admin/stories` and `/admin/scenes` with New, Edit and Delete. Delete is a plain link
(a GET request) that is limited to admins but has no CSRF token, so only use it while logged in to your own site.

Passwords are stored as unsalted MD5, which is how the framework was written; treat the admin password as low assurance.

## Deploy on Dokploy

Application, build type **Dockerfile**, **Build Path** = the folder holding this `Dockerfile`, **Container Port 8080**,
health check URL `/health`.

Environment variables:

| Variable | Needed for |
|---|---|
| `APP_URL` | **Required.** Public address with trailing slash, e.g. `https://imradhe.com/`. Used for links, assets and redirects. |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `/scene/{slug}`, `/login`, `/register`, `/admin/*` and `/api/*`, which use MySQL. Without them those routes return 500; every other page works. Use a dedicated user, not the admin user. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION` | `/testmail` only. |

Left out of the image: `ar-old/` (403 on the live site), `aibro/` and `adcast/` (already served from their own subdomains), and zip archives.
