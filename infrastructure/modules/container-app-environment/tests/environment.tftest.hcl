mock_provider "azurerm" {}

variables {
  name                = "cae-team3-test3"
  location            = "uksouth"
  resource_group_name = "rg-team3-test3"
}

run "default_environment" {
  command = plan

  assert {
    condition     = azurerm_container_app_environment.this.infrastructure_subnet_id == null && length(azurerm_container_app_environment.this.workload_profile) == 0
    error_message = "Existing callers must not opt into a subnet or workload profile."
  }
}

run "vnet_environment" {
  command = plan

  variables {
    infrastructure_subnet_id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Network/virtualNetworks/vnet-team3-test3/subnets/snet-container-apps"
  }

  assert {
    condition     = azurerm_container_app_environment.this.infrastructure_subnet_id == var.infrastructure_subnet_id
    error_message = "The environment must attach to the supplied subnet."
  }

  assert {
    condition     = length(azurerm_container_app_environment.this.workload_profile) == 1 && one(azurerm_container_app_environment.this.workload_profile).name == "Consumption" && one(azurerm_container_app_environment.this.workload_profile).workload_profile_type == "Consumption"
    error_message = "VNet integration must use the Consumption workload profile without Dedicated capacity."
  }

  assert {
    condition     = azurerm_container_app_environment.this.internal_load_balancer_enabled == false
    error_message = "The pilot must retain an external environment for the public frontend and future Front Door Standard origin."
  }
}