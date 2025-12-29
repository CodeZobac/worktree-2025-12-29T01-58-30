# Deployment Files

This directory contains deployment configuration files.

## Files

- **docker-compose.yml.tpl** - Template for Docker Compose configuration
- **init-ssl.sh** - Helper script for initial SSL certificate setup
- **nginx/** - Nginx configuration directory

## Nginx Directory

- **nginx.conf.tpl** - Template for Nginx reverse proxy configuration
- **certbot/** - Directory for SSL certificates (created automatically)
  - **conf/** - Let's Encrypt configuration and certificates
  - **www/** - Webroot for ACME challenges

## Usage

These files are automatically processed and deployed by Terraform. You should not need to modify them manually.

For deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md) in the project root.
