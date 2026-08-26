output "id" {
  description = "Resource ID used when creating Container Apps."
  value       = azurerm_container_app_environment.this.id
}

output "default_domain" {
  description = "Default DNS domain for Container Apps in this environment."
  value       = azurerm_container_app_environment.this.default_domain
}