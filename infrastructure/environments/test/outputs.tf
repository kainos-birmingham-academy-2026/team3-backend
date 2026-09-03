output "resource_group_name" {
  description = "Name of the test resource group."
  value       = module.resource_group.name
}

output "key_vault_name" {
  description = "Name of the test Key Vault."
  value       = module.key_vault.name
}

output "key_vault_uri" {
  description = "URI of the test Key Vault."
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

output "container_app_environment_id" {
  description = "Resource ID of the test Container App Environment."
  value       = module.container_app_environment.id
}

output "container_app_environment_default_domain" {
  description = "Default DNS domain of the test Container App Environment."
  value       = module.container_app_environment.default_domain
}

output "backend_container_app_fqdn" {
  description = "Internal FQDN of the test backend Container App."
  value       = module.backend_container_app.fqdn
}

output "log_analytics_workspace_name" {
  description = "Name of the test Log Analytics workspace."
  value       = module.log_analytics.name
}

output "grafana_endpoint" {
  description = "URL of the test Grafana dashboard."
  value       = module.grafana.endpoint
}

output "postgresql_server_name" {
  description = "Name of the test PostgreSQL Flexible Server."
  value       = module.postgresql.name
}

output "postgresql_fqdn" {
  description = "Fully qualified domain name of the test PostgreSQL Flexible Server."
  value       = module.postgresql.fqdn
}

output "postgresql_database_name" {
  description = "Name of the test application database."
  value       = module.postgresql.database_name
}
