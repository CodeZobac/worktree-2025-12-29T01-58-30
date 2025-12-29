#!/bin/sh

# Certbot renewal script
# This script runs in a loop to automatically renew SSL certificates

# Exit on SIGTERM
trap exit TERM

while :; do
  echo "Running certbot renewal check..."
  
  certbot renew \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${SSL_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${DOMAIN_NAME}"
  
  echo "Next renewal check in 12 hours..."
  
  # Sleep for 12 hours
  sleep 12h & wait ${!}
done
