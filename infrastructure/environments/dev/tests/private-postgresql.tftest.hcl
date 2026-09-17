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
  project_name                      = "team3"
  environment                       = "dev"
  location                          = "uksouth"
  deployment_principal_object_id    = "00000000-0000-0000-0000-000000000001"
  postgresql_administrator_password = "TestPassword123!"
  acr_name                          = "shared"
  acr_resource_group_name           = "rg-shared"
  backend_image_tag                 = "dev-private-network"
}

override_module {
  target = module.resource_group
  outputs = {
    name = "rg-team3-dev"
    id   = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-dev"
  }
}

override_module {
  target = module.network
  outputs = {
    name                     = "vnet-team3-dev"
    id                       = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-dev/providers/Microsoft.Network/virtualNetworks/vnet-team3-dev"
    address_space            = ["10.60.0.0/16"]
    container_apps_subnet_id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-dev/providers/Microsoft.Network/virtualNetworks/vnet-team3-dev/subnets/snet-container-apps"
  }
}

run "private_database_is_mandatory_for_dev" {
  command = plan

  plan_options {
    target = [
      module.postgresql,
      azurerm_container_app_job.private_smoke_test,
      azurerm_private_endpoint.postgresql,
      azurerm_private_dns_zone_virtual_network_link.postgresql,
    ]
  }

  assert {
    condition     = output.postgresql_public_network_access_enabled == false && azurerm_private_endpoint.postgresql.name == "pe-team3-postgresql-dev"
    error_message = "Dev PostgreSQL must disable public access and use a private endpoint."
  }

  assert {
    condition     = azurerm_private_dns_zone.postgresql.name == "privatelink.postgres.database.azure.com" && azurerm_private_dns_zone_virtual_network_link.postgresql.virtual_network_id == module.network.id && !azurerm_private_dns_zone_virtual_network_link.postgresql.registration_enabled
    error_message = "Dev PostgreSQL private DNS must be linked to the dev VNet without registration."
  }

  assert {
    condition     = azurerm_container_app_job.private_smoke_test.replica_retry_limit == 0 && azurerm_container_app_job.private_smoke_test.replica_timeout_in_seconds == 120 && azurerm_container_app_job.private_smoke_test.template[0].container[0].command == tolist(["node", "--import", "tsx", "--input-type=module", "--eval"])
    error_message = "Dev must create a bounded private database smoke job that bypasses application startup."
  }
}