# Deployment Guide

This guide explains how to deploy the Family Recipes application to a VM using Terraform, Docker, and Docker Compose.

## Architecture

The deployment consists of three Docker services:

1. **Next.js App** - The main application container
2. **Certbot** - Automatic SSL certificate management (Let's Encrypt)
3. **Nginx** - Reverse proxy with SSL termination

## Prerequisites

Before deploying, ensure you have:

- A VM with Ubuntu (20.04+ or 22.04+) and SSH access
- A domain name pointing to your VM's IP address
- SSH private key for accessing the VM
- Terraform installed locally (v1.0+)
- Make utility installed locally

### VM Requirements

- **OS**: Ubuntu 20.04 or later
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 20GB minimum
- **Network**: Public IP address
- **Ports**: 80 (HTTP) and 443 (HTTPS) open in firewall

## Setup Instructions

### Step 1: Configure Variables

1. Copy the example variables file:
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

2. Edit `terraform/terraform.tfvars` with your values:

```hcl
# VM Configuration
vm_host              = "YOUR_VM_IP_ADDRESS"
vm_user              = "root"  # or your SSH user
ssh_private_key_path = "/path/to/your/ssh/private/key"

# Domain Configuration
domain_name = "yourdomain.com"
ssl_email   = "your-email@example.com"

# Application Configuration
app_port = 3000

# NextAuth Configuration
nextauth_secret = "GENERATE_WITH: openssl rand -base64 32"
nextauth_url    = "https://yourdomain.com"

# Google OAuth Configuration
google_client_id     = "YOUR_GOOGLE_CLIENT_ID"
google_client_secret = "YOUR_GOOGLE_CLIENT_SECRET"

# Supabase Configuration
database_url               = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true"
direct_url                 = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
supabase_url               = "https://YOUR_PROJECT.supabase.co"
supabase_anon_key          = "YOUR_SUPABASE_ANON_KEY"
supabase_service_role_key  = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

#### Getting Your Values

**NextAuth Secret:**
```bash
openssl rand -base64 32
```

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

**Supabase:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a project or select existing
3. Go to Settings > API to find your keys and URLs
4. Go to Settings > Database to find connection strings

### Step 2: Initialize Terraform

```bash
make init
```

This command will:
- Initialize Terraform
- Download required providers
- Validate your configuration file exists

### Step 3: Review Deployment Plan (Optional)

```bash
make plan
```

This shows what Terraform will do without making any changes.

### Step 4: Deploy

```bash
make deploy
```

This command will:
1. Provision the VM infrastructure
2. Install Docker and Docker Compose
3. Copy application files to the VM
4. Build and start all containers
5. Configure Nginx reverse proxy
6. Request SSL certificates from Let's Encrypt

**Note:** First deployment takes 5-10 minutes. SSL certificate generation may take a few minutes after the initial deployment.

## Available Commands

All commands are run from the project root directory:

```bash
make help       # Show all available commands
make init       # Initialize Terraform
make plan       # Show deployment plan
make apply      # Apply infrastructure changes
make deploy     # Full deployment pipeline
make validate   # Validate Terraform configuration
make destroy    # Destroy all infrastructure
make clean      # Clean Terraform cache files

# Helper commands
make ssh        # SSH into the VM
make logs       # View application logs
make status     # Check service status
```

## Post-Deployment

### Verify Deployment

1. Check service status:
```bash
make status
```

2. View logs:
```bash
make logs
```

3. Access your application:
```
https://yourdomain.com
```

### Manual SSH Access

```bash
ssh -i /path/to/key user@vm_ip
cd /opt/app
docker compose ps
docker compose logs
```

### Common Docker Commands on VM

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Rebuild and restart
docker compose up -d --build

# Stop services
docker compose down

# Remove all containers and volumes
docker compose down -v
```

## SSL Certificate Management

Certbot automatically:
- Requests SSL certificates on first deployment
- Renews certificates every 12 hours (if needed)
- Certificates are valid for 90 days

### Manual Certificate Operations

If you need to manually manage certificates:

```bash
# SSH into VM
ssh -i /path/to/key user@vm_ip

# Request certificate manually
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com

# Force renewal
docker compose run --rm certbot renew --force-renewal

# Check certificate status
docker compose exec certbot certbot certificates
```

## Updating the Application

To deploy updates:

1. Commit and push your changes to the repository
2. Run the deployment command:
```bash
make deploy
```

This will:
- Copy updated files to the VM
- Rebuild containers
- Restart services with zero downtime

## Environment Variables

All environment variables are securely stored in `/opt/app/.env.production` on the VM. They are:

- Never committed to git
- Encrypted in transit via SSH
- Only readable by root user on the VM

## Troubleshooting

### Deployment fails during Docker installation

**Issue:** Docker installation fails on the VM.

**Solution:**
- Ensure VM has internet access
- Check VM OS is Ubuntu 20.04+
- Verify you have root access or sudo privileges

### SSL certificate fails to generate

**Issue:** Certbot cannot obtain SSL certificate.

**Solution:**
- Verify domain DNS points to VM IP address (wait for DNS propagation)
- Ensure ports 80 and 443 are open in firewall
- Check VM has internet access
- Verify email address is valid

### Application not accessible

**Issue:** Cannot access application via domain.

**Solution:**
1. Check if containers are running:
```bash
make status
```

2. Check logs for errors:
```bash
make logs
```

3. Verify DNS resolution:
```bash
nslookup yourdomain.com
```

4. Check firewall rules on VM

### Database connection issues

**Issue:** Application cannot connect to database.

**Solution:**
- Verify Supabase connection strings in `terraform.tfvars`
- Ensure Supabase project is running
- Check database allows connections from VM IP

## Security Best Practices

1. **Never commit `terraform.tfvars`** - Contains sensitive data
2. **Restrict SSH access** - Use SSH keys, disable password auth
3. **Keep secrets secure** - Use environment variables, not hardcoded values
4. **Regular updates** - Keep Docker images and packages updated
5. **Monitor logs** - Regularly check application logs
6. **Firewall rules** - Only open necessary ports (80, 443, 22)
7. **SSL certificates** - Always use HTTPS in production

## Backup and Recovery

### Backup Application Data

Since this uses Supabase for data storage, backups are handled by Supabase. Configure automated backups in your Supabase project settings.

### Backup Configuration

Keep secure backups of:
- `terraform/terraform.tfvars` (encrypted)
- SSH private keys
- Environment variable values

### Disaster Recovery

To redeploy from scratch:

1. Ensure you have `terraform.tfvars` and SSH keys
2. Run: `make destroy` (if infrastructure exists)
3. Run: `make deploy`

## Cost Optimization

- Use a small VM instance for testing (2GB RAM)
- Scale up for production (4GB+ RAM recommended)
- Enable Docker resource limits if needed
- Monitor resource usage with `docker stats`

## Support

For issues related to:
- **Application**: Check GitHub issues
- **Infrastructure**: Review Terraform logs
- **Docker**: Check container logs with `make logs`
- **SSL**: Review Certbot logs in certbot container

## Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
