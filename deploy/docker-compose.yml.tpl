version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextjs-app
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - "${app_port}:3000"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  certbot:
    image: certbot/certbot:latest
    container_name: certbot
    restart: unless-stopped
    volumes:
      - ./deploy/nginx/certbot/conf:/etc/letsencrypt
      - ./deploy/nginx/certbot/www:/var/www/certbot
      - ./deploy/certbot-renew.sh:/opt/certbot-renew.sh:ro
    environment:
      - DOMAIN_NAME=${domain_name}
      - SSL_EMAIL=${ssl_email}
    entrypoint: ["/bin/sh", "/opt/certbot-renew.sh"]
    networks:
      - app-network
    depends_on:
      - nginx

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./deploy/nginx/certbot/conf:/etc/letsencrypt:ro
      - ./deploy/nginx/certbot/www:/var/www/certbot:ro
    networks:
      - app-network
    depends_on:
      app:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge
