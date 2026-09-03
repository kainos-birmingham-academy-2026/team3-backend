resource "azurerm_postgresql_flexible_server" "this" {
  name                              = var.name
  resource_group_name               = var.resource_group_name
  location                          = var.location
  version                           = var.postgresql_version
  administrator_login               = var.administrator_login
  administrator_password_wo         = var.administrator_password
  administrator_password_wo_version = var.administrator_password_version
  sku_name                          = var.sku_name
  storage_mb                        = var.storage_mb
  backup_retention_days             = var.backup_retention_days
  geo_redundant_backup_enabled      = false
  public_network_access_enabled     = true
  zone                              = var.zone

  authentication {
    active_directory_auth_enabled = false
    password_auth_enabled         = true
  }

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "this" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}