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

module "notification_service_bus" {
  source = "../../modules/notification-service-bus"

  name                = "rg-${var.project_name}-svb"
  location            = var.location
  resource_group_name = module.resource_group.name
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "email_communication" {
  source = "../../modules/email-communication"

  communication_service_name = "rg-${var.project_name}-comms"
  email_service_name         = "rg-${var.project_name}-email"
  resource_group_name        = module.resource_group.name
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

resource "azurerm_cognitive_account" "openai" {
  name                          = "aoai-team3-chatbot-dev"
  location                      = var.location
  resource_group_name           = module.resource_group.name
  kind                          = "OpenAI"
  sku_name                      = "S0"
  custom_subdomain_name         = "aoai-team3-chatbot-dev"
  public_network_access_enabled = true
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
    purpose     = "applicant-chatbot"
    teamName    = "team3"
  }

  network_acls {
    default_action = "Allow"
  }
}

resource "azurerm_cognitive_deployment" "openai" {
  name                   = "team3-chatbot-gpt5-nano"
  cognitive_account_id   = azurerm_cognitive_account.openai.id
  version_upgrade_option = "OnceCurrentVersionExpired"

  model {
    format  = "OpenAI"
    name    = "gpt-5-nano"
    version = "2025-08-07"
  }

  sku {
    name     = "GlobalStandard"
    capacity = 10
  }
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

resource "azurerm_key_vault_secret" "service_bus_connection_string" {
  name             = "service-bus-connection-string"
  key_vault_id     = module.key_vault.id
  value_wo         = module.notification_service_bus.backend_send_primary_connection_string
  value_wo_version = var.application_secret_version

  depends_on = [time_sleep.secrets_rbac_propagation]
}

resource "azurerm_key_vault_secret" "function_service_bus_connection_string" {
  name             = "function-service-bus-connection-string"
  key_vault_id     = module.key_vault.id
  value_wo         = module.notification_service_bus.function_listen_primary_connection_string
  value_wo_version = var.application_secret_version

  depends_on = [time_sleep.secrets_rbac_propagation]
}

resource "azurerm_key_vault_secret" "acs_connection_string" {
  name             = "acs-connection-string"
  key_vault_id     = module.key_vault.id
  value_wo         = module.email_communication.primary_connection_string
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

module "notification_function" {
  source = "../../modules/notification-function"

  name                              = "rg-${var.project_name}-fa"
  storage_account_name              = "rg${var.project_name}${var.environment}ac09"
  deployment_container_name         = "app-package-rg-team3-fa-af43acb"
  service_plan_name                 = "ASP-rg${var.project_name}${var.environment}-89fa"
  application_insights_name         = "rg-${var.project_name}-fa"
  location                          = var.location
  resource_group_name               = module.resource_group.name
  log_analytics_workspace_id        = module.log_analytics.id
  service_bus_connection_secret_uri = "${module.key_vault.vault_uri}secrets/function-service-bus-connection-string"
  acs_connection_secret_uri         = "${module.key_vault.vault_uri}secrets/acs-connection-string"
  email_sender_address              = "DoNotReply@${module.email_communication.sender_domain}"
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  depends_on = [
    azurerm_key_vault_secret.function_service_bus_connection_string,
    azurerm_key_vault_secret.acs_connection_string,
  ]
}

resource "azurerm_role_assignment" "notification_function_key_vault_secrets_user" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.notification_function.principal_id
  principal_type       = "ServicePrincipal"
}

resource "azurerm_role_assignment" "openai_user" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = module.managed_identity.principal_id
  principal_type       = "ServicePrincipal"
}

module "backend_container_app" {
  source = "../../modules/container-app"

