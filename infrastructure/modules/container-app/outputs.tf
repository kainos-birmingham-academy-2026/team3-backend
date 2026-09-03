output "id" {
  description = "Resource ID of the Container App."
  value       = azurerm_container_app.this.id
}

output "fqdn" {
  description = "Internal fully qualified domain name of the Container App."
  value       = azurerm_container_app.this.ingress[0].fqdn
}

output "outbound_ip_addresses" {
  description = "Outbound IP addresses used by the Container App."
  value       = azurerm_container_app.this.outbound_ip_addresses
}