output "id" {
  description = "Resource ID of the Grafana instance."
  value       = azurerm_dashboard_grafana.this.id
}

output "endpoint" {
  description = "URL used to reach the Grafana dashboard."
  value       = azurerm_dashboard_grafana.this.endpoint
}

output "principal_id" {
  description = "Principal ID of the Grafana system assigned identity."
  value       = azurerm_dashboard_grafana.this.identity[0].principal_id
}
