#!/bin/sh
# DB smoke test: import db/imradhe.sql (the real stories and scenes) and db/auth.sql into a throwaway MariaDB, point the image at it,
# and check that the pages backed by the database work. Usage: tests/smoke-db.sh <image>
set -eu
IMAGE="${1:?image name}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${SMOKE_DB_PORT:-18081}"
NET="imradhe-smoke-$$"
PASS="smoke-$$-pass"      # throwaway, only lives as long as this test
FAILS=0

docker network create "$NET" >/dev/null
cleanup() { docker rm -f "$APP" "$DB" >/dev/null 2>&1 || true; docker network rm "$NET" >/dev/null 2>&1 || true; }
DB="$NET-db"; APP="$NET-app"; trap cleanup EXIT

docker run -d --rm --name "$DB" --network "$NET" \
  -e MARIADB_ROOT_PASSWORD="$PASS" -e MARIADB_DATABASE=smoke mariadb:11.8 >/dev/null
# Wait over TCP (-h127.0.0.1), not the unix socket: on first start the image runs a temporary server that has
# networking off and answers on the socket only, then restarts. A socket check can pass against that temporary
# server and the import right after it then fails with "Can't connect ... mysqld.sock". Only the real server listens on TCP.
i=0; until docker exec "$DB" mariadb -h127.0.0.1 -uroot -p"$PASS" -e 'select 1' >/dev/null 2>&1; do
  i=$((i+1)); [ "$i" -gt 90 ] && { echo "mariadb did not start"; exit 1; }; sleep 1; done

# The import itself: it must succeed with no errors
docker exec -i "$DB" mariadb -uroot -p"$PASS" smoke < "$HERE/db/imradhe.sql"
docker exec -i "$DB" mariadb -uroot -p"$PASS" smoke < "$HERE/db/auth.sql"
sql() { docker exec "$DB" mariadb -uroot -p"$PASS" -N -e "$1" smoke; }
stories="$(docker exec "$DB" mariadb -uroot -p"$PASS" -N -e 'select count(*) from smoke.stories')"
scenes="$(docker exec "$DB" mariadb -uroot -p"$PASS" -N -e 'select count(*) from smoke.scenes')"
[ "$stories" = "3" ] && [ "$scenes" = "3" ] && echo "ok   import: $stories stories, $scenes scenes" \
  || { echo "FAIL import: $stories stories, $scenes scenes"; FAILS=$((FAILS+1)); }

docker run -d --rm --name "$APP" --network "$NET" -p "$PORT:8080" \
  -e APP_URL="http://localhost:$PORT/" -e DB_HOST="$DB" -e DB_DATABASE=smoke -e DB_USERNAME=root -e DB_PASSWORD="$PASS" "$IMAGE" >/dev/null
i=0; until curl -fsS "http://localhost:$PORT/health" >/dev/null 2>&1; do
  i=$((i+1)); [ "$i" -gt 30 ] && { echo "app did not start"; exit 1; }; sleep 1; done

COOKIE_ARGS=""
get() { curl -s -o /tmp/smoke-db.$$ -w '%{http_code}' $COOKIE_ARGS "http://localhost:$PORT$1"; }
expect() { # label path status [needle]
  code="$(get "$2")"
  if [ "$code" != "$3" ]; then echo "FAIL $1: $2 -> $code (want $3)"; FAILS=$((FAILS+1)); return; fi
  if [ -n "${4:-}" ] && ! grep -q -- "$4" /tmp/smoke-db.$$; then echo "FAIL $1: $2 is missing '$4'"; FAILS=$((FAILS+1)); return; fi
  echo "ok   $1: $2 -> $code"
}
expect "scene: short-stories 1" /scene/short-stories-1-1-1 200 "The Dark"
expect "scene: short-stories 2" /scene/short-stories-1-2-1 200 "Shattered Glass"
expect "scene: streaktracker"   /scene/streaktracker-1-1-1 200 "StreakTracker"
expect "old test scene is gone" /scene/twins-stories-1-1-1 404
expect "unknown scene"        /scene/does-not-exist-1-1-1 404
expect "scene needs a slug"   /scene 404
expect "no SQL injection via ?slug=" "/scene?slug=%27%20OR%201=1--%20" 404

# Auth end to end: pages render, a user can register and log in, /admin is admin-only
TEST_MAIL="smoke$$@example.com"; TEST_PASS="Aa1!smoke$$"; JAR="/tmp/smoke-jar.$$"
expect "login page"           /login 200 "Login"
expect "register page"        /register 200 "Registration"
curl -s -o /dev/null --data-urlencode "name=Smoke Tester" --data-urlencode "email=$TEST_MAIL" \
  --data-urlencode "phone=9876543210" --data-urlencode "password=$TEST_PASS" --data-urlencode "btn-register=1" \
  "http://localhost:$PORT/register"
