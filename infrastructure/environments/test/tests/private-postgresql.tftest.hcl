mock_provider "azurerm" {
  mock_data "azurerm_client_config" {
    defaults = {
      tenant_id       = "00000000-0000-0000-0000-000000000000"
      subscription_id = "00000000-0000-0000-0000-000000000000"
      object_id       = "00000000-0000-0000-0000-000000000001"
    }
  }
  mock_data "azurerm_container_registry" {
    defaults = {
      id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-shared/providers/Microsoft.ContainerRegistry/registries/shared"
    }
  }
  mock_data "azurerm_cognitive_account" {
    defaults = {
      id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-shared/providers/Microsoft.CognitiveServices/accounts/shared"
    }
  }
}
mock_provider "random" {}
mock_provider "time" {}

variables {
  environment                    = "test3"
  enable_vnet_integration        = true
  deployment_principal_object_id = "00000000-0000-0000-0000-000000000001"
  backend_image_tag              = "test-private-network"
}

override_module {
  target = module.resource_group
  outputs = {
    name = "rg-team3-test3"
    id   = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3"
  }
}

override_module {
  target = module.network
  outputs = {
    name                     = "vnet-team3-test3"
    id                       = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Network/virtualNetworks/vnet-team3-test3"
    address_space            = ["10.63.0.0/16"]
    container_apps_subnet_id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Network/virtualNetworks/vnet-team3-test3/subnets/snet-container-apps"
  }
}

override_module {
  target = module.backend_container_app
  outputs = {
    outbound_ip_addresses = [for index in range(161) : "192.0.2.${index + 1}"]
    fqdn                  = "backend.internal.example.com"
  }
}

run "private_database_with_multiple_outbound_addresses" {
  command = plan

  plan_options {
    target = [
      module.postgresql,
      azurerm_private_endpoint.postgresql,
      azurerm_private_dns_zone_virtual_network_link.postgresql,
      azurerm_postgresql_flexible_server_firewall_rule.backend_container_app,
    ]
  }

  assert {
    condition     = length(azurerm_postgresql_flexible_server_firewall_rule.backend_container_app) == 0
    error_message = "Private mode must not evaluate one() against the 161 outbound addresses or allow public IPs."
  }

  assert {
    condition     = azurerm_subnet.private_endpoints[0].address_prefixes == tolist(["10.63.2.0/24"]) && length(azurerm_subnet.private_endpoints[0].delegation) == 0
    error_message = "Private endpoints require a separate non-delegated subnet outside the Container Apps /23."
  }

  assert {
    condition     = azurerm_private_dns_zone.postgresql[0].name == "privatelink.postgres.database.azure.com" && azurerm_private_dns_zone_virtual_network_link.postgresql[0].virtual_network_id == module.network.id && !azurerm_private_dns_zone_virtual_network_link.postgresql[0].registration_enabled
    error_message = "PostgreSQL private DNS must be linked to the pilot VNet without VM registration."
  }

  assert {
    condition     = azurerm_private_endpoint.postgresql[0].private_service_connection[0].subresource_names == tolist(["postgresqlServer"]) && !azurerm_private_endpoint.postgresql[0].private_service_connection[0].is_manual_connection && length(azurerm_private_endpoint.postgresql[0].private_dns_zone_group) == 1
    error_message = "The endpoint must connect to PostgreSQL and register its private address through a DNS zone group."
  }
}

run "test1_public_access_unchanged" {
  command = plan

  variables {
    environment             = "test1"
    enable_vnet_integration = false
  }

  override_module {
    target = module.backend_container_app
    outputs = {
      outbound_ip_addresses = ["192.0.2.10"]
      fqdn                  = "backend.internal.example.com"
    }
  }

  plan_options {
    target = [
      module.postgresql,
      azurerm_private_endpoint.postgresql,
      azurerm_private_dns_zone_virtual_network_link.postgresql,
      azurerm_postgresql_flexible_server_firewall_rule.backend_container_app,
    ]
  }

  assert {
    condition     = length(azurerm_private_endpoint.postgresql) == 0 && length(azurerm_subnet.private_endpoints) == 0 && length(azurerm_private_dns_zone.postgresql) == 0 && length(azurerm_private_dns_zone_virtual_network_link.postgresql) == 0
    error_message = "Non-pilot slots must not provision private networking resources."
  }

  assert {
    condition     = length(azurerm_postgresql_flexible_server_firewall_rule.backend_container_app) == 1 && azurerm_postgresql_flexible_server_firewall_rule.backend_container_app[0].start_ip_address == "192.0.2.10" && azurerm_postgresql_flexible_server_firewall_rule.backend_container_app[0].end_ip_address == "192.0.2.10"
    error_message = "Non-pilot slots must retain their existing single-IP firewall rule."
  }
}