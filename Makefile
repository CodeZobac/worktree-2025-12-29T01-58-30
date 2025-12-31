.PHONY: help init plan apply deploy destroy clean validate backup

# Default target
help:
	@echo "Available commands:"
	@echo "  make init       - Initialize Terraform and prepare environment"
	@echo "  make plan       - Show what Terraform will do"
	@echo "  make apply      - Apply Terraform configuration (provision infrastructure)"
	@echo "  make deploy     - Deploy/redeploy the application (full pipeline)"
	@echo "  make validate   - Validate Terraform configuration"
	@echo "  make destroy    - Destroy all infrastructure"
	@echo "  make clean      - Clean Terraform state and cache files"
	@echo "  make backup     - Trigger manual backup of SQLite database"
	@echo "  make ssh        - SSH into the VM"
	@echo "  make logs       - View application logs"
	@echo "  make status     - Check Docker container status"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. Copy terraform/terraform.tfvars.example to terraform/terraform.tfvars"
	@echo "  2. Edit terraform/terraform.tfvars with your configuration"
	@echo "  3. Run: make init"
	@echo "  4. Run: make deploy"
	@echo ""
	@echo "Data Storage:"
	@echo "  - SQLite database: /opt/app/data/dev.db (on VM)"
	@echo "  - Uploaded images: /opt/app/uploads/ (on VM)"
	@echo "  - Backups: /opt/app/backups/ (on VM, daily at 2 AM)"

# Initialize Terraform
init:
	@echo "==> Initializing Terraform..."
	@if [ ! -f terraform/terraform.tfvars ]; then \
		echo "ERROR: terraform/terraform.tfvars not found!"; \
		echo "Please copy terraform/terraform.tfvars.example to terraform/terraform.tfvars and fill in your values."; \
		exit 1; \
	fi
	@cd terraform && terraform init
	@echo "==> Terraform initialized successfully!"

# Validate Terraform configuration
validate: init
	@echo "==> Validating Terraform configuration..."
	@cd terraform && terraform validate
	@echo "==> Validation successful!"

# Show Terraform plan
plan: validate
	@echo "==> Creating Terraform plan..."
	@cd terraform && terraform plan
	@echo "==> Plan created successfully!"

# Apply Terraform configuration (provision infrastructure)
apply: validate
	@echo "==> Applying Terraform configuration..."
	@echo "This will provision and configure your VM infrastructure."
	@cd terraform && terraform apply -auto-approve
	@echo "==> Infrastructure provisioned successfully!"

# Full deployment pipeline
deploy: validate
	@echo "==> Starting full deployment pipeline..."
	@echo ""
	@echo "Step 1/3: Provisioning infrastructure..."
	@cd terraform && terraform apply -auto-approve
	@echo ""
	@echo "Step 2/3: Waiting for services to stabilize..."
	@sleep 15
	@echo ""
	@echo "Step 3/3: Deployment complete!"
	@echo ""
	@echo "==> Deployment Summary:"
	@cd terraform && terraform output
	@echo ""
	@echo "==> Your application should now be accessible!"
	@echo "Note: SSL certificate generation may take a few minutes on first deployment."
	@echo "Check logs with: ssh <vm_user>@<vm_host> 'cd /opt/app && docker compose logs'"

# Destroy all infrastructure
destroy:
	@echo "==> WARNING: This will destroy all deployed infrastructure!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd terraform && terraform destroy -auto-approve; \
		echo "==> Infrastructure destroyed successfully!"; \
	else \
		echo "==> Destroy cancelled."; \
	fi

# Clean Terraform files
clean:
	@echo "==> Cleaning Terraform state and cache..."
	@rm -rf terraform/.terraform
	@rm -f terraform/.terraform.lock.hcl
	@rm -f terraform/terraform.tfstate*
	@echo "==> Clean complete!"

# SSH into the VM (helper command)
ssh:
	@if [ ! -f terraform/terraform.tfvars ]; then \
		echo "ERROR: terraform/terraform.tfvars not found!"; \
		exit 1; \
	fi
	@VM_HOST=$$(grep "^vm_host" terraform/terraform.tfvars | cut -d'"' -f2); \
	VM_USER=$$(grep "^vm_user" terraform/terraform.tfvars | cut -d'"' -f2); \
	SSH_KEY=$$(grep "^ssh_private_key_path" terraform/terraform.tfvars | cut -d'"' -f2); \
	ssh -i $$SSH_KEY $$VM_USER@$$VM_HOST

# View logs from the VM (helper command)
logs:
	@if [ ! -f terraform/terraform.tfvars ]; then \
		echo "ERROR: terraform/terraform.tfvars not found!"; \
		exit 1; \
	fi
	@VM_HOST=$$(grep "^vm_host" terraform/terraform.tfvars | cut -d'"' -f2); \
	VM_USER=$$(grep "^vm_user" terraform/terraform.tfvars | cut -d'"' -f2); \
	SSH_KEY=$$(grep "^ssh_private_key_path" terraform/terraform.tfvars | cut -d'"' -f2); \
	ssh -i $$SSH_KEY $$VM_USER@$$VM_HOST 'cd /opt/app && docker compose logs -f'

# Check status of services on the VM (helper command)
status:
	@if [ ! -f terraform/terraform.tfvars ]; then \
		echo "ERROR: terraform/terraform.tfvars not found!"; \
		exit 1; \
	fi
	@VM_HOST=$$(grep "^vm_host" terraform/terraform.tfvars | cut -d'"' -f2); \
	VM_USER=$$(grep "^vm_user" terraform/terraform.tfvars | cut -d'"' -f2); \
	SSH_KEY=$$(grep "^ssh_private_key_path" terraform/terraform.tfvars | cut -d'"' -f2); \
	ssh -i $$SSH_KEY $$VM_USER@$$VM_HOST 'cd /opt/app && docker compose ps'

# Trigger manual backup of SQLite database
backup:
	@if [ ! -f terraform/terraform.tfvars ]; then \
		echo "ERROR: terraform/terraform.tfvars not found!"; \
		exit 1; \
	fi
	@echo "==> Triggering manual backup..."
	@VM_HOST=$$(grep "^vm_host" terraform/terraform.tfvars | cut -d'"' -f2); \
	VM_USER=$$(grep "^vm_user" terraform/terraform.tfvars | cut -d'"' -f2); \
	SSH_KEY=$$(grep "^ssh_private_key_path" terraform/terraform.tfvars | cut -d'"' -f2); \
	RETENTION=$$(grep "^backup_retention_days" terraform/terraform.tfvars | cut -d'=' -f2 | tr -d ' ' || echo "7"); \
	ssh -i $$SSH_KEY $$VM_USER@$$VM_HOST "/opt/app/deploy/backup.sh $$RETENTION"
	@echo "==> Backup complete!"

# List available backups
list-backups:
	@if [ ! -f terraform/terraform.tfvars ]; then \
		echo "ERROR: terraform/terraform.tfvars not found!"; \
		exit 1; \
	fi
	@echo "==> Available backups:"
	@VM_HOST=$$(grep "^vm_host" terraform/terraform.tfvars | cut -d'"' -f2); \
	VM_USER=$$(grep "^vm_user" terraform/terraform.tfvars | cut -d'"' -f2); \
	SSH_KEY=$$(grep "^ssh_private_key_path" terraform/terraform.tfvars | cut -d'"' -f2); \
	ssh -i $$SSH_KEY $$VM_USER@$$VM_HOST 'ls -lah /opt/app/backups/'