  name                                    = "ca-${var.project_name}-backend-${var.environment}"
  container_app_environment_id            = module.container_app_environment.id
  resource_group_name                     = module.resource_group.name
  managed_identity_id                     = module.managed_identity.id
  managed_identity_client_id              = module.managed_identity.client_id
  registry_server                         = data.azurerm_container_registry.shared.login_server
  image                                   = "${data.azurerm_container_registry.shared.login_server}/team3-backend:${var.backend_image_tag}"
  revision_suffix                         = var.container_revision_suffix
  database_url_secret_id                  = "${module.key_vault.vault_uri}secrets/database-url"
  jwt_secret_id                           = "${module.key_vault.vault_uri}secrets/jwt-secret"
  azure_openai_endpoint                   = azurerm_cognitive_account.openai.endpoint
  azure_openai_deployment                 = "team3-chatbot-gpt5-nano"
  service_bus_connection_string_secret_id = "${module.key_vault.vault_uri}secrets/service-bus-connection-string"
  enable_swagger_docs                     = var.enable_swagger_docs
  seed_database                           = true
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
    azurerm_role_assignment.openai_user,
    azurerm_cognitive_deployment.openai,
    azurerm_key_vault_secret.database_url,
    azurerm_key_vault_secret.jwt_secret,
    azurerm_key_vault_secret.service_bus_connection_string,
  ]
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "backend_container_app" {
  name             = "allow-team3-backend-container-app"
  server_id        = module.postgresql.id
  start_ip_address = one(module.backend_container_app.outbound_ip_addresses)
  end_ip_address   = one(module.backend_container_app.outbound_ip_addresses)
}

resource "azurerm_automation_account" "services" {
  name                = "aa-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  sku_name            = "Basic"

  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

resource "azurerm_role_assignment" "automation_service_power_operator" {
  scope                = module.resource_group.id
  role_definition_name = "Container Apps Contributor"
  principal_id         = azurerm_automation_account.services.identity[0].principal_id
  principal_type       = "ServicePrincipal"
}

resource "azurerm_automation_module" "accounts" {
  name                    = "Az.Accounts"
  resource_group_name     = module.resource_group.name
  automation_account_name = azurerm_automation_account.services.name

  module_link {
    uri = "https://www.powershellgallery.com/api/v2/package/Az.Accounts/${var.automation_accounts_module_version}"
  }
}

resource "azurerm_automation_module" "app" {
  name                    = "Az.App"
  resource_group_name     = module.resource_group.name
  automation_account_name = azurerm_automation_account.services.name

  module_link {
    uri = "https://www.powershellgallery.com/api/v2/package/Az.App/${var.automation_app_module_version}"
  }

  depends_on = [azurerm_automation_module.accounts]
}

resource "azurerm_automation_runbook" "start_services" {
  name                    = "Start-Team3-Services"
  location                = var.location
  resource_group_name     = module.resource_group.name
  automation_account_name = azurerm_automation_account.services.name
  runbook_type            = "PowerShell"
  log_verbose             = false
  log_progress            = false
  description             = "Start the dev backend, then the dev frontend."
  tags                    = azurerm_automation_account.services.tags

  content = <<-POWERSHELL
    $ErrorActionPreference = "Stop"

    Disable-AzContextAutosave -Scope Process | Out-Null
    Connect-AzAccount -Identity | Out-Null

    Start-AzContainerApp `
        -Name "ca-${var.project_name}-backend-${var.environment}" `
        -ResourceGroupName "${module.resource_group.name}" `
        -Confirm:$false | Out-Null

    Start-AzContainerApp `
        -Name "ca-${var.project_name}-frontend-${var.environment}" `
        -ResourceGroupName "${module.resource_group.name}" `
        -Confirm:$false | Out-Null

    Write-Output "Started Team 3 backend and frontend"
  POWERSHELL

  depends_on = [
    azurerm_automation_module.app,
    azurerm_role_assignment.automation_service_power_operator,
  ]
}

resource "azurerm_automation_runbook" "stop_services" {
  name                    = "Stop-Team3-Services"
  location                = var.location
  resource_group_name     = module.resource_group.name
  automation_account_name = azurerm_automation_account.services.name
  runbook_type            = "PowerShell"
  log_verbose             = false
  log_progress            = false
  description             = "Stop the dev frontend, then the dev backend."
  tags                    = azurerm_automation_account.services.tags

  content = <<-POWERSHELL
    $ErrorActionPreference = "Stop"

    Disable-AzContextAutosave -Scope Process | Out-Null
    Connect-AzAccount -Identity | Out-Null

    Stop-AzContainerApp `
        -Name "ca-${var.project_name}-frontend-${var.environment}" `
        -ResourceGroupName "${module.resource_group.name}" `
        -Confirm:$false | Out-Null

    Stop-AzContainerApp `
        -Name "ca-${var.project_name}-backend-${var.environment}" `
        -ResourceGroupName "${module.resource_group.name}" `
        -Confirm:$false | Out-Null

    Write-Output "Stopped Team 3 frontend and backend"
  POWERSHELL

  depends_on = [
    azurerm_automation_module.app,
    azurerm_role_assignment.automation_service_power_operator,
  ]
}