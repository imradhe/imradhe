#!/bin/sh
# Syntax-check every PHP file with PHP 8.3 and validate routes.json. Runs inside php:8.3-cli with
# the site mounted at /app. Prints every file that does not parse, then exits non-zero.
# (Deprecation notices are not failures; parse and fatal errors are.)
cd /app || exit 2
out="$(find . -name '*.php' -not -path './assets/*' -exec php -l {} \; 2>&1 | grep -E 'Parse error|Fatal error')"
if [ -n "$out" ]; then
  echo "PHP syntax errors:"; echo "$out"; exit 1
fi
php -r 'json_decode(file_get_contents("routes.json"), true, 512, JSON_THROW_ON_ERROR); echo "routes.json ok\n";' || exit 1
echo "lint ok"
