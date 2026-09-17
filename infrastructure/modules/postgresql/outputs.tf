output "public_network_access_enabled" {
  description = "Effective public network access setting of the PostgreSQL server."
  value       = azurerm_postgresql_flexible_server.this.public_network_access_enabled
}

output "azure_services_firewall_enabled" {
  description = "Whether the PostgreSQL firewall permits Azure services."
  value       = length(azurerm_postgresql_flexible_server_firewall_rule.azure_services) == 1
}

output "id" {
  description = "Resource ID of the PostgreSQL Flexible Server."
  value       = azurerm_postgresql_flexible_server.this.id
}

output "name" {
  description = "Name of the PostgreSQL Flexible Server."
  value       = azurerm_postgresql_flexible_server.this.name
}

output "administrator_login" {
  description = "Administrator login for the PostgreSQL Flexible Server."
  value       = azurerm_postgresql_flexible_server.this.administrator_login
}

output "fqdn" {
  description = "Fully qualified domain name of the PostgreSQL Flexible Server."
  value       = azurerm_postgresql_flexible_server.this.fqdn
}

output "database_name" {
  description = "Name of the application database."
  value       = azurerm_postgresql_flexible_server_database.this.name
}