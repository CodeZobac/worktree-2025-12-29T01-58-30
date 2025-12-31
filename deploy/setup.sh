#!/bin/bash
# VM Setup Script for Family Recipes Application
# This script is run by Terraform to set up the server environment
# All commands use -y flag and DEBIAN_FRONTEND=noninteractive for autonomous execution

set -euo pipefail

# Export non-interactive mode for apt
export DEBIAN_FRONTEND=noninteractive

echo "=== Starting VM Setup ==="

# Update system packages
echo "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    gnupg \
    lsb-release \
    cron \
    sqlite3

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
else
    echo "Docker is already installed"
fi

# Verify Docker installation
docker --version
docker compose version

# Create application directories
echo "Creating application directories..."
mkdir -p /opt/app/data
mkdir -p /opt/app/uploads
mkdir -p /opt/app/backups
mkdir -p /opt/app/deploy/nginx/certbot/conf
mkdir -p /opt/app/deploy/nginx/certbot/www

# Set proper permissions
echo "Setting directory permissions..."
chmod 755 /opt/app/data
chmod 755 /opt/app/uploads
chmod 755 /opt/app/backups

# Enable and start cron service
echo "Configuring cron service..."
systemctl enable cron
systemctl start cron

# Create logrotate config for backups
cat > /etc/logrotate.d/family-recipes << 'EOF'
/opt/app/backups/*.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

echo "=== VM Setup Complete ==="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo "Data directory: /opt/app/data"
echo "Uploads directory: /opt/app/uploads"
echo "Backups directory: /opt/app/backups"
