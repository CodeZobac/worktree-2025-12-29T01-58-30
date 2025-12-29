#!/bin/bash

# Initial SSL Certificate Setup Script
# This script helps obtain the first SSL certificate before full deployment

set -e

echo "==> SSL Certificate Initial Setup"
echo ""

# Check if running on the VM
if [ ! -d "/opt/app" ]; then
    echo "ERROR: This script should run on the VM at /opt/app"
    exit 1
fi

cd /opt/app

# Read domain from docker-compose.yml or prompt
if [ -z "$DOMAIN_NAME" ]; then
    read -p "Enter your domain name: " DOMAIN_NAME
fi

if [ -z "$SSL_EMAIL" ]; then
    read -p "Enter your email for SSL certificate: " SSL_EMAIL
fi

echo ""
echo "Domain: $DOMAIN_NAME"
echo "Email: $SSL_EMAIL"
echo ""

# Create directories
mkdir -p deploy/nginx/certbot/conf
mkdir -p deploy/nginx/certbot/www

# Create temporary nginx config for certificate challenge
cat > /tmp/nginx-init.conf <<EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN_NAME www.$DOMAIN_NAME;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'Waiting for SSL certificate...';
            add_header Content-Type text/plain;
        }
    }
}
EOF

echo "==> Starting temporary Nginx for certificate challenge..."

# Start temporary nginx
docker run -d --name nginx-temp \
    -p 80:80 \
    -v /tmp/nginx-init.conf:/etc/nginx/nginx.conf:ro \
    -v "$(pwd)/deploy/nginx/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

sleep 5

echo "==> Requesting SSL certificate..."

# Request certificate
docker run --rm \
    -v "$(pwd)/deploy/nginx/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/deploy/nginx/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$SSL_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN_NAME" \
    --non-interactive

echo "==> Stopping temporary Nginx..."
docker stop nginx-temp
docker rm nginx-temp

echo ""
echo "==> SSL certificate obtained successfully!"
echo "You can now run: docker compose up -d"
echo ""
