output "name" {
  description = "Name of the resource group."
  value       = azurerm_resource_group.this.name
}

output "id" {
  description = "Resource ID of the resource group, used as a role assignment scope."
  value       = azurerm_resource_group.this.id
}