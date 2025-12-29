# Deployment Architecture

## Overview

The deployment uses a modern containerized architecture with automated infrastructure provisioning.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Computer                          │
│                                                              │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │   Terraform  │────▶│  terraform/  │                     │
│  │              │     │  *.tf files  │                     │
│  └──────────────┘     └──────────────┘                     │
│         │                                                    │
│         │ SSH Connection                                     │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ Provisions & Deploys
          ▼
┌─────────────────────────────────────────────────────────────┐
│                     VM (Ubuntu)                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Docker Network (app-network)           │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │            Nginx Container                    │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │  Port 443 (HTTPS) ─▶ SSL Termination  │  │  │    │
│  │  │  │  Port 80 (HTTP) ─▶ Redirect to HTTPS  │  │  │    │
│  │  │  │                                          │  │  │    │
│  │  │  │  Security Headers │ Rate Limiting       │  │  │    │
│  │  │  │  Gzip Compression │ Static Caching      │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  │              │                                 │  │    │
│  │  │              │ Proxy Pass                      │  │    │
│  │  │              ▼                                 │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │        Next.js App Container                  │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │  Port 3000 (internal)                  │  │  │    │
│  │  │  │                                          │  │  │    │
│  │  │  │  • Next.js 15 Server                   │  │  │    │
│  │  │  │  • React Server Components             │  │  │    │
│  │  │  │  • API Routes                           │  │  │    │
│  │  │  │  • NextAuth Sessions                    │  │  │    │
│  │  │  │                                          │  │  │    │
│  │  │  │  Environment Variables (from .env)     │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                     │                               │    │
│  │                     │ Database Connections          │    │
│  │                     ▼                               │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Certbot Container                     │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │  • SSL Certificate Management          │  │  │    │
│  │  │  │  • Let's Encrypt Integration           │  │  │    │
│  │  │  │  • Auto-renewal every 12h              │  │  │    │
│  │  │  │  • Shared volume with Nginx            │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Volumes:                                                    │
│  • /opt/app - Application code                              │
│  • deploy/nginx/certbot/conf - SSL certificates            │
│  • deploy/nginx/certbot/www - ACME challenges              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Connects to
                          ▼
              ┌───────────────────────────┐
              │   External Services       │
              │                           │
              │  • Supabase (Database)   │
              │  • Google OAuth          │
              │  • Let's Encrypt CA      │
              └───────────────────────────┘
```

## Component Responsibilities

### Terraform
- Connects to VM via SSH
- Installs Docker and Docker Compose
- Copies application files to `/opt/app`
- Generates environment configuration
- Deploys Docker Compose stack
- Idempotent and automated

### Nginx Container
- **Port 80**: Redirects all HTTP to HTTPS
- **Port 443**: Handles HTTPS traffic with SSL
- Reverse proxy to Next.js app
- SSL termination
- Security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting for API and general routes
- Gzip compression
- Static file caching
- Health check endpoint

### Next.js App Container
- Multi-stage Docker build (builder + runner)
- Standalone output mode for optimized size
- Runs as non-root user (nextjs)
- Internal port 3000 (not exposed externally)
- Connects to Supabase for data
- Handles authentication with NextAuth
- Server-side rendering and API routes

### Certbot Container
- Automatically obtains SSL certificates
- Renews certificates every 12 hours
- Uses webroot verification method
- Shares volume with Nginx for certificates
- Non-interactive, fully automated

## Network Flow

### HTTPS Request Flow
1. Client → `https://yourdomain.com`
2. Nginx (port 443) → SSL termination
3. Nginx → Proxies to app:3000
4. Next.js App → Processes request
5. Next.js App → Queries Supabase if needed
6. Response flows back through chain

### HTTP Request Flow
1. Client → `http://yourdomain.com`
2. Nginx (port 80) → 301 redirect to HTTPS
3. Client follows redirect to HTTPS

### SSL Certificate Flow
1. Certbot → Requests certificate from Let's Encrypt
2. Let's Encrypt → Verifies domain via HTTP challenge
3. Nginx → Serves ACME challenge files
4. Certbot → Saves certificate to shared volume
5. Nginx → Loads certificate for HTTPS