[ "$(sql "select count(*) from users where email='$TEST_MAIL'")" = "1" ] && echo "ok   register creates the user" \
  || { echo "FAIL register did not create the user"; FAILS=$((FAILS+1)); }
[ "$(sql "select role from users where email='$TEST_MAIL'")" = "user" ] && echo "ok   new accounts get role user" \
  || { echo "FAIL new account role"; FAILS=$((FAILS+1)); }

sleep 1   # register() already logs the new user in; the login id is built from the time in seconds
hdr="$(curl -s -D - -o /dev/null -c "$JAR" --data-urlencode "email=$TEST_MAIL" --data-urlencode "password=$TEST_PASS" \
  --data-urlencode "btn-login=1" "http://localhost:$PORT/login")"
printf '%s' "$hdr" | head -1 | grep -q " 302" && printf '%s' "$hdr" | grep -qi "set-cookie: auth=" \
  && echo "ok   login redirects and sets the session cookie" || { echo "FAIL login: $(printf '%s' "$hdr" | head -1)"; FAILS=$((FAILS+1)); }
bad="$(curl -s -o /dev/null -w '%{http_code}' --data-urlencode "email=$TEST_MAIL" --data-urlencode "password=wrong" \
  --data-urlencode "btn-login=1" "http://localhost:$PORT/login")"
[ "$bad" = "200" ] && echo "ok   wrong password stays on the login page" || { echo "FAIL wrong password -> $bad"; FAILS=$((FAILS+1)); }

[ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/admin")" = "302" ] \
  && echo "ok   /admin without a session redirects to login" || { echo "FAIL /admin without session"; FAILS=$((FAILS+1)); }
code="$(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" "http://localhost:$PORT/admin")"
[ "$code" = "401" ] && echo "ok   /admin refuses a plain user (401)" || { echo "FAIL /admin as user -> $code"; FAILS=$((FAILS+1)); }
sql "update users set role='admin' where email='$TEST_MAIL'"
# A 200 is not enough: a PHP fatal after the first bytes were sent is still a 200 with a half-empty page.
COOKIE_ARGS="-b $JAR"
expect "admin home: clock"         /admin 200 'id="time"'
expect "admin home: sidebar"       /admin 200 'Logout'
expect "admin stories: list"       /admin/stories 200 "One Sided Tale"
expect "admin scenes: list"        /admin/scenes 200 "The Dark"
expect "admin stories: new form"   /admin/stories/new 200 "<form"
expect "admin scenes: new form"    /admin/scenes/new 200 "<form"
expect "admin stories: edit form"  /admin/stories/edit/short-stories 200 "Short Stories"
expect "admin scenes: edit form"   /admin/scenes/edit/short-stories-1-1-1 200 "The Dark"
COOKIE_ARGS=""

# Deletes must be admin-only. Anonymous requests are refused and nothing is removed.
code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/admin/scenes/delete/streaktracker-1-1-1")"
code2="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/admin/stories/delete/streaktracker")"
{ [ "$code" = "302" ] && [ "$code2" = "302" ] && [ "$(sql 'select count(*) from scenes')" = "3" ] && [ "$(sql 'select count(*) from stories')" = "3" ]; } \
  && echo "ok   anonymous deletes are refused and delete nothing" || { echo "FAIL anonymous delete: $code $code2"; FAILS=$((FAILS+1)); }
# A plain user is refused too
sql "update users set role='user' where email='$TEST_MAIL'"
code="$(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" "http://localhost:$PORT/admin/scenes/delete/streaktracker-1-1-1")"
{ [ "$code" = "401" ] && [ "$(sql 'select count(*) from scenes')" = "3" ]; } \
  && echo "ok   a plain user cannot delete" || { echo "FAIL plain user delete: $code"; FAILS=$((FAILS+1)); }
sql "update users set role='admin' where email='$TEST_MAIL'"
# An admin can: delete the scene, then the story (the scene table cascades)
curl -s -o /dev/null -b "$JAR" "http://localhost:$PORT/admin/scenes/delete/streaktracker-1-1-1"
[ "$(sql 'select count(*) from scenes')" = "2" ] && echo "ok   admin deletes a scene" || { echo "FAIL admin scene delete"; FAILS=$((FAILS+1)); }
curl -s -o /dev/null -b "$JAR" "http://localhost:$PORT/admin/stories/delete/streaktracker"
[ "$(sql 'select count(*) from stories')" = "2" ] && echo "ok   admin deletes a story" || { echo "FAIL admin story delete"; FAILS=$((FAILS+1)); }
rm -f "$JAR"
rm -f /tmp/smoke-db.$$

[ "$FAILS" -eq 0 ] && echo "ALL DB SMOKE CHECKS PASSED" || { echo "$FAILS check(s) failed"; exit 1; }
