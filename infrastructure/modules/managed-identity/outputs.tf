output "id" {
  description = "Resource ID used to attach the identity to Azure resources."
  value       = azurerm_user_assigned_identity.this.id
}

output "principal_id" {
  description = "Principal ID used in Azure role assignments."
  value       = azurerm_user_assigned_identity.this.principal_id
}