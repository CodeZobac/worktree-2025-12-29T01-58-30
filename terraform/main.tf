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
    NEXTAUTH_SECRET=${var.nextauth_secret}
    NEXTAUTH_URL=${var.nextauth_url}
    GOOGLE_CLIENT_ID=${var.google_client_id}
    GOOGLE_CLIENT_SECRET=${var.google_client_secret}
    DATABASE_URL=${var.database_url}
    DIRECT_URL=${var.direct_url}
    NEXT_PUBLIC_SUPABASE_URL=${var.supabase_url}
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${var.supabase_anon_key}
    SUPABASE_SERVICE_ROLE_KEY=${var.supabase_service_role_key}
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

# Copy deployment files to VM
resource "null_resource" "copy_files" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "file" {
    source      = "${path.module}/../"
    destination = "/opt/app"

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
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
      "apt-get update -y",
      # Install prerequisites
      "apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release",
      # Add Docker's official GPG key
      "mkdir -p /etc/apt/keyrings",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg",
      # Set up Docker repository
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null",
      # Install Docker
      "apt-get update -y",
      "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      # Start and enable Docker
      "systemctl start docker",
      "systemctl enable docker",
      # Verify installation
      "docker --version",
      "docker compose version"
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
      # Create necessary directories
      "mkdir -p deploy/nginx/certbot/conf deploy/nginx/certbot/www",
      # Stop any existing containers
      "docker compose down || true",
      # Build and start services
      "docker compose up -d --build",
      # Wait for services to be ready
      "sleep 10",
      # Show running containers
      "docker compose ps"
    ]

    connection {
      type        = "ssh"
      host        = var.vm_host
      user        = var.vm_user
      private_key = file(var.ssh_private_key_path)
    }
  }
}
