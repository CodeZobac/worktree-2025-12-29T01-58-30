output "vm_host" {
  description = "IP address of the deployed VM"
  value       = var.vm_host
}

output "application_url" {
  description = "URL of the deployed application"
  value       = "https://${var.domain_name}"
}

output "deployment_status" {
  description = "Status message"
  value       = "Application deployed successfully"
}
