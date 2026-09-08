output "communication_service_id" {
  description = "Resource ID of the Azure Communication Service."
  value       = azurerm_communication_service.this.id
}

output "email_service_id" {
  description = "Resource ID of the Email Communication Service."
  value       = azurerm_email_communication_service.this.id
}

output "email_domain_id" {
  description = "Resource ID of the Azure-managed email domain."
  value       = azurerm_email_communication_service_domain.azure_managed.id
}

output "sender_domain" {
  description = "Azure-managed sender domain used by the Function App."
  value       = azurerm_email_communication_service_domain.azure_managed.from_sender_domain
}

output "primary_connection_string" {
  description = "Primary Azure Communication Services connection string."
  value       = azurerm_communication_service.this.primary_connection_string
  sensitive   = true
}