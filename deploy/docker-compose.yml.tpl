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
    volumes:
      # Bind mount for SQLite database persistence
      - /opt/app/data:/app/data
      # Bind mount for uploaded images
      - /opt/app/uploads:/app/public/uploads
      # Bind mount for backups (read-only for app)
      - /opt/app/backups:/backups:ro
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/auth/providers', (r) => process.exit(r.statusCode >= 200 && r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"]
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
