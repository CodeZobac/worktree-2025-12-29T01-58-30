terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# Create .env file content
locals {
  env_content = <<-EOT
    AUTH_SECRET=${var.AUTH_SECRET}
    AUTH_URL=${var.AUTH_URL}
    AUTH_TRUST_HOST=true
    AUTH_GOOGLE_ID=${var.AUTH_GOOGLE_ID}
    AUTH_GOOGLE_SECRET=${var.AUTH_GOOGLE_SECRET}
    DATABASE_URL=file:/app/data/dev.db
    NODE_ENV=production
  EOT

  docker_compose_content = templatefile("${path.module}/../deploy/docker-compose.yml.tpl", {
    domain_name = var.domain_name
    ssl_email   = var.ssl_email
    app_port    = var.app_port
  })

  nginx_config = templatefile("${path.module}/../deploy/nginx/nginx.conf.tpl", {
    domain_name = var.domain_name
    app_port    = var.app_port
  })
}

# First, prepare the VM directories with proper permissions
resource "null_resource" "prepare_vm" {
  triggers = {
    vm_host = var.vm_host
  }

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "echo 'Preparing VM directories...'",
      "sudo mkdir -p /opt/app",
      "sudo mkdir -p /opt/app/data /opt/app/uploads /opt/app/backups",
      "sudo mkdir -p /opt/app/deploy/nginx/certbot/conf /opt/app/deploy/nginx/certbot/www",
      "sudo chown -R ${var.vm_user}:${var.vm_user} /opt/app",
      "sudo chmod -R 755 /opt/app",
      "echo 'VM directories prepared successfully!'"
    ]

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }
}

# Copy deployment files to VM using rsync (excludes node_modules, .git, etc.)
resource "null_resource" "copy_files" {
  depends_on = [null_resource.prepare_vm]

  triggers = {
    always_run = timestamp()
  }

  # Use local-exec with rsync for better control over what gets copied
  provisioner "local-exec" {
    command = <<-EOT
      rsync -avz --progress --delete \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude 'terraform/.terraform' \
        --exclude 'terraform/*.tfstate*' \
        --exclude 'terraform/terraform.tfvars' \
        --exclude '.env*' \
        --exclude '*.log' \
        --exclude '.vscode' \
        --exclude 'coverage' \
        --exclude '.DS_Store' \
        --exclude 'data' \
        --exclude 'public/uploads' \
        --exclude 'deploy/nginx/certbot/conf' \
        --exclude 'deploy/nginx/certbot/www' \
        --exclude 'deploy/nginx/nginx.conf' \
        --exclude 'docker-compose.yml' \
        --exclude 'backups' \
        --exclude 'uploads' \
        -e "ssh -i ${var.ssh_private_key_path} -o StrictHostKeyChecking=no" \
        ${path.module}/../ ${var.vm_user}@${var.vm_host}:/opt/app/
    EOT
  }

  provisioner "file" {
    content     = local.env_content
    destination = "/opt/app/.env.production"

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }

  provisioner "file" {
    content     = local.docker_compose_content
    destination = "/opt/app/docker-compose.yml"

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }

  provisioner "file" {
    content     = local.nginx_config
    destination = "/opt/app/deploy/nginx/nginx.conf"

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }
}

# Install Docker and Docker Compose
resource "null_resource" "install_docker" {
  depends_on = [null_resource.copy_files]

  triggers = {
    vm_host = var.vm_host
  }

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "export DEBIAN_FRONTEND=noninteractive",
      # Update package list
      "sudo apt-get update -y",
      # Install prerequisites
      "sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release",
      # Add Docker's official GPG key
      "sudo mkdir -p /etc/apt/keyrings",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes",
      # Set up Docker repository
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      # Install Docker
      "sudo apt-get update -y",
      "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      # Add user to docker group
      "sudo usermod -aG docker ${var.vm_user}",
      # Start and enable Docker
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      # Setup swap space for low-memory VMs (needed for Next.js build)
      "if [ ! -f /swapfile ]; then sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab; fi",
      # Verify installation
      "docker --version",
      "docker compose version",
      "free -h"
    ]

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }
}

# Deploy the application
resource "null_resource" "deploy_app" {
  depends_on = [null_resource.install_docker]

  triggers = {
    always_run = timestamp()
  }

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "cd /opt/app",
      # Create necessary directories for SSL, SQLite data, uploads, and backups
      "mkdir -p deploy/nginx/certbot/conf deploy/nginx/certbot/www",
      "mkdir -p /opt/app/data /opt/app/uploads /opt/app/backups",
      # Set proper permissions for data directories (UID 1001 = nextjs user in container)
      "sudo chown -R 1001:1001 /opt/app/data /opt/app/uploads",
      "sudo chmod -R 777 /opt/app/data /opt/app/uploads",
      "sudo chmod 755 /opt/app/backups",
      # Make backup script executable
      "chmod +x /opt/app/deploy/backup.sh || true",
      # Install cron and sqlite3 if not present
      "sudo apt-get install -y cron sqlite3",
      # Setup daily backup cron job at 2 AM
      "(crontab -l 2>/dev/null | grep -v 'backup.sh'; echo '0 2 * * * /opt/app/deploy/backup.sh ${var.backup_retention_days}') | crontab -",
      # Ensure cron is running
      "sudo systemctl enable cron && sudo systemctl start cron",
      # Stop any existing containers
      "sudo docker compose down || true",
      # Build and start services
      "sudo docker compose up -d --build",
      # Wait for services to be ready
      "sleep 15",
      # Verify database is initialized
      "echo 'Verifying database status...'",
      "sudo docker compose logs app --tail 50",
      # Show running containers
      "sudo docker compose ps"
    ]

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }
}
