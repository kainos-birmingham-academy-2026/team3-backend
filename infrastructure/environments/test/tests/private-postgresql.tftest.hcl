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

  assert {
    condition     = output.postgresql_public_network_access_enabled == false
    error_message = "Private-mode PostgreSQL must disable public network access."
  }

  plan_options {
    target = [
      module.postgresql,
      azurerm_container_app_job.private_smoke_test,
      azurerm_private_endpoint.postgresql,
      azurerm_private_dns_zone_virtual_network_link.postgresql,
    ]
  }

  assert {
    condition     = azurerm_container_app_job.private_smoke_test.replica_retry_limit == 0 && azurerm_container_app_job.private_smoke_test.replica_timeout_in_seconds == 120
    error_message = "Every test environment requires one bounded smoke job without automatic retries."
  }

  assert {
    condition     = azurerm_container_app_job.private_smoke_test.template[0].container[0].command == tolist(["node", "--import", "tsx", "--input-type=module", "--eval"])
    error_message = "The smoke job must bypass image startup migrations and seeding."
  }

  assert {
    condition     = azurerm_subnet.private_endpoints.address_prefixes == tolist(["10.63.2.0/24"]) && length(azurerm_subnet.private_endpoints.delegation) == 0
    error_message = "Private endpoints require a separate non-delegated subnet outside the Container Apps /23."
  }

  assert {
    condition     = azurerm_private_dns_zone.postgresql.name == "privatelink.postgres.database.azure.com" && azurerm_private_dns_zone_virtual_network_link.postgresql.virtual_network_id == module.network.id && !azurerm_private_dns_zone_virtual_network_link.postgresql.registration_enabled
    error_message = "PostgreSQL private DNS must be linked to the environment VNet without VM registration."
  }

  assert {
    condition     = azurerm_private_endpoint.postgresql.private_service_connection[0].subresource_names == tolist(["postgresqlServer"]) && !azurerm_private_endpoint.postgresql.private_service_connection[0].is_manual_connection && length(azurerm_private_endpoint.postgresql.private_dns_zone_group) == 1
    error_message = "The endpoint must connect to PostgreSQL and register its private address through a DNS zone group."
  }
}

run "private_database_for_test1" {
  command = plan

  variables {
    environment = "test1"
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
      azurerm_container_app_job.private_smoke_test,
      azurerm_private_endpoint.postgresql,
      azurerm_private_dns_zone_virtual_network_link.postgresql,
    ]
  }

  assert {
    condition     = output.postgresql_public_network_access_enabled == false && azurerm_container_app_job.private_smoke_test.name == "caj-team3-private-smoke-test1"
    error_message = "Test1 must provision a private database and smoke job."
  }

  assert {
    condition     = azurerm_private_endpoint.postgresql.name == "pe-team3-postgresql-test1" && azurerm_private_dns_zone.postgresql.name == "privatelink.postgres.database.azure.com"
    error_message = "Test1 must provision private endpoint and DNS resources."
  }
}

run "private_database_for_test2" {
  command = plan

  variables {
    environment = "test2"
  }

  plan_options {
    target = [
      module.postgresql,
      azurerm_container_app_job.private_smoke_test,
      azurerm_private_endpoint.postgresql,
      azurerm_private_dns_zone_virtual_network_link.postgresql,
    ]
  }

  assert {
    condition     = output.postgresql_public_network_access_enabled == false && azurerm_container_app_job.private_smoke_test.name == "caj-team3-private-smoke-test2" && azurerm_private_endpoint.postgresql.name == "pe-team3-postgresql-test2"
    error_message = "Test2 must provision private PostgreSQL and its smoke job."
  }
}