<?php
// Liveness probe for Docker and Dokploy. Deliberately free of database calls.
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
echo "ok";