## Security Features

### Network Security
- No direct access to Next.js app (internal only)
- Firewall: Only ports 22, 80, 443 exposed
- SSH key authentication (no passwords)
- Non-root containers

### Application Security
- HTTPS enforced for all traffic
- Security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting on API routes
- Environment variables isolated
- Secrets never in code or logs

### SSL/TLS
- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS with includeSubDomains
- Automatic certificate renewal

## Deployment Flow

```
Developer          Terraform            VM                Docker
    │                  │                 │                   │
    │  make deploy     │                 │                   │
    ├─────────────────▶│                 │                   │
    │                  │                 │                   │
    │              Initialize            │                   │
    │                  │                 │                   │
    │                  │  SSH Connect    │                   │
    │                  ├────────────────▶│                   │
    │                  │                 │                   │
    │                  │  Install Docker │                   │
    │                  │  & Compose      │                   │
    │                  ├────────────────▶│                   │
    │                  │                 │                   │
    │                  │  Copy Files     │                   │
    │                  ├────────────────▶│                   │
    │                  │                 │                   │
    │                  │  Create .env    │                   │
    │                  ├────────────────▶│                   │
    │                  │                 │                   │
    │                  │  Deploy Compose │                   │
    │                  ├────────────────▶│  docker compose   │
    │                  │                 ├──────────────────▶│
    │                  │                 │                   │
    │                  │                 │   Build Images    │
    │                  │                 │◀──────────────────┤
    │                  │                 │                   │
    │                  │                 │   Start Containers│
    │                  │                 │◀──────────────────┤
    │                  │                 │                   │
    │                  │  Deployment OK  │                   │
    │                  │◀────────────────┤                   │
    │                  │                 │                   │
    │  Output URLs     │                 │                   │
    │◀─────────────────┤                 │                   │
    │                  │                 │                   │
```

## Data Flow

### User Data
- Stored in Supabase PostgreSQL
- Application queries via Prisma ORM
- Database URL from environment variables
- Connection pooling via pgBouncer

### Static Assets
- Stored in Next.js build output
- Served with cache headers via Nginx
- Optimized images via Next.js Image component
- User uploads stored in Supabase Storage

### Sessions
- NextAuth JWT sessions
- Encrypted with NEXTAUTH_SECRET
- Stored in secure HTTP-only cookies
- Google OAuth for authentication

## Scalability Considerations

### Current Architecture (Single VM)
- Good for: Small to medium applications
- Handles: Hundreds of concurrent users
- Cost: Single VM cost

### Future Scaling Options
1. **Vertical Scaling**: Upgrade VM resources
2. **Load Balancer**: Add multiple app containers
3. **Database**: Supabase handles scaling
4. **CDN**: Add CloudFlare/CloudFront
5. **Container Orchestration**: Migrate to Kubernetes

## Monitoring Recommendations

- **Logs**: `make logs` or `docker compose logs`
- **Status**: `make status` or `docker compose ps`
- **Resources**: `docker stats` on VM
- **Uptime**: External monitoring service
- **SSL**: Certificate expiry monitoring

## Backup Strategy

### What to Backup
1. `terraform/terraform.tfvars` (encrypted)
2. SSH private keys
3. Supabase database (automatic in Supabase)

### What NOT to Backup
- Docker images (rebuilt on deploy)
- `.next` build output
- `node_modules`
- Terraform state (local only)

## Cost Estimate

- VM: $5-20/month (DigitalOcean/Linode/Hetzner)
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)
- Supabase: Free tier available
- Total: ~$5-20/month + domain

## Performance Optimizations

1. **Docker Multi-stage Build**: Smaller images
2. **Next.js Standalone**: Optimized runtime
3. **Nginx Gzip**: Compressed responses
4. **Static Caching**: CDN-like performance
5. **Image Optimization**: Next.js automatic
6. **Connection Pooling**: Supabase pgBouncer
