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

module "container_app_environment" {
  source = "../../modules/container-app-environment"

  name                = "cae-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

data "azurerm_container_registry" "shared" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
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

module "backend_container_app" {
  source = "../../modules/container-app"

  name                         = "ca-${var.project_name}-backend-${var.environment}"
  container_app_environment_id = module.container_app_environment.id
  resource_group_name          = module.resource_group.name
  managed_identity_id          = module.managed_identity.id
  registry_server              = data.azurerm_container_registry.shared.login_server
  image                        = "${data.azurerm_container_registry.shared.login_server}/team3-backend:${var.backend_image_tag}"
  database_url_secret_id       = "${module.key_vault.vault_uri}secrets/database-url"
  jwt_secret_id                = "${module.key_vault.vault_uri}secrets/jwt-secret"
  enable_swagger_docs          = var.enable_swagger_docs
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
  ]
}

import {
  to = module.resource_group.azurerm_resource_group.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/rg-${var.project_name}-${var.environment}"
}