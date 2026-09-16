variable "name" {
  description = "Name of the Container App Environment."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the Container App Environment."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Container App Environment."
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace that receives container logs."
  type        = string
  default     = null
}

variable "infrastructure_subnet_id" {
  description = "Optional dedicated subnet for a VNet-integrated workload profiles environment. Changing this requires environment replacement."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to the Container App Environment."
  type        = map(string)
  default     = {}
}