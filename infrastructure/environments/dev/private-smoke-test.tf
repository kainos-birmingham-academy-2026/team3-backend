resource "azurerm_container_app_job" "private_smoke_test" {
  count = var.enable_vnet_integration ? 1 : 0

  name                         = "caj-${var.project_name}-private-smoke-${var.environment}"
  location                     = var.location
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id
  replica_timeout_in_seconds   = 120
  replica_retry_limit          = 0

  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [module.managed_identity.id]
  }

  registry {
    server   = data.azurerm_container_registry.shared.login_server
    identity = module.managed_identity.id
  }

  secret {
    name                = "database-url"
    identity            = module.managed_identity.id
    key_vault_secret_id = "${module.key_vault.vault_uri}secrets/database-url"
  }

  template {
    container {
      name    = "private-smoke-test"
      image   = "${data.azurerm_container_registry.shared.login_server}/team3-backend:${var.backend_image_tag}"
      cpu     = 0.25
      memory  = "0.5Gi"
      command = ["node", "--import", "tsx", "--input-type=module", "--eval"]
      args    = ["${file("${path.module}/../test/private-smoke-test.mjs")}\nawait runPrivateSmokeTest();"]

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name  = "EXPECTED_PRIVATE_IP"
        value = azurerm_private_endpoint.postgresql[0].private_service_connection[0].private_ip_address
      }
    }
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
    azurerm_key_vault_secret.database_url,
    azurerm_private_dns_zone_virtual_network_link.postgresql,
    module.backend_container_app,
  ]
}