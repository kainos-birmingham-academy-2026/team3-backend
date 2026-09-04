resource "azurerm_container_app" "this" {
  name                         = var.name
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  registry {
    server   = var.registry_server
    identity = var.managed_identity_id
  }

  secret {
    name                = "database-url-ref"
    key_vault_secret_id = var.database_url_secret_id
    identity            = var.managed_identity_id
  }

  secret {
    name                = "jwt-secret-ref"
    key_vault_secret_id = var.jwt_secret_id
    identity            = var.managed_identity_id
  }

  ingress {
    external_enabled = false
    target_port      = 4000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    revision_suffix = var.revision_suffix
    min_replicas    = 1
    max_replicas    = 1

    container {
      name   = "backend"
      image  = var.image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url-ref"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret-ref"
      }

      env {
        name  = "ENABLE_SWAGGER_DOCS"
        value = tostring(var.enable_swagger_docs)
      }

      env {
        name  = "SEED_DATABASE"
        value = tostring(var.seed_database)
      }

      dynamic "env" {
        for_each = var.azure_openai_endpoint == null ? [] : [var.azure_openai_endpoint]

        content {
          name  = "AZURE_OPENAI_ENDPOINT"
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.azure_openai_deployment == null ? [] : [var.azure_openai_deployment]

        content {
          name  = "AZURE_OPENAI_DEPLOYMENT"
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.azure_openai_endpoint == null ? [] : [var.azure_openai_api_version]

        content {
          name  = "AZURE_OPENAI_API_VERSION"
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.azure_openai_endpoint == null ? [] : [var.managed_identity_client_id]

        content {
          name  = "AZURE_CLIENT_ID"
          value = env.value
        }
      }

      liveness_probe {
        transport = "HTTP"
        port      = 4000
        path      = "/health"
      }

      readiness_probe {
        transport = "HTTP"
        port      = 4000
        path      = "/health"
      }
    }
  }
}