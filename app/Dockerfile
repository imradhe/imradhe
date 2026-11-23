FROM php:8.3-apache

# Production php.ini (errors are logged, never shown to visitors), the MySQL
# extension the admin and API views use, and the Apache modules .htaccess needs.
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && docker-php-ext-install mysqli \
 && a2enmod rewrite headers

# Run as www-data on an unprivileged port (Dokploy: container port 8080).
COPY apache.conf /etc/apache2/conf-available/imradhe.conf
RUN a2enconf imradhe \
 && sed -ri 's/Listen 80$/Listen 8080/' /etc/apache2/ports.conf \
 && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:8080>/' /etc/apache2/sites-available/000-default.conf \
 && chown -R www-data:www-data /var/run/apache2 /var/lock/apache2 /var/log/apache2

# The AR models are 350 MB and rarely change: copy them first so Docker caches
# this layer and a code-only change does not rebuild it.
COPY media/ar/ /var/www/html/assets/ar/
COPY src/ /var/www/html/

USER www-data
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD php -r 'exit(@file_get_contents("http://127.0.0.1:8080/health") === "ok" ? 0 : 1);'
