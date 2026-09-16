resource "azurerm_subnet" "private_endpoints" {
  count = var.enable_vnet_integration ? 1 : 0

  name                 = "snet-private-endpoints"
  resource_group_name  = module.resource_group.name
  virtual_network_name = module.network.name
  address_prefixes     = [cidrsubnet(one(module.network.address_space), 8, 2)]
}

resource "azurerm_private_dns_zone" "postgresql" {
  count = var.enable_vnet_integration ? 1 : 0

  name                = "privatelink.postgres.database.azure.com"
  resource_group_name = module.resource_group.name
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgresql" {
  count = var.enable_vnet_integration ? 1 : 0

  name                  = "postgresql-${var.environment}"
  resource_group_name   = module.resource_group.name
  private_dns_zone_name = azurerm_private_dns_zone.postgresql[0].name
  virtual_network_id    = module.network.id
  registration_enabled  = false
}

resource "azurerm_private_endpoint" "postgresql" {
  count = var.enable_vnet_integration ? 1 : 0

  name                = "pe-${var.project_name}-postgresql-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  subnet_id           = azurerm_subnet.private_endpoints[0].id
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  private_service_connection {
    name                           = "postgresql"
    private_connection_resource_id = module.postgresql.id
    subresource_names              = ["postgresqlServer"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "postgresql"
    private_dns_zone_ids = [azurerm_private_dns_zone.postgresql[0].id]
  }
}