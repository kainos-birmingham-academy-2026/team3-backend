resource "azurerm_dashboard_grafana" "this" {
  name                              = var.name
  location                          = var.location
  resource_group_name               = var.resource_group_name
  grafana_major_version             = var.grafana_major_version
  sku                               = "Standard"
  api_key_enabled                   = false
  deterministic_outbound_ip_enabled = false
  public_network_access_enabled     = true
  zone_redundancy_enabled           = false

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Lets Grafana query Azure Monitor and the Log Analytics workspace on the team's behalf.
resource "azurerm_role_assignment" "monitoring_reader" {
  scope                = var.monitoring_reader_scope
  role_definition_name = "Monitoring Reader"
  principal_id         = azurerm_dashboard_grafana.this.identity[0].principal_id
  principal_type       = "ServicePrincipal"
}

resource "azurerm_role_assignment" "grafana_admins" {
  for_each = toset(var.admin_object_ids)

  scope                = azurerm_dashboard_grafana.this.id
  role_definition_name = "Grafana Admin"
  principal_id         = each.value
}
