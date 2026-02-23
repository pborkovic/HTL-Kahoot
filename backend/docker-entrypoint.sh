#!/bin/sh
set -e

mkdir -p \
    storage/framework/views \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/logs \
    storage/app/public \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

exec php-fpm
