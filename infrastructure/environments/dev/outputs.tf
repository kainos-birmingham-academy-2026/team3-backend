output "resource_group_name" {
  description = "Name of the dev resource group."
  value       = module.resource_group.name
}

output "key_vault_name" {
  description = "Name of the dev Key Vault."
  value       = module.key_vault.name
}

output "key_vault_uri" {
  description = "URI of the dev Key Vault."
  value       = module.key_vault.vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the backend managed identity."
  value       = module.managed_identity.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the backend managed identity for role assignments."
  value       = module.managed_identity.principal_id
}