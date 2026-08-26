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