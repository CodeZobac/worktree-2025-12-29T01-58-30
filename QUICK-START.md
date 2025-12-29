# Quick Start Deployment Guide

This is a quick reference for deploying the Family Recipes application.

## Prerequisites Checklist

- [ ] VM with Ubuntu 20.04+ and public IP
- [ ] Domain name pointing to VM IP
- [ ] SSH private key for VM access
- [ ] Terraform installed locally (`terraform --version`)
- [ ] Make utility installed (`make --version`)
- [ ] Google OAuth credentials configured
- [ ] Supabase project created and configured

## 5-Minute Deployment

### 1. Configure Variables (2 minutes)

```bash
# Copy example file
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your values
nano terraform/terraform.tfvars
```

**Required values:**
- `vm_host` - Your VM IP address
- `ssh_private_key_path` - Path to your SSH key
- `domain_name` - Your domain (must point to VM)
- `ssl_email` - Your email for SSL certificates
- `nextauth_secret` - Generate with: `openssl rand -base64 32`
- All Google OAuth and Supabase credentials

### 2. Deploy (3 minutes)

```bash
# Initialize
make init

# Deploy everything
make deploy
```

That's it! Your application will be live at `https://yourdomain.com`

## Post-Deployment

### Check Status
```bash
make status
```

### View Logs
```bash
make logs
```

### SSH to VM
```bash
make ssh
```

## Common Issues

**DNS not resolving?**
- Wait for DNS propagation (can take up to 48 hours)
- Check with: `nslookup yourdomain.com`

**SSL certificate fails?**
- Ensure ports 80 and 443 are open
- Verify domain points to correct IP
- Wait a few minutes and check logs

**Application not starting?**
- Check logs: `make logs`
- Verify all environment variables in terraform.tfvars
- Ensure Supabase database is accessible

## Update Application

```bash
# After code changes
make deploy
```

## Destroy Infrastructure

```bash
make destroy
```

## More Information

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive documentation.
