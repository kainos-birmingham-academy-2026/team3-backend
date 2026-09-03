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