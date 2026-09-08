output "id" {
  description = "Resource ID of the notification Function App."
  value       = azurerm_function_app_flex_consumption.this.id
}

output "name" {
  description = "Name of the notification Function App."
  value       = azurerm_function_app_flex_consumption.this.name
}

output "default_hostname" {
  description = "Default hostname of the notification Function App."
  value       = azurerm_function_app_flex_consumption.this.default_hostname
}

output "principal_id" {
  description = "Principal ID of the Function App system-assigned identity."
  value       = azurerm_function_app_flex_consumption.this.identity[0].principal_id
}

output "storage_account_name" {
  description = "Name of the Function App storage account."
  value       = azurerm_storage_account.this.name
}