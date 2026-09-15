output "id" {
  description = "Resource ID of the environment virtual network."
  value       = azurerm_virtual_network.this.id
}

output "name" {
  description = "Name of the environment virtual network."
  value       = azurerm_virtual_network.this.name
}

output "address_space" {
  description = "Reserved address space of the environment virtual network."
  value       = azurerm_virtual_network.this.address_space
}

output "container_apps_subnet_id" {
  description = "Resource ID of the subnet reserved for a workload profiles Container Apps Environment."
  value       = azurerm_subnet.container_apps.id
}