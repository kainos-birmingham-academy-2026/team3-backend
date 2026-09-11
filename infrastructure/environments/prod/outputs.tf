output "virtual_network_id" {
  description = "Resource ID of the environment virtual network."
  value       = module.network.id
}

output "virtual_network_address_space" {
  description = "Reserved address space of the environment virtual network."
  value       = module.network.address_space
}

output "container_apps_subnet_id" {
  description = "Resource ID of the subnet reserved for Container Apps migration."
  value       = module.network.container_apps_subnet_id
}

output "resource_group_name" {
  description = "Name of the production resource group."
  value       = module.resource_group.name
}

output "key_vault_name" {
  description = "Name of the production Key Vault."
  value       = module.key_vault.name
}

output "key_vault_uri" {
  description = "URI of the production Key Vault."
  value       = module.key_vault.vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the production backend managed identity."
  value       = module.managed_identity.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the production backend managed identity."
  value       = module.managed_identity.principal_id
}

output "container_app_environment_id" {
  description = "Resource ID of the production Container App Environment."
  value       = module.container_app_environment.id
}

output "container_app_environment_default_domain" {
  description = "Default DNS domain of the production Container App Environment."
  value       = module.container_app_environment.default_domain
}

output "backend_container_app_fqdn" {
  description = "Internal FQDN of the production backend Container App."
  value       = module.backend_container_app.fqdn
}