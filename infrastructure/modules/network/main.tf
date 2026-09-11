terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

locals {
  address_spaces = {
    dev   = "10.60.0.0/16"
    test1 = "10.61.0.0/16"
    test2 = "10.62.0.0/16"
    test3 = "10.63.0.0/16"
    uat   = "10.64.0.0/16"
    prod  = "10.65.0.0/16"
  }
}

resource "azurerm_virtual_network" "this" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = [local.address_spaces[var.environment]]
  tags                = var.tags
}

resource "azurerm_subnet" "container_apps" {
  name                 = "snet-container-apps"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [cidrsubnet(local.address_spaces[var.environment], 7, 0)]

  delegation {
    name = "container-apps"

    service_delegation {
      name    = "Microsoft.App/environments"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}