mock_provider "azurerm" {}

variables {
  project_name        = "team3"
  environment         = "dev"
  location            = "uksouth"
  resource_group_name = "rg-team3-dev"
  tags = {
    managed_by = "terraform"
  }
}

run "dev_network" {
  command = plan

  assert {
    condition     = output.name == "vnet-team3-dev" && toset(output.address_space) == toset(["10.60.0.0/16"])
    error_message = "Dev must use its reserved network name and address space."
  }

  assert {
    condition     = azurerm_subnet.container_apps.address_prefixes == tolist(["10.60.0.0/23"])
    error_message = "The Container Apps subnet must reserve the first /23 inside the VNet."
  }

  assert {
    condition     = azurerm_subnet.container_apps.delegation[0].service_delegation[0].name == "Microsoft.App/environments"
    error_message = "The subnet must be delegated for a workload profiles Container Apps Environment."
  }

  assert {
    condition     = azurerm_virtual_network.this.resource_group_name == var.resource_group_name && azurerm_virtual_network.this.tags["managed_by"] == "terraform"
    error_message = "The VNet must belong to the supplied resource group and preserve its tags."
  }
}

run "test1_network" {
  command = plan
  variables {
    environment         = "test1"
    resource_group_name = "rg-team3-test1"
  }
  assert {
    condition     = output.name == "vnet-team3-test1" && toset(output.address_space) == toset(["10.61.0.0/16"]) && azurerm_subnet.container_apps.address_prefixes == tolist(["10.61.0.0/23"])
    error_message = "Test1 must use its own VNet and subnet ranges."
  }
}

run "test2_network" {
  command = plan
  variables {
    environment         = "test2"
    resource_group_name = "rg-team3-test2"
  }
  assert {
    condition     = output.name == "vnet-team3-test2" && toset(output.address_space) == toset(["10.62.0.0/16"]) && azurerm_subnet.container_apps.address_prefixes == tolist(["10.62.0.0/23"])
    error_message = "Test2 must use its own VNet and subnet ranges."
  }
}

run "test3_network" {
  command = plan
  variables {
    environment         = "test3"
    resource_group_name = "rg-team3-test3"
  }
  assert {
    condition     = output.name == "vnet-team3-test3" && toset(output.address_space) == toset(["10.63.0.0/16"]) && azurerm_subnet.container_apps.address_prefixes == tolist(["10.63.0.0/23"])
    error_message = "Test3 must use its own VNet and subnet ranges."
  }
}

run "uat_reservation" {
  command = plan
  variables {
    environment         = "uat"
    resource_group_name = "rg-team3-uat"
  }
  assert {
    condition     = output.name == "vnet-team3-uat" && toset(output.address_space) == toset(["10.64.0.0/16"]) && azurerm_subnet.container_apps.address_prefixes == tolist(["10.64.0.0/23"])
    error_message = "Future UAT must use its reserved VNet and subnet ranges."
  }
}

run "prod_network" {
  command = plan
  variables {
    environment         = "prod"
    resource_group_name = "rg-team3-prod"
  }
  assert {
    condition     = output.name == "vnet-team3-prod" && toset(output.address_space) == toset(["10.65.0.0/16"]) && azurerm_subnet.container_apps.address_prefixes == tolist(["10.65.0.0/23"])
    error_message = "Production must use its own VNet and subnet ranges."
  }
}