module "resource_group" {
  source = "../../modules/resource-group"

  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "key_vault" {
  source = "../../modules/key-vault"

  name                = "kv-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "managed_identity" {
  source = "../../modules/managed-identity"

  name                = "id-${var.project_name}-backend-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "log_analytics" {
  source = "../../modules/log-analytics"

  name                = "log-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  retention_in_days   = var.log_retention_in_days
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "grafana" {
  source = "../../modules/grafana"

  name                    = "graf-${var.project_name}-${var.environment}"
  location                = var.location
  resource_group_name     = module.resource_group.name
  monitoring_reader_scope = module.resource_group.id
  admin_object_ids        = var.grafana_admin_object_ids
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  depends_on = [module.log_analytics]
}

module "container_app_environment" {
  source = "../../modules/container-app-environment"

  name                       = "cae-${var.project_name}-${var.environment}"
  location                   = var.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = module.log_analytics.id
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "postgresql" {
  source = "../../modules/postgresql"

  name                           = "psql-${var.project_name}-${var.environment}"
  resource_group_name            = module.resource_group.name
  location                       = var.location
  postgresql_version             = "18"
  administrator_login            = "dino_admin_team3"
  administrator_password         = var.postgresql_administrator_password
  administrator_password_version = var.postgresql_administrator_password_version
  sku_name                       = "B_Standard_B1ms"
  storage_mb                     = 32768
  backup_retention_days          = 7
  zone                           = "2"
  database_name                  = "jobRoles"
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false

  keepers = {
    version = var.application_secret_version
  }
}

resource "random_password" "session_secret" {
  length  = 64
  special = false

  keepers = {
    version = var.application_secret_version
  }
}

data "azurerm_container_registry" "shared" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

# The academy-managed Azure OpenAI account and deployment are external prerequisites.
# Terraform validates the account and manages this application's access to it.
data "azurerm_cognitive_account" "openai" {
  name                = "aoai-team3-chatbot-dev"
  resource_group_name = module.resource_group.name
}

resource "azurerm_role_assignment" "deployment_secrets_officer" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = var.deployment_principal_object_id
  principal_type       = "ServicePrincipal"
}

resource "time_sleep" "secrets_rbac_propagation" {
  create_duration = "30s"

  triggers = {
    role_assignment_id = azurerm_role_assignment.deployment_secrets_officer.id
  }
}

resource "azurerm_key_vault_secret" "database_url" {
  name             = "database-url"
  key_vault_id     = module.key_vault.id
  value_wo         = "postgresql://${module.postgresql.administrator_login}:${urlencode(var.postgresql_administrator_password)}@${module.postgresql.fqdn}:5432/${module.postgresql.database_name}?sslmode=require"
  value_wo_version = var.postgresql_administrator_password_version

  depends_on = [time_sleep.secrets_rbac_propagation]
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name             = "jwt-secret"
  key_vault_id     = module.key_vault.id
  value_wo         = random_password.jwt_secret.result
  value_wo_version = var.application_secret_version

  depends_on = [time_sleep.secrets_rbac_propagation]
}

resource "azurerm_key_vault_secret" "session_secret" {
  name             = "session-secret"
  key_vault_id     = module.key_vault.id
  value_wo         = random_password.session_secret.result
  value_wo_version = var.application_secret_version

  depends_on = [time_sleep.secrets_rbac_propagation]
}

resource "azurerm_role_assignment" "key_vault_secrets_user" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.managed_identity.principal_id
  principal_type       = "ServicePrincipal"

  depends_on = [module.key_vault, module.managed_identity]
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.shared.id
  role_definition_name = "AcrPull"
  principal_id         = module.managed_identity.principal_id
  principal_type       = "ServicePrincipal"

  depends_on = [module.managed_identity]
}

resource "azurerm_role_assignment" "openai_user" {
  scope                = data.azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = module.managed_identity.principal_id
  principal_type       = "ServicePrincipal"
}

import {
  to = azurerm_role_assignment.openai_user
  id = "/subscriptions/ca3b1116-a974-4549-88c2-8b56da5130d0/resourceGroups/rg-team3-dev/providers/Microsoft.CognitiveServices/accounts/aoai-team3-chatbot-dev/providers/Microsoft.Authorization/roleAssignments/b93bc3e5-a4bc-458e-a568-b46130d7cf4d"
}

module "backend_container_app" {
  source = "../../modules/container-app"

  name                         = "ca-${var.project_name}-backend-${var.environment}"
  container_app_environment_id = module.container_app_environment.id
  resource_group_name          = module.resource_group.name
  managed_identity_id          = module.managed_identity.id
  managed_identity_client_id   = module.managed_identity.client_id
  registry_server              = data.azurerm_container_registry.shared.login_server
  image                        = "${data.azurerm_container_registry.shared.login_server}/team3-backend:${var.backend_image_tag}"
  revision_suffix              = var.container_revision_suffix
  database_url_secret_id       = "${module.key_vault.vault_uri}secrets/database-url"
  jwt_secret_id                = "${module.key_vault.vault_uri}secrets/jwt-secret"
  azure_openai_endpoint        = data.azurerm_cognitive_account.openai.endpoint
  azure_openai_deployment      = "team3-chatbot-gpt5-nano"
  enable_swagger_docs          = var.enable_swagger_docs
  seed_database                = true
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
    azurerm_role_assignment.openai_user,
    azurerm_key_vault_secret.database_url,
    azurerm_key_vault_secret.jwt_secret,
  ]
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "backend_container_app" {
  name             = "allow-team3-backend-container-app"
  server_id        = module.postgresql.id
  start_ip_address = one(module.backend_container_app.outbound_ip_addresses)
  end_ip_address   = one(module.backend_container_app.outbound_ip_addresses)
}