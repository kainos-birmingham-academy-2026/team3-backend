resource "azurerm_storage_account" "this" {
  name                     = var.storage_account_name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  min_tls_version          = "TLS1_2"

  tags = var.tags
}

resource "azurerm_storage_container" "deployment_packages" {
  name                  = coalesce(var.deployment_container_name, "app-package-${var.name}")
  storage_account_id    = azurerm_storage_account.this.id
  container_access_type = "private"
}

resource "azurerm_service_plan" "this" {
  name                = var.service_plan_name
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "FC1"

  tags = var.tags
}

resource "azurerm_application_insights" "this" {
  name                = var.application_insights_name
  resource_group_name = var.resource_group_name
  location            = var.location
  application_type    = "Node.JS"
  workspace_id        = var.log_analytics_workspace_id

  tags = var.tags
}

resource "azurerm_function_app_flex_consumption" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id

  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${azurerm_storage_account.this.primary_blob_endpoint}${azurerm_storage_container.deployment_packages.name}"
  storage_authentication_type = "StorageAccountConnectionString"
  storage_access_key          = azurerm_storage_account.this.primary_access_key

  runtime_name           = "node"
  runtime_version        = "22"
  maximum_instance_count = 100
  instance_memory_in_mb  = 2048

  app_settings = {
    (var.service_bus_setting_name) = "@Microsoft.KeyVault(SecretUri=${var.service_bus_connection_secret_uri})"
    ACS_CONNECTION_STRING          = "@Microsoft.KeyVault(SecretUri=${var.acs_connection_secret_uri})"
    EMAIL_SENDER_ADDRESS           = var.email_sender_address
    AZURE_LOG_LEVEL                = "info"
  }

  https_only = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_insights_connection_string = azurerm_application_insights.this.connection_string
    application_insights_key               = azurerm_application_insights.this.instrumentation_key
    minimum_tls_version                    = "1.2"
  }

  tags = var.tags
}