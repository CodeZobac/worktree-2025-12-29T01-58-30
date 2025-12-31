variable "vm_host" {
  description = "IP address of the target VM"
  type        = string
}

variable "vm_user" {
  description = "SSH user for the target VM"
  type        = string
  default     = "root"
}

variable "ssh_private_key_path" {
  description = "Path to the SSH private key file"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "ssl_email" {
  description = "Email address for SSL certificate registration"
  type        = string
}

variable "nextauth_secret" {
  description = "NextAuth secret for session encryption"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth URL (e.g., https://yourdomain.com)"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "app_port" {
  description = "Port for the Next.js application"
  type        = number
  default     = 3000
}

variable "backup_retention_days" {
  description = "Number of days to retain SQLite database backups"
  type        = number
  default     = 7
}
