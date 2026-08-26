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

import {
  to = module.resource_group.azurerm_resource_group.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/rg-${var.project_name}-${var.environment}"
}