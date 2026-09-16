terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

resource "azurerm_container_app_environment" "this" {
  name                           = var.name
  location                       = var.location
  resource_group_name            = var.resource_group_name
  log_analytics_workspace_id     = var.log_analytics_workspace_id
  logs_destination               = var.log_analytics_workspace_id == null ? null : "log-analytics"
  tags                           = var.tags
  infrastructure_subnet_id       = var.infrastructure_subnet_id
  internal_load_balancer_enabled = var.infrastructure_subnet_id == null ? null : false

  dynamic "workload_profile" {
    for_each = var.infrastructure_subnet_id == null ? [] : ["Consumption"]

    content {
      name                  = workload_profile.value
      workload_profile_type = "Consumption"
    }
  }
}