#!/bin/sh
# Smoke test: start the real image (Apache + .htaccess + router) and hit it over HTTP.
# Usage: tests/smoke.sh <image>
set -eu
IMAGE="${1:?image name}"
HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${SMOKE_PORT:-18080}"
FAILS=0

CID="$(docker run -d --rm -p "$PORT:8080" -e "APP_URL=http://localhost:$PORT/" "$IMAGE")"
trap 'docker rm -f "$CID" >/dev/null 2>&1 || true' EXIT
docker cp "$HERE/fixtures/smoke-post.md" "$CID:/var/www/html/content/blog/smoke-post.md"

i=0; until curl -fsS "http://localhost:$PORT/health" >/dev/null 2>&1; do
  i=$((i+1)); [ "$i" -gt 30 ] && { echo "server did not start"; docker logs "$CID"; exit 1; }; sleep 1
done

# check <label> <expected status> <path> [substring that must be in the body]
check() {
  label="$1"; want="$2"; path="$3"; needle="${4:-}"
  body="$(curl -s -o - -w '\n%{http_code}' "http://localhost:$PORT$path")"
  code="$(printf '%s' "$body" | tail -n1)"
  if [ "$code" != "$want" ]; then echo "FAIL $label: $path -> $code (want $want)"; FAILS=$((FAILS+1)); return; fi
  if [ -n "$needle" ] && ! printf '%s' "$body" | grep -q -- "$needle"; then
    echo "FAIL $label: $path is missing '$needle'"; FAILS=$((FAILS+1)); return; fi
  echo "ok   $label: $path -> $code"
}

# refute <label> <path> <substring that must NOT be in the body>
refute() {
  label="$1"; path="$2"; needle="$3"
  if curl -s "http://localhost:$PORT$path" | grep -q -- "$needle"; then
    echo "FAIL $label: $path contains '$needle'"; FAILS=$((FAILS+1)); else echo "ok   $label: $path"; fi
}

check "health"            200 /health ok
check "home"              200 /
check "existing route"    200 /projects
check "blog index"        200 /blog "Smoke test post"
refute "blog index hides _ files" /blog "Example post"
check "blog post"         200 /blog/smoke-post "Smoke test post"
check "blog post markdown" 200 /blog/smoke-post "Hello from the"
check "unknown post"      404 /blog/does-not-exist
check "bad slug"          404 "/blog/..%2Fconfig"
check "example is hidden" 404 /blog/_example
check "unknown route"     404 /no-such-page
check "ar route"          200 /ar
check "ar static route"   200 /ar/ironman

# /blog/ must redirect to /blog and keep the query string
loc="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://localhost:$PORT/blog/?page=2")"
[ "$loc" = "302 http://localhost:$PORT/blog?page=2" ] && echo "ok   trailing slash: $loc" || { echo "FAIL trailing slash: $loc"; FAILS=$((FAILS+1)); }

# The query string must reach PHP through .htaccess (QSA)
qs="$(curl -s "http://localhost:$PORT/blog?page=2" -o /dev/null -w '%{http_code}')"
[ "$qs" = "200" ] && echo "ok   query string route: $qs" || { echo "FAIL query string route: $qs"; FAILS=$((FAILS+1)); }

# Source and config must not be downloadable
for p in /config.php /routes.json /router.php /controllers/BlogController.php /content/blog/smoke-post.md; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$p")"
  [ "$code" = "403" ] && echo "ok   blocked: $p -> 403" || { echo "FAIL blocked: $p -> $code"; FAILS=$((FAILS+1)); }
done

# The container healthcheck must pass and the process must not run as root
user="$(docker exec "$CID" id -un)"
[ "$user" = "www-data" ] && echo "ok   runs as $user" || { echo "FAIL runs as $user"; FAILS=$((FAILS+1)); }

[ "$FAILS" -eq 0 ] && echo "ALL SMOKE CHECKS PASSED" || { echo "$FAILS check(s) failed"; exit 1; }
